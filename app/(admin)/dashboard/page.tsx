'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, DollarSign, Clock, CheckCircle, AlertTriangle, RefreshCw, Loader2, Inbox } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/leads?limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()

      if (data.leads) {
        const leads = data.leads as RecentLead[]
        setRecentLeads(leads)
        setStats({
          totalLeads: data.total || leads.length,
          newLeads: leads.filter((l) => l.status === 'new').length,
          estimatesGenerated: leads.filter((l) => l.status === 'estimate_generated').length,
          totalEstimateValue: 0, // Would need separate query
        })
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
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
      color: 'bg-blue-500',
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      title: 'Estimates Generated',
      value: stats.estimatesGenerated,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Est. Pipeline Value',
      value: formatCurrency(stats.totalEstimateValue),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Today's pipeline at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">
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
          <CardTitle>Recent Leads (Last 10)</CardTitle>
          <Link
            href="/leads"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-500">Loading leads...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="mt-3 text-gray-600">{error}</p>
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
              <Inbox className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-gray-600">No leads yet</p>
              <p className="text-sm text-gray-400">New submissions will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
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
                      <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {contact?.first_name && contact?.last_name
                              ? `${contact.first_name} ${contact.last_name}`
                              : contact?.email || 'Unknown'}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {property?.city && property?.state
                            ? `${property.city}, ${property.state}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-3 text-gray-600">
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
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    intake_started: 'bg-amber-100 text-amber-800',
    intake_complete: 'bg-purple-100 text-purple-800',
    estimate_generated: 'bg-green-100 text-green-800',
    consultation_scheduled: 'bg-cyan-100 text-cyan-800',
    quote_sent: 'bg-indigo-100 text-indigo-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-gray-100 text-gray-800',
    archived: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-gray-100'}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
