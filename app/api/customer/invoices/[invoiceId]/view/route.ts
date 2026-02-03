import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireCustomer } from '@/lib/api/auth'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// POST - Mark invoice as viewed
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { customerId, error: authError } = await requireCustomer()
    if (authError) return authError

    const { invoiceId } = await params
    const supabase = await createClient()

    // Get customer's lead IDs to verify access
    const { data: customerLeads } = await supabase
      .from('customer_leads')
      .select('lead_id')
      .eq('customer_id', customerId!)

    const leadIds = customerLeads?.map((cl: { lead_id: string }) => cl.lead_id) || []

    // Get and update the invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, lead_id, customer_id, status')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check ownership
    const invoiceData = invoice as { lead_id?: string; customer_id?: string; status: string }
    const hasAccess =
      leadIds.includes(invoiceData.lead_id || '') ||
      invoiceData.customer_id === customerId

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Update to viewed if currently sent
    if (invoiceData.status === 'sent') {
      await supabase
        .from('invoices')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString(),
        } as never)
        .eq('id', invoiceId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice view error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
