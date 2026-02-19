import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateAdvisorResponse } from '@/lib/ai'
import type { AdvisorInput } from '@/lib/ai/provider'
import { getBusinessConfigFromDB } from '@/lib/config/business-loader'
import { z } from 'zod'
import { persistAiContent } from '@/lib/ai/persist-content'
import { logger } from '@/lib/logger'

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
  status?: string
}

interface InsuranceClaim {
  insurance_company?: string
  cause_of_loss?: string
  status?: string
  claim_amount_approved?: number
  deductible?: number
}

interface ProgramApp {
  program_id: string
  status?: string
  approved_amount?: number | null
  program?: { name?: string } | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit using composite key: IP + user ID
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimitAsync(`${clientIP}:${user.id}`, 'ai')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
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
        .from('customer_leads')
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
        // Check intake for storm damage flag
        if (lead.intake?.has_insurance_claim) {
          userContext.hasStormDamage = true
        }
      }

      // Fetch all three data sources in parallel for cross-topic awareness
      const [financingResult, claimResult, programsResult] = await Promise.all([
        supabase
          .from('financing_applications')
          .select('credit_range, income_range, status')
          .eq('customer_id', customer.id)
          .eq('lead_id', leadId)
          .single(),
        supabase
          .from('insurance_claims')
          .select('insurance_company, cause_of_loss, status, claim_amount_approved, deductible')
          .eq('customer_id', customer.id)
          .eq('lead_id', leadId)
          .single(),
        supabase
          .from('customer_program_applications')
          .select('program_id, status, approved_amount, program:assistance_programs(name)')
          .eq('customer_id', customer.id)
          .eq('lead_id', leadId),
      ])

      // Financing
      const financing = financingResult.data as FinancingApp | null
      if (financing) {
        userContext.creditRange = financing.credit_range
        userContext.incomeRange = financing.income_range
        userContext.financingStatus = financing.status
      }

      // Insurance
      const claim = claimResult.data as InsuranceClaim | null
      if (claim) {
        userContext.hasInsuranceClaim = true
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

      // Programs — include names and statuses for richer AI context
      const programs = programsResult.data as ProgramApp[] | null
      if (programs && programs.length > 0) {
        userContext.eligibleProgramCount = programs.length
        const programNames = programs
          .map((p) => {
            const name = (p.program as { name?: string } | null)?.name || p.program_id
            return p.status ? `${name} (${p.status})` : name
          })
          .filter(Boolean)
        if (programNames.length > 0) {
          userContext.eligibleProgramNames = programNames
        }
      }

      // Calculate funding gap: estimate minus insurance payout minus approved assistance
      if (userContext.estimateAmount) {
        let covered = userContext.claimAmountApproved || 0
        // Sum approved assistance amounts
        if (programs && programs.length > 0) {
          for (const p of programs) {
            if (p.approved_amount && p.approved_amount > 0) {
              covered += p.approved_amount
            }
          }
        }
        const gap = userContext.estimateAmount - covered
        if (gap > 0) {
          userContext.fundingGap = gap
        }
      }
    }

    // Load business config from DB (admin settings) — not the static fallback
    const dbConfig = await getBusinessConfigFromDB()
    const businessConfig = {
      name: dbConfig.name,
      tagline: dbConfig.tagline,
      phone: { raw: dbConfig.phone.raw, display: dbConfig.phone.display },
      email: { primary: dbConfig.email.primary },
      hours: {
        weekdays: dbConfig.hours.weekdays,
        saturday: dbConfig.hours.saturday,
        sunday: dbConfig.hours.sunday as { open: string; close: string } | null,
      },
    }

    const result = await generateAdvisorResponse({
      topic,
      messages,
      userContext,
      businessConfig,
    })

    if (!result.success) {
      logger.error(`[advisor] topic=${topic} provider=${result.provider} error="${result.error}"`)
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    // Persist AI response for the customer (fire-and-forget)
    persistAiContent({
      customerId: customer.id,
      leadId: leadId || undefined,
      contentType: 'advisor_message',
      topic,
      content: {
        message: result.data!.message,
        suggestedActions: result.data!.suggestedActions || [],
      },
      provider: result.provider,
      inputContext: { lastUserMessage: messages[messages.length - 1]?.content },
    })

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
