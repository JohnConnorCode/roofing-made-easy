'use client'

import { useEffect, useState } from 'react'
import { X, Phone, Mail, MapPin, Calendar, FileText, Image, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils'
import Link from 'next/link'
import type { LeadCardData } from './LeadCard'

interface LeadDetails extends LeadCardData {
  intakes?: {
    job_type?: string
    roof_material?: string
    roof_size_sqft?: number
    timeline_urgency?: string
    has_insurance_claim?: boolean
    issues?: string[]
  }[]
  uploads?: { id: string; original_filename?: string; ai_analyzed?: boolean }[]
  estimates?: { id: string; price_low: number; price_likely: number; price_high: number }[]
}

interface LeadSlideOverProps {
  lead: LeadCardData | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>
}

const STATUS_OPTIONS = [
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

export function LeadSlideOver({ lead, isOpen, onClose, onStatusChange }: LeadSlideOverProps) {
  const [details, setDetails] = useState<LeadDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (lead && isOpen) {
      fetchLeadDetails(lead.id)
    }
  }, [lead, isOpen])

  const fetchLeadDetails = async (leadId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`)
      if (response.ok) {
        const data = await response.json()
        setDetails(data.lead)
      }
    } catch (error) {
      console.error('Failed to fetch lead details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return
    setIsUpdating(true)
    try {
      await onStatusChange(lead.id, newStatus)
      if (details) {
        setDetails({ ...details, status: newStatus })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen) return null

  const contact = details?.contacts?.[0] || lead?.contacts?.[0]
  const property = details?.properties?.[0] || lead?.properties?.[0]
  const intake = details?.intakes?.[0]
  const estimate = details?.estimates?.[0]
  const uploads = details?.uploads || []

  const name = contact?.first_name && contact?.last_name
    ? `${contact.first_name} ${contact.last_name}`
    : contact?.email || 'Unknown'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500">Lead Details</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/leads/${lead?.id}`}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              title="Open full view"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <Select
                  options={STATUS_OPTIONS}
                  value={details?.status || lead?.status || ''}
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {contact?.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-3 text-slate-600 hover:text-amber-600"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{formatPhone(contact.phone)}</span>
                    </a>
                  )}
                  {contact?.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 text-slate-600 hover:text-amber-600"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{contact.email}</span>
                    </a>
                  )}
                  {property?.street_address && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>
                        {property.street_address}
                        <br />
                        {property.city}, {property.state}
                      </span>
                    </div>
                  )}
                  {lead?.created_at && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted {formatDate(lead.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {intake && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Project Details</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {intake.job_type && (
                      <>
                        <dt className="text-slate-500">Job Type</dt>
                        <dd className="text-slate-900 capitalize">{intake.job_type.replace(/_/g, ' ')}</dd>
                      </>
                    )}
                    {intake.roof_material && (
                      <>
                        <dt className="text-slate-500">Material</dt>
                        <dd className="text-slate-900 capitalize">{intake.roof_material.replace(/_/g, ' ')}</dd>
                      </>
                    )}
                    {intake.roof_size_sqft && (
                      <>
                        <dt className="text-slate-500">Roof Size</dt>
                        <dd className="text-slate-900">{intake.roof_size_sqft.toLocaleString()} sq ft</dd>
                      </>
                    )}
                    {intake.timeline_urgency && (
                      <>
                        <dt className="text-slate-500">Timeline</dt>
                        <dd className="text-slate-900 capitalize">{intake.timeline_urgency.replace(/_/g, ' ')}</dd>
                      </>
                    )}
                    {intake.has_insurance_claim !== undefined && (
                      <>
                        <dt className="text-slate-500">Insurance Claim</dt>
                        <dd className="text-slate-900">{intake.has_insurance_claim ? 'Yes' : 'No'}</dd>
                      </>
                    )}
                  </dl>
                  {intake.issues && intake.issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <dt className="text-slate-500 text-sm mb-1">Reported Issues</dt>
                      <div className="flex flex-wrap gap-1">
                        {intake.issues.map((issue, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                            {issue.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estimate */}
              {estimate && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Estimate</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(estimate.price_likely)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Range: {formatCurrency(estimate.price_low)} - {formatCurrency(estimate.price_high)}
                    </p>
                  </div>
                </div>
              )}

              {/* Photos */}
              {uploads.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Photos ({uploads.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {uploads.slice(0, 6).map((upload) => (
                      <div
                        key={upload.id}
                        className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center text-slate-400"
                      >
                        <Image className="h-6 w-6" />
                      </div>
                    ))}
                  </div>
                  {uploads.length > 6 && (
                    <p className="text-sm text-slate-500 mt-2 text-center">
                      +{uploads.length - 6} more photos
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50">
          <div className="flex gap-3">
            <Link href={`/leads/${lead?.id}`} className="flex-1">
              <Button variant="primary" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
