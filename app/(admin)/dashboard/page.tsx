'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, DollarSign, Clock, CheckCircle, AlertTriangle, RefreshCw, Inbox, Loader2, BarChart3 } from 'lucide-react'
import { SkeletonDashboard } from '@/components/ui/skeleton'
import { SimpleAnalytics } from '@/components/admin/simple-analytics'
import Link from 'next/link'

interface DashboardStats {
  totalLeads: number
  newLeads: number
  estimatesGenerated: number
  totalEstimateValue: number
}

interface RecentLead {
  id: string
  status: string
  created_at: string
  contacts: { first_name: string; last_name: string; email: string }[]
  properties: { city: string; state: string }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    estimatesGenerated: 0,
    totalEstimateValue: 0,
  })
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [allLeads, setAllLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch recent leads for display
      const recentResponse = await fetch('/api/leads?limit=10')
      // Fetch all leads for analytics
      const allResponse = await fetch('/api/leads?limit=100')

      if (!recentResponse.ok || !allResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const recentData = await recentResponse.json()
      const allData = await allResponse.json()

      if (recentData.leads) {
        const leads = recentData.leads as RecentLead[]
        setRecentLeads(leads)
        setStats({
          totalLeads: recentData.total || leads.length,
          newLeads: leads.filter((l) => l.status === 'new').length,
          estimatesGenerated: leads.filter((l) => l.status === 'estimate_generated').length,
          totalEstimateValue: 0,
        })
      }

      if (allData.leads) {
        setAllLeads(allData.leads)
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

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'bg-slate-700',
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      icon: Clock,
      color: 'bg-amber-600',
    },
    {
      title: 'Estimates Generated',
      value: stats.estimatesGenerated,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Est. Pipeline Value',
      value: formatCurrency(stats.totalEstimateValue),
      icon: DollarSign,
      color: 'bg-slate-800',
    },
  ]

  if (isLoading) {
    return <SkeletonDashboard />
  }

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

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900">Recent Leads (Last 10)</CardTitle>
          <Link
            href="/leads"
            className="text-sm text-amber-600 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
              <span className="ml-2 text-slate-500">Loading leads...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="mt-3 text-slate-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchDashboardData}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            </div>
          ) : recentLeads.length === 0 ? (
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
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => {
                    const contact = lead.contacts?.[0]
                    const property = lead.properties?.[0]
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
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-amber-100 text-amber-800',
    intake_started: 'bg-slate-100 text-slate-800',
    intake_complete: 'bg-slate-200 text-slate-800',
    estimate_generated: 'bg-green-100 text-green-800',
    consultation_scheduled: 'bg-amber-100 text-amber-800',
    quote_sent: 'bg-slate-700 text-white',
    won: 'bg-green-600 text-white',
    lost: 'bg-slate-100 text-slate-600',
    archived: 'bg-slate-100 text-slate-500',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100'}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
