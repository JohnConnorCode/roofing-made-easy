'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  RefreshCw,
  AlertTriangle,
  Hammer,
  List,
  Kanban,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Calendar,
  DollarSign,
} from 'lucide-react'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  type JobStatus,
  type Job,
} from '@/lib/jobs/types'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { Skeleton } from '@/components/ui/skeleton'

type ViewMode = 'table' | 'kanban'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(JOB_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const KANBAN_STATUSES: JobStatus[] = [
  'pending_start',
  'materials_ordered',
  'scheduled',
  'in_progress',
  'inspection_pending',
  'punch_list',
  'completed',
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [summary, setSummary] = useState<Record<string, number>>({})
  const limit = 50

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      params.set('offset', offset.toString())
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch jobs')

      const data = await response.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setSummary(data.summary || {})
    } catch (err) {
      setError('Unable to load jobs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [offset, statusFilter, search])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const activeJobCount = (summary.in_progress || 0) + (summary.scheduled || 0) + (summary.inspection_pending || 0)
  const totalValue = jobs.reduce((sum, j) => sum + (j.contract_amount || 0), 0)

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500">Manage active projects and job assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{activeJobCount}</p>
              </div>
              <div className="rounded-lg bg-indigo-100 p-2">
                <Hammer className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Start</p>
                <p className="text-2xl font-bold text-slate-900">{summary.pending_start || 0}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{summary.completed || 0}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-2">
                <Hammer className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0) }}
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setOffset(0) }}
            />
            <Button variant="outline" size="sm" onClick={fetchJobs} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchJobs}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!error && viewMode === 'table' && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Hammer className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-slate-600">No jobs found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="px-4 py-3">Job #</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3">Scheduled</th>
                        <th className="px-4 py-3">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/jobs/${job.id}`} className="font-medium text-gold hover:underline">
                              {job.job_number}
                            </Link>
                            {job.lead?.contacts?.[0] && (
                              <p className="text-xs text-slate-500">
                                {job.lead.contacts[0].first_name} {job.lead.contacts[0].last_name}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                              {JOB_STATUS_LABELS[job.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {job.property_city && job.property_state
                              ? `${job.property_city}, ${job.property_state}`
                              : job.property_address || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {job.team ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: job.team.color }} />
                                {job.team.name}
                              </span>
                            ) : (
                              <span className="text-slate-400">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {job.scheduled_start ? formatDate(job.scheduled_start) : 'Not scheduled'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {formatCurrency(job.contract_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-slate-500">
                      Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={offset === 0}
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                        leftIcon={<ChevronLeft className="h-4 w-4" />}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={offset + limit >= total}
                        onClick={() => setOffset(offset + limit)}
                        leftIcon={<ChevronRight className="h-4 w-4" />}
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
      )}

      {/* Kanban View */}
      {!error && viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_STATUSES.map((status) => {
              const columnJobs = jobs.filter((j) => j.status === status)
              return (
                <div key={status} className="w-72 shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-700">{JOB_STATUS_LABELS[status]}</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                      {columnJobs.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {isLoading ? (
                      <Skeleton className="h-24 w-full rounded-lg" />
                    ) : columnJobs.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                        No jobs
                      </div>
                    ) : (
                      columnJobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                          <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <p className="text-sm font-medium text-slate-900">{job.job_number}</p>
                              {job.lead?.contacts?.[0] && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {job.lead.contacts[0].first_name} {job.lead.contacts[0].last_name}
                                </p>
                              )}
                              {job.property_city && (
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.property_city}, {job.property_state}
                                </p>
                              )}
                              {job.team && (
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {job.team.name}
                                </p>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs font-medium text-green-600">
                                  {formatCurrency(job.contract_amount)}
                                </span>
                                {job.scheduled_start && (
                                  <span className="text-xs text-slate-400">
                                    {formatDate(job.scheduled_start)}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminPageTransition>
  )
}
