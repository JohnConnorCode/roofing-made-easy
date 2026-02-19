import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateInsuranceLetter } from '@/lib/ai'
import type { InsuranceLetterInput } from '@/lib/ai/provider'
import { z } from 'zod'
import { persistAiContent } from '@/lib/ai/persist-content'

const letterSchema = z.object({
  letterType: z.enum(['initial_claim', 'supplement', 'appeal']),
  leadId: z.string().uuid(),
})

interface CustomerRecord {
  id: string
  first_name?: string
  last_name?: string
}

interface ClaimRecord {
  insurance_company?: string
  claim_number?: string
  policy_number?: string
  date_of_loss?: string
  cause_of_loss?: string
  customer_notes?: string
  claim_amount_approved?: number
}

interface EstimateRecord {
  price_likely?: number
}

interface PropertyRecord {
  street_address?: string
  city?: string
  state?: string
  zip?: string
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimitAsync(clientIP, 'ai')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData as CustomerRecord | null
    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = letterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { letterType, leadId } = parsed.data

    // Verify customer owns this lead
    const { data: leadLink, error: linkError } = await supabase
      .from('customer_leads')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .single()

    if (linkError || !leadLink) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 403 })
    }

    // Get claim data
    const { data: claimData } = await supabase
      .from('insurance_claims')
      .select('insurance_company, claim_number, policy_number, date_of_loss, cause_of_loss, customer_notes, claim_amount_approved')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .single()

    const claim = claimData as ClaimRecord | null

    // Get estimate
    const { data: estimateData } = await supabase
      .from('estimates')
      .select('price_likely')
      .eq('lead_id', leadId)
      .single()

    const estimate = estimateData as EstimateRecord | null

    // Get property
    const { data: propertyData } = await supabase
      .from('properties')
      .select('street_address, city, state, zip')
      .eq('lead_id', leadId)
      .single()

    const property = propertyData as PropertyRecord | null

    const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || '[Your Name]'
    const propertyAddress = property
      ? [property.street_address, property.city, property.state, property.zip].filter(Boolean).join(', ')
      : '[Your Address]'

    // Map "supplement" to "follow_up" for the AI provider
    const mappedType: InsuranceLetterInput['letterType'] = letterType === 'supplement' ? 'follow_up' : letterType

    const input: InsuranceLetterInput = {
      letterType: mappedType,
      claimData: {
        insuranceCompany: claim?.insurance_company,
        claimNumber: claim?.claim_number,
        policyNumber: claim?.policy_number,
        dateOfLoss: claim?.date_of_loss,
        causeOfLoss: claim?.cause_of_loss,
        customerNotes: claim?.customer_notes,
      },
      propertyAddress,
      customerName,
      estimateAmount: estimate?.price_likely,
      claimAmountApproved: claim?.claim_amount_approved,
    }

    const result = await generateInsuranceLetter(input)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 })
    }

    // Persist AI response (fire-and-forget)
    persistAiContent({
      customerId: customer.id,
      leadId,
      contentType: 'insurance_letter',
      topic: 'insurance',
      content: { letterType, letter: result.data },
      provider: result.provider,
      inputContext: { letterType, insuranceCompany: claim?.insurance_company },
    })

    return NextResponse.json({
      letter: result.data,
      letterType,
      provider: result.provider,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
