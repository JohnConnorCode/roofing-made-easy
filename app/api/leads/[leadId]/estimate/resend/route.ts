import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { sendCustomerEstimateEmail } from '@/lib/email'
import { sendEstimateReadySms } from '@/lib/sms'
import type { Intake, Property, Contact } from '@/lib/supabase/types'

interface LeadWithRelations {
  id: string
  share_token: string
  intakes: Intake[] | Intake | null
  properties: Property[] | Property | null
  contacts: Contact[] | Contact | null
}

interface EstimateRecord {
  id: string
  price_low: number
  price_likely: number
  price_high: number
  valid_until: string | null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  // Require admin authentication
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    const { leadId } = await params
    const supabase = await createClient()

    // Fetch lead with relations
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        intakes(*),
        properties(*),
        contacts(*)
      `)
      .eq('id', leadId)
      .single()

    const lead = leadData as LeadWithRelations | null

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if lead has a share token
    if (!lead.share_token) {
      return NextResponse.json(
        { error: 'Lead does not have a share token' },
        { status: 400 }
      )
    }

    // Fetch latest estimate
    const { data: estimateData, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('lead_id', leadId)
      .eq('is_superseded', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const estimate = estimateData as EstimateRecord | null

    if (estimateError || !estimate) {
      return NextResponse.json({ error: 'No estimate found for this lead' }, { status: 404 })
    }

    // Extract contact and property
    const contact = Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts
    const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties
    const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes

    if (!contact?.email) {
      return NextResponse.json(
        { error: 'Lead has no contact email' },
        { status: 400 }
      )
    }

    // Prepare customer name
    const customerName = contact?.first_name && contact?.last_name
      ? `${contact.first_name} ${contact.last_name}`
      : contact?.first_name || undefined

    // Send the estimate email
    const emailResult = await sendCustomerEstimateEmail({
      customerEmail: contact.email,
      contactName: customerName,
      address: property?.street_address || undefined,
      city: property?.city || undefined,
      state: property?.state || undefined,
      jobType: intake?.job_type || undefined,
      priceLow: estimate.price_low,
      priceLikely: estimate.price_likely,
      priceHigh: estimate.price_high,
      shareToken: lead.share_token,
      validUntil: estimate.valid_until || undefined,
    })

    const results: { email: boolean; sms: boolean } = {
      email: emailResult.success,
      sms: false,
    }

    // Also resend SMS if contact has a phone and consented
    const body = await request.json().catch(() => ({}))
    const includeSms = body.includeSms !== false // Default to true

    if (includeSms && contact?.phone && contact.consent_sms && lead.share_token) {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'
      const estimateUrl = `${BASE_URL}/estimate/${lead.share_token}`
      const smsResult = await sendEstimateReadySms(
        contact.phone,
        customerName || 'there',
        estimateUrl
      )
      results.sms = smsResult.success
    }

    if (!results.email) {
      return NextResponse.json(
        { error: 'Failed to send estimate email', results },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estimate resent successfully',
      results,
    })
  } catch (error) {
    console.error('[Estimate Resend] Error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to resend estimate' },
      { status: 500 }
    )
  }
}
