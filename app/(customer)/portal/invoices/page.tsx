'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useAnalytics } from '@/lib/analytics'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  payment_type: string
  total: number
  balance_due: number
  issue_date: string
  due_date: string | null
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; className: string; badgeClass: string; label: string }> = {
  draft: { icon: FileText, className: 'text-slate-400 bg-slate-700', badgeClass: 'text-slate-300 bg-slate-700', label: 'Draft' },
  sent: { icon: Clock, className: 'text-blue-400 bg-blue-900/50', badgeClass: 'text-blue-300 bg-blue-900/50', label: 'Awaiting Payment' },
  viewed: { icon: Clock, className: 'text-purple-400 bg-purple-900/50', badgeClass: 'text-purple-300 bg-purple-900/50', label: 'Awaiting Payment' },
  paid: { icon: CheckCircle, className: 'text-green-400 bg-green-900/50', badgeClass: 'text-green-300 bg-green-900/50', label: 'Paid' },
  partially_paid: { icon: Clock, className: 'text-amber-400 bg-amber-900/50', badgeClass: 'text-amber-300 bg-amber-900/50', label: 'Partially Paid' },
  overdue: { icon: AlertCircle, className: 'text-red-400 bg-red-900/50', badgeClass: 'text-red-300 bg-red-900/50', label: 'Overdue' },
  cancelled: { icon: FileText, className: 'text-slate-400 bg-slate-700', badgeClass: 'text-slate-300 bg-slate-700', label: 'Cancelled' },
}

export default function CustomerInvoicesPage() {
  const router = useRouter()
  const { trackEngagement } = useAnalytics()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
      trackEngagement('portal_invoices_viewed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Upon receipt'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Split invoices into unpaid and paid
  const unpaidInvoices = invoices.filter(inv => !['paid', 'cancelled'].includes(inv.status))
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + inv.balance_due, 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3" />
          <div className="h-32 bg-slate-800 rounded" />
          <div className="h-32 bg-slate-800 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-red-300">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Invoices</h1>
        <p className="text-slate-400 mt-1">View and pay your invoices</p>
      </div>

      {/* Total Due Banner */}
      {totalDue > 0 && (
        <div className="bg-gradient-to-r from-gold to-gold-light rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Balance Due</p>
              <p className="text-3xl font-bold">{formatCurrency(totalDue)}</p>
            </div>
            {unpaidInvoices.length === 1 && (
              <Button
                onClick={() => router.push(`/portal/invoices/${unpaidInvoices[0].id}`)}
                className="bg-white text-gold-dark hover:bg-slate-100"
              >
                Pay Now
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Outstanding Invoices</h2>
          <div className="space-y-3">
            {unpaidInvoices.map(invoice => {
              const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.sent
              const StatusIcon = statusConfig.icon

              return (
                <Link
                  key={invoice.id}
                  href={`/portal/invoices/${invoice.id}`}
                  className="block bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-gold-light/50 hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${statusConfig.className.split(' ')[1]}`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.className.split(' ')[0]}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{invoice.invoice_number}</p>
                        <p className="text-sm text-slate-400">
                          Due: {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-100">{formatCurrency(invoice.balance_due)}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.badgeClass}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Paid Invoices */}
      {paidInvoices.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Payment History</h2>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paidInvoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-800 cursor-pointer"
                    onClick={() => router.push(`/portal/invoices/${invoice.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(invoice.issue_date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-200">{formatCurrency(invoice.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-900/50 text-green-300">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {invoices.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
          <FileText className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <p className="text-slate-300 mb-2">No invoices yet</p>
          <p className="text-sm text-slate-500">Invoices will appear here once your project begins</p>
        </div>
      )}
    </div>
  )
}
