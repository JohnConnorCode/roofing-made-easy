import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateLeadSchema } from '@/lib/validation/schemas'
import { requireLeadOwnership } from '@/lib/api/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Require auth - admins can access all, customers only their linked leads
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    const supabase = await createClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        contacts(*),
        properties(*),
        intakes(*),
        uploads(*),
        estimates(*),
        detailed_estimates(*, estimate_line_items(*))
      `)
      .eq('id', leadId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch lead' },
        { status: 500 }
      )
    }

    // Fetch customer qualification data in parallel for better performance
    const [
      { data: customerLead },
      { data: financingApplications },
      { data: insuranceClaims },
      { data: programApplications },
    ] = await Promise.all([
      supabase
        .from('customer_leads')
        .select(`customer:customers(id, email, first_name, last_name, created_at)`)
        .eq('lead_id', leadId)
        .single(),
      supabase
        .from('financing_applications')
        .select('id, amount_requested, credit_range, income_range, status, created_at')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('insurance_claims')
        .select('id, insurance_company, claim_number, status, created_at')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('customer_program_applications')
        .select('id, program_id, status, created_at')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      lead: {
        ...(lead as Record<string, unknown>),
        customer_lead: customerLead,
        financing_applications: financingApplications || [],
        insurance_claims: insuranceClaims || [],
        program_applications: programApplications || [],
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Require auth - admins can update all, customers only their linked leads
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    const body = await request.json()
    const parsed = updateLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (parsed.data.status) updates.status = parsed.data.status
    if (parsed.data.currentStep) updates.current_step = parsed.data.currentStep

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updates as never)
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lead not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lead })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
