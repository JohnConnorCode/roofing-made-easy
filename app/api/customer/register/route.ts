import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      authUserId,
      email,
      firstName,
      lastName,
      phone,
      consentMarketing,
      leadId,
    } = body

    if (!authUserId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Type for customer record
    interface CustomerRecord {
      id: string
      auth_user_id: string
      email: string
      first_name: string | null
      last_name: string | null
      phone: string | null
    }

    // Create customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers' as never)
      .insert({
        auth_user_id: authUserId,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        notification_preferences: {
          email: consentMarketing ?? true,
          sms: false,
        },
      } as never)
      .select()
      .single()

    const customer = customerData as CustomerRecord | null

    if (customerError) {
      console.error('Error creating customer:', customerError)
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      )
    }

    // If leadId provided, link the lead to this customer
    if (leadId && !leadId.startsWith('demo-') && customer) {
      const { error: linkError } = await supabase
        .from('customer_leads' as never)
        .insert({
          customer_id: customer.id,
          lead_id: leadId,
          is_primary: true,
        } as never)

      if (linkError) {
        console.error('Error linking lead:', linkError)
        // Don't fail the registration, just log the error
      }
    }

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
