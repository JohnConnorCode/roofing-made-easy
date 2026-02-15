'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Receipt,
  RefreshCw,
  AlertTriangle,
  Download,
} from 'lucide-react'
import Link from 'next/link'

interface AgingInvoice {
  invoice_id: string
  invoice_number: string
  bill_to_name: string | null
  bill_to_email: string | null
  total: number
  amount_paid: number
  balance_due: number
  issue_date: string
  due_date: string | null
  status: string
  aging_bucket: string
  days_overdue: number
}

interface AgingBucket {
  count: number
  total: number
}

const BUCKET_LABELS: Record<string, string> = {
  current: 'Current',
  '1_30': '1-30 Days',
  '31_60': '31-60 Days',
  '61_90': '61-90 Days',
  '90_plus': '90+ Days',
}

const BUCKET_COLORS: Record<string, string> = {
  current: 'bg-green-100 text-green-700 border-green-200',
  '1_30': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '31_60': 'bg-orange-100 text-orange-700 border-orange-200',
  '61_90': 'bg-red-100 text-red-700 border-red-200',
  '90_plus': 'bg-red-200 text-red-800 border-red-300',
}

export default function ARAgingPage() {
  const [invoices, setInvoices] = useState<AgingInvoice[]>([])
  const [buckets, setBuckets] = useState<Record<string, AgingBucket>>({})
  const [totalAR, setTotalAR] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeBucket, setActiveBucket] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/ar-aging')
      if (!response.ok) throw new Error('Failed to fetch AR data')

      const data = await response.json()
      setInvoices(data.invoices || [])
      setBuckets(data.buckets || {})
      setTotalAR(data.summary?.totalAR || 0)
    } catch (err) {
      setError('Unable to load AR aging data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredInvoices = activeBucket
    ? invoices.filter((i) => i.aging_bucket === activeBucket)
    : invoices

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Accounts Receivable Aging</h1>
            <p className="text-slate-500">Outstanding invoices by aging bucket</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/reports/export?type=invoices" download>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export CSV
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {!error && isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {!error && !isLoading && (
        <>
          {/* Total AR */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Outstanding AR</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalAR)}</p>
                </div>
                <div className="rounded-lg bg-amber-100 p-3">
                  <Receipt className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aging Buckets */}
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(BUCKET_LABELS).map(([key, label]) => {
              const bucket = buckets[key] || { count: 0, total: 0 }
              const isActive = activeBucket === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveBucket(isActive ? null : key)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    isActive
                      ? `${BUCKET_COLORS[key]} ring-2 ring-offset-1 ring-current`
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`text-sm font-medium ${isActive ? '' : 'text-slate-600'}`}>{label}</p>
                  <p className={`text-xl font-bold mt-1 ${isActive ? '' : 'text-slate-900'}`}>
                    {formatCurrency(bucket.total)}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'opacity-75' : 'text-slate-400'}`}>
                    {bucket.count} invoice{bucket.count !== 1 ? 's' : ''}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Invoice Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>
                {activeBucket ? `${BUCKET_LABELS[activeBucket]} Invoices` : 'All Outstanding Invoices'}
                {' '}({filteredInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="mt-2 text-slate-500">No outstanding invoices</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Issue Date</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Days Overdue</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Paid</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.invoice_id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.invoice_number}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{inv.bill_to_name || inv.bill_to_email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{inv.issue_date ? formatDate(inv.issue_date) : '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{inv.due_date ? formatDate(inv.due_date) : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                              inv.days_overdue === 0 ? 'bg-green-100 text-green-700' :
                              inv.days_overdue <= 30 ? 'bg-yellow-100 text-yellow-700' :
                              inv.days_overdue <= 60 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {inv.days_overdue === 0 ? 'Current' : `${inv.days_overdue}d`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.total)}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(inv.amount_paid)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatCurrency(inv.balance_due)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
