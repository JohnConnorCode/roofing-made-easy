'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InvoiceViewer } from '@/components/customer/InvoiceViewer'
import { ArrowLeft } from 'lucide-react'

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
  invoice_line_items: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

export default function CustomerInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [params.invoiceId])

  async function fetchInvoice() {
    try {
      setLoading(true)
      const res = await fetch(`/api/customer/invoices/${params.invoiceId}`)
      if (!res.ok) throw new Error('Invoice not found')
      const data = await res.json()
      setInvoice(data.invoice)

      // Mark as viewed
      if (data.invoice.status === 'sent') {
        await fetch(`/api/customer/invoices/${params.invoiceId}/view`, { method: 'POST' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3" />
          <div className="h-64 bg-slate-800 rounded" />
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-red-300">
          {error || 'Invoice not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/portal/invoices')}
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </button>

        <InvoiceViewer invoice={invoice} onPaymentComplete={fetchInvoice} />
      </div>
    </div>
  )
}
