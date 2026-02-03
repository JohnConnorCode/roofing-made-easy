import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { requireLeadOwnership } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { QuotePDFDocument, type QuotePDFData } from '@/lib/pdf/quote-template'
import { BUSINESS_CONFIG, getPhoneDisplay, getFullAddress } from '@/lib/config/business'
import React from 'react'

interface LeadData {
  id: string
  contacts: Array<{
    first_name: string
    last_name: string
    email: string
    phone: string
  }>
  properties: Array<{
    street_address: string
    city: string
    state: string
    zip_code: string
  }>
  intakes: Array<{
    job_type: string
    roof_material: string
    roof_size_sqft: number
  }>
  estimates: Array<{
    id: string
    price_low: number
    price_likely: number
    price_high: number
    valid_until: string
    created_at: string
    is_superseded?: boolean
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Verify customer owns this lead
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Fetch lead data
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        contacts(*),
        properties(*),
        intakes(*),
        estimates(*)
      `)
      .eq('id', leadId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const lead = data as LeadData
    const contact = lead.contacts?.[0]
    const property = lead.properties?.[0]
    const intake = lead.intakes?.[0]
    const estimate = lead.estimates?.find((e: { is_superseded?: boolean }) => !e.is_superseded) || lead.estimates?.[0]

    if (!estimate) {
      return NextResponse.json(
        { error: 'No estimate found for this lead' },
        { status: 400 }
      )
    }

    // Build quote data
    const quoteData: QuotePDFData = {
      quoteNumber: `Q-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntil: estimate.valid_until
        ? new Date(estimate.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      company: {
        name: BUSINESS_CONFIG.name,
        tagline: BUSINESS_CONFIG.tagline,
        address: getFullAddress(),
        phone: getPhoneDisplay(),
        email: BUSINESS_CONFIG.email.primary,
        license: BUSINESS_CONFIG.credentials.stateContractorLicense || undefined,
      },
      customer: {
        name: contact
          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Customer'
          : 'Customer',
        address: property?.street_address || '',
        city: property?.city || '',
        state: property?.state || '',
        zip: property?.zip_code || '',
        phone: contact?.phone,
        email: contact?.email,
      },
      project: {
        description: intake?.job_type?.replace(/_/g, ' ') || 'Roofing service',
        material: intake?.roof_material?.replace(/_/g, ' '),
        size: intake?.roof_size_sqft,
      },
      lineItems: buildLineItems(intake, estimate),
      subtotal: estimate.price_likely,
      tax: 0,
      total: estimate.price_likely,
      notes: 'Price includes all materials and labor. Permit fees may be additional if required by your municipality. Final price confirmed after on-site inspection.',
      terms: `Payment Terms: 50% deposit required to schedule work, balance due upon completion.
This quote is valid for 30 days from the date above.
Work includes a 5-year workmanship warranty and manufacturer's material warranty.
All work performed by licensed, bonded, and insured contractors.`,
    }

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(QuotePDFDocument, { data: quoteData }) as any
    )

    // Return PDF
    const customerName = contact
      ? `${contact.first_name || ''}_${contact.last_name || ''}`.trim().replace(/\s+/g, '_') || 'Customer'
      : 'Customer'
    const filename = `Quote_${customerName}_${quoteData.quoteNumber}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
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

function buildLineItems(
  intake: LeadData['intakes'][0] | undefined,
  estimate: LeadData['estimates'][0]
): QuotePDFData['lineItems'] {
  const items: QuotePDFData['lineItems'] = []

  const jobType = intake?.job_type || 'service'
  const material = intake?.roof_material?.replace(/_/g, ' ') || 'Architectural shingles'
  const size = intake?.roof_size_sqft

  if (jobType === 'full_replacement') {
    items.push({
      description: `Complete roof replacement - ${material}`,
      quantity: size,
      unit: 'sq ft',
      amount: estimate.price_likely,
    })
    items.push({ description: 'Tear-off and disposal of existing roofing', amount: 0 })
    items.push({ description: 'New synthetic underlayment installation', amount: 0 })
    items.push({ description: 'Ice and water shield at eaves and valleys', amount: 0 })
    items.push({ description: 'New drip edge and flashing', amount: 0 })
    items.push({ description: 'Ridge vent installation for proper ventilation', amount: 0 })
    items.push({ description: 'Cleanup and haul-away of debris', amount: 0 })
    items.push({ description: 'Final inspection and walkthrough', amount: 0 })
  } else if (jobType === 'repair') {
    items.push({
      description: 'Roof repair service',
      amount: estimate.price_likely,
    })
    items.push({ description: 'Damaged shingle/material replacement', amount: 0 })
    items.push({ description: 'Flashing repair/replacement as needed', amount: 0 })
    items.push({ description: 'Sealant application', amount: 0 })
    items.push({ description: 'Cleanup', amount: 0 })
  } else if (jobType === 'inspection') {
    items.push({
      description: 'Comprehensive roof inspection',
      amount: estimate.price_likely,
    })
    items.push({ description: 'Visual inspection of all roof surfaces', amount: 0 })
    items.push({ description: 'Flashing and penetration assessment', amount: 0 })
    items.push({ description: 'Gutter and drainage evaluation', amount: 0 })
    items.push({ description: 'Written report with photos and recommendations', amount: 0 })
  } else {
    items.push({
      description: `${jobType.replace(/_/g, ' ')} service`,
      amount: estimate.price_likely,
    })
    items.push({ description: 'Labor and materials', amount: 0 })
    items.push({ description: 'Cleanup', amount: 0 })
  }

  return items
}
