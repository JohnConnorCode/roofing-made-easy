import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLeadSchema } from '@/lib/validation/schemas'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  createRateLimitHeaders,
} from '@/lib/rate-limit'
import { requireAdmin, parsePagination } from '@/lib/api/auth'
import { triggerWorkflows } from '@/lib/communication/workflow-engine'
import { notifyAdmins } from '@/lib/notifications'
import { notifyNewLead } from '@/lib/email/notifications'

// Valid status values for filtering (must match LeadStatus type in lib/constants/status.ts)
const VALID_STATUSES = new Set([
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'estimate_sent',
  'quote_created',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived',
])

// POST is public - anyone can create a lead (with rate limiting)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for lead creation
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'leadCreation')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }
    const body = await request.json()
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS (anon no longer has INSERT on related tables)
    const supabase = await createAdminClient()

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        source: parsed.data.source || 'web_funnel',
        utm_source: parsed.data.utmSource,
        utm_medium: parsed.data.utmMedium,
        utm_campaign: parsed.data.utmCampaign,
        referrer_url: parsed.data.referrerUrl,
        status: 'new',
        current_step: 1,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      } as never)
      .select()
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    // Create empty related records
    const leadId = (lead as { id: string }).id

    const relatedResults = await Promise.allSettled([
      supabase.from('contacts').insert({ lead_id: leadId } as never),
      supabase.from('properties').insert({ lead_id: leadId } as never),
      supabase.from('intakes').insert({ lead_id: leadId } as never),
    ])

    const failures = relatedResults.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error('Partial lead initialization failure:', failures.map(f =>
        f.status === 'rejected' ? f.reason : null
      ))
    }

    // If ALL related record inserts failed, clean up the orphaned lead
    if (failures.length === relatedResults.length) {
      await supabase.from('leads').delete().eq('id', leadId)
      return NextResponse.json(
        { error: 'Failed to initialize lead' },
        { status: 500 }
      )
    }

    // Trigger lead_created workflows (async, don't wait)
    const source = parsed.data.source || 'web_funnel'
    triggerWorkflows('lead_created', {
      leadId,
      data: { source },
    }).catch(err => console.error('Failed to trigger lead_created workflows:', err))

    // Fire-and-forget notifications
    notifyAdmins('lead_new', 'New Lead Submitted', `New lead from ${source}`, `/leads/${leadId}`)
      .catch(err => console.error('Failed to notify admins of new lead:', err))
    notifyNewLead({ leadId, source, createdAt: new Date().toISOString() })
      .catch(err => console.error('Failed to send new lead email:', err))

    return NextResponse.json(
      { lead },
      {
        status: 201,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET requires admin - listing all leads is an admin operation
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting for general API calls
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const { limit, offset } = parsePagination(searchParams)

    // Validate status parameter if provided
    if (status && !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${Array.from(VALID_STATUSES).join(', ')}` },
        { status: 400 }
      )
    }

    let query = supabase
      .from('leads')
      .select(`
        *,
        contacts(*),
        properties(*),
        estimates(id, price_likely, is_superseded),
        detailed_estimates(id, name, status, price_likely)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: leads, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({ leads, total: count })
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
