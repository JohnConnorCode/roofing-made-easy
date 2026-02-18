'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  FileText,
  ArrowUpDown,
  Columns,
  Scale,
} from 'lucide-react'
import { SkeletonLeadsTable } from '@/components/ui/skeleton'
import { EstimateComparisonModal } from '@/components/admin/EstimateComparisonModal'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface Estimate {
  id: string
  lead_id: string
  price_low: number
  price_likely: number
  price_high: number
  status: string
  created_at: string
  valid_until: string | null
  sent_at: string | null
  accepted_at: string | null
  lead: {
    id: string
    status: string
    contact: { first_name: string; last_name: string; email: string }[] | null
    property: { street_address: string; city: string; state: string; zip_code: string }[] | null
    intake: { job_type: string; timeline_urgency: string; has_insurance_claim: boolean }[] | null
  }
}

interface EstimatesResponse {
  estimates: Estimate[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  aggregates: {
    total: number
    totalValue: number
    byStatus: {
      draft: number
      sent: number
      accepted: number
      expired: number
    }
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'expired', label: 'Expired' },
]

type SortField = 'created_at' | 'price_likely' | 'valid_until'

export default function EstimatesPage() {
  const [data, setData] = useState<EstimatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedEstimates, setSelectedEstimates] = useState<Set<string>>(new Set())
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const fetchEstimates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: sortField,
        sortOrder,
      })
      if (status) params.set('status', status)
      if (search) params.set('search', search)

      const response = await fetch(`/api/estimates?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch estimates')
      }
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load estimates. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [page, status, search, sortField, sortOrder])

  useEffect(() => {
    fetchEstimates()
  }, [fetchEstimates])

  useEffect(() => {
    setSelectedEstimates(new Set())
  }, [status, page])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleSelectEstimate = (estimateId: string) => {
    const newSelection = new Set(selectedEstimates)
    if (newSelection.has(estimateId)) {
      newSelection.delete(estimateId)
    } else {
      if (newSelection.size < 3) {
        newSelection.add(estimateId)
      }
    }
    setSelectedEstimates(newSelection)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700'
      case 'sent':
        return 'bg-blue-100 text-blue-700'
      case 'accepted':
        return 'bg-green-100 text-green-700'
      case 'expired':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const formatJobType = (type: string | undefined) => {
    if (!type) return 'N/A'
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <TableHead
      className="cursor-pointer hover:text-slate-900 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={`h-3 w-3 ${sortField === field ? 'text-gold' : 'text-slate-400'}`}
        />
      </div>
    </TableHead>
  )

  const selectedEstimateData = data?.estimates.filter((e) =>
    selectedEstimates.has(e.id)
  ) || []

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimates</h1>
          <p className="text-slate-500">View and manage all generated estimates</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedEstimates.size >= 2 && (
            <Button
              onClick={() => setIsCompareOpen(true)}
              leftIcon={<Scale className="h-4 w-4" />}
            >
              Compare ({selectedEstimates.size})
            </Button>
          )}
        </div>
      </div>
      </FadeInSection>

      {/* Stats Cards */}
      <FadeInSection delay={100} animation="slide-up">
      {data?.aggregates && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Total Estimates</div>
              <div className="text-2xl font-bold text-slate-900">
                {data.aggregates.total}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Total Value</div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(data.aggregates.totalValue)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Accepted</div>
              <div className="text-2xl font-bold text-green-600">
                {data.aggregates.byStatus.accepted}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Pending</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.aggregates.byStatus.sent}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </FadeInSection>

      {/* Filters */}
      <FadeInSection delay={200} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name or address..."
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

      {/* Estimates table */}
      <FadeInSection delay={300} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {data?.pagination.total || 0} Estimate
            {data?.pagination.total !== 1 ? 's' : ''}
            {selectedEstimates.size > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({selectedEstimates.size} selected for comparison)
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
                onClick={fetchEstimates}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            </div>
          ) : !data?.estimates.length ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-slate-600">No estimates found</p>
              <p className="text-sm text-slate-400">
                {search || status
                  ? 'Try adjusting your filters.'
                  : 'Estimates will appear here when generated.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Columns className="h-4 w-4 text-slate-400" />
                    </TableHead>
                    <TableHead>Lead / Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <SortableHeader field="price_likely">Price Range</SortableHeader>
                    <TableHead>Status</TableHead>
                    <SortableHeader field="created_at">Created</SortableHeader>
                    <SortableHeader field="valid_until">Valid Until</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.estimates.map((estimate) => {
                    const contact = estimate.lead?.contact?.[0]
                    const property = estimate.lead?.property?.[0]
                    const intake = estimate.lead?.intake?.[0]
                    const isSelected = selectedEstimates.has(estimate.id)

                    return (
                      <TableRow
                        key={estimate.id}
                        className={isSelected ? 'bg-gold-light/10' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectEstimate(estimate.id)}
                            disabled={!isSelected && selectedEstimates.size >= 3}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/leads/${estimate.lead_id}`}
                            className="font-medium text-gold hover:underline"
                          >
                            {contact?.first_name && contact?.last_name
                              ? `${contact.first_name} ${contact.last_name}`
                              : 'Unknown'}
                          </Link>
                          {contact?.email && (
                            <div className="text-sm text-slate-500">
                              {contact.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {property ? (
                            <div>
                              <div className="text-sm">
                                {property.street_address}
                              </div>
                              <div className="text-sm text-slate-500">
                                {property.city}, {property.state} {property.zip_code}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{formatJobType(intake?.job_type)}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(estimate.price_likely)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatCurrency(estimate.price_low)} -{' '}
                            {formatCurrency(estimate.price_high)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                              estimate.status
                            )}`}
                          >
                            {estimate.status.charAt(0).toUpperCase() +
                              estimate.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(estimate.created_at)}</TableCell>
                        <TableCell>
                          {estimate.valid_until
                            ? formatDate(estimate.valid_until)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing{' '}
                    {(data.pagination.page - 1) * data.pagination.limit + 1}-
                    {Math.min(
                      data.pagination.page * data.pagination.limit,
                      data.pagination.total
                    )}{' '}
                    of {data.pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pagination.totalPages}
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

      {/* Comparison Modal */}
      <EstimateComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        estimates={selectedEstimateData}
      />
    </AdminPageTransition>
  )
}
