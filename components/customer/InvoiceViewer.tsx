'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getStripe, isStripeConfiguredClient } from '@/lib/stripe/client'
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react'

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  payment_type: string
  issue_date: string
  due_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_percent: number
  discount_amount: number
  total: number
  amount_paid: number
  balance_due: number
  bill_to_name: string | null
  bill_to_email: string | null
  bill_to_phone: string | null
  bill_to_address: string | null
  notes: string | null
  terms: string | null
  invoice_line_items: InvoiceLineItem[]
}

interface InvoiceViewerProps {
  invoice: InvoiceData
  onPaymentComplete?: () => void
}

// Inner payment form component that uses Stripe hooks
function PaymentForm({
  invoiceId,
  amount,
  onSuccess,
  onCancel,
}: {
  invoiceId: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
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

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/portal/invoices?payment=success&invoice=${invoiceId}`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setIsProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
          leftIcon={!isProcessing ? <CreditCard className="h-4 w-4" /> : undefined}
          className="flex-1"
        >
          Pay {formatCurrency(amount)}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

// Payment modal with Stripe Elements
function PaymentModal({
  invoice,
  onSuccess,
  onClose,
}: {
  invoice: InvoiceData
  onSuccess: () => void
  onClose: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function createIntent() {
      try {
        const response = await fetch(`/api/invoices/${invoice.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: invoice.balance_due,
            payerEmail: invoice.bill_to_email || '',
            payerName: invoice.bill_to_name || 'Customer',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment initialization failed')
      } finally {
        setIsLoading(false)
      }
    }

    createIntent()
  }, [invoice])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isStripeConfiguredClient()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4" role="dialog" aria-modal="true">
          <div className="flex items-center gap-3 text-slate-500">
            <AlertTriangle className="h-5 w-5" />
            <p>Payment service is not available at this time.</p>
          </div>
          <Button variant="outline" onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="payment-modal-title" className="text-lg font-semibold text-slate-900">
            Pay Invoice {invoice.invoice_number}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount display */}
          <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Amount Due</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(invoice.balance_due)}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#c9a25c',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm
                invoiceId={invoice.id}
                amount={invoice.balance_due}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function InvoiceViewer({ invoice, onPaymentComplete }: InvoiceViewerProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const canPay = invoice.balance_due > 0 && !['paid', 'cancelled', 'refunded'].includes(invoice.status)

  // Check for payment success from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setPaymentSuccess(true)
      onPaymentComplete?.()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [onPaymentComplete])

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Upon receipt'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function getStatusDisplay() {
    if (paymentSuccess) {
      return { icon: CheckCircle, text: 'Payment Successful', className: 'text-green-600 bg-green-50' }
    }
    switch (invoice.status) {
      case 'paid':
        return { icon: CheckCircle, text: 'Paid', className: 'text-green-600 bg-green-50' }
      case 'overdue':
        return { icon: AlertCircle, text: 'Overdue', className: 'text-red-600 bg-red-50' }
      case 'partially_paid':
        return { icon: Clock, text: 'Partially Paid', className: 'text-amber-600 bg-amber-50' }
      default:
        return { icon: FileText, text: 'Pending', className: 'text-blue-600 bg-blue-50' }
    }
  }

  function handlePaymentSuccess() {
    setShowPaymentModal(false)
    setPaymentSuccess(true)
    onPaymentComplete?.()
    // Reload to get updated invoice status
    window.location.reload()
  }

  const statusDisplay = getStatusDisplay()
  const StatusIcon = statusDisplay.icon

  return (
    <div className="max-w-3xl mx-auto">
      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Payment Successful!</p>
            <p className="text-sm text-green-700">Thank you for your payment. A receipt has been sent to your email.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoice {invoice.invoice_number}</h1>
            <p className="text-slate-500 mt-1">Issued: {formatDate(invoice.issue_date)}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.className}`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium">{statusDisplay.text}</span>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Bill To</h3>
            <div className="text-slate-900">
              {invoice.bill_to_name && <p className="font-medium">{invoice.bill_to_name}</p>}
              {invoice.bill_to_email && <p>{invoice.bill_to_email}</p>}
              {invoice.bill_to_phone && <p>{invoice.bill_to_phone}</p>}
              {invoice.bill_to_address && (
                <p className="whitespace-pre-line">{invoice.bill_to_address}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Date:</span>
                <span className="font-medium">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-medium">{formatDate(invoice.due_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-medium capitalize">{invoice.payment_type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.invoice_line_items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-slate-900">{item.description}</td>
                <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-slate-600">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="bg-slate-50 px-6 py-4">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount ({invoice.discount_percent}%)</span>
                <span className="text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax ({(invoice.tax_rate * 100).toFixed(2)}%)</span>
                <span className="text-slate-900">{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Paid</span>
                <span className="text-green-600">-{formatCurrency(invoice.amount_paid)}</span>
              </div>
            )}
            {invoice.balance_due > 0 && invoice.status !== 'paid' && !paymentSuccess && (
              <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t border-slate-200">
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.balance_due)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Notes</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Terms */}
      {invoice.terms && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Terms & Conditions</h3>
          <p className="text-slate-600 text-sm whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Download PDF
        </Button>

        {canPay && !paymentSuccess && (
          <Button
            onClick={() => setShowPaymentModal(true)}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Pay {formatCurrency(invoice.balance_due)}
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}
