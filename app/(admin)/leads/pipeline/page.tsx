'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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
  Loader2,
  Search,
  Filter,
  X,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { JOB_TYPE_MAP } from '@/lib/constants/status'
import { SkeletonPageContent } from '@/components/ui/skeleton'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface PipelineStats {
  totalLeads: number
  totalPipelineValue: number
  byStatus: { status: string; count: number; value: number }[]
}

// Filter options
const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All Job Types' },
  ...Object.entries(JOB_TYPE_MAP).map(([value, config]) => ({
    value,
    label: config.label,
  })),
]

const DATE_RANGE_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

const VALUE_RANGE_OPTIONS = [
  { value: '', label: 'Any value' },
  { value: '0-5000', label: 'Under $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: '10000-20000', label: '$10,000 - $20,000' },
  { value: '20000+', label: 'Over $20,000' },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<LeadCardData[]>([])
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadCardData | null>(null)
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('')
  const [valueRangeFilter, setValueRangeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

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

  // Bulk status change handler
  const handleBulkStatusChange = async (leadIds: string[], newStatus: string) => {
    try {
      // Update each lead
      await Promise.all(
        leadIds.map(leadId =>
          fetch(`/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      )
      // Refresh data
      await fetchPipelineData()
    } catch {
      setUpdateError('Failed to update some leads. Please try again.')
    }
  }

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter (name, email, phone, address)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const contact = lead.contacts?.[0]
        const property = lead.properties?.[0]
        const name = contact ? `${contact.first_name} ${contact.last_name}`.toLowerCase() : ''
        const email = contact?.email?.toLowerCase() || ''
        const phone = contact?.phone?.toLowerCase() || ''
        const address = property ? `${property.street_address} ${property.city}`.toLowerCase() : ''

        if (!name.includes(query) && !email.includes(query) && !phone.includes(query) && !address.includes(query)) {
          return false
        }
      }

      // Job type filter
      if (jobTypeFilter && lead.intakes?.[0]?.job_type !== jobTypeFilter) {
        return false
      }

      // Date range filter
      if (dateRangeFilter) {
        const days = parseInt(dateRangeFilter)
        const leadDate = new Date(lead.created_at)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        if (leadDate < cutoff) {
          return false
        }
      }

      // Value range filter
      if (valueRangeFilter) {
        const estimateValue = lead.estimates?.[0]?.price_likely || 0
        if (valueRangeFilter === '0-5000' && estimateValue >= 5000) return false
        if (valueRangeFilter === '5000-10000' && (estimateValue < 5000 || estimateValue >= 10000)) return false
        if (valueRangeFilter === '10000-20000' && (estimateValue < 10000 || estimateValue >= 20000)) return false
        if (valueRangeFilter === '20000+' && estimateValue < 20000) return false
      }

      return true
    })
  }, [leads, searchQuery, jobTypeFilter, dateRangeFilter, valueRangeFilter])

  // Check if any filters are active
  const hasActiveFilters = searchQuery || jobTypeFilter || dateRangeFilter || valueRangeFilter

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setJobTypeFilter('')
    setDateRangeFilter('')
    setValueRangeFilter('')
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Status', 'Job Type', 'Estimate', 'Created']
    const rows = filteredLeads.map(lead => {
      const contact = lead.contacts?.[0]
      const property = lead.properties?.[0]
      const intake = lead.intakes?.[0]
      const estimate = lead.estimates?.[0]
      return [
        contact ? `${contact.first_name} ${contact.last_name}` : '',
        contact?.email || '',
        contact?.phone || '',
        property?.street_address || '',
        property?.city || '',
        property?.state || '',
        lead.status,
        intake?.job_type || '',
        estimate?.price_likely || '',
        new Date(lead.created_at).toLocaleDateString(),
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate win rate
  const wonCount = stats?.byStatus.find(s => s.status === 'won')?.count || 0
  const lostCount = stats?.byStatus.find(s => s.status === 'lost')?.count || 0
  const closedDeals = wonCount + lostCount
  const winRate = closedDeals > 0 ? Math.round((wonCount / closedDeals) * 100) : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonPageContent />
      </div>
    )
  }

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500">
            {hasActiveFilters
              ? `Showing ${filteredLeads.length} of ${leads.length} leads`
              : 'Drag leads between columns to update status'}
          </p>
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
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
            className={showFilters || hasActiveFilters ? 'bg-gold-light/20 border-gold-light' : ''}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-gold text-white text-xs rounded-full">
                {[searchQuery, jobTypeFilter, dateRangeFilter, valueRangeFilter].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-4 w-4" />}
            disabled={filteredLeads.length === 0}
          >
            Export
          </Button>
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
      </FadeInSection>

      {/* Filters panel */}
      <FadeInSection delay={100} animation="slide-up">
      {showFilters && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, phone, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="md:w-44">
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                <Select
                  options={JOB_TYPE_OPTIONS}
                  value={jobTypeFilter}
                  onChange={setJobTypeFilter}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Date Range */}
              <div className="md:w-40">
                <label className="block text-sm font-medium text-slate-700 mb-1">Created</label>
                <Select
                  options={DATE_RANGE_OPTIONS}
                  value={dateRangeFilter}
                  onChange={setDateRangeFilter}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Value Range */}
              <div className="md:w-44">
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimate Value</label>
                <Select
                  options={VALUE_RANGE_OPTIONS}
                  value={valueRangeFilter}
                  onChange={setValueRangeFilter}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  leftIcon={<X className="h-4 w-4" />}
                  className="text-slate-500"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </FadeInSection>

      {/* Stats cards */}
      <FadeInSection delay={200} animation="slide-up">
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
      </FadeInSection>

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
      <FadeInSection delay={300} animation="slide-up">
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
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onStatusChange={handleStatusChange}
          onBulkStatusChange={handleBulkStatusChange}
          isUpdating={updatingLeadId}
        />
      )}
      </FadeInSection>

      {/* Lead slide-over */}
      <LeadSlideOver
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />
    </AdminPageTransition>
  )
}
