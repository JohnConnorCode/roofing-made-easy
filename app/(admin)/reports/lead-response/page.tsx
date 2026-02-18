'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface LeadResponseData {
  period: { days: number; since: string }
  speedToLead: {
    avgMinutes: number | null
    medianMinutes: number | null
    pctUnder5Min: number
    pctUnder30Min: number
    pctUnder1Hr: number
    totalLeads: number
    leadsWithResponse: number
  }
  responseBySource: Array<{
    source: string
    leads: number
    avgResponseMinutes: number | null
    conversionRate: number
    pipelineValue: number
  }>
  activityVolume: {
    total: number
    breakdown: Record<string, number>
  }
  dailyTrends: Array<{
    date: string
    avgResponseMinutes: number
    leadsResponded: number
  }>
  staleLeads: Array<{
    id: string
    name: string
    status: string
    daysSinceActivity: number
    lastActivity: string | null
  }>
  staleLeadCount: number
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
}

function formatResponseTime(minutes: number | null): string {
  if (minutes === null) return 'N/A'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export default function LeadResponsePage() {
  const [data, setData] = useState<LeadResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports/lead-response?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load lead response data.')
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Response</h1>
          <p className="text-slate-500">Speed-to-lead metrics and follow-up performance</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Response Time</p>
                    <p className={`text-2xl font-bold ${
                      data?.speedToLead.avgMinutes === null ? 'text-slate-400'
                        : (data?.speedToLead.avgMinutes ?? 0) <= 15 ? 'text-green-600'
                        : (data?.speedToLead.avgMinutes ?? 0) <= 60 ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {isLoading ? '...' : formatResponseTime(data?.speedToLead.avgMinutes ?? null)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Under 5 Minutes</p>
                    <p className="text-2xl font-bold text-green-600">
                      {isLoading ? '...' : `${data?.speedToLead.pctUnder5Min || 0}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Stale Leads</p>
                    <p className={`text-2xl font-bold ${
                      (data?.staleLeadCount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : data?.staleLeadCount || 0}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2 ${
                    (data?.staleLeadCount || 0) > 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      (data?.staleLeadCount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Activities</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.activityVolume.total.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Response by Source */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Response Time by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.responseBySource && data.responseBySource.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-5 text-xs font-medium text-slate-500 pb-2 border-b border-slate-100">
                      <span>Source</span>
                      <span className="text-right">Leads</span>
                      <span className="text-right">Avg Time</span>
                      <span className="text-right">Conv %</span>
                      <span className="text-right">Pipeline</span>
                    </div>
                    {data.responseBySource.map(source => (
                      <div key={source.source} className="grid grid-cols-5 py-1.5 text-sm">
                        <span className="font-medium text-slate-700 truncate">{source.source}</span>
                        <span className="text-right text-slate-600">{source.leads}</span>
                        <span className={`text-right font-medium ${
                          source.avgResponseMinutes === null ? 'text-slate-400'
                            : source.avgResponseMinutes <= 15 ? 'text-green-600'
                            : source.avgResponseMinutes <= 60 ? 'text-amber-600'
                            : 'text-red-600'
                        }`}>
                          {formatResponseTime(source.avgResponseMinutes)}
                        </span>
                        <span className="text-right text-slate-600">{source.conversionRate}%</span>
                        <span className="text-right text-slate-600">{formatCurrency(source.pipelineValue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No source data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Activity Breakdown */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.activityVolume.breakdown && Object.keys(data.activityVolume.breakdown).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(data.activityVolume.breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const Icon = ACTIVITY_ICONS[type] || Phone
                        const total = data.activityVolume.total || 1
                        const pct = Math.round((count / total) * 100)
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-slate-500" />
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 capitalize">{type}</span>
                                <span className="text-slate-500">{count} ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No activity data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Response Time Trend */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Daily Response Time Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.dailyTrends && data.dailyTrends.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="flex items-end gap-1 h-40 mb-2">
                      {data.dailyTrends.map(day => {
                        const maxTime = Math.max(...data.dailyTrends.map(d => d.avgResponseMinutes), 1)
                        const height = Math.max((day.avgResponseMinutes / maxTime) * 100, 2)
                        const color = day.avgResponseMinutes <= 15 ? 'bg-green-400'
                          : day.avgResponseMinutes <= 60 ? 'bg-amber-400'
                          : 'bg-red-400'
                        return (
                          <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center"
                            title={`${day.date}: ${day.avgResponseMinutes}m avg (${day.leadsResponded} leads)`}
                          >
                            <div className="w-full flex flex-col items-center" style={{ height: '100%', justifyContent: 'flex-end' }}>
                              <div
                                className={`w-full ${color} rounded-t-sm min-h-[2px]`}
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

          {/* Stale Leads Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Stale Leads (No Activity 48+ Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.staleLeads && data.staleLeads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Days Since Activity</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.staleLeads.map(lead => (
                        <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4">
                            <Link href={`/leads/${lead.id}`} className="font-medium text-blue-600 hover:underline">
                              {lead.name || 'Unknown'}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                              {lead.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`font-medium ${
                              lead.daysSinceActivity >= 7 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {lead.daysSinceActivity} days
                            </span>
                          </td>
                          <td className="py-3">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Follow Up
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  No stale leads - all leads have recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminPageTransition>
  )
}
