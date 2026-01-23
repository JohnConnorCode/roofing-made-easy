import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLeadSchema } from '@/lib/validation/schemas'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  createRateLimitHeaders,
} from '@/lib/rate-limit'

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

    const supabase = await createClient()

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
      console.error('Error creating lead:', leadError)
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }

    // Create empty related records
    const leadId = (lead as { id: string }).id

    await Promise.all([
      supabase.from('contacts').insert({ lead_id: leadId } as never),
      supabase.from('properties').insert({ lead_id: leadId } as never),
      supabase.from('intakes').insert({ lead_id: leadId } as never),
    ])

    return NextResponse.json(
      { lead },
      {
        status: 201,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    console.error('Error in POST /api/leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for general API calls
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('leads')
      .select(`
        *,
        contacts(*),
        properties(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({ leads, total: count })
  } catch (error) {
    console.error('Error in GET /api/leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
