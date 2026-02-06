import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCustomer } from '@/lib/api/auth'

// GET - List customer's invoices
export async function GET(request: NextRequest) {
  try {
    const { customerId, error: authError } = await requireCustomer()
    if (authError) return authError

    const supabase = await createClient()

    // Get customer's lead IDs
    const { data: customerLeads } = await supabase
      .from('customer_leads')
      .select('lead_id')
      .eq('customer_id', customerId!)

    const leadIds = customerLeads?.map((cl: { lead_id: string }) => cl.lead_id) || []

    // Get invoices for these leads or directly linked to customer
    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        payment_type,
        total,
        balance_due,
        issue_date,
        due_date
      `)

    // Build OR clause based on available identifiers
    if (leadIds.length > 0) {
      query = query.or(`lead_id.in.(${leadIds.join(',')}),customer_id.eq.${customerId}`)
    } else {
      query = query.eq('customer_id', customerId!)
    }

    const { data: invoices, error } = await query
      .not('status', 'eq', 'draft')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invoices: invoices || [] })
  } catch (error) {
    console.error('Customer invoices fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
