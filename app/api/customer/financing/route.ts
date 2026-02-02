import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const financingSchema = z.object({
  leadId: z.string().uuid(),
  amountRequested: z.number().positive(),
  creditRange: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor']),
  incomeRange: z.enum(['under_30k', '30k_50k', '50k_75k', '75k_100k', '100k_150k', 'over_150k']),
  employmentStatus: z.enum(['employed_full_time', 'employed_part_time', 'self_employed', 'retired', 'unemployed', 'other']),
  monthlyHousingPayment: z.number().optional(),
  coApplicant: z.boolean().optional(),
})

// Type for customer record
interface CustomerRecord {
  id: string
}

export async function POST(request: NextRequest) {
  try {
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
      .from('customers' as never)
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
    const parsed = financingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      leadId,
      amountRequested,
      creditRange,
      incomeRange,
      employmentStatus,
      monthlyHousingPayment,
      coApplicant,
    } = parsed.data

    // Verify customer owns this lead
    const { data: leadLink, error: linkError } = await supabase
      .from('customer_leads' as never)
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

    // Check for existing application
    const { data: existing } = await supabase
      .from('financing_applications' as never)
      .select('id')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Financing application already exists for this property' },
        { status: 409 }
      )
    }

    // Create financing application
    const { data: application, error: createError } = await supabase
      .from('financing_applications' as never)
      .insert({
        customer_id: customer.id,
        lead_id: leadId,
        amount_requested: amountRequested,
        credit_range: creditRange,
        income_range: incomeRange,
        employment_status: employmentStatus,
        monthly_housing_payment: monthlyHousingPayment || null,
        co_applicant: coApplicant || false,
        status: 'interested',
      } as never)
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Financing application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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
      .from('customers' as never)
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

    // Get all financing applications for this customer
    const { data: applications, error: fetchError } = await supabase
      .from('financing_applications' as never)
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Financing fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
