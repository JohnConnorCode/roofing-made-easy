import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCustomer } from '@/lib/api/auth'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// GET - Get a single invoice for customer
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { customerId, error: authError } = await requireCustomer()
    if (authError) return authError

    const { invoiceId } = await params
    const supabase = await createClient()

    // Get customer's lead IDs
    const { data: customerLeads } = await supabase
      .from('customer_leads')
      .select('lead_id')
      .eq('customer_id', customerId!)

    const leadIds = customerLeads?.map((cl: { lead_id: string }) => cl.lead_id) || []

    // Get the invoice if it belongs to this customer
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        payment_type,
        issue_date,
        due_date,
        subtotal,
        tax_rate,
        tax_amount,
        discount_percent,
        discount_amount,
        total,
        amount_paid,
        balance_due,
        bill_to_name,
        bill_to_email,
        bill_to_phone,
        bill_to_address,
        notes,
        terms,
        invoice_line_items(
          id,
          description,
          quantity,
          unit_price,
          total
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check ownership
    const invoiceData = invoice as { lead_id?: string; customer_id?: string }
    const hasAccess =
      leadIds.includes(invoiceData.lead_id || '') ||
      invoiceData.customer_id === customerId

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    logger.error('Customer invoice fetch error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
