'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate, formatPhone } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw, Loader2, Inbox } from 'lucide-react'

interface Lead {
  id: string
  status: string
  created_at: string
  current_step: number
  contacts: { first_name: string; last_name: string; email: string; phone: string }[]
  properties: { city: string; state: string; street_address: string }[]
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

const LIMIT = 20

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)

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
      console.error('Error fetching leads:', err)
      setError('Unable to load leads. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [status, offset])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

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

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500">Manage your roofing leads</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
              className="md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leads table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} Lead{total !== 1 ? 's' : ''}
          </CardTitle>
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
                onClick={fetchLeads}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Inbox className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-gray-600">No leads found</p>
              <p className="text-sm text-gray-400">
                {search || status ? 'Try adjusting your filters.' : 'New submissions will appear here automatically.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Contact</th>
                      <th className="pb-3 pr-4">Location</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Step</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
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
                                : 'Unknown'}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600">
                            {contact?.email && (
                              <div>{contact.email}</div>
                            )}
                            {contact?.phone && (
                              <div>{formatPhone(contact.phone)}</div>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-600">
                            {property?.city && property?.state
                              ? `${property.city}, ${property.state}`
                              : 'N/A'}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="py-3 pr-4 text-gray-600">
                            {lead.current_step}/8
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
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
