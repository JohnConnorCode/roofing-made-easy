/**
 * Record Manual Payment API
 * POST - Record a manual payment (check, cash, bank transfer)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { notifyAdmins } from '@/lib/notifications'
import { sendPaymentReceivedEmail } from '@/lib/email/notifications'
import { sendPaymentReceivedSms } from '@/lib/sms/twilio'
import { triggerWorkflows } from '@/lib/communication/workflow-engine'
import { logCommunication } from '@/lib/communication/log-direct-send'
import { z } from 'zod'

const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  payment_method: z.enum(['check', 'cash', 'bank_transfer']),
  reference_number: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const { invoiceId } = await params
    const body = await request.json()
    const parsed = recordPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get invoice to verify it exists and check balance
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, balance_due, status')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const inv = invoice as { id: string; balance_due: number; status: string }

    if (inv.status === 'cancelled' || inv.status === 'refunded') {
      return NextResponse.json(
        { error: `Cannot record payment on ${inv.status} invoice` },
        { status: 400 }
      )
    }

    if (parsed.data.amount > inv.balance_due) {
      return NextResponse.json(
        { error: `Payment amount ($${parsed.data.amount}) exceeds balance due ($${inv.balance_due})` },
        { status: 400 }
      )
    }

    // Insert payment record — existing DB triggers handle invoice totals and status updates
    const { data: payment, error: insertError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount: parsed.data.amount,
        status: 'succeeded',
        payment_method: parsed.data.payment_method,
        reference_number: parsed.data.reference_number || null,
        recorded_by: user!.id,
        paid_at: new Date().toISOString(),
        notes: parsed.data.notes || null,
      } as never)
      .select()
      .single()

    if (insertError) {
      console.error('Error recording payment:', insertError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    // Fetch invoice details for notifications
    const { data: invoiceDetails } = await supabase
      .from('invoices')
      .select('invoice_number, lead_id, customer_id, bill_to_name, bill_to_email, bill_to_phone, balance_due, payment_type')
      .eq('id', invoiceId)
      .single()

    const details = invoiceDetails as {
      invoice_number?: string; lead_id?: string; customer_id?: string
      bill_to_name?: string; bill_to_email?: string; bill_to_phone?: string
      balance_due?: number; payment_type?: string
    } | null

    const amount = parsed.data.amount
    const formattedAmount = `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

    // Fire-and-forget notifications
    notifyAdmins(
      'invoice_paid',
      `Payment Received: ${formattedAmount}`,
      `${details?.bill_to_name || 'Customer'} — ${details?.invoice_number || invoiceId}`,
      '/invoices'
    ).catch(err => console.error('Failed to notify admins of payment:', err))

    if (details?.bill_to_email) {
      sendPaymentReceivedEmail({
        customerEmail: details.bill_to_email,
        customerName: details.bill_to_name || undefined,
        amount,
        paymentType: (details.payment_type as 'deposit' | 'progress' | 'final') || 'progress',
        remainingBalance: details.balance_due ?? undefined,
      }).then(() => {
        logCommunication({
          channel: 'email', to: details.bill_to_email!, subject: 'Payment Received',
          leadId: details.lead_id || undefined, customerId: details.customer_id || undefined,
          category: 'payment_received',
        }).catch(() => {})
      }).catch(err => console.error('Failed to send payment email:', err))
    }

    if (details?.bill_to_phone) {
      sendPaymentReceivedSms(details.bill_to_phone, details.bill_to_name || 'Customer', formattedAmount)
        .then(() => {
          logCommunication({
            channel: 'sms', to: details.bill_to_phone!,
            leadId: details.lead_id || undefined, customerId: details.customer_id || undefined,
            category: 'payment_received',
          }).catch(() => {})
        }).catch(err => console.error('Failed to send payment SMS:', err))
    }

    if (details?.lead_id) {
      triggerWorkflows('payment_received', {
        leadId: details.lead_id,
        customerId: details.customer_id || undefined,
        data: { amount, invoice_number: details.invoice_number },
      }).catch(err => console.error('Failed to trigger payment workflows:', err))
    }

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Record payment POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
