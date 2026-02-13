import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateAdvisorResponse } from '@/lib/ai'
import type { AdvisorInput } from '@/lib/ai/provider'
import { z } from 'zod'

const advisorSchema = z.object({
  topic: z.enum(['financing', 'insurance', 'assistance']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(2000),
  })).min(1).max(20),
  leadId: z.string().uuid().optional(),
})

interface CustomerRecord {
  id: string
}

interface LeadData {
  estimate?: {
    price_likely?: number
  }
  property?: {
    street_address?: string
    city?: string
    state?: string
  }
  intake?: {
    has_insurance_claim?: boolean
  }
}

interface LinkedLead {
  lead_id: string
  lead: LeadData
}

interface FinancingApp {
  credit_range?: string
  income_range?: string
}

interface InsuranceClaim {
  insurance_company?: string
  cause_of_loss?: string
  status?: string
  claim_amount_approved?: number
  deductible?: number
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
      .from('customers' as never)
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData as CustomerRecord | null
    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = advisorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { topic, messages, leadId } = parsed.data

    // Build user context from their data
    const userContext: AdvisorInput['userContext'] = {}

    if (leadId) {
      // Get lead data
      const { data: linkData } = await supabase
        .from('customer_leads' as never)
        .select('lead_id, lead:leads(estimate:estimates(*), property:properties(*), intake:intakes(*))')
        .eq('customer_id', customer.id)
        .eq('lead_id', leadId)
        .single()

      const linkedLead = linkData as unknown as LinkedLead | null

      if (linkedLead?.lead) {
        const lead = linkedLead.lead
        if (lead.estimate?.price_likely) {
          userContext.estimateAmount = lead.estimate.price_likely
        }
        if (lead.property) {
          const p = lead.property
          userContext.propertyAddress = [p.street_address, p.city].filter(Boolean).join(', ')
          userContext.propertyState = p.state || undefined
        }
      }

      // Get financing data
      if (topic === 'financing') {
        const { data: financingData } = await supabase
          .from('financing_applications' as never)
          .select('credit_range, income_range')
          .eq('customer_id', customer.id)
          .eq('lead_id', leadId)
          .single()

        const financing = financingData as FinancingApp | null
        if (financing) {
          userContext.creditRange = financing.credit_range
          userContext.incomeRange = financing.income_range
        }
      }

      // Get insurance data
      if (topic === 'insurance') {
        const { data: claimData } = await supabase
          .from('insurance_claims' as never)
          .select('insurance_company, cause_of_loss, status, claim_amount_approved, deductible')
          .eq('customer_id', customer.id)
          .eq('lead_id', leadId)
          .single()

        const claim = claimData as InsuranceClaim | null
        if (claim) {
          userContext.insuranceCompany = claim.insurance_company
          userContext.causeOfLoss = claim.cause_of_loss
          userContext.claimStatus = claim.status
          if (claim.claim_amount_approved) {
            userContext.claimAmountApproved = claim.claim_amount_approved
          }
          if (claim.deductible) {
            userContext.deductible = claim.deductible
          }
        }
      }
    }

    const result = await generateAdvisorResponse({
      topic,
      messages,
      userContext,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: result.data!.message,
      suggestedActions: result.data!.suggestedActions || [],
      provider: result.provider,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
