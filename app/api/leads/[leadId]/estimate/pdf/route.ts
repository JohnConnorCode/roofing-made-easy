import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { EstimatePDF, type EstimatePDFData } from '@/lib/pdf/estimate-pdf'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'
import type { Intake, Property, Contact } from '@/lib/supabase/types'

interface Adjustment {
  name: string
  impact: number
  description?: string
}
import React from 'react'

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
  ai_explanation: string | null
  adjustments: Adjustment[] | null
  valid_until: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const supabase = await createClient()

    // Fetch lead data with relations
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
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
    }

    // Extract related data
    const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes
    const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties
    const contact = Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts

    // Build PDF data
    const pdfData: EstimatePDFData = {
      customerName: contact?.first_name && contact?.last_name
        ? `${contact.first_name} ${contact.last_name}`
        : contact?.first_name || undefined,
      propertyAddress: property?.street_address || undefined,
      city: property?.city || undefined,
      state: property?.state || undefined,
      jobType: intake?.job_type || null,
      roofMaterial: intake?.roof_material || null,
      roofSizeSqft: intake?.roof_size_sqft || null,
      priceLow: estimate.price_low,
      priceLikely: estimate.price_likely,
      priceHigh: estimate.price_high,
      explanation: estimate.ai_explanation || undefined,
      factors: estimate.adjustments?.filter(adj => adj.impact !== 0).map(adj => ({
        name: adj.name,
        impact: adj.impact,
        description: adj.description || '',
      })),
      validUntil: estimate.valid_until || undefined,
    }

    // Generate PDF
    // @ts-expect-error - React.createElement types don't perfectly match @react-pdf/renderer expectations
    const pdfBuffer = await renderToBuffer(React.createElement(EstimatePDF, { data: pdfData }))

    // Create filename
    const customerPart = pdfData.customerName?.replace(/\s+/g, '-').toLowerCase() || 'estimate'
    const datePart = new Date().toISOString().split('T')[0]
    const filename = `farrell-roofing-estimate-${customerPart}-${datePart}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
