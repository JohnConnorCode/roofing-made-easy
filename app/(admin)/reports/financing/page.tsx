'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart } from '@/components/admin/charts/bar-chart'
import {
  Landmark,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface FinancingData {
  pipeline: Array<{ status: string; count: number }>
  summary: {
    totalApplications: number
    approvedCount: number
    deniedCount: number
    approvalRate: number
    avgRequestedAmount: number
    avgApprovedAmount: number
    totalApprovedAmount: number
  }
  byCreditRange: Array<{
    creditRange: string
    count: number
    approvedCount: number
    approvalRate: number
  }>
  byLender: Array<{
    lenderName: string
    count: number
    approvedCount: number
    approvalRate: number
    avgApprovedAmount: number
    avgRate: number | null
    avgTermMonths: number | null
  }>
  conversionImpact: {
    financedWinRate: number
    nonFinancedWinRate: number
    financedLeadCount: number
    liftPct: number
  }
  pendingApplications: Array<{
    id: string
    lenderName: string
    status: string
    requestedAmount: number
    daysPending: number
  }>
}

const creditRangeColors: Record<string, string> = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  fair: 'text-amber-600',
  poor: 'text-red-600',
}

export default function FinancingPage() {
  const [data, setData] = useState<FinancingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/financing')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load financing data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financing Performance</h1>
          <p className="text-slate-500">Application pipeline, lender stats, and conversion impact</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Applications</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.summary.totalApplications || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <Landmark className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Approval Rate</p>
                    <p className={`text-2xl font-bold ${
                      (data?.summary.approvalRate || 0) >= 60 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {isLoading ? '...' : `${data?.summary.approvalRate || 0}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Approved Amount</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : formatCurrency(data?.summary.avgApprovedAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Win Rate Lift</p>
                    <p className={`text-2xl font-bold ${
                      (data?.conversionImpact.liftPct || 0) > 0 ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {isLoading ? '...' : data?.conversionImpact.liftPct != null
                        ? `${data.conversionImpact.liftPct > 0 ? '+' : ''}${data.conversionImpact.liftPct}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Approved Amount */}
          {data?.summary.totalApprovedAmount != null && data.summary.totalApprovedAmount > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Total Approved Financing</span>
                <span className="text-lg font-bold text-blue-900">{formatCurrency(data.summary.totalApprovedAmount)}</span>
              </CardContent>
            </Card>
          )}

          {/* Pipeline */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-600" />
                Application Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.pipeline && data.pipeline.length > 0 ? (
                <BarChart
                  data={data.pipeline.map(p => ({
                    label: titleCase(p.status),
                    value: p.count,
                  }))}
                  horizontal
                />
              ) : (
                <div className="py-8 text-center text-slate-400">No application data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Impact Callout */}
          {data?.conversionImpact && data.conversionImpact.financedLeadCount > 0 && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-900">Financing Impact on Win Rate</h3>
                    <p className="mt-1 text-emerald-800">
                      Leads with financing close at <span className="font-bold">{data.conversionImpact.financedWinRate}%</span> vs{' '}
                      <span className="font-bold">{data.conversionImpact.nonFinancedWinRate}%</span> without financing
                      ({data.conversionImpact.financedLeadCount} financed leads tracked).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Lender Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                By Lender
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.byLender && data.byLender.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Lender</th>
                        <th className="pb-3 pr-4 text-right">Apps</th>
                        <th className="pb-3 pr-4 text-right">Approved</th>
                        <th className="pb-3 pr-4 text-right">Rate</th>
                        <th className="pb-3 pr-4 text-right">Avg Approved</th>
                        <th className="pb-3 pr-4 text-right">Avg APR</th>
                        <th className="pb-3 text-right">Avg Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byLender.map(l => (
                        <tr key={l.lenderName} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{l.lenderName}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{l.count}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{l.approvedCount}</td>
                          <td className="py-3 pr-4 text-right">
                            <span className={`font-medium ${
                              l.approvalRate >= 60 ? 'text-green-600' : l.approvalRate >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {l.approvalRate}%
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(l.avgApprovedAmount)}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{l.avgRate != null ? `${l.avgRate}%` : 'N/A'}</td>
                          <td className="py-3 text-right text-slate-600">{l.avgTermMonths != null ? `${l.avgTermMonths}mo` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No lender data yet</div>
              )}
            </CardContent>
          </Card>

          {/* By Credit Range */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                By Credit Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.byCreditRange && data.byCreditRange.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Credit Range</th>
                        <th className="pb-3 pr-4 text-right">Applications</th>
                        <th className="pb-3 pr-4 text-right">Approved</th>
                        <th className="pb-3 text-right">Approval Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byCreditRange.map(cr => (
                        <tr key={cr.creditRange} className="border-b last:border-0 hover:bg-slate-50">
                          <td className={`py-3 pr-4 font-medium ${
                            creditRangeColors[cr.creditRange.toLowerCase()] || 'text-slate-700'
                          }`}>
                            {cr.creditRange}
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">{cr.count}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{cr.approvedCount}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              cr.approvalRate >= 60 ? 'text-green-600' : cr.approvalRate >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {cr.approvalRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No credit data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Pending Applications */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pending Applications ({data?.pendingApplications?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.pendingApplications && data.pendingApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Lender</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4 text-right">Requested</th>
                        <th className="pb-3 text-right">Days Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pendingApplications.map(a => (
                        <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{a.lenderName}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              {titleCase(a.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(a.requestedAmount)}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              a.daysPending > 30 ? 'text-red-600' : a.daysPending > 14 ? 'text-amber-600' : 'text-slate-600'
                            }`}>
                              {a.daysPending}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No pending applications</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminPageTransition>
  )
}
