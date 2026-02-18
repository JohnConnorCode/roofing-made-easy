'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  Hammer,
  BarChart3,
  TrendingUp,
  FileText,
  CloudRain,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { Skeleton, SkeletonReportContent } from '@/components/ui/skeleton'

interface OperationsData {
  period: { days: number; since: string }
  scheduleAdherence: {
    onTimePct: number | null
    lateJobsCount: number
    avgDaysOver: number
    totalTracked: number
  }
  lateJobs: Array<{
    jobNumber: string
    scheduledEnd: string
    actualEnd: string
    daysLate: number
  }>
  crewProductivity: Array<{
    teamId: string
    teamName: string
    totalHours: number
    jobCount: number
    avgHoursPerJob: number
    laborCost: number
    costPerHour: number
  }>
  productivitySummary: {
    totalHours: number
    avgHoursPerJob: number
  }
  delays: {
    totalDelayDays: number
    weatherDays: number
    reasons: Array<{ reason: string; count: number }>
  }
  changeOrders: {
    totalCount: number
    approvedCount: number
    totalCostImpact: number
    avgPerJob: number
    reasons: Array<{ reason: string; count: number }>
  }
  cycleTime: {
    avgDays: number | null
    completedJobCount: number
  }
}

export default function OperationsPage() {
  const [data, setData] = useState<OperationsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(90)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports/operations?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load operations data.')
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const maxHours = Math.max(...(data?.crewProductivity.map(t => t.totalHours) || [1]))

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operations</h1>
            <p className="text-slate-500">Schedule adherence, crew productivity, and job performance</p>
          </div>
          <div className="flex items-center gap-2">
            {[30, 60, 90, 180, 365].map(d => (
              <Button
                key={d}
                variant={days === d ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
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
                    <p className="text-sm text-slate-500">Schedule Adherence</p>
                    <p className={`text-2xl font-bold ${
                      data?.scheduleAdherence.onTimePct === null ? 'text-slate-400'
                        : (data?.scheduleAdherence.onTimePct ?? 0) >= 80 ? 'text-green-600'
                        : (data?.scheduleAdherence.onTimePct ?? 0) >= 60 ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.scheduleAdherence.onTimePct != null
                        ? `${data?.scheduleAdherence.onTimePct}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.scheduleAdherence.totalTracked || 0} jobs tracked
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Hours/Job</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.productivitySummary.avgHoursPerJob || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Hammer className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.productivitySummary.totalHours || 0} total hours
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Change Order Rate</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.changeOrders.avgPerJob || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  per job ({data?.changeOrders.totalCount || 0} total)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Cycle Time</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? <Skeleton className="h-8 w-20 inline-block" /> : data?.cycleTime.avgDays != null
                        ? `${data?.cycleTime.avgDays}d`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.cycleTime.completedJobCount || 0} completed
                </p>
              </CardContent>
            </Card>
          </div>
          </FadeInSection>

          <FadeInSection delay={200} animation="slide-up">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Hours by Team */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Hours by Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonReportContent />
                ) : data?.crewProductivity && data.crewProductivity.length > 0 ? (
                  <div className="space-y-3">
                    {data.crewProductivity.map(team => {
                      const width = maxHours > 0 ? (team.totalHours / maxHours) * 100 : 0
                      return (
                        <div key={team.teamId}>
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span className="font-medium text-slate-700">{team.teamName}</span>
                            <span className="text-slate-500">
                              {team.totalHours}h ({team.jobCount} jobs)
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No productivity data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Delay Reasons */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-slate-600" />
                  Delay Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonReportContent />
                ) : data?.delays.reasons && data.delays.reasons.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-500 pb-2 border-b">
                      <span>{data.delays.totalDelayDays} delay days total</span>
                      <span>{data.delays.weatherDays} weather-related</span>
                    </div>
                    {data.delays.reasons.map(item => {
                      const total = data.delays.totalDelayDays || 1
                      const pct = Math.round((item.count / total) * 100)
                      return (
                        <div key={item.reason} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700 truncate">{item.reason}</span>
                              <span className="text-slate-500">{item.count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No delay data recorded</div>
                )}
              </CardContent>
            </Card>
          </div>
          </FadeInSection>

          {/* Late Jobs Table */}
          <FadeInSection delay={300} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Jobs Running Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonReportContent />
              ) : data?.lateJobs && data.lateJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Job #</th>
                        <th className="pb-3 pr-4">Scheduled End</th>
                        <th className="pb-3 pr-4">Actual End</th>
                        <th className="pb-3 text-right">Days Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lateJobs.map(job => (
                        <tr key={job.jobNumber} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{job.jobNumber}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {new Date(job.scheduledEnd + 'T00:00:00').toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {new Date(job.actualEnd + 'T00:00:00').toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              job.daysLate >= 14 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {job.daysLate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  No late jobs - all jobs are on schedule
                </div>
              )}
            </CardContent>
          </Card>

          </FadeInSection>

          {/* Change Orders Summary */}
          <FadeInSection delay={400} animation="slide-up">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Change Order Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{data?.changeOrders.totalCount || 0}</p>
                  <p className="text-sm text-slate-500">Total Change Orders</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{data?.changeOrders.approvedCount || 0}</p>
                  <p className="text-sm text-slate-500">Approved</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className={`text-2xl font-bold ${
                    (data?.changeOrders.totalCostImpact || 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(data?.changeOrders.totalCostImpact || 0)}
                  </p>
                  <p className="text-sm text-slate-500">Cost Impact</p>
                </div>
              </div>

              {data?.changeOrders.reasons && data.changeOrders.reasons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">By Reason</p>
                  {data.changeOrders.reasons.map(item => (
                    <div key={item.reason} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-700 truncate">{item.reason}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                  ))}
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
