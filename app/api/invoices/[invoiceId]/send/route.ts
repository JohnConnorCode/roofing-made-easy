import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { sendEmail } from '@/lib/email'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// POST - Send invoice to customer
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { invoiceId } = await params
    const supabase = await createClient()

    // Get the invoice with lead/contact info
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
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoiceData = invoice as {
      id: string
      invoice_number: string
      total: number
      due_date: string | null
      bill_to_email: string | null
      bill_to_name: string | null
      status: string
      leads: {
        id: string
        share_token: string
        contacts: Array<{ first_name?: string; last_name?: string; email?: string }>
      }
    }

    // Get recipient email
    const recipientEmail = invoiceData.bill_to_email || invoiceData.leads?.contacts?.[0]?.email

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address found for invoice recipient' },
        { status: 400 }
      )
    }

    // Build invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const invoiceUrl = `${baseUrl}/portal/invoices/${invoiceId}`

    // Build email content
    const recipientName = invoiceData.bill_to_name || invoiceData.leads?.contacts?.[0]?.first_name || 'Valued Customer'
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoiceData.total)
    const dueDate = invoiceData.due_date
      ? new Date(invoiceData.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Upon receipt'

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
              <h1 style="color: #0c0f14; margin: 0;">Invoice from Farrell Roofing</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              <p>Your invoice <strong>${invoiceData.invoice_number}</strong> is ready for review.</p>
              <div class="details">
                <p><strong>Amount Due:</strong> ${amount}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
              </div>
              <p style="text-align: center;">
                <a href="${invoiceUrl}" class="button">View Invoice</a>
              </p>
              <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing Farrell Roofing!</p>
              <p>123 Main Street, Tupelo, MS 38801 | (662) 555-0123</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoice_number} from Farrell Roofing`,
      html,
    })

    if (!emailResult.success) {
      console.error('Failed to send invoice email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send invoice email' },
        { status: 500 }
      )
    }

    // Update invoice status to sent
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: invoiceData.status === 'draft' ? 'sent' : invoiceData.status,
        sent_at: new Date().toISOString(),
      } as never)
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Failed to update invoice status:', updateError)
      // Email was sent, so don't return error
    }

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${recipientEmail}`,
    })
  } catch (error) {
    console.error('Invoice send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
