'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Lead {
  id: string
  status: string
  created_at: string
  intakes?: Array<{
    job_type?: string
    timeline_urgency?: string
  }>
  estimates?: Array<{
    price_likely?: number
    is_superseded?: boolean
  }>
}

interface SimpleAnalyticsProps {
  leads: Lead[]
}

export function SimpleAnalytics({ leads }: SimpleAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Recent leads (last 30 days)
    const recentLeads = leads.filter(
      (l) => new Date(l.created_at) >= thirtyDaysAgo
    )

    // Previous period (30-60 days ago)
    const previousLeads = leads.filter(
      (l) =>
        new Date(l.created_at) >= sixtyDaysAgo &&
        new Date(l.created_at) < thirtyDaysAgo
    )

    // Lead growth
    const leadGrowth =
      previousLeads.length > 0
        ? ((recentLeads.length - previousLeads.length) / previousLeads.length) * 100
        : recentLeads.length > 0
        ? 100
        : 0

    // Conversion rate (estimate_generated or later stages)
    const convertedStatuses = ['estimate_generated', 'consultation_scheduled', 'quote_sent', 'won']
    const convertedLeads = leads.filter((l) => convertedStatuses.includes(l.status))
    const conversionRate = leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0

    // Won leads
    const wonLeads = leads.filter((l) => l.status === 'won')
    const winRate = convertedLeads.length > 0 ? (wonLeads.length / convertedLeads.length) * 100 : 0

    // Helper to get the active (non-superseded) estimate
    const getActiveEstimate = (lead: Lead) =>
      lead.estimates?.find(e => !e.is_superseded) || lead.estimates?.[0]

    // Pipeline value (estimates)
    const pipelineValue = leads.reduce((sum, lead) => {
      const estimate = getActiveEstimate(lead)
      if (estimate?.price_likely && lead.status !== 'won' && lead.status !== 'lost' && lead.status !== 'archived') {
        return sum + estimate.price_likely
      }
      return sum
    }, 0)

    // Revenue (won deals)
    const revenue = wonLeads.reduce((sum, lead) => {
      const estimate = getActiveEstimate(lead)
      return sum + (estimate?.price_likely || 0)
    }, 0)

    // Average deal size
    const avgDealSize = wonLeads.length > 0 ? revenue / wonLeads.length : 0

    // Leads by status
    const statusCounts: Record<string, number> = {}
    leads.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    })

    // Leads by job type
    const jobTypeCounts: Record<string, number> = {}
    leads.forEach((lead) => {
      const jobType = lead.intakes?.[0]?.job_type || 'unknown'
      jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1
    })

    // Leads by urgency
    const urgencyCounts: Record<string, number> = {}
    leads.forEach((lead) => {
      const urgency = lead.intakes?.[0]?.timeline_urgency || 'unknown'
      urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1
    })

    return {
      totalLeads: leads.length,
      recentLeads: recentLeads.length,
      leadGrowth,
      conversionRate,
      winRate,
      pipelineValue,
      revenue,
      avgDealSize,
      statusCounts,
      jobTypeCounts,
      urgencyCounts,
    }
  }, [leads])

  const statCards = [
    {
      title: 'Lead Growth',
      value: `${analytics.leadGrowth >= 0 ? '+' : ''}${analytics.leadGrowth.toFixed(0)}%`,
      subtitle: `${analytics.recentLeads} leads (30 days)`,
      icon: analytics.leadGrowth >= 0 ? TrendingUp : TrendingDown,
      color: analytics.leadGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: analytics.leadGrowth >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(0)}%`,
      subtitle: 'Leads to estimates',
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Win Rate',
      value: `${analytics.winRate.toFixed(0)}%`,
      subtitle: 'Estimates to won',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(analytics.pipelineValue),
      subtitle: 'Active opportunities',
      icon: DollarSign,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
    },
  ]

  const statusLabels: Record<string, string> = {
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

  const jobTypeLabels: Record<string, string> = {
    full_replacement: 'Full Replacement',
    repair: 'Repair',
    inspection: 'Inspection',
    maintenance: 'Maintenance',
    commercial: 'Commercial',
    unknown: 'Not Specified',
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-5 w-5" />
              Leads by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 capitalize">
                          {statusLabels[status] || status}
                        </span>
                        <span className="font-medium text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Leads by Job Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-5 w-5" />
              Leads by Job Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.jobTypeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 capitalize">
                          {jobTypeLabels[type] || type.replace('_', ' ')}
                        </span>
                        <span className="font-medium text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Est. Closed Value</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(analytics.revenue)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Based on estimates for {leads.filter((l) => l.status === 'won').length} won leads
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Average Deal Size</p>
              <p className="text-3xl font-bold text-slate-700">
                {formatCurrency(analytics.avgDealSize)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Per closed project</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Pipeline</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatCurrency(analytics.pipelineValue)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Potential revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
