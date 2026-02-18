'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart } from '@/components/admin/charts/bar-chart'
import {
  Target,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { Skeleton, SkeletonReportContent } from '@/components/ui/skeleton'

interface EstimateAccuracyData {
  summary: {
    jobsAnalyzed: number
    avgPriceVariancePct: number
    avgMaterialVariancePct: number
    avgLaborVariancePct: number
    overEstimateCount: number
    underEstimateCount: number
  }
  varianceDistribution: Array<{ label: string; count: number }>
  trend: Array<{ month: string; avgAbsVariance: number; jobCount: number }>
  jobs: Array<{
    id: string
    jobNumber: string
    contractAmount: number
    estimatedAmount: number
    variancePct: number
    materialEstimated: number
    materialActual: number
    materialVariancePct: number | null
    laborEstimated: number
    laborActual: number
    laborVariancePct: number | null
  }>
}

function varianceColor(pct: number): string {
  const abs = Math.abs(pct)
  if (abs < 5) return 'text-green-600'
  if (abs < 15) return 'text-amber-600'
  return 'text-red-600'
}

export default function EstimateAccuracyPage() {
  const [data, setData] = useState<EstimateAccuracyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/estimate-accuracy')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load estimate accuracy data.')
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
      <FadeInSection delay={0} animation="fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estimate Accuracy</h1>
            <p className="text-slate-500">Estimate vs actual cost variance analysis</p>
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
                    <p className="text-sm text-slate-500">Jobs Analyzed</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.summary.jobsAnalyzed || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-100 p-2">
                    <Target className="h-5 w-5 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Price Variance</p>
                    <p className={`text-2xl font-bold ${varianceColor(data?.summary.avgPriceVariancePct || 0)}`}>
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : `${(data?.summary.avgPriceVariancePct || 0) > 0 ? '+' : ''}${data?.summary.avgPriceVariancePct || 0}%`}
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
                    <p className="text-sm text-slate-500">Over-Estimates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.summary.overEstimateCount || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <ArrowDown className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">Cost less than estimated</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Under-Estimates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.summary.underEstimateCount || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-100 p-2">
                    <ArrowUp className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">Cost more than estimated</p>
              </CardContent>
            </Card>
          </div>
          </FadeInSection>

          <FadeInSection delay={200} animation="slide-up">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Variance Distribution */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-600" />
                  Variance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonReportContent />
                ) : data?.varianceDistribution && data.varianceDistribution.some(b => b.count > 0) ? (
                  <BarChart
                    data={data.varianceDistribution.map(b => ({
                      label: b.label,
                      value: b.count,
                    }))}
                  />
                ) : (
                  <div className="py-8 text-center text-slate-400">No variance data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Avg Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonReportContent />
                ) : data?.trend && data.trend.length > 0 ? (
                  <BarChart
                    data={data.trend.map(t => ({
                      label: t.month,
                      value: t.avgAbsVariance,
                    }))}
                    formatValue={v => `${v}%`}
                  />
                ) : (
                  <div className="py-8 text-center text-slate-400">No trend data yet</div>
                )}
              </CardContent>
            </Card>
          </div>
          </FadeInSection>

          {/* Job Breakdown Table */}
          <FadeInSection delay={300} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Job-by-Job Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.jobs && data.jobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Job #</th>
                        <th className="pb-3 pr-4 text-right">Contract</th>
                        <th className="pb-3 pr-4 text-right">Estimated</th>
                        <th className="pb-3 pr-4 text-right">Variance</th>
                        <th className="pb-3 pr-4 text-right">Material Var</th>
                        <th className="pb-3 text-right">Labor Var</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.jobs.map(j => (
                        <tr key={j.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{j.jobNumber}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(j.contractAmount)}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(j.estimatedAmount)}</td>
                          <td className="py-3 pr-4 text-right">
                            <span className={`font-medium ${varianceColor(j.variancePct)}`}>
                              {j.variancePct > 0 ? '+' : ''}{j.variancePct}%
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            {j.materialVariancePct != null ? (
                              <span className={`font-medium ${varianceColor(j.materialVariancePct)}`}>
                                {j.materialVariancePct > 0 ? '+' : ''}{j.materialVariancePct}%
                              </span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {j.laborVariancePct != null ? (
                              <span className={`font-medium ${varianceColor(j.laborVariancePct)}`}>
                                {j.laborVariancePct > 0 ? '+' : ''}{j.laborVariancePct}%
                              </span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  No completed jobs with estimate data to analyze
                </div>
              )}
            </CardContent>
          </Card>
          </FadeInSection>
        </>
      )}
    </AdminPageTransition>
  )
}
