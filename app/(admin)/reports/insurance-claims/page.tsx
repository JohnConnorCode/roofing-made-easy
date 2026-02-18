'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart } from '@/components/admin/charts/bar-chart'
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Clock,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { Skeleton, SkeletonReportContent } from '@/components/ui/skeleton'

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface InsuranceClaimsData {
  pipeline: Array<{ status: string; count: number }>
  summary: {
    totalClaims: number
    approvedCount: number
    deniedCount: number
    totalApprovedAmount: number
    avgApprovedAmount: number
    avgDaysToApproval: number | null
  }
  byCarrier: Array<{
    carrier: string
    claimCount: number
    approvedCount: number
    approvalRate: number
    avgApprovedAmount: number
    avgDaysToApproval: number | null
  }>
  stuckClaims: Array<{
    id: string
    claimNumber: string
    carrier: string
    status: string
    daysSinceCreated: number
    causeOfLoss: string
  }>
  byCauseOfLoss: Array<{ cause: string; count: number }>
}

export default function InsuranceClaimsPage() {
  const [data, setData] = useState<InsuranceClaimsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/insurance-claims')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load insurance claims data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const approvalRate = data?.summary.totalClaims
    ? Math.round((data.summary.approvedCount / data.summary.totalClaims) * 100)
    : 0

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Insurance Claims</h1>
            <p className="text-slate-500">Claims pipeline, carrier performance, and stuck claims</p>
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
      </FadeInSection>

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
          <FadeInSection delay={100} animation="slide-up">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Claims</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.summary.totalClaims || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-rose-100 p-2">
                    <Shield className="h-5 w-5 text-rose-600" />
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
                      approvalRate >= 70 ? 'text-green-600' : approvalRate >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : `${approvalRate}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.summary.approvedCount || 0} approved, {data?.summary.deniedCount || 0} denied
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Payout</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : formatCurrency(data?.summary.avgApprovedAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Days to Approval</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.summary.avgDaysToApproval != null
                        ? `${data.summary.avgDaysToApproval}d`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </FadeInSection>

          {/* Pipeline */}
          <FadeInSection delay={200} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-600" />
                Claims Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.pipeline && data.pipeline.length > 0 ? (
                <BarChart
                  data={data.pipeline.map(p => ({
                    label: titleCase(p.status),
                    value: p.count,
                  }))}
                  horizontal
                />
              ) : (
                <div className="py-8 text-center text-slate-400">No claims data yet</div>
              )}
            </CardContent>
          </Card>

          </FadeInSection>

          {/* By Carrier Table */}
          <FadeInSection delay={300} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Performance by Carrier
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.byCarrier && data.byCarrier.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Carrier</th>
                        <th className="pb-3 pr-4 text-right">Claims</th>
                        <th className="pb-3 pr-4 text-right">Approved</th>
                        <th className="pb-3 pr-4 text-right">Approval Rate</th>
                        <th className="pb-3 pr-4 text-right">Avg Payout</th>
                        <th className="pb-3 text-right">Avg Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byCarrier.map(c => (
                        <tr key={c.carrier} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{c.carrier}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{c.claimCount}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{c.approvedCount}</td>
                          <td className="py-3 pr-4 text-right">
                            <span className={`font-medium ${
                              c.approvalRate >= 70 ? 'text-green-600' : c.approvalRate >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {c.approvalRate}%
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(c.avgApprovedAmount)}</td>
                          <td className="py-3 text-right text-slate-600">{c.avgDaysToApproval ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No carrier data yet</div>
              )}
            </CardContent>
          </Card>

          </FadeInSection>

          {/* Stuck Claims */}
          <FadeInSection delay={400} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Stuck Claims ({data?.stuckClaims?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.stuckClaims && data.stuckClaims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Claim #</th>
                        <th className="pb-3 pr-4">Carrier</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Cause</th>
                        <th className="pb-3 text-right">Days Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.stuckClaims.map(c => (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{c.claimNumber}</td>
                          <td className="py-3 pr-4 text-slate-600">{c.carrier}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              {titleCase(c.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{c.causeOfLoss}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              c.daysSinceCreated > 60 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {c.daysSinceCreated}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No stuck claims</div>
              )}
            </CardContent>
          </Card>

          </FadeInSection>

          {/* Cause of Loss */}
          <FadeInSection delay={500} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Cause of Loss Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.byCauseOfLoss && data.byCauseOfLoss.length > 0 ? (
                <BarChart
                  data={data.byCauseOfLoss.map(c => ({
                    label: titleCase(c.cause),
                    value: c.count,
                  }))}
                  horizontal
                />
              ) : (
                <div className="py-8 text-center text-slate-400">No cause of loss data</div>
              )}
            </CardContent>
          </Card>
          </FadeInSection>
        </>
      )}
    </AdminPageTransition>
  )
}
