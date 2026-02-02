import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const applicationSchema = z.object({
  leadId: z.string().uuid(),
  programId: z.string(),
  status: z.enum(['researching', 'eligible', 'not_eligible', 'applied', 'approved', 'denied']).optional(),
  applicationDate: z.string().optional(),
  applicationReference: z.string().optional(),
  notes: z.string().optional(),
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
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      leadId,
      programId,
      status,
      applicationDate,
      applicationReference,
      notes,
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

    // Check for existing application for this program/lead combo
    const { data: existing } = await supabase
      .from('customer_program_applications' as never)
      .select('id')
      .eq('customer_id', customer.id)
      .eq('lead_id', leadId)
      .eq('program_id', programId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Application already exists for this program and property' },
        { status: 409 }
      )
    }

    // Create program application
    // Note: We're storing the program ID from our static data file
    // In a real implementation, you might want to validate against the assistance_programs table
    const { data: application, error: createError } = await supabase
      .from('customer_program_applications' as never)
      .insert({
        customer_id: customer.id,
        lead_id: leadId,
        program_id: programId,
        status: status || 'researching',
        application_date: applicationDate || null,
        application_reference: applicationReference || null,
        notes: notes || null,
      } as never)
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Program application error:', error)
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
    const { data: customerData2, error: customerError } = await supabase
      .from('customers' as never)
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

    // Get all program applications for this customer
    const { data: applications, error: fetchError } = await supabase
      .from('customer_program_applications' as never)
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Program applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
