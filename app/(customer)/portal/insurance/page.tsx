'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { ClaimTracker, ResourceLibrary, EstimateSummary, Breadcrumbs } from '@/components/customer'
import {
  Shield,
  Plus,
  Mail,
  Phone,
  CheckSquare,
  ChevronDown,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  HandHeart,
} from 'lucide-react'
import { INSURANCE_COMPANIES, CLAIM_STATUS_LABELS } from '@/lib/data/insurance-resources'
import type { InsuranceClaimStatus, InsuranceClaimTimelineEvent } from '@/lib/supabase/types'
import { BUSINESS_CONFIG, getPhoneDisplay, getPhoneLink } from '@/lib/config/business'
import { formatCurrency } from '@/lib/utils'
import ClaimLetterGenerator from '@/components/insurance/ClaimLetterGenerator'
import DamageDocGuide from '@/components/insurance/DamageDocGuide'
import ClaimValueEstimator from '@/components/insurance/ClaimValueEstimator'
import { AiAdvisorChat } from '@/components/shared/AiAdvisorChat'

const CAUSE_OPTIONS = [
  { value: 'hail', label: 'Hail Damage' },
  { value: 'wind', label: 'Wind Damage' },
  { value: 'storm', label: 'Storm Damage' },
  { value: 'tree', label: 'Tree/Debris Damage' },
  { value: 'tornado', label: 'Tornado' },
  { value: 'hurricane', label: 'Hurricane' },
  { value: 'fire', label: 'Fire Damage' },
  { value: 'other', label: 'Other' },
]

