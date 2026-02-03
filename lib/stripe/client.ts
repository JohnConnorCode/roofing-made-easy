'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'

// Client-side Stripe initialization
let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

// Check if Stripe is configured on client
export function isStripeConfiguredClient(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}
