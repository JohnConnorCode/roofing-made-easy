import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for profile update
const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  notification_preferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
  }).optional(),
}).strict() // Reject unknown fields

// Type for customer record
interface CustomerRecord {
  id: string
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
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    const customer = customerData as (CustomerRecord & Record<string, unknown>) | null

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      throw customerError
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Fetch all related data in parallel for better performance
    const [
      { data: linkedLeads },
      { data: financingApplications },
      { data: insuranceClaims },
      { data: programApplications },
    ] = await Promise.all([
      supabase
        .from('customer_leads' as never)
        .select(`
          *,
          lead:leads (
            *,
            property:properties (*),
            intake:intakes (*),
            estimate:estimates (*),
            uploads (*)
          )
        `)
        .eq('customer_id', customer.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('financing_applications' as never)
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('insurance_claims' as never)
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('customer_program_applications' as never)
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      customer,
      linkedLeads: linkedLeads || [],
      financingApplications: financingApplications || [],
      insuranceClaims: insuranceClaims || [],
      programApplications: programApplications || [],
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      phone,
      notification_preferences,
    } = validation.data

    // Build update object
    const updates: Record<string, unknown> = {}
    if (firstName !== undefined) updates.first_name = firstName
    if (lastName !== undefined) updates.last_name = lastName
    if (phone !== undefined) updates.phone = phone
    if (notification_preferences !== undefined) updates.notification_preferences = notification_preferences

    const { data: customer, error: updateError } = await supabase
      .from('customers' as never)
      .update(updates as never)
      .eq('auth_user_id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(customer)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
