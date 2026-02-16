import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent, isStripeConfiguredAsync } from '@/lib/stripe/server'
import { requireAuth } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ invoiceId: string }>
}

// Schema for payment request
const paymentSchema = z.object({
  amount: z.number().positive().optional(), // If not provided, pays full balance
  payerEmail: z.string().email(),
  payerName: z.string().min(1),
})

// POST - Create a payment intent for an invoice
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Require authentication - only logged-in users can pay invoices
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Check if Stripe is configured
    const stripeConfigured = await isStripeConfiguredAsync()
    if (!stripeConfigured) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 503 }
      )
    }

    const { invoiceId } = await params
    const body = await request.json()
    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, lead_id, customer_id, invoice_number, total, balance_due, status')
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
      lead_id: string
      customer_id: string | null
      invoice_number: string
      total: number
      balance_due: number
      status: string
    }

    // Verify the authenticated user owns this invoice (admin or linked customer)
    const isAdmin =
      user!.user_metadata?.role === 'admin' ||
      user!.app_metadata?.role === 'admin'

    if (!isAdmin) {
      // Check if the user is linked to this invoice's customer
      const { data: customer } = await supabase
        .from('customers' as never)
        .select('id')
        .eq('auth_user_id', user!.id)
        .single()

      const customerId = (customer as { id: string } | null)?.id
      if (!customerId || customerId !== invoiceData.customer_id) {
        return NextResponse.json(
          { error: 'Not authorized to pay this invoice' },
          { status: 403 }
        )
      }
    }

    // Check invoice is payable
    if (['paid', 'cancelled', 'refunded'].includes(invoiceData.status)) {
      return NextResponse.json(
        { error: 'Invoice cannot be paid' },
        { status: 400 }
      )
    }

    // Determine payment amount
    const paymentAmount = parsed.data.amount || invoiceData.balance_due

    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    if (paymentAmount > invoiceData.balance_due) {
      return NextResponse.json(
        { error: 'Payment amount exceeds balance due' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent (amount in cents)
    const paymentResult = await createPaymentIntent({
      amount: Math.round(paymentAmount * 100),
      currency: 'usd',
      leadId: invoiceData.lead_id,
      customerEmail: parsed.data.payerEmail,
      customerName: parsed.data.payerName,
      description: `Payment for invoice ${invoiceData.invoice_number}`,
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoiceData.invoice_number,
      },
    })

    if ('error' in paymentResult) {
      console.error('Payment intent creation failed:', paymentResult.error)
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 500 }
      )
    }

    // Create a pending payment record
    const { error: paymentRecordError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount: paymentAmount,
        payment_method: 'card',
        stripe_payment_intent_id: paymentResult.paymentIntentId,
        status: 'pending',
        payer_email: parsed.data.payerEmail,
        payer_name: parsed.data.payerName,
      } as never)

    if (paymentRecordError) {
      console.error('Failed to create payment record:', paymentRecordError)
      // Continue anyway - the payment intent exists
    }

    // Update invoice to viewed if first interaction
    if (invoiceData.status === 'sent') {
      await supabase
        .from('invoices')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() } as never)
        .eq('id', invoiceId)
    }

    return NextResponse.json({
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
      amount: paymentAmount,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
