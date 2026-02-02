'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PipelineBoard } from '@/components/admin/PipelineBoard'
import { LeadSlideOver } from '@/components/admin/LeadSlideOver'
import type { LeadCardData } from '@/components/admin/LeadCard'
import { formatCurrency } from '@/lib/utils'
import {
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  List,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface PipelineStats {
  totalLeads: number
  totalPipelineValue: number
  byStatus: { status: string; count: number; value: number }[]
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<LeadCardData[]>([])
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadCardData | null>(null)
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)

  const fetchPipelineData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/leads/pipeline')
      if (!response.ok) {
        throw new Error('Failed to fetch pipeline data')
      }
      const data = await response.json()
      setLeads(data.leads || [])
      setStats(data.stats || null)
    } catch (err) {
      setError('Unable to load pipeline data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPipelineData()
  }, [fetchPipelineData])

  const [updateError, setUpdateError] = useState<string | null>(null)

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Get lead data BEFORE any state updates to avoid race condition
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const oldStatus = lead.status
    const estimateValue = lead.estimates?.[0]?.price_likely || 0

    setUpdatingLeadId(leadId)
    setUpdateError(null)

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update lead status')
      }

      // Update local state
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ))

      // Recalculate stats using the captured values
      if (stats) {
        const updatedStats = { ...stats }

        // Update byStatus array
        updatedStats.byStatus = updatedStats.byStatus.map(s => {
          if (s.status === oldStatus) {
            return { ...s, count: Math.max(0, s.count - 1), value: Math.max(0, s.value - estimateValue) }
          }
          if (s.status === newStatus) {
            return { ...s, count: s.count + 1, value: s.value + estimateValue }
          }
          return s
        })

        // Add new status if it doesn't exist
        if (!updatedStats.byStatus.find(s => s.status === newStatus)) {
          updatedStats.byStatus.push({ status: newStatus, count: 1, value: estimateValue })
        }

        setStats(updatedStats)
      }
    } catch {
      setUpdateError('Failed to update lead status. Please try again.')
      // Refetch data on error to restore correct state
      fetchPipelineData()
    } finally {
      setUpdatingLeadId(null)
    }
  }

  const handleLeadClick = (lead: LeadCardData) => {
    setSelectedLead(lead)
  }

  // Calculate win rate
  const wonCount = stats?.byStatus.find(s => s.status === 'won')?.count || 0
  const lostCount = stats?.byStatus.find(s => s.status === 'lost')?.count || 0
  const closedDeals = wonCount + lostCount
  const winRate = closedDeals > 0 ? Math.round((wonCount / closedDeals) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500">Drag leads between columns to update status</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leads">
            <Button variant="outline" size="sm" leftIcon={<List className="h-4 w-4" />}>
              List View
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPipelineData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-100 p-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPipelineValue)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-gold-light/20 p-3">
                <TrendingUp className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Win Rate</p>
                <p className="text-2xl font-bold text-gold">{winRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-emerald-100 p-3">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Deals Won</p>
                <p className="text-2xl font-bold text-emerald-600">{wonCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update error notification */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{updateError}</p>
          <button
            onClick={() => setUpdateError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Pipeline board */}
      {error ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gold" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchPipelineData}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PipelineBoard
          leads={leads}
          onLeadClick={handleLeadClick}
          onStatusChange={handleStatusChange}
          isUpdating={updatingLeadId}
        />
      )}

      {/* Lead slide-over */}
      <LeadSlideOver
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
