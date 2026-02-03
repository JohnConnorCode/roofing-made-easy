'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate, formatPhone } from '@/lib/utils'
import { QuickStatusSelect } from '@/components/admin/QuickStatusSelect'
import { BulkActions } from '@/components/admin/BulkActions'
import { LeadCreateModal } from '@/components/admin/LeadCreateModal'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Inbox,
  Kanban,
  ArrowUpDown,
  Download,
  Plus
} from 'lucide-react'
import { SkeletonLeadsTable } from '@/components/ui/skeleton'
import { calculateLeadScore, getScoreTierDisplay, type LeadScoreInput } from '@/lib/leads/scoring'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface Lead {
  id: string
  status: string
  created_at: string
  current_step: number
  contacts: { first_name: string; last_name: string; email: string; phone: string }[]
  properties: { city: string; state: string; street_address: string }[]
  intakes?: {
    job_type?: string
    timeline_urgency?: string
    has_insurance_claim?: boolean
    roof_size_sqft?: number
  }[]
  uploads?: { id: string }[]
  estimates?: { price_likely: number }[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'intake_started', label: 'Intake Started' },
  { value: 'intake_complete', label: 'Intake Complete' },
  { value: 'estimate_generated', label: 'Estimate Generated' },
  { value: 'consultation_scheduled', label: 'Consultation Scheduled' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'archived', label: 'Archived' },
]

type SortField = 'created_at' | 'name' | 'status' | 'step'
type SortDirection = 'asc' | 'desc'

