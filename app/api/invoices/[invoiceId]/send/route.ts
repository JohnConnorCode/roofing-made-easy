import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { sendInvoiceEmail } from '@/lib/invoices/send'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// POST - Send invoice to customer
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { invoiceId } = await params
  const supabase = await createClient()

  const result = await sendInvoiceEmail(supabase, invoiceId)

  if (!result.success) {
    const errorMap: Record<string, { status: number; message: string }> = {
      invoice_not_found: { status: 404, message: 'Invoice not found' },
      no_recipient_email: { status: 400, message: 'No email address found for invoice recipient' },
      email_send_failed: { status: 500, message: 'Failed to send invoice email' },
    }
    const mapped = errorMap[result.error ?? ''] ?? { status: 500, message: 'Failed to send invoice' }
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }

  return NextResponse.json({
    success: true,
    message: `Invoice sent to ${result.recipient}`,
  })
}