export default function InsurancePage() {
  const { showToast } = useToast()
  const {
    linkedLeads,
    selectedLeadId,
    insuranceClaims,
    addInsuranceClaim,
    updateInsuranceClaim,
  } = useCustomerStore()

  const [showForm, setShowForm] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    insuranceCompany: '',
    policyNumber: '',
    claimNumber: '',
    dateOfLoss: '',
    causeOfLoss: '',
    customerNotes: '',
  })

  const [statusData, setStatusData] = useState({
    status: 'filed' as InsuranceClaimStatus,
    notes: '',
  })

  // Get current lead data
  const currentLead = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const estimate = currentLead?.lead?.estimate
  const property = currentLead?.lead?.property
  const intake = currentLead?.lead?.intake

  // Get existing claim for this lead
  const existingClaim = insuranceClaims.find((c) => c.lead_id === selectedLeadId)

  // Calculate insurance gap
  const insuranceGap = useMemo(() => {
    if (!existingClaim?.claim_amount_approved || !estimate?.price_likely) return null
    const approved = existingClaim.claim_amount_approved
    const deductible = existingClaim.deductible || 0
    const netPayout = approved - deductible
    const gap = estimate.price_likely - netPayout
    return gap > 0 ? { approved, deductible, netPayout, gap, estimateAmount: estimate.price_likely } : null
  }, [existingClaim?.claim_amount_approved, existingClaim?.deductible, estimate?.price_likely])

  // Reset form and pre-fill from intake data when property changes
  useEffect(() => {
    setShowForm(false)
    setShowStatusUpdate(false)
    setShowOptionalFields(false)
    if (intake && !existingClaim) {
      setFormData({
        insuranceCompany: intake.insurance_company || '',
        policyNumber: '',
        claimNumber: intake.claim_number || '',
        dateOfLoss: '',
        causeOfLoss: '',
        customerNotes: '',
      })
    } else {
      setFormData({
        insuranceCompany: '',
        policyNumber: '',
        claimNumber: '',
        dateOfLoss: '',
        causeOfLoss: '',
        customerNotes: '',
      })
    }
  }, [selectedLeadId, intake, existingClaim])

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLeadId) {
      showToast('Please select a property first', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/customer/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create claim')
      }

      const data = await response.json()
      addInsuranceClaim(data)
      setShowForm(false)
      showToast('Claim tracker created!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!existingClaim) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/customer/insurance/${existingClaim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusData.status,
          notes: statusData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update')
      }

      const data = await response.json()
      updateInsuranceClaim(existingClaim.id, data)
      setShowStatusUpdate(false)
      setStatusData({ status: 'filed', notes: '' })
      showToast('Status updated!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Detected issues placeholder (intake table doesn't store photo_analysis)
  const detectedIssues: Array<{ issue: string; confidence: number; description?: string }> = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/portal' },
          { label: 'Insurance' },
        ]} />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Insurance Assistance</h1>
          <p className="text-slate-400">Track your claim and access helpful resources</p>
        </div>
      </div>

      {/* Current estimate summary */}
      {estimate && (
        <EstimateSummary
          estimate={{
            priceLow: estimate.price_low,
            priceLikely: estimate.price_likely,
            priceHigh: estimate.price_high,
          }}
          property={{
            address: property?.street_address || undefined,
            city: property?.city || undefined,
            state: property?.state || undefined,
          }}
          compact
          showActions={false}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - claim tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim tracker or create form */}
          {existingClaim ? (
            <ClaimTracker
              claim={{
                id: existingClaim.id,
                insuranceCompany: existingClaim.insurance_company,
                claimNumber: existingClaim.claim_number,
                status: existingClaim.status,
                dateOfLoss: existingClaim.date_of_loss,
                causeOfLoss: existingClaim.cause_of_loss,
                timeline: (existingClaim.timeline as unknown as InsuranceClaimTimelineEvent[]) || [],
                adjusterName: existingClaim.adjuster_name,
                adjusterPhone: existingClaim.adjuster_phone,
                adjusterVisitDate: existingClaim.adjuster_visit_date,
                claimAmountApproved: existingClaim.claim_amount_approved,
                deductible: existingClaim.deductible,
              }}
              onUpdateStatus={() => setShowStatusUpdate(true)}
              onAddNote={() => setShowStatusUpdate(true)}
            />
          ) : showForm ? (
            <Card variant="dark" className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Start Tracking Your Claim</CardTitle>
                <CardDescription>
                  Just 2 fields to get started. Add details later anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClaim} className="space-y-4">
                  {/* Required fields */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Insurance Company
                    </label>
                    <Select
                      value={formData.insuranceCompany}
                      onChange={(value) => setFormData({ ...formData, insuranceCompany: value })}
                      options={[
                        { value: '', label: 'Select company...' },
                        ...INSURANCE_COMPANIES.map((c) => ({
                          value: c.name,
                          label: c.name,
                        })),
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Cause of Damage
                    </label>
                    <Select
                      value={formData.causeOfLoss}
                      onChange={(value) => setFormData({ ...formData, causeOfLoss: value })}
                      options={[
                        { value: '', label: 'Select cause...' },
                        ...CAUSE_OPTIONS,
                      ]}
                    />
                  </div>

                  {/* Optional fields toggle */}
                  {!showOptionalFields ? (
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(true)}
                      className="flex items-center gap-2 text-sm text-gold-light hover:text-gold-hover transition-colors w-full justify-center py-2 rounded-lg border border-dashed border-slate-700 hover:border-gold-light/30"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Add claim details (optional)
                    </button>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                      <Input
                        label="Claim Number"
                        placeholder="CLM-123456"
                        value={formData.claimNumber}
                        onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                        hint="Don't have this yet? You can add it later."
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Policy Number (optional)"
                          placeholder="POL-789012"
                          value={formData.policyNumber}
                          onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                        />
                        <Input
                          type="date"
                          label="Date of Loss"
                          value={formData.dateOfLoss}
                          onChange={(e) => setFormData({ ...formData, dateOfLoss: e.target.value })}
                        />
                      </div>

                      <Textarea
                        label="Notes (optional)"
                        placeholder="Any additional details about the damage or claim..."
                        value={formData.customerNotes}
                        onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    >
                      Start Tracking
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Why file through us? */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
                  <Users className="h-5 w-5 text-gold-light mx-auto mb-1" />
                  <p className="text-sm font-medium text-slate-200">Expert Guidance</p>
                  <p className="text-xs text-slate-500">We handle the process</p>
                </div>
                <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
                  <Clock className="h-5 w-5 text-gold-light mx-auto mb-1" />
                  <p className="text-sm font-medium text-slate-200">Track Progress</p>
                  <p className="text-xs text-slate-500">Real-time updates</p>
                </div>
                <div className="rounded-lg bg-slate-deep border border-slate-700 p-3 text-center">
                  <DollarSign className="h-5 w-5 text-gold-light mx-auto mb-1" />
                  <p className="text-sm font-medium text-slate-200">Maximize Payout</p>
                  <p className="text-xs text-slate-500">Get what you deserve</p>
                </div>
              </div>

              {/* Before you start checklist */}
              <Card variant="dark" className="border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-gold-light" />
                    Before You Start
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300 mb-4">
                    <li className="flex gap-2"><span className="text-gold-light font-medium">1.</span> Document all damage with photos</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">2.</span> Note the date and cause of damage</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">3.</span> Contact your insurance company</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">4.</span> Get your claim number</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">5.</span> Schedule adjuster visit</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">6.</span> Get a roofing estimate</li>
                    <li className="flex gap-2"><span className="text-gold-light font-medium">7.</span> Review adjuster report</li>
                  </ul>
                  <p className="text-xs text-slate-500 mb-4">
                    {intake?.has_insurance_claim
                      ? "We see you have an insurance claim. Let's track it together."
                      : "Don't worry if you haven't completed all steps. Start tracking and we'll guide you."}
                  </p>
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowForm(true)}
                  >
                    Start Tracking Claim
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Claim Letter Generator */}
          {existingClaim && (
            <ClaimLetterGenerator leadId={selectedLeadId || undefined} />
          )}

          {/* Damage Documentation Guide */}
          <DamageDocGuide detectedIssues={detectedIssues} />

          {/* Claim Value Estimator */}
          {estimate && (
            <ClaimValueEstimator estimateAmount={estimate.price_likely} />
          )}

          {/* Gap Analysis */}
          {insuranceGap && (
            <Card variant="dark" className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Coverage Gap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Estimate</p>
                    <p className="text-slate-200 font-medium">{formatCurrency(insuranceGap.estimateAmount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Approved</p>
                    <p className="text-slate-200 font-medium">{formatCurrency(insuranceGap.approved)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Deductible</p>
                    <p className="text-slate-200 font-medium">-{formatCurrency(insuranceGap.deductible)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Net Payout</p>
                    <p className="text-slate-200 font-medium">{formatCurrency(insuranceGap.netPayout)}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-amber-300 font-semibold text-lg">{formatCurrency(insuranceGap.gap)} remaining</p>
                  <p className="text-sm text-slate-400 mt-1">You may need to cover this gap out of pocket or through financing/assistance.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/portal/financing`}>
                    <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Explore Financing Options
                    </Button>
                  </Link>
                  <Link href="/portal/assistance">
                    <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      <HandHeart className="h-3.5 w-3.5 mr-1.5" />
                      Check Assistance Programs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status update modal/form */}
          {showStatusUpdate && existingClaim && (
            <Card className="border-gold-light/30">
              <CardHeader>
                <CardTitle className="text-slate-100">Update Claim Status</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      New Status
                    </label>
                    <Select
                      value={statusData.status}
                      onChange={(value) => setStatusData({ ...statusData, status: value as InsuranceClaimStatus })}
                      options={Object.entries(CLAIM_STATUS_LABELS).map(([value, info]) => ({
                        value,
                        label: info.label,
                      }))}
                    />
                  </div>
                  <Textarea
                    label="Notes"
                    placeholder="What happened? Any updates to share?"
                    value={statusData.notes}
                    onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      onClick={() => setShowStatusUpdate(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    >
                      Update Status
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - resources */}
        <div className="space-y-6">
          {/* AI Insurance Advisor */}
          <AiAdvisorChat
            topic="insurance"
            leadId={selectedLeadId || undefined}
            suggestedQuestions={[
              'What should I say when I call to file?',
              'My adjuster is coming -- how do I prepare?',
              'My claim was denied -- what are my options?',
              `How much should insurance cover on my repair?`,
            ]}
            compact
          />

          {/* Quick actions */}
          <Card variant="dark" className="border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-800"
                leftIcon={<CheckSquare className="h-4 w-4" />}
                onClick={() => setShowChecklist(!showChecklist)}
              >
                {showChecklist ? 'Hide' : 'View'} Claim Checklist
              </Button>
              {showChecklist && (
                <div className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300 space-y-2">
                  <p className="font-medium text-slate-200 mb-2">Before filing your claim:</p>
                  <ul className="space-y-1.5">
                    <li className="flex gap-2"><span className="text-gold-light">1.</span> Document all damage with photos</li>
                    <li className="flex gap-2"><span className="text-gold-light">2.</span> Note the date and cause of damage</li>
                    <li className="flex gap-2"><span className="text-gold-light">3.</span> Contact your insurance company</li>
                    <li className="flex gap-2"><span className="text-gold-light">4.</span> Get your claim number</li>
                    <li className="flex gap-2"><span className="text-gold-light">5.</span> Schedule adjuster visit</li>
                    <li className="flex gap-2"><span className="text-gold-light">6.</span> Get a roofing estimate</li>
                    <li className="flex gap-2"><span className="text-gold-light">7.</span> Review adjuster report</li>
                  </ul>
                </div>
              )}
              <a
                href={`mailto:${BUSINESS_CONFIG.email.primary}?subject=Insurance%20Claim%20Documents`}
                className="flex w-full items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Documents
              </a>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-800"
                leftIcon={<Phone className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = getPhoneLink()
                }}
              >
                Call {getPhoneDisplay()}
              </Button>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card variant="dark" className="border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceLibrary limit={3} />
            </CardContent>
          </Card>

          {/* Cross-links */}
          <Card variant="dark" className="border-slate-700">
            <CardContent className="pt-4 pb-4 space-y-3">
              <Link href="/portal/financing" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                <DollarSign className="h-5 w-5 text-gold-light" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">Financing Options</p>
                  <p className="text-xs text-slate-500">Cover any gap with affordable payments</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-gold-light transition-colors" />
              </Link>
              <Link href="/portal/assistance" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group">
                <HandHeart className="h-5 w-5 text-gold-light" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">Assistance Programs</p>
                  <p className="text-xs text-slate-500">Grants and programs you may qualify for</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-gold-light transition-colors" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
