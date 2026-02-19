import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { safeCompare } from '@/lib/utils'
import { z } from 'zod'

const leadIdSchema = z.string().uuid()

/**
 * Public endpoint returning minimal lead data for the registration page.
 * Requires a valid share_token to prevent enumeration attacks.
 * Returns non-sensitive fields: address, estimate amount, first name only.
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

    // Require share_token to prevent lead enumeration
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Validate share_token matches the lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('id, share_token')
      .eq('id', leadId)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!safeCompare((lead as { share_token: string }).share_token || '', token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Fetch property, estimate, and contact in parallel
    const [propertyResult, estimateResult, contactResult] = await Promise.all([
      supabase
        .from('properties')
        .select('formatted_address, street_address')
        .eq('lead_id', leadId)
        .single(),
      supabase
        .from('estimates')
        .select('price_likely')
        .eq('lead_id', leadId)
        .single(),
      supabase
        .from('contacts')
        .select('first_name')
        .eq('lead_id', leadId)
        .single(),
    ])

    interface PropertyRow { formatted_address?: string; street_address?: string }
    interface EstimateRow { price_likely?: number }
    interface ContactRow { first_name?: string }

    const property = propertyResult.data as PropertyRow | null
    const estimate = estimateResult.data as EstimateRow | null
    const contact = contactResult.data as ContactRow | null

    return NextResponse.json({
      address: property?.formatted_address || property?.street_address || null,
      estimate: estimate?.price_likely || null,
      firstName: contact?.first_name || null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
