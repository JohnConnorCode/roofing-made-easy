/**
 * Send an invoice email to the bill-to contact and stamp status='sent'.
 * Extracted from /api/invoices/[invoiceId]/send so auto-create flows (deposit
 * invoice on estimate acceptance) can reuse the same template and side effects.
 */

import { sendEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SendInvoiceResult {
  success: boolean
  recipient?: string
  error?: string
}

export async function sendInvoiceEmail(
  supabase: SupabaseClient,
  invoiceId: string
): Promise<SendInvoiceResult> {
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select(`
      *,
      leads:lead_id(
        id,
        share_token,
        contacts(first_name, last_name, email)
      )
    `)
    .eq('id', invoiceId)
    .single()

  if (fetchError || !invoice) {
    return { success: false, error: 'invoice_not_found' }
  }

  const invoiceData = invoice as {
    id: string
    invoice_number: string
    total: number
    due_date: string | null
    payment_type: string
    bill_to_email: string | null
    bill_to_name: string | null
    status: string
    leads: {
      id: string
      share_token: string
      contacts: Array<{ first_name?: string; last_name?: string; email?: string }>
    }
  }

  const recipientEmail = invoiceData.bill_to_email || invoiceData.leads?.contacts?.[0]?.email
  if (!recipientEmail) {
    return { success: false, error: 'no_recipient_email' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const invoiceUrl = `${baseUrl}/portal/invoices/${invoiceId}`

  const recipientName = invoiceData.bill_to_name || invoiceData.leads?.contacts?.[0]?.first_name || 'Valued Customer'
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoiceData.total)
  const dueDate = invoiceData.due_date
    ? new Date(invoiceData.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Upon receipt'

  const isDeposit = invoiceData.payment_type === 'deposit'
  const heading = isDeposit ? 'Deposit invoice ready' : 'Your invoice is ready'
  const intro = isDeposit
    ? `Thanks for accepting your quote. Your deposit invoice is ready — paying it lets us lock in your spot and start scheduling.`
    : `Your invoice is ready for review.`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #c9a25c; }
          .content { padding: 30px 0; }
          .button { display: inline-block; background: #c9a25c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .details { background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #0c0f14; margin: 0;">${heading}</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName},</p>
            <p>${intro}</p>
            <div class="details">
              <p><strong>Invoice:</strong> ${invoiceData.invoice_number}</p>
              <p><strong>Amount Due:</strong> ${amount}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <p style="text-align: center;">
              <a href="${invoiceUrl}" class="button">View and Pay Invoice</a>
            </p>
            <p>If you have any questions, just reply to this email and we'll get right back to you.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing Farrell Roofing.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const subject = isDeposit
    ? `Deposit invoice ${invoiceData.invoice_number} — let's lock in your spot`
    : `Invoice ${invoiceData.invoice_number} from Farrell Roofing`

  const emailResult = await sendEmail({
    to: recipientEmail,
    subject,
    html,
  })

  if (!emailResult.success) {
    logger.error('[sendInvoiceEmail] send failed', {
      invoiceId,
      error: String(emailResult.error),
    })
    return { success: false, error: 'email_send_failed' }
  }

  // Stamp sent_at + bump status to 'sent' (only from draft).
  await supabase
    .from('invoices')
    .update({
      status: invoiceData.status === 'draft' ? 'sent' : invoiceData.status,
      sent_at: new Date().toISOString(),
    } as never)
    .eq('id', invoiceId)

  return { success: true, recipient: recipientEmail }
}
