'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { ClaimTracker, ResourceLibrary, EstimateSummary } from '@/components/customer'
import {
  Shield,
  ArrowLeft,
  Plus,
  FileText,
  Upload,
  Phone,
} from 'lucide-react'
import { INSURANCE_COMPANIES, CLAIM_STATUS_LABELS } from '@/lib/data/insurance-resources'
import type { InsuranceClaimStatus, InsuranceClaimTimelineEvent } from '@/lib/supabase/types'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

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
  const router = useRouter()
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

  // Pre-fill form from intake data
  useState(() => {
    if (intake && !existingClaim) {
      setFormData((prev) => ({
        ...prev,
        insuranceCompany: intake.insurance_company || '',
        claimNumber: intake.claim_number || '',
      }))
    }
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200"
          onClick={() => router.push('/portal')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
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
                  Enter your insurance claim details to track progress and get helpful resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClaim} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
                    <Input
                      label="Claim Number"
                      placeholder="CLM-123456"
                      value={formData.claimNumber}
                      onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                    />
                  </div>

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

                  <Textarea
                    label="Notes (optional)"
                    placeholder="Any additional details about the damage or claim..."
                    value={formData.customerNotes}
                    onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                    rows={3}
                  />

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
                      className="flex-1 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
                    >
                      Start Tracking
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card variant="dark" className="border-slate-700">
              <CardContent className="py-8 text-center">
                <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-200 mb-2">Track Your Insurance Claim</h3>
                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                  {intake?.has_insurance_claim
                    ? "We see you have an insurance claim. Let's track it together."
                    : 'Filing an insurance claim? Track your progress and get helpful resources.'}
                </p>
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowForm(true)}
                >
                  Start Tracking Claim
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status update modal/form */}
          {showStatusUpdate && existingClaim && (
            <Card className="border-[#c9a25c]/30">
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
                      className="flex-1 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
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
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Download Claim Checklist
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-800"
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Upload Documents
              </Button>
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
        </div>
      </div>
    </div>
  )
}
