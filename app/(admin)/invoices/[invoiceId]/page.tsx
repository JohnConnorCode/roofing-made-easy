'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  ArrowLeft,
  Send,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react'

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  is_taxable: boolean
}

interface InvoicePayment {
  id: string
  amount: number
  status: string
  payment_method: string | null
  paid_at: string | null
  payer_email: string | null
  payer_name: string | null
}

interface InvoiceDetails {
  id: string
  invoice_number: string
  lead_id: string
  customer_id: string | null
  status: string
  payment_type: string
  issue_date: string
  due_date: string | null
  sent_at: string | null
  viewed_at: string | null
  paid_at: string | null
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
  internal_notes: string | null
  terms: string | null
  created_at: string
  invoice_line_items: InvoiceLineItem[]
  invoice_payments: InvoicePayment[]
  leads?: {
    id: string
    status: string
    contacts: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>
    properties: Array<{ street_address?: string; city?: string; state?: string; zip_code?: string }>
  }
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; className: string; label: string; bg: string }> = {
  draft: { icon: FileText, className: 'text-slate-600', label: 'Draft', bg: 'bg-slate-100' },
  sent: { icon: Send, className: 'text-blue-600', label: 'Sent', bg: 'bg-blue-100' },
  viewed: { icon: CheckCircle, className: 'text-purple-600', label: 'Viewed', bg: 'bg-purple-100' },
  paid: { icon: CheckCircle, className: 'text-green-600', label: 'Paid', bg: 'bg-green-100' },
  partially_paid: { icon: Clock, className: 'text-amber-600', label: 'Partially Paid', bg: 'bg-amber-100' },
  overdue: { icon: AlertCircle, className: 'text-red-600', label: 'Overdue', bg: 'bg-red-100' },
  cancelled: { icon: XCircle, className: 'text-slate-500', label: 'Cancelled', bg: 'bg-slate-100' },
  refunded: { icon: RefreshCw, className: 'text-slate-600', label: 'Refunded', bg: 'bg-slate-100' },
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { confirm, ConfirmDialog } = useConfirmDialog()

  useEffect(() => {
    fetchInvoice()
  }, [params.invoiceId])

  async function fetchInvoice() {
    try {
      setLoading(true)
      const res = await fetch(`/api/invoices/${params.invoiceId}`)
      if (!res.ok) throw new Error('Invoice not found')
      const data = await res.json()
      setInvoice(data.invoice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!invoice) return
    setActionLoading('send')
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to send invoice')
      await fetchInvoice()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateStatus(status: string) {
    if (!invoice) return
    setActionLoading('status')
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchInvoice()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!invoice || invoice.status !== 'draft') return

    const confirmed = await confirm({
      title: 'Delete Draft Invoice',
      description: `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!confirmed) return

    setActionLoading('delete')
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete invoice')
      router.push('/admin/invoices')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice')
    } finally {
      setActionLoading(null)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="h-64 bg-slate-100 rounded" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Invoice not found'}
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon
  const contact = invoice.leads?.contacts?.[0]
  const property = invoice.leads?.properties?.[0]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/invoices')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.className}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              Created {formatDate(invoice.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
            leftIcon={<Download className="h-4 w-4" />}
          >
            PDF
          </Button>
          {invoice.status === 'draft' && (
            <>
              <Button
                onClick={handleSend}
                isLoading={actionLoading === 'send'}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Invoice
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={actionLoading === 'delete'}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Property Info */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-3">Bill To</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">
                      {invoice.bill_to_name || `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || 'Unknown'}
                    </span>
                  </div>
                  {(invoice.bill_to_email || contact?.email) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{invoice.bill_to_email || contact?.email}</span>
                    </div>
                  )}
                  {(invoice.bill_to_phone || contact?.phone) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{invoice.bill_to_phone || contact?.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-3">Property</h3>
                {property ? (
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span>
                      {property.street_address}<br />
                      {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">No property on file</span>
                )}
                {invoice.lead_id && (
                  <a
                    href={`/admin/leads/${invoice.lead_id}`}
                    className="inline-flex items-center gap-1 text-sm text-gold-dark hover:text-gold mt-3"
                  >
                    View Lead <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.invoice_line_items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-900">{item.description}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="bg-slate-50 px-4 py-4 border-t border-slate-200">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
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
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.amount_paid > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>-{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                )}
                {invoice.balance_due > 0 && (
                  <div className="flex justify-between font-bold text-red-600">
                    <span>Balance Due</span>
                    <span>{formatCurrency(invoice.balance_due)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payments */}
          {invoice.invoice_payments.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.invoice_payments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="font-medium text-slate-900">{formatCurrency(payment.amount)}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${payment.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {payment.status}
                      </span>
                      {payment.payer_name && (
                        <span className="ml-2 text-sm text-slate-500">by {payment.payer_name}</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{formatDate(payment.paid_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-medium text-slate-900 mb-4">Invoice Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-medium">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="capitalize">{invoice.payment_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Date</span>
                <span>{formatDate(invoice.issue_date).split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date</span>
                <span>{invoice.due_date ? formatDate(invoice.due_date).split(',')[0] : 'On receipt'}</span>
              </div>
              {invoice.sent_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Sent</span>
                  <span>{formatDate(invoice.sent_at)}</span>
                </div>
              )}
              {invoice.viewed_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Viewed</span>
                  <span>{formatDate(invoice.viewed_at)}</span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid</span>
                  <span>{formatDate(invoice.paid_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-medium text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleUpdateStatus('paid')}
                  isLoading={actionLoading === 'status'}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                >
                  Mark as Paid
                </Button>
              )}
              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => handleUpdateStatus('cancelled')}
                  isLoading={actionLoading === 'status'}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Cancel Invoice
                </Button>
              )}
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.internal_notes) && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-900 mb-4">Notes</h3>
              {invoice.notes && (
                <div className="mb-4">
                  <span className="text-xs text-slate-500 uppercase">Customer Notes</span>
                  <p className="text-slate-700 mt-1">{invoice.notes}</p>
                </div>
              )}
              {invoice.internal_notes && (
                <div>
                  <span className="text-xs text-slate-500 uppercase">Internal Notes</span>
                  <p className="text-slate-700 mt-1">{invoice.internal_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  )
}
