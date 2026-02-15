'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils'
import {
  ArrowLeft,
  User,
  MapPin,
  Home,
  AlertTriangle,
  Clock,
  DollarSign,
  ImageIcon,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Shield,
  HandHeart,
  UserCheck,
  Mail,
  Download,
  Send,
  Hammer,
} from 'lucide-react'
import { SkeletonLeadDetail } from '@/components/ui/skeleton'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { calculateLeadScore, getScoreTierDisplay, type LeadScoreInput } from '@/lib/leads/scoring'
import { LeadNotes } from '@/components/admin/lead-notes'
import { FollowUpReminder } from '@/components/admin/follow-up-reminder'
import { QuoteGenerator } from '@/components/admin/quote-generator'
import { PhotoGallery } from '@/components/admin/photo-gallery'
import { CommunicationTimeline } from '@/components/admin/communication-timeline'

interface LeadDetail {
  id: string
  status: string
  current_step: number
  created_at: string
  completed_at: string | null
  contacts: Array<{
    first_name: string
    last_name: string
    email: string
    phone: string
    preferred_contact_method: string
  }>
  properties: Array<{
    street_address: string
    city: string
    state: string
    zip_code: string
  }>
  intakes: Array<{
    job_type: string
    roof_material: string
    roof_size_sqft: number
    stories: number
    roof_pitch: string
    issues: string[]
    timeline_urgency: string
    has_insurance_claim: boolean
  }>
  uploads: Array<{
    id: string
    storage_path: string
    original_filename: string
    ai_analyzed: boolean
    ai_detected_issues: string[]
  }>
  estimates: Array<{
    id: string
    price_low: number
    price_likely: number
    price_high: number
    ai_explanation: string
    ai_explanation_status?: string
    ai_explanation_provider?: string
    estimate_status?: string
    is_superseded?: boolean
    sent_at?: string
    created_at: string
  }>
  // Customer hub data
  customer_lead?: {
    customer: {
      id: string
      email: string
      first_name: string
      last_name: string
      created_at: string
    }
  }
  financing_applications?: Array<{
    id: string
    amount_requested: number
    credit_range: string
    income_range: string
    status: string
    created_at: string
  }>
  insurance_claims?: Array<{
    id: string
    insurance_company: string
    claim_number: string
    status: string
    created_at: string
  }>
  program_applications?: Array<{
    id: string
    program_id: string
    status: string
    created_at: string
  }>
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

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.leadId as string
  const { showToast } = useToast()
  const { confirm } = useConfirmDialog()

  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isResendingEstimate, setIsResendingEstimate] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  const fetchLead = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/leads/${leadId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lead')
      }
      const data = await response.json()
      if (data.lead) {
        setLead(data.lead)
      } else {
        setError('Lead not found')
      }
    } catch (err) {
      setError('Unable to load lead. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return

    // Confirm destructive status changes
    const destructiveStatuses = ['lost', 'archived']
    if (destructiveStatuses.includes(newStatus)) {
      const confirmed = await confirm({
        title: `Mark Lead as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}?`,
        description: `Are you sure you want to mark this lead as "${newStatus}"? This action can be undone by changing the status again.`,
        confirmText: `Mark as ${newStatus}`,
        cancelText: 'Cancel',
        variant: newStatus === 'lost' ? 'danger' : 'warning',
      })
      if (!confirmed) return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      setLead({ ...lead, status: newStatus })
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'success')
    } catch (err) {
      showToast('Failed to update status. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResendEstimate = async () => {
    if (!lead) return

    setIsResendingEstimate(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/estimate/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeSms: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend estimate')
      }

      let message = 'Estimate email sent'
      if (data.results?.sms) {
        message += ' and SMS sent'
      }
      showToast(message, 'success')
      // Re-fetch to update estimate status badge
      fetchLead()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend estimate'
      showToast(message, 'error')
    } finally {
      setIsResendingEstimate(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/estimate/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'estimate.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('PDF downloaded', 'success')
    } catch (err) {
      showToast('Failed to download PDF', 'error')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  if (isLoading) {
    return <SkeletonLeadDetail />
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="mt-4 text-lg font-medium text-slate-900">
          {error || "This lead doesn't exist or may have been archived."}
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={fetchLead} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Button variant="primary" onClick={() => router.push('/leads')}>
            Return to Leads
          </Button>
        </div>
      </div>
    )
  }

  const contact = lead.contacts?.[0]
  const property = lead.properties?.[0]
  const intake = lead.intakes?.[0]
  // Find the most recent non-superseded estimate, or fall back to the first estimate
  const estimate = lead.estimates?.find((e) => e && !(e as any).is_superseded) || lead.estimates?.[0]

  // Calculate lead score
  const scoreInput: LeadScoreInput = {
    jobType: intake?.job_type,
    timelineUrgency: intake?.timeline_urgency,
    photosCount: lead.uploads?.length || 0,
    hasInsuranceClaim: intake?.has_insurance_claim,
    roofSizeSqft: intake?.roof_size_sqft,
  }
  const leadScore = calculateLeadScore(scoreInput)
  const scoreTier = getScoreTierDisplay(leadScore.tier)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {contact?.first_name} {contact?.last_name}
            </h1>
            <p className="text-slate-500">
              Lead created {formatDate(lead.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${scoreTier.className}`}
            title={`Lead Score: ${leadScore.score}/100`}
          >
            <TrendingUp className="h-4 w-4" />
            {scoreTier.emoji && <span>{scoreTier.emoji}</span>}
            {scoreTier.label} ({leadScore.score})
          </div>
          {lead.status === 'won' && (
            <Link href={`/jobs?create_from_lead=${lead.id}`}>
              <Button variant="primary" size="sm" leftIcon={<Hammer className="h-4 w-4" />}>
                Create Job
              </Button>
            </Link>
          )}
          <Select
            options={STATUS_OPTIONS}
            value={lead.status}
            onChange={handleStatusChange}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium">
                {contact?.first_name} {contact?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{contact?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium">
                {contact?.phone ? formatPhone(contact.phone) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Preferred Contact</p>
              <p className="font-medium capitalize">
                {contact?.preferred_contact_method || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Property Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-medium">
                {property?.street_address || 'N/A'}
              </p>
              {property?.city && (
                <p className="text-slate-600">
                  {property.city}, {property.state} {property.zip_code}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roof Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Roof Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Job Type</p>
                <p className="font-medium capitalize">
                  {intake?.job_type?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Material</p>
                <p className="font-medium capitalize">
                  {intake?.roof_material?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Size</p>
                <p className="font-medium">
                  {intake?.roof_size_sqft
                    ? `${intake.roof_size_sqft.toLocaleString()} sq ft`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Stories</p>
                <p className="font-medium">{intake?.stories || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pitch</p>
                <p className="font-medium capitalize">
                  {intake?.roof_pitch?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reported Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intake?.issues && intake.issues.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {intake.issues.map((issue, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                  >
                    {String(issue).replace('_', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No issues reported</p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Urgency</p>
              <p className="font-medium capitalize">
                {intake?.timeline_urgency?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Insurance Claim</p>
              <p className="font-medium">
                {intake?.has_insurance_claim ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estimate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Estimate
            </CardTitle>
            {estimate && contact?.email && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  leftIcon={<Download className="h-4 w-4" />}
                  title="Download PDF"
                >
                  {isDownloadingPDF ? 'Downloading...' : 'PDF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendEstimate}
                  disabled={isResendingEstimate}
                  leftIcon={<Send className="h-4 w-4" />}
                  title="Resend estimate to customer"
                >
                  {isResendingEstimate ? 'Sending...' : 'Resend'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {estimate ? (
              <div className="space-y-4">
                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    estimate.estimate_status === 'accepted' ? 'bg-green-100 text-green-700' :
                    estimate.estimate_status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    estimate.estimate_status === 'rejected' ? 'bg-red-100 text-red-700' :
                    estimate.estimate_status === 'expired' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {(estimate.estimate_status || 'draft').charAt(0).toUpperCase() + (estimate.estimate_status || 'draft').slice(1)}
                  </span>
                  {estimate.ai_explanation_status && estimate.ai_explanation_status !== 'success' && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      estimate.ai_explanation_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      AI: {estimate.ai_explanation_status}
                    </span>
                  )}
                  {estimate.ai_explanation_provider && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-500">
                      via {estimate.ai_explanation_provider}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Range</p>
                    <p className="text-lg font-medium">
                      {formatCurrency(estimate.price_low)} -{' '}
                      {formatCurrency(estimate.price_high)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Most Likely</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(estimate.price_likely)}
                    </p>
                  </div>
                </div>
                {estimate.ai_explanation && (
                  <div>
                    <p className="text-sm text-slate-500">AI Summary</p>
                    <p className="text-sm text-slate-700">{estimate.ai_explanation}</p>
                  </div>
                )}
                {/* Show email delivery info */}
                {contact?.email && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {estimate.sent_at
                        ? `Sent to ${contact.email} on ${formatDate(estimate.sent_at)}`
                        : `Will be sent to: ${contact.email}`
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">No estimate generated</p>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photos ({lead.uploads?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGallery
              photos={lead.uploads || []}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
              leadId={lead.id}
            />
          </CardContent>
        </Card>

        {/* Follow-Up Reminder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Follow-Up</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowUpReminder
              leadId={lead.id}
              leadName={`${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || 'Lead'}
            />
          </CardContent>
        </Card>

        {/* Communications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommunicationTimeline leadId={lead.id} />
          </CardContent>
        </Card>

        {/* Notes & Activity */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <LeadNotes leadId={lead.id} />
          </CardContent>
        </Card>

        {/* Quote Generator */}
        {estimate && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <QuoteGenerator
                leadData={{
                  id: lead.id,
                  contact: contact,
                  property: property,
                  intake: intake,
                  estimate: estimate,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Customer Qualification Hub */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Customer Qualification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Customer Account */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Customer Account</p>
                </div>
                {lead.customer_lead?.customer ? (
                  <div>
                    <p className="text-sm text-slate-900">
                      {lead.customer_lead.customer.first_name} {lead.customer_lead.customer.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{lead.customer_lead.customer.email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No account created</p>
                )}
              </div>

              {/* Financing Status */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Financing</p>
                </div>
                {lead.financing_applications && lead.financing_applications.length > 0 ? (
                  <div>
                    <p className="text-sm text-slate-900">
                      {formatCurrency(lead.financing_applications[0].amount_requested)} requested
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      Credit: {lead.financing_applications[0].credit_range?.replace('_', ' ')}
                    </p>
                    <span className={`inline-flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded ${
                      lead.financing_applications[0].status === 'approved'
                        ? 'text-green-600 bg-green-50'
                        : lead.financing_applications[0].status === 'denied'
                        ? 'text-red-600 bg-red-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {lead.financing_applications[0].status.replace('_', ' ')}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not interested</p>
                )}
              </div>

              {/* Insurance Claim Status */}
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Insurance Claim</p>
                </div>
                {lead.insurance_claims && lead.insurance_claims.length > 0 ? (
                  <div>
                    <p className="text-sm text-slate-900">
                      {lead.insurance_claims[0].insurance_company || 'Company not specified'}
                    </p>
                    {lead.insurance_claims[0].claim_number && (
                      <p className="text-xs text-slate-500 font-mono">
                        #{lead.insurance_claims[0].claim_number}
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded ${
                      lead.insurance_claims[0].status === 'approved' || lead.insurance_claims[0].status === 'settled'
                        ? 'text-green-600 bg-green-50'
                        : lead.insurance_claims[0].status === 'denied'
                        ? 'text-red-600 bg-red-50'
                        : 'text-blue-600 bg-blue-50'
                    }`}>
                      {lead.insurance_claims[0].status.replace('_', ' ')}
                    </span>
                  </div>
                ) : intake?.has_insurance_claim ? (
                  <p className="text-sm text-amber-600">Claim indicated, not tracked</p>
                ) : (
                  <p className="text-sm text-slate-500">No claim</p>
                )}
              </div>
            </div>

            {/* Assistance Programs */}
            {lead.program_applications && lead.program_applications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <HandHeart className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">
                    Assistance Programs ({lead.program_applications.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.program_applications.map((app) => (
                    <span
                      key={app.id}
                      className={`text-xs px-2 py-1 rounded ${
                        app.status === 'approved'
                          ? 'text-green-600 bg-green-50'
                          : app.status === 'denied'
                          ? 'text-red-600 bg-red-50'
                          : 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      {app.program_id} - {app.status.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
