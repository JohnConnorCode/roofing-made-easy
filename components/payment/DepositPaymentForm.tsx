'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripe, isStripeConfiguredClient } from '@/lib/stripe/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface DepositPaymentFormProps {
  leadId: string
  estimateId?: string
  amount: number // in dollars
  onSuccess?: () => void
  onError?: (error: string) => void
}

function PaymentForm({
  amount,
  onSuccess,
  onError,
}: {
  amount: number
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/portal?payment=success`,
      },
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      onError?.(submitError.message || 'Payment failed')
      setIsProcessing(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-[#1a1f2e] rounded-lg border border-slate-700">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
        leftIcon={!isProcessing ? <CreditCard className="h-5 w-5" /> : undefined}
      >
        Pay {formatCurrency(amount)} Deposit
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

export function DepositPaymentForm({
  leadId,
  estimateId,
  amount,
  onSuccess,
  onError,
}: DepositPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Check for payment success from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setIsComplete(true)
    }
  }, [])

  // Create payment intent
  useEffect(() => {
    if (isComplete) return

    async function createIntent() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            estimateId,
            amount: Math.round(amount * 100), // convert to cents
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment initialization failed'
        setError(message)
        onError?.(message)
      } finally {
        setIsLoading(false)
      }
    }

    createIntent()
  }, [leadId, estimateId, amount, onError, isComplete])

  if (!isStripeConfiguredClient()) {
    return (
      <Card className="border-slate-700 bg-[#161a23]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-slate-400">
            <AlertTriangle className="h-5 w-5" />
            <p>Payment service is not available at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    return (
      <Card className="border-slate-700 bg-[#161a23]">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3d7a5a]/20">
            <CheckCircle className="h-8 w-8 text-[#3d7a5a]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            Payment Successful!
          </h3>
          <p className="text-slate-400">
            Thank you for your deposit of {formatCurrency(amount)}. We&apos;ll be in touch shortly.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="border-slate-700 bg-[#161a23]">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c9a25c]" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-slate-700 bg-[#161a23]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <Card className="border-slate-700 bg-[#161a23]">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#c9a25c]" />
          Secure Deposit Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-[#0c0f14] border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Deposit Amount</span>
            <span className="text-2xl font-bold text-[#c9a25c]">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        <Elements
          stripe={getStripe()}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#c9a25c',
                colorBackground: '#1a1f2e',
                colorText: '#e2e8f0',
                colorDanger: '#ef4444',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            amount={amount}
            onSuccess={() => {
              setIsComplete(true)
              onSuccess?.()
            }}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}
