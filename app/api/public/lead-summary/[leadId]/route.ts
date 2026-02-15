import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const leadIdSchema = z.string().uuid()

/**
 * Public endpoint returning minimal lead data for the registration page.
 * No auth required — only returns non-sensitive fields (address, estimate, name, email, phone).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const parsed = leadIdSchema.safeParse(leadId)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Fetch only the minimal fields needed for pre-filling the register form
    const { data: lead, error } = await supabase
      .from('leads' as never)
      .select('id')
      .eq('id', leadId)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Fetch property, estimate, and contact in parallel
    const [propertyResult, estimateResult, contactResult] = await Promise.all([
      supabase
        .from('properties' as never)
        .select('formatted_address, street_address')
        .eq('lead_id', leadId)
        .single(),
      supabase
        .from('estimates' as never)
        .select('price_likely')
        .eq('lead_id', leadId)
        .single(),
      supabase
        .from('contacts' as never)
        .select('first_name, last_name')
        .eq('lead_id', leadId)
        .single(),
    ])

    interface PropertyRow { formatted_address?: string; street_address?: string }
    interface EstimateRow { price_likely?: number }
    interface ContactRow { first_name?: string; last_name?: string }

    const property = propertyResult.data as PropertyRow | null
    const estimate = estimateResult.data as EstimateRow | null
    const contact = contactResult.data as ContactRow | null

    return NextResponse.json({
      address: property?.formatted_address || property?.street_address || null,
      estimate: estimate?.price_likely || null,
      firstName: contact?.first_name || null,
      lastName: contact?.last_name || null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
