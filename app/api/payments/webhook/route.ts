import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { sendPaymentReceivedEmail } from '@/lib/email'
import { sendPaymentReceivedSms } from '@/lib/sms'
import { z } from 'zod'
import type Stripe from 'stripe'
import { logger } from '@/lib/logger'

// Schema for validating payment intent metadata
const paymentMetadataSchema = z.object({
  lead_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  customer_name: z.string().optional(),
  payment_type: z.enum(['deposit', 'progress', 'final']).optional(),
  invoice_id: z.string().uuid().optional(),
  invoice_number: z.string().optional(),
})

// Disable body parsing for webhooks (we need raw body)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      )
    }

    // Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook
    const event = await constructWebhookEvent(body, signature)
    if ('error' in event) {
      return NextResponse.json({ error: event.error }, { status: 400 })
    }

    // Handle the event
    const supabase = await createClient()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(supabase, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(supabase, paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(supabase, charge)
        break
      }

      default:
        // Unhandled event type - no action needed
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('[Stripe Webhook] Critical error processing webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  // Validate metadata structure
  const metadataResult = paymentMetadataSchema.safeParse(paymentIntent.metadata)
  if (!metadataResult.success) {
    logger.error('[Payment Webhook] Invalid metadata structure', {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
      errors: metadataResult.error.flatten(),
    })
    // Continue with defaults - don't fail the webhook
  }
  const metadata = metadataResult.success ? metadataResult.data : {}
  const { lead_id, customer_name, payment_type, invoice_id } = metadata
  // The charges property exists in expanded PaymentIntent from webhooks
  const charges = (paymentIntent as Stripe.PaymentIntent & { charges?: { data: Stripe.Charge[] } }).charges
  const receiptUrl = charges?.data?.[0]?.receipt_url || undefined

  // Idempotency check: skip if already processed
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .eq('status', 'succeeded')
    .maybeSingle()

  if (existingPayment) {
    return
  }

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      receipt_url: receiptUrl || null,
    } as never)
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update invoice_payments and invoice balance if this is an invoice payment
  if (invoice_id) {
    await supabase
      .from('invoice_payments')
      .update({
        status: 'succeeded',
        paid_at: new Date().toISOString(),
      } as never)
      .eq('stripe_payment_intent_id', paymentIntent.id)

    // Recalculate balance_due from all succeeded payments
    const { data: payments } = await supabase
      .from('invoice_payments')
      .select('amount')
      .eq('invoice_id', invoice_id)
      .eq('status', 'succeeded')

    const totalPaid = (payments || []).reduce((sum, p) => sum + ((p as { amount: number }).amount || 0), 0)

    const { data: invoice } = await supabase
      .from('invoices')
      .select('total')
      .eq('id', invoice_id)
      .single()

    if (invoice) {
      const newBalance = Math.max(0, (invoice as { total: number }).total - totalPaid)
      const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid'
      await supabase
        .from('invoices')
        .update({
          balance_due: newBalance,
          status: newStatus,
          paid_at: newBalance <= 0 ? new Date().toISOString() : null,
        } as never)
        .eq('id', invoice_id)
    }
  }

  // Update lead status if this is a deposit
  if (lead_id) {
    await supabase
      .from('leads')
      .update({ status: 'won' } as never)
      .eq('id', lead_id)
  }

  // Fetch lead data for better email/SMS notifications
  let contactData: { phone?: string; consent_sms?: boolean; first_name?: string; last_name?: string } | null = null
  let propertyData: { street_address?: string; city?: string; state?: string } | null = null

  if (lead_id) {
    const { data: leadRelations } = await supabase
      .from('leads')
      .select('contacts(*), properties(*)')
      .eq('id', lead_id)
      .single()

    if (leadRelations) {
      const relations = leadRelations as {
        contacts: { phone?: string; consent_sms?: boolean; first_name?: string; last_name?: string }[] | { phone?: string; consent_sms?: boolean; first_name?: string; last_name?: string } | null
        properties: { street_address?: string; city?: string; state?: string }[] | { street_address?: string; city?: string; state?: string } | null
      }
      contactData = Array.isArray(relations.contacts) ? relations.contacts[0] : relations.contacts
      propertyData = Array.isArray(relations.properties) ? relations.properties[0] : relations.properties
    }
  }

  const amount = paymentIntent.amount / 100
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

  // Send professional payment confirmation email
  if (paymentIntent.receipt_email) {
    sendPaymentReceivedEmail({
      customerEmail: paymentIntent.receipt_email,
      customerName: customer_name || undefined,
      amount,
      paymentType: (payment_type as 'deposit' | 'progress' | 'final') || 'deposit',
      address: propertyData?.street_address,
      city: propertyData?.city,
      state: propertyData?.state,
      portalUrl: `${BASE_URL}/portal`,
      receiptUrl,
    }).catch((err) => {
      logger.error('[Payment Webhook] Failed to send payment confirmation email', {
        paymentIntentId: paymentIntent.id,
        email: paymentIntent.receipt_email,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    })
  }

  // Send SMS if customer consented
  if (contactData?.phone && contactData?.consent_sms) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

    sendPaymentReceivedSms(
      contactData.phone,
      customer_name || contactData?.first_name || 'there',
      formattedAmount
    ).catch((err) => {
      logger.error('[Payment Webhook] Failed to send payment confirmation SMS', {
        paymentIntentId: paymentIntent.id,
        phone: contactData.phone,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    })
  }

}

async function handlePaymentFailure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
    } as never)
    .eq('stripe_payment_intent_id', paymentIntent.id)

}

async function handleRefund(
  supabase: Awaited<ReturnType<typeof createClient>>,
  charge: Stripe.Charge
) {
  if (!charge.payment_intent) return

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent.id

  // Get the original payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!payment) return

  // Create refund record
  const refundAmount = charge.amount_refunded / 100
  await supabase.from('payments').insert({
    lead_id: (payment as { lead_id: string }).lead_id,
    estimate_id: (payment as { estimate_id: string | null }).estimate_id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_charge_id: charge.id,
    amount: -refundAmount, // negative for refund
    currency: 'USD',
    status: 'succeeded',
    type: 'refund',
    paid_at: new Date().toISOString(),
    payer_email: (payment as { payer_email: string }).payer_email,
    payer_name: (payment as { payer_name: string }).payer_name,
  } as never)

  // Update original payment status if fully refunded
  if (charge.refunded) {
    await supabase
      .from('payments')
      .update({ status: 'refunded' } as never)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('type', 'deposit')
  }

}
