'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Target,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StageVelocity {
  stage: string
  avgDurationMinutes: number
  avgDurationDays: number
  totalLeads: number
  medianDurationMinutes: number
}

interface ConversionStep {
  fromStage: string
  toStage: string
  count: number
  percentage: number
}

interface Cohort {
  month: string
  total: number
  won: number
  lost: number
  active: number
  conversionRate: number
}

interface VelocityData {
  period: {
    days: number
    from: string
    to: string
  }
  stageVelocity: StageVelocity[]
  conversions: ConversionStep[]
  cohorts: Cohort[]
  dealVelocity: {
    avgDaysToClose: number
    dealsAnalyzed: number
  }
}

const PERIOD_OPTIONS = [
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
]

const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  intake_started: 'Intake Started',
  intake_complete: 'Intake Complete',
  estimate_generated: 'Estimate Generated',
  consultation_scheduled: 'Consultation',
  quote_sent: 'Quote Sent',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
}

export function VelocityAnalytics() {
  const [data, setData] = useState<VelocityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('90')

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/analytics/velocity?days=${period}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-10 w-10 text-gold" />
        <p className="mt-3 text-slate-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={fetchData}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) return null

  const maxDuration = Math.max(...data.stageVelocity.map((s) => s.avgDurationDays), 1)

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Pipeline Velocity</h3>
        <Select
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          className="w-40"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold-light/20 p-2">
                <Gauge className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Avg Deal Velocity</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.dealVelocity.avgDaysToClose} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Deals Analyzed</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.dealVelocity.dealsAnalyzed}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Top Conversion</div>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.max(...data.conversions.map((c) => c.percentage), 0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Slowest Stage</div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.stageVelocity.length > 0
                    ? STAGE_LABELS[
                        data.stageVelocity.reduce((prev, curr) =>
                          curr.avgDurationDays > prev.avgDurationDays ? curr : prev
                        ).stage
                      ] || 'N/A'
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Duration Chart */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Average Time in Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.stageVelocity.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-slate-700 truncate">
                  {STAGE_LABELS[stage.stage] || stage.stage}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 rounded bg-gold-light transition-all"
                      style={{
                        width: `${Math.max((stage.avgDurationDays / maxDuration) * 100, 4)}%`,
                      }}
                    />
                    <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                      {stage.avgDurationDays < 1
                        ? `${Math.round(stage.avgDurationMinutes / 60)}h`
                        : `${stage.avgDurationDays}d`}
                    </span>
                  </div>
                </div>
                <div className="w-20 text-right text-xs text-slate-500">
                  {stage.totalLeads} leads
                </div>
              </div>
            ))}
            {data.stageVelocity.length === 0 && (
              <p className="text-center py-4 text-slate-500">
                No stage history data available for this period
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.conversions.map((conversion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {STAGE_LABELS[conversion.fromStage] || conversion.fromStage}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {STAGE_LABELS[conversion.toStage] || conversion.toStage}
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-sm text-slate-500">{conversion.count} leads</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm font-medium ${
                      conversion.percentage >= 70
                        ? 'bg-green-100 text-green-700'
                        : conversion.percentage >= 40
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {conversion.percentage}%
                  </span>
                </div>
              </div>
            ))}
            {data.conversions.length === 0 && (
              <p className="text-center py-4 text-slate-500">
                No conversion data available for this period
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Monthly Cohort Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-slate-500">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3 pr-4 text-right">Won</th>
                  <th className="pb-3 pr-4 text-right">Lost</th>
                  <th className="pb-3 pr-4 text-right">Active</th>
                  <th className="pb-3 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort) => (
                  <tr key={cohort.month} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {new Date(cohort.month + '-01').toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-600">
                      {cohort.total}
                    </td>
                    <td className="py-3 pr-4 text-right text-green-600">
                      {cohort.won}
                    </td>
                    <td className="py-3 pr-4 text-right text-red-500">
                      {cohort.lost}
                    </td>
                    <td className="py-3 pr-4 text-right text-blue-600">
                      {cohort.active}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-sm font-medium ${
                          cohort.conversionRate >= 30
                            ? 'bg-green-100 text-green-700'
                            : cohort.conversionRate >= 15
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cohort.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {data.cohorts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      No cohort data available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
