'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { FunnelChart } from '@/components/admin/charts/funnel-chart'
import {
  Target,
  Users,
  FileText,
  UserPlus,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MousePointer,
} from 'lucide-react'

interface FunnelStep {
  step: number
  name: string
  entered: number
  completed: number
  dropOff: number
}

interface TimeStep {
  step: string
  avgMs: number
}

interface Source {
  source: string
  sessions: number
  conversions: number
  conversionRate: number
}

interface Device {
  device: string
  sessions: number
  conversions: number
  conversionRate: number
  percentage: number
}

interface SourceRevenue {
  source: string
  leads: number
  won: number
  pipelineValue: number
}

interface DailyTrend {
  date: string
  sessions: number
  conversions: number
}

interface FunnelAnalytics {
  period: { days: number; since: string }
  overview: {
    totalSessions: number
    totalEvents: number
    leadsCreated: number
    estimatesGenerated: number
    registrations: number
    overallConversionRate: number
  }
  funnel: FunnelStep[]
  timePerStep: TimeStep[]
  sources: Source[]
  sourceRevenue: SourceRevenue[]
  devices: Device[]
  dailyTrends: DailyTrend[]
  ctaClicks: Record<string, number>
}

function formatDuration(ms: number): string {
  if (ms === 0) return '-'
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

export default function FunnelAnalyticsPage() {
  const [data, setData] = useState<FunnelAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports/funnel-analytics?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load funnel analytics data.')
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Funnel Analytics</h1>
          <p className="text-slate-500">Track visitor journeys, drop-off rates, and conversion performance</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60, 90].map(d => (
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Sessions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.overview.totalSessions.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Leads</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.overview.leadsCreated.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Estimates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.overview.estimatesGenerated.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Registrations</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.overview.registrations.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {isLoading ? '...' : `${data?.overview.overallConversionRate || 0}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Visualization */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Funnel Drop-Off
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-slate-400">Loading...</div>
              ) : data?.funnel && data.funnel.some(f => f.entered > 0) ? (
                <FunnelChart data={data.funnel} />
              ) : (
                <div className="py-12 text-center text-slate-400">
                  No funnel data yet. Events will appear once visitors start using the funnel.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Time Per Step */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Average Time Per Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {data?.timePerStep.map(step => (
                      <div key={step.step} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm font-medium text-slate-700">{step.step}</span>
                        <span className="text-sm font-semibold text-slate-900">{formatDuration(step.avgMs)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source Attribution */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.sources && data.sources.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-6 text-xs font-medium text-slate-500 pb-2 border-b border-slate-100">
                      <span>Source</span>
                      <span className="text-right">Sessions</span>
                      <span className="text-right">Conversions</span>
                      <span className="text-right">Rate</span>
                      <span className="text-right">Won</span>
                      <span className="text-right">Revenue</span>
                    </div>
                    {data.sources.map(source => {
                      const rev = data.sourceRevenue?.find(sr => sr.source === source.source)
                      return (
                        <div key={source.source} className="grid grid-cols-6 py-1.5 text-sm">
                          <span className="font-medium text-slate-700 truncate">{source.source}</span>
                          <span className="text-right text-slate-600">{source.sessions}</span>
                          <span className="text-right text-slate-600">{source.conversions}</span>
                          <span className="text-right font-medium text-green-600">{source.conversionRate}%</span>
                          <span className="text-right text-slate-600">{rev?.won || 0}</span>
                          <span className="text-right font-medium text-slate-900">{formatCurrency(rev?.pipelineValue || 0)}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No source data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Device Breakdown */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-slate-600" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.devices && data.devices.length > 0 ? (
                  <div className="space-y-3">
                    {data.devices.map(device => {
                      const DeviceIcon = DEVICE_ICONS[device.device] || Monitor
                      return (
                        <div key={device.device} className="flex items-center gap-3">
                          <DeviceIcon className="h-5 w-5 text-slate-500" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-slate-700 capitalize">{device.device}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500">{device.sessions} ({device.percentage}%)</span>
                                <span className="text-green-600 font-medium">{device.conversionRate || 0}% conv</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${device.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No device data yet</div>
                )}
              </CardContent>
            </Card>

            {/* CTA Clicks */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-amber-600" />
                  CTA Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.ctaClicks && Object.keys(data.ctaClicks).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(data.ctaClicks)
                      .sort(([, a], [, b]) => b - a)
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{name.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-semibold text-slate-900">{count}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No CTA data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Trends */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Daily Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.dailyTrends && data.dailyTrends.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Simple bar chart using CSS */}
                    <div className="flex items-end gap-1 h-40 mb-2">
                      {data.dailyTrends.map(day => {
                        const maxSessions = Math.max(...data.dailyTrends.map(d => d.sessions), 1)
                        const height = Math.max((day.sessions / maxSessions) * 100, 2)
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.sessions} sessions, ${day.conversions} conversions`}>
                            <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100%', justifyContent: 'flex-end' }}>
                              <div
                                className="w-full bg-blue-400 rounded-t-sm min-h-[2px]"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-1">
                      {data.dailyTrends.map((day, i) => (
                        <div key={day.date} className="flex-1 text-center">
                          {(i === 0 || i === data.dailyTrends.length - 1 || i % Math.ceil(data.dailyTrends.length / 7) === 0) && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No trend data yet</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