const LIMIT = 20

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      })
      if (status) params.set('status', status)

      const response = await fetch(`/api/leads?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      const data = await response.json()

      if (data.leads) {
        setLeads(data.leads)
        setTotal(data.total || data.leads.length)
      }
    } catch (err) {
      setError('Unable to load leads. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [status, offset])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Clear selection when filters change
  useEffect(() => {
    setSelectedLeads(new Set())
  }, [status, offset])

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true
    const contact = lead.contacts?.[0]
    const property = lead.properties?.[0]
    const searchLower = search.toLowerCase()
    return (
      contact?.first_name?.toLowerCase().includes(searchLower) ||
      contact?.last_name?.toLowerCase().includes(searchLower) ||
      contact?.email?.toLowerCase().includes(searchLower) ||
      property?.city?.toLowerCase().includes(searchLower)
    )
  })

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'name':
        const nameA = `${a.contacts?.[0]?.first_name || ''} ${a.contacts?.[0]?.last_name || ''}`
        const nameB = `${b.contacts?.[0]?.first_name || ''} ${b.contacts?.[0]?.last_name || ''}`
        comparison = nameA.localeCompare(nameB)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'step':
        comparison = a.current_step - b.current_step
        break
    }
    return sortDirection === 'desc' ? -comparison : comparison
  })

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === sortedLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(sortedLeads.map(l => l.id)))
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelection = new Set(selectedLeads)
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId)
    } else {
      newSelection.add(leadId)
    }
    setSelectedLeads(newSelection)
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update')

      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    } catch {
      // Failed to update lead status
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeads.size === 0) return
    setIsProcessing(true)
    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads),
          status: newStatus
        })
      })

      if (!response.ok) throw new Error('Failed to update')

      // Update local state
      setLeads(prev => prev.map(lead =>
        selectedLeads.has(lead.id) ? { ...lead, status: newStatus } : lead
      ))
      setSelectedLeads(new Set())
    } catch {
      // Failed to bulk update
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkExport = async () => {
    if (selectedLeads.size === 0) return

    try {
      const response = await fetch(`/api/leads/bulk?ids=${Array.from(selectedLeads).join(',')}`)
      if (!response.ok) throw new Error('Failed to export')

      const data = await response.json()
      const leads = data.leads || []

      // Convert to CSV
      if (leads.length === 0) return

      const headers = Object.keys(leads[0])
      const csvContent = [
        headers.join(','),
        ...leads.map((row: Record<string, unknown>) =>
          headers.map(h => {
            const val = row[h]
            let str = String(val || '')
            // Prevent CSV injection - prefix cells starting with formula characters
            if (/^[=+\-@\t\r]/.test(str)) {
              str = "'" + str
            }
            // Escape quotes and wrap in quotes if contains comma or special chars
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes("'")) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          }).join(',')
        )
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      // Failed to export
    }
  }

  const handleBulkArchive = async () => {
    await handleBulkStatusChange('archived')
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="pb-3 pr-4 cursor-pointer hover:text-slate-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-gold' : 'text-slate-400'}`} />
      </div>
    </th>
  )

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-500">Manage your roofing leads</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leads/pipeline">
              <Button variant="outline" size="sm" leftIcon={<Kanban className="h-4 w-4" />}>
                Pipeline View
              </Button>
            </Link>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              New Lead
            </Button>
          </div>
        </div>
      </FadeInSection>

      {/* Filters */}
      <FadeInSection delay={100} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900"
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
              className="md:w-48 bg-white border-slate-300 text-slate-900"
            />
          </div>
        </CardContent>
      </Card>
      </FadeInSection>

      {/* Leads table */}
      <FadeInSection delay={200} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {total} Lead{total !== 1 ? 's' : ''}
            {selectedLeads.size > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({selectedLeads.size} selected)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonLeadsTable />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-gold" />
              <p className="mt-3 text-slate-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchLeads}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Inbox className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-slate-600">No leads found</p>
              <p className="text-sm text-slate-400">
                {search || status ? 'Try adjusting your filters.' : 'New submissions will appear here automatically.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-slate-500">
                      <th className="pb-3 pr-2 w-8">
                        <Checkbox
                          checked={selectedLeads.size === sortedLeads.length && sortedLeads.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <SortHeader field="name">Name</SortHeader>
                      <th className="pb-3 pr-4">Contact</th>
                      <th className="pb-3 pr-4">Location</th>
                      <SortHeader field="status">Status</SortHeader>
                      <th className="pb-3 pr-4">Score</th>
                      <SortHeader field="step">Step</SortHeader>
                      <SortHeader field="created_at">Date</SortHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeads.map((lead) => {
                      const contact = lead.contacts?.[0]
                      const property = lead.properties?.[0]
                      const intake = lead.intakes?.[0]
                      const scoreInput: LeadScoreInput = {
                        jobType: intake?.job_type,
                        timelineUrgency: intake?.timeline_urgency,
                        photosCount: lead.uploads?.length || 0,
                        hasInsuranceClaim: intake?.has_insurance_claim,
                        roofSizeSqft: intake?.roof_size_sqft,
                      }
                      const leadScore = calculateLeadScore(scoreInput)
                      const scoreTier = getScoreTierDisplay(leadScore.tier)
                      const isSelected = selectedLeads.has(lead.id)

                      return (
                        <tr
                          key={lead.id}
                          className={`border-b last:border-0 transition-colors ${
                            isSelected ? 'bg-gold-light/10' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 pr-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectLead(lead.id)}
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="font-medium text-gold hover:underline"
                            >
                              {contact?.first_name && contact?.last_name
                                ? `${contact.first_name} ${contact.last_name}`
                                : 'Unknown'}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-600">
                            {contact?.email && (
                              <div>{contact.email}</div>
                            )}
                            {contact?.phone && (
                              <div>{formatPhone(contact.phone)}</div>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {property?.city && property?.state
                              ? `${property.city}, ${property.state}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 pr-4">
                            <QuickStatusSelect
                              leadId={lead.id}
                              currentStatus={lead.status}
                              onStatusChange={handleStatusChange}
                              compact
                            />
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${scoreTier.className}`}
                              title={`Score: ${leadScore.score}`}
                            >
                              {scoreTier.emoji && <span>{scoreTier.emoji}</span>}
                              {scoreTier.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {lead.current_step}/8
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {offset + 1}-{Math.min(offset + LIMIT, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                      disabled={offset === 0}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(offset + LIMIT)}
                      disabled={currentPage >= totalPages}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </FadeInSection>

      {/* Bulk actions bar */}
      <BulkActions
        selectedCount={selectedLeads.size}
        onClearSelection={() => setSelectedLeads(new Set())}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkExport={handleBulkExport}
        onBulkArchive={handleBulkArchive}
        isProcessing={isProcessing}
      />

      {/* Create Lead Modal */}
      <LeadCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </AdminPageTransition>
  )
}
