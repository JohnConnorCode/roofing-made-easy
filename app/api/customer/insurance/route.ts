import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const claimSchema = z.object({
  leadId: z.string().uuid(),
  insuranceCompany: z.string().optional(),
  policyNumber: z.string().optional(),
  claimNumber: z.string().optional(),
  dateOfLoss: z.string().optional(),
  causeOfLoss: z.string().optional(),
  customerNotes: z.string().optional(),
})

// Type for customer record
interface CustomerRecord {
  id: string
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData as CustomerRecord | null

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = claimSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      leadId,
      insuranceCompany,
      policyNumber,
      claimNumber,
      dateOfLoss,
      causeOfLoss,
      customerNotes,
    } = parsed.data

    // Verify customer owns this lead
    const { data: leadLink, error: linkError } = await supabase
      .from('customer_leads')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .single()

    if (linkError || !leadLink) {
      return NextResponse.json(
        { error: 'Lead not found or not authorized' },
        { status: 403 }
      )
    }

    // Check for existing claim
    const { data: existing } = await supabase
      .from('insurance_claims')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Insurance claim already exists for this property' },
        { status: 409 }
      )
    }

    // Create initial timeline event
    const initialTimeline = [{
      date: new Date().toISOString(),
      status: 'not_started',
      notes: 'Claim tracking started',
    }]

    // Create insurance claim
    const { data: claim, error: createError } = await supabase
      .from('insurance_claims')
      .insert({
        customer_id: customer.id,
        lead_id: leadId,
        insurance_company: insuranceCompany || null,
        policy_number: policyNumber || null,
        claim_number: claimNumber || null,
        date_of_loss: dateOfLoss || null,
        cause_of_loss: causeOfLoss || null,
        customer_notes: customerNotes || null,
        status: 'not_started',
        timeline: initialTimeline,
      } as never)
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json(claim, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer record
    const { data: customerData2, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData2 as CustomerRecord | null

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get all insurance claims for this customer
    const { data: claims, error: fetchError } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json(claims)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
