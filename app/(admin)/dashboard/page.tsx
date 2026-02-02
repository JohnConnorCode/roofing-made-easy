'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Inbox,
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  PieChart
} from 'lucide-react'
import { SkeletonDashboard } from '@/components/ui/skeleton'
import { SimpleAnalytics } from '@/components/admin/simple-analytics'
import Link from 'next/link'

interface DashboardStats {
  totalLeads: number
  newLeadsThisMonth: number
  newLeadsLastMonth: number
  mtdGrowth: number
  thirtyDayGrowth: number
  pipelineValue: number
  closedValue: number
  winRate: number
  conversionRate: number
  estimatesGenerated: number
  wonDeals: number
  lostDeals: number
}

interface RecentLead {
  id: string
  status: string
  created_at: string
  contacts: { first_name: string; last_name: string; email: string }[]
  properties: { city: string; state: string }[]
  estimates?: { price_likely: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  intake_started: 'Intake Started',
  intake_complete: 'Intake Complete',
  estimate_generated: 'Estimate Generated',
  consultation_scheduled: 'Consultation',
  quote_sent: 'Quote Sent',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived'
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-500',
  intake_started: 'bg-slate-400',
  intake_complete: 'bg-slate-500',
  estimate_generated: 'bg-green-500',
  consultation_scheduled: 'bg-blue-500',
  quote_sent: 'bg-purple-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-400',
  archived: 'bg-slate-300'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({})
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [allLeads, setAllLeads] = useState<any[]>([])

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      // Fetch recent leads for display
      const recentResponse = await fetch('/api/leads?limit=10')

      if (!statsResponse.ok || !recentResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const statsData = await statsResponse.json()
      const recentData = await recentResponse.json()

      setStats(statsData.stats)
      setStatusCounts(statsData.statusCounts || {})
      setSourceBreakdown(statsData.sourceBreakdown || {})

      if (recentData.leads) {
        setRecentLeads(recentData.leads)
        setAllLeads(recentData.leads) // For analytics view
      }
    } catch (err) {
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return <SkeletonDashboard />
  }

  // Calculate total for source percentages
  const totalFromSources = Object.values(sourceBreakdown).reduce((a, b) => a + b, 0)
  const sourcePercentages = Object.entries(sourceBreakdown)
    .map(([source, count]) => ({
      source: source.replace(/_/g, ' '),
      count,
      percentage: Math.round((count / totalFromSources) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  // Calculate pipeline statuses for visualization
  const pipelineStatuses = ['new', 'estimate_generated', 'consultation_scheduled', 'quote_sent', 'won']
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            {showAnalytics ? 'Performance analytics' : "Today's pipeline at a glance"}
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setShowAnalytics(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showAnalytics
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              showAnalytics
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
        </div>
      </div>

      {showAnalytics ? (
        <SimpleAnalytics leads={allLeads} />
      ) : (
        <>
          {error ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
                <p className="mt-4 text-slate-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={fetchDashboardData}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Primary Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">New Leads (MTD)</p>
                        <p className="text-3xl font-bold text-slate-900">{stats?.newLeadsThisMonth || 0}</p>
                      </div>
                      <div className="rounded-lg bg-amber-100 p-3">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      {(stats?.mtdGrowth || 0) >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={(stats?.mtdGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(stats?.mtdGrowth || 0)}%
                      </span>
                      <span className="text-slate-400 ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Estimates Generated</p>
                        <p className="text-3xl font-bold text-slate-900">{stats?.estimatesGenerated || 0}</p>
                      </div>
                      <div className="rounded-lg bg-green-100 p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-slate-400">
                        {stats?.conversionRate || 0}% conversion rate
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Win Rate</p>
                        <p className="text-3xl font-bold text-slate-900">{stats?.winRate || 0}%</p>
                      </div>
                      <div className="rounded-lg bg-blue-100 p-3">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-slate-400">
                        {stats?.wonDeals || 0} won / {(stats?.wonDeals || 0) + (stats?.lostDeals || 0)} closed
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Pipeline Value</p>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(stats?.pipelineValue || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-100 p-3">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-slate-400">
                        {formatCurrency(stats?.closedValue || 0)} closed
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pipeline and Sources */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pipeline by Status */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Pipeline by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pipelineStatuses.map((status) => {
                        const count = statusCounts[status] || 0
                        const width = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0

                        return (
                          <div key={status}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-600">
                                {STATUS_LABELS[status] || status}
                              </span>
                              <span className="text-sm font-medium text-slate-900">{count}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${STATUS_COLORS[status]} rounded-full transition-all`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href="/leads/pipeline"
                        className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                      >
                        View Pipeline Board
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Sources */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Lead Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sourcePercentages.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No source data available</p>
                    ) : (
                      <div className="space-y-4">
                        {sourcePercentages.map((source, idx) => {
                          const colors = ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
                          return (
                            <div key={source.source} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700 capitalize">
                                    {source.source}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {source.percentage}%
                                  </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className={`h-full ${colors[idx % colors.length]} rounded-full`}
                                    style={{ width: `${source.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent leads */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-900">Recent Leads</CardTitle>
                  <Link
                    href="/leads"
                    className="text-sm text-amber-600 hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Inbox className="h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-slate-600">No leads yet</p>
                      <p className="text-sm text-slate-400">New submissions will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-slate-500">
                            <th className="pb-3 pr-4">Name</th>
                            <th className="pb-3 pr-4">Location</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3 pr-4">Value</th>
                            <th className="pb-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentLeads.map((lead) => {
                            const contact = lead.contacts?.[0]
                            const property = lead.properties?.[0]
                            const estimate = lead.estimates?.[0]
                            return (
                              <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-3 pr-4">
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="font-medium text-amber-600 hover:underline"
                                  >
                                    {contact?.first_name && contact?.last_name
                                      ? `${contact.first_name} ${contact.last_name}`
                                      : contact?.email || 'Unknown'}
                                  </Link>
                                </td>
                                <td className="py-3 pr-4 text-slate-600">
                                  {property?.city && property?.state
                                    ? `${property.city}, ${property.state}`
                                    : 'N/A'}
                                </td>
                                <td className="py-3 pr-4">
                                  <StatusBadge status={lead.status} />
                                </td>
                                <td className="py-3 pr-4 text-slate-600">
                                  {estimate?.price_likely
                                    ? formatCurrency(estimate.price_likely)
                                    : '-'}
                                </td>
                                <td className="py-3 text-slate-600">
                                  {formatDate(lead.created_at)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-amber-100 text-amber-800',
    intake_started: 'bg-slate-100 text-slate-800',
    intake_complete: 'bg-slate-200 text-slate-800',
    estimate_generated: 'bg-green-100 text-green-800',
    consultation_scheduled: 'bg-blue-100 text-blue-800',
    quote_sent: 'bg-purple-100 text-purple-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
    archived: 'bg-slate-100 text-slate-500',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
