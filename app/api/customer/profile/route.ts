import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get linked leads with property, intake, and estimate data
    const { data: linkedLeads, error: leadsError } = await supabase
      .from('customer_leads' as never)
      .select(`
        *,
        lead:leads (
          *,
          property:properties (*),
          intake:intakes (*),
          estimate:estimates (*)
        )
      `)
      .eq('customer_id', customer.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('Error fetching linked leads:', leadsError)
    }

    // Get financing applications
    const { data: financingApplications, error: financingError } = await supabase
      .from('financing_applications' as never)
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (financingError) {
      console.error('Error fetching financing applications:', financingError)
    }

    // Get insurance claims
    const { data: insuranceClaims, error: claimsError } = await supabase
      .from('insurance_claims' as never)
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (claimsError) {
      console.error('Error fetching insurance claims:', claimsError)
    }

    // Get program applications
    const { data: programApplications, error: programsError } = await supabase
      .from('customer_program_applications' as never)
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (programsError) {
      console.error('Error fetching program applications:', programsError)
    }

    return NextResponse.json({
      customer,
      linkedLeads: linkedLeads || [],
      financingApplications: financingApplications || [],
      insuranceClaims: insuranceClaims || [],
      programApplications: programApplications || [],
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
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
    const {
      firstName,
      lastName,
      phone,
      notification_preferences,
    } = body

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
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
