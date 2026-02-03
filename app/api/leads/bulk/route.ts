import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum([
    'new',
    'intake_started',
    'intake_complete',
    'estimate_generated',
    'consultation_scheduled',
    'quote_sent',
    'won',
    'lost',
    'archived'
  ])
})

export async function PUT(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const parsed = bulkUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { leadIds, status } = parsed.data
    const supabase = await createClient()

    // Update all leads in bulk
    const { data, error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() } as never)
      .in('id', leadIds)
      .select('id, status')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      leads: data
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for bulk export
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { error: 'No lead IDs provided' },
        { status: 400 }
      )
    }

    const leadIds = idsParam.split(',').filter(id => id.length > 0)

    // Validate UUIDs using zod
    const uuidArraySchema = z.array(z.string().uuid()).min(1).max(100)
    const validationResult = uuidArraySchema.safeParse(leadIds)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid lead IDs - must be valid UUIDs (1-100 allowed)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        id,
        status,
        source,
        created_at,
        contacts(first_name, last_name, email, phone),
        properties(street_address, city, state, zip_code),
        intakes(job_type, roof_size_sqft, timeline_urgency),
        estimates(price_likely)
      `)
      .in('id', leadIds)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Transform to flat CSV-friendly format
    type LeadExportData = Record<string, unknown>
    const exportData = (leads as LeadExportData[] | null)?.map(lead => {
      const contact = (lead.contacts as Record<string, string>[])?.[0] || {}
      const property = (lead.properties as Record<string, string>[])?.[0] || {}
      const intake = (lead.intakes as Record<string, unknown>[])?.[0] || {}
      const estimate = (lead.estimates as Record<string, number>[])?.[0] || {}

      return {
        id: lead.id,
        status: lead.status,
        source: lead.source,
        created_at: lead.created_at,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        street_address: property.street_address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        job_type: intake.job_type || '',
        roof_size_sqft: intake.roof_size_sqft || '',
        timeline_urgency: intake.timeline_urgency || '',
        estimate_price: estimate.price_likely || ''
      }
    }) || []

    return NextResponse.json({ leads: exportData })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
