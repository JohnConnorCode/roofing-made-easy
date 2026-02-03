import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, requireCustomer } from '@/lib/api/auth'
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// GET - Generate PDF for an invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Try admin auth first, then customer auth
    const adminAuth = await requireAdmin()
    let isAuthorized = !adminAuth.error

    if (!isAuthorized) {
      const customerAuth = await requireCustomer()
      isAuthorized = !customerAuth.error
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId } = await params
    const supabase = await createClient()

    // Get the complete invoice data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        leads:lead_id(
          id,
          contacts(first_name, last_name, email, phone),
          properties(street_address, city, state, zip_code)
        ),
        invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Generate the PDF
    const pdfBuffer = await generateInvoicePdf(invoice as never)

    // Return the PDF
    const invoiceData = invoice as { invoice_number: string }
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoiceData.invoice_number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
