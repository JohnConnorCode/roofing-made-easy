'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  FileText,
  Send,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
  Search,
} from 'lucide-react'

export interface InvoiceListItem {
  id: string
  invoice_number: string
  status: string
  payment_type: string
  total: number
  balance_due: number
  issue_date: string
  due_date: string | null
  bill_to_name: string | null
  bill_to_email: string | null
  created_at: string
  leads?: {
    id: string
    contacts: Array<{ first_name?: string; last_name?: string; email?: string }>
  }
}

interface InvoiceListProps {
  initialInvoices?: InvoiceListItem[]
  leadId?: string
  customerId?: string
  jobId?: string
  showCreateButton?: boolean
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  draft: { icon: FileText, className: 'text-slate-500 bg-slate-100', label: 'Draft' },
  sent: { icon: Send, className: 'text-blue-600 bg-blue-100', label: 'Sent' },
  viewed: { icon: Eye, className: 'text-purple-600 bg-purple-100', label: 'Viewed' },
  paid: { icon: CheckCircle, className: 'text-green-600 bg-green-100', label: 'Paid' },
  partially_paid: { icon: Clock, className: 'text-amber-600 bg-amber-100', label: 'Partial' },
  overdue: { icon: AlertCircle, className: 'text-red-600 bg-red-100', label: 'Overdue' },
  cancelled: { icon: XCircle, className: 'text-slate-500 bg-slate-100', label: 'Cancelled' },
  refunded: { icon: RefreshCw, className: 'text-slate-600 bg-slate-100', label: 'Refunded' },
}

export function InvoiceList({
  initialInvoices,
  leadId,
  customerId,
  jobId,
  showCreateButton = true,
}: InvoiceListProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initialInvoices || [])
  const [loading, setLoading] = useState(!initialInvoices)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialInvoices) {
      fetchInvoices()
    }
  }, [leadId, customerId, jobId, statusFilter])

  async function fetchInvoices() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (leadId) params.set('leadId', leadId)
      if (customerId) params.set('customerId', customerId)
      if (jobId) params.set('jobId', jobId)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/invoices?${params}`)
      if (!res.ok) throw new Error('Failed to fetch invoices')

      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function getCustomerName(invoice: InvoiceListItem): string {
    if (invoice.bill_to_name) return invoice.bill_to_name
    const contact = invoice.leads?.contacts?.[0]
    if (contact) {
      return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || 'Unknown'
    }
    return 'Unknown'
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const filteredInvoices = invoices.filter(inv => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      inv.invoice_number.toLowerCase().includes(query) ||
      getCustomerName(inv).toLowerCase().includes(query) ||
      inv.bill_to_email?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Error loading invoices: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      {sendSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5" />
          <span>Invoice {sendSuccess} sent successfully!</span>
        </div>
      )}
      {sendError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 shadow-lg animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5" />
          <span>{sendError}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-light"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        {showCreateButton && (
          <Button
            onClick={() => router.push(`/admin/invoices/new${leadId ? `?leadId=${leadId}` : ''}`)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Invoice
          </Button>
        )}
      </div>

      {/* Invoice Table */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-500">No invoices found</p>
          {showCreateButton && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push(`/admin/invoices/new${leadId ? `?leadId=${leadId}` : ''}`)}
            >
              Create First Invoice
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(invoice => {
                const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
                const StatusIcon = statusConfig.icon

                return (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                  >
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{getCustomerName(invoice)}</div>
                        {invoice.bill_to_email && (
                          <div className="text-xs text-slate-500">{invoice.bill_to_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-slate-500">
                      {invoice.payment_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.balance_due > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(invoice.balance_due)}
                        </span>
                      ) : (
                        <span className="text-green-600">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? formatDate(invoice.due_date) : 'On receipt'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {invoice.status === 'draft' && (
                          <button
                            onClick={async e => {
                              e.stopPropagation()
                              setSendingInvoiceId(invoice.id)
                              setSendError(null)
                              setSendSuccess(null)
                              try {
                                const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
                                if (!res.ok) {
                                  const data = await res.json()
                                  throw new Error(data.error || 'Failed to send invoice')
                                }
                                setSendSuccess(invoice.invoice_number)
                                setTimeout(() => setSendSuccess(null), 3000)
                                fetchInvoices()
                              } catch (err) {
                                setSendError(err instanceof Error ? err.message : 'Failed to send invoice')
                                setTimeout(() => setSendError(null), 5000)
                              } finally {
                                setSendingInvoiceId(null)
                              }
                            }}
                            disabled={sendingInvoiceId === invoice.id}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                            title="Send Invoice"
                          >
                            {sendingInvoiceId === invoice.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
