import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum([
    'not_started',
    'filed',
    'adjuster_scheduled',
    'adjuster_visited',
    'under_review',
    'approved',
    'denied',
    'appealing',
    'settled',
  ]).optional(),
  notes: z.string().optional(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  adjusterEmail: z.string().optional(),
  adjusterVisitDate: z.string().optional(),
  claimAmountApproved: z.number().optional(),
  deductible: z.number().optional(),
})

// Type for customer record
interface CustomerRecord {
  id: string
}

// Type for insurance claim
interface InsuranceClaimRecord {
  id: string
  timeline: Array<Record<string, unknown>> | null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const { claimId } = await params
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

    // Verify customer owns this claim
    const { data: existingClaimData, error: claimError } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('id', claimId)
      .eq('customer_id', customer.id)
      .single()

    const existingClaim = existingClaimData as InsuranceClaimRecord | null

    if (claimError || !existingClaim) {
      return NextResponse.json(
        { error: 'Claim not found or not authorized' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      status,
      notes,
      adjusterName,
      adjusterPhone,
      adjusterEmail,
      adjusterVisitDate,
      claimAmountApproved,
      deductible,
    } = parsed.data

    // Build update object
    const updates: Record<string, unknown> = {}

    if (status) {
      updates.status = status
      updates.status_updated_at = new Date().toISOString()

      // Add to timeline
      const currentTimeline = existingClaim.timeline || []
      updates.timeline = [
        ...currentTimeline,
        {
          date: new Date().toISOString(),
          status,
          notes: notes || '',
        },
      ]
    }

    if (adjusterName !== undefined) updates.adjuster_name = adjusterName
    if (adjusterPhone !== undefined) updates.adjuster_phone = adjusterPhone
    if (adjusterEmail !== undefined) updates.adjuster_email = adjusterEmail
    if (adjusterVisitDate !== undefined) updates.adjuster_visit_date = adjusterVisitDate
    if (claimAmountApproved !== undefined) updates.claim_amount_approved = claimAmountApproved
    if (deductible !== undefined) updates.deductible = deductible
    if (notes && !status) updates.customer_notes = notes

    const { data: claim, error: updateError } = await supabase
      .from('insurance_claims')
      .update(updates as never)
      .eq('id', claimId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(claim)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
