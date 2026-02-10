import Stripe from 'stripe'
import { getStripeCredentials } from '@/lib/credentials/loader'

// Cached Stripe client and webhook secret
let cachedStripe: Stripe | null = null
let cachedWebhookSecret: string | undefined

/**
 * Get a Stripe client instance
 * Creates client on-demand using credentials from DB or ENV
 */
async function getStripeClient(): Promise<Stripe | null> {
  const { credentials } = await getStripeCredentials()
  if (!credentials) return null

  // Return cached client if we have one with same key
  if (cachedStripe) return cachedStripe

  cachedStripe = new Stripe(credentials.secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
    timeout: 30000,
  })

  cachedWebhookSecret = credentials.webhookSecret

  return cachedStripe
}

/**
 * Get the webhook secret (for webhook verification)
 */
async function getWebhookSecret(): Promise<string | undefined> {
  const { credentials } = await getStripeCredentials()
  return credentials?.webhookSecret
}

// Legacy export for backwards compatibility (will be null at module load)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
      timeout: 30000,
    })
  : null

// Check if Stripe is configured (sync check for backwards compatibility)
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/**
 * Check if Stripe is configured (async, checks DB too)
 */
export async function isStripeConfiguredAsync(): Promise<boolean> {
  const { credentials } = await getStripeCredentials()
  return credentials !== null
}

// Payment types
export type PaymentType = 'deposit' | 'progress' | 'final' | 'refund'

// Create a payment intent for collecting deposits
export interface CreatePaymentIntentParams {
  amount: number // in cents
  currency?: string
  leadId: string
  estimateId?: string
  customerEmail: string
  customerName?: string
  description?: string
  metadata?: Record<string, string>
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<{ clientSecret: string; paymentIntentId: string } | { error: string }> {
  const stripeClient = await getStripeClient()

  if (!stripeClient) {
    return { error: 'Payment service not configured' }
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      receipt_email: params.customerEmail,
      description: params.description || 'Roofing deposit',
      metadata: {
        lead_id: params.leadId,
        estimate_id: params.estimateId || '',
        customer_name: params.customerName || '',
        ...params.metadata,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// Verify webhook signature
export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | { error: string }> {
  const stripeClient = await getStripeClient()

  if (!stripeClient) {
    return { error: 'Payment service not configured' }
  }

  const webhookSecret = await getWebhookSecret()
  if (!webhookSecret) {
    return { error: 'Webhook secret not configured' }
  }

  try {
    return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Webhook verification failed',
    }
  }
}

// Retrieve a payment intent
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | { error: string }> {
  const stripeClient = await getStripeClient()

  if (!stripeClient) {
    return { error: 'Payment service not configured' }
  }

  try {
    return await stripeClient.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to retrieve payment',
    }
  }
}

// Create a refund
export async function createRefund(
  paymentIntentId: string,
  amount?: number // partial refund amount in cents, or undefined for full refund
): Promise<Stripe.Refund | { error: string }> {
  const stripeClient = await getStripeClient()

  if (!stripeClient) {
    return { error: 'Payment service not configured' }
  }

  try {
    return await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create refund',
    }
  }
}
