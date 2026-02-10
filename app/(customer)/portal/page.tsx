'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import {
  StatusCard,
  EstimateSummary,
  ProgressTimeline,
  DocumentHub,
  QuoteViewer,
  ProjectUpdates,
  NextStepHero,
  EmptyState,
} from '@/components/customer'
import { computeJourneySteps } from '@/lib/customer/journey'
import {
  DollarSign,
  Shield,
  HandHeart,
  Calendar,
  Phone,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

export default function CustomerPortalPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const {
    customer,
    linkedLeads,
    selectedLeadId,
    financingApplications,
    insuranceClaims,
    programApplications,
    setCustomer,
    setLinkedLeads,
    setSelectedLeadId,
    setFinancingApplications,
    setInsuranceClaims,
    setProgramApplications,
    setLoading,
    isLoading,
  } = useCustomerStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Refetch customer data (used after upload)
  const refetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/customer/profile')
      if (response.ok) {
        const data = await response.json()
        setLinkedLeads(data.linkedLeads || [])
        setFinancingApplications(data.financingApplications || [])
        setInsuranceClaims(data.insuranceClaims || [])
        setProgramApplications(data.programApplications || [])
      }
    } catch {
      // Refetch failed silently
    }
  }, [setLinkedLeads, setFinancingApplications, setInsuranceClaims, setProgramApplications])

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (files: FileList) => {
    if (!selectedLeadId || files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const file of Array.from(files)) {
        try {
          // Get signed URL
          const signedUrlResponse = await fetch(`/api/customer/leads/${selectedLeadId}/uploads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
            }),
          })

          if (!signedUrlResponse.ok) {
            errorCount++
            continue
          }

          const { uploadId, signedUrl, token } = await signedUrlResponse.json()

          // Upload file to storage
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          })

          if (!uploadResponse.ok) {
            errorCount++
            continue
          }

          // Mark upload as complete
          await fetch(`/api/customer/leads/${selectedLeadId}/uploads`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadId,
              fileSize: file.size,
            }),
          })

          successCount++
        } catch {
          errorCount++
        }
      }

      if (successCount > 0) {
        showToast(`${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully`, 'success')
        // Refetch to show new photos
        await refetchData()
      }
      if (errorCount > 0) {
        showToast(`${errorCount} photo${errorCount > 1 ? 's' : ''} failed to upload`, 'error')
      }
    } finally {
      setIsUploading(false)
    }
  }, [selectedLeadId, showToast, refetchData])

  // Fetch customer data on mount (runs once)
  useEffect(() => {
    async function fetchCustomerData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/customer/login')
          return
        }

        // Fetch customer profile and linked data
        const response = await fetch('/api/customer/profile')
        if (!response.ok) {
          // If no customer record exists, redirect to complete registration
          if (response.status === 404) {
            router.push('/customer/register')
            return
          }
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setCustomer(data.customer)
        setLinkedLeads(data.linkedLeads || [])
        setFinancingApplications(data.financingApplications || [])
        setInsuranceClaims(data.insuranceClaims || [])
        setProgramApplications(data.programApplications || [])

        // Set selected lead to primary or first lead (only on initial load)
        if (data.linkedLeads?.length > 0) {
          const currentSelection = useCustomerStore.getState().selectedLeadId
          if (!currentSelection) {
            const primaryLead = data.linkedLeads.find((l: { is_primary: boolean }) => l.is_primary)
            setSelectedLeadId(primaryLead?.lead_id || data.linkedLeads[0].lead_id)
          }
        }
      } catch {
        // Failed to fetch customer data
      } finally {
        setLoading(false)
        setIsInitializing(false)
      }
    }

    fetchCustomerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount; selectedLeadId read from store directly to avoid re-fetch loop
  }, [router, setCustomer, setLinkedLeads, setSelectedLeadId, setFinancingApplications, setInsuranceClaims, setProgramApplications, setLoading])

  // Get current lead data
  const currentLead = linkedLeads.find((l) => l.lead_id === selectedLeadId)
  const estimate = currentLead?.lead?.estimate
  const property = currentLead?.lead?.property
  const intake = currentLead?.lead?.intake

  // Get financing status for current lead
  const currentFinancing = financingApplications.find((f) => f.lead_id === selectedLeadId)
  const financingStatus = currentFinancing
    ? { label: currentFinancing.status.replace('_', ' ').charAt(0).toUpperCase() + currentFinancing.status.replace('_', ' ').slice(1), color: 'text-blue-400' }
    : undefined

  // Get insurance claim for current lead
  const currentClaim = insuranceClaims.find((c) => c.lead_id === selectedLeadId)
  const claimStatus = currentClaim
    ? { label: currentClaim.status.replace('_', ' ').charAt(0).toUpperCase() + currentClaim.status.replace('_', ' ').slice(1), color: 'text-yellow-400' }
    : undefined

  // Get program applications for current lead
  const currentPrograms = programApplications.filter((p) => p.lead_id === selectedLeadId)

  // Check if quote was accepted
  const quoteAccepted = !!(currentLead?.lead as Record<string, unknown>)?.quote_accepted

  // Check for appointment
  const hasAppointment = false // Derived from activities if available

  // Check for storm damage from intake
  const hasStormDamage = !!intake?.has_insurance_claim

  // Build data-driven progress timeline
  const progressSteps = computeJourneySteps({
    hasEstimate: !!estimate,
    estimatePrice: estimate?.price_likely,
    quoteAccepted,
    hasFinancingApp: !!currentFinancing,
    financingStatus: currentFinancing?.status,
    hasInsuranceClaim: !!currentClaim,
    insuranceStatus: currentClaim?.status,
    hasAppointment,
    programCount: currentPrograms.length,
    hasStormDamage,
  })

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Contextual messages for StatusCards
  const financingContext = currentFinancing
    ? currentFinancing.status === 'interested' || currentFinancing.status === 'contacted'
      ? 'Under review. Typically 1-2 business days.'
      : undefined
    : 'Most projects qualify. Check in 2 minutes.'

  const insuranceContext = currentClaim
    ? undefined
    : hasStormDamage
    ? 'We see you have storm damage. Let us help.'
    : undefined

  const insuranceBadge = !currentClaim && hasStormDamage
    ? { label: 'Storm Damage Detected', variant: 'warning' as const }
    : undefined

  const programsContext = property?.state
    ? `Programs available in ${property.state}`
    : 'Find grants for your area'

  if (isInitializing) {
    return (
      <div className="space-y-6">
        {/* Welcome header skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        {/* Hero card skeleton */}
        <Skeleton className="h-24 w-full rounded-xl" />
        {/* Timeline skeleton */}
        <Skeleton className="h-20 w-full rounded-xl" />
        {/* Two-column grid skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        {/* Three-column cards skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome{customer?.first_name ? `, ${customer.first_name}` : ''}!
        </h1>
        <p className="text-slate-400">
          Track your roofing project progress and explore your options.
        </p>
      </div>

      {/* No leads — encouraging empty state */}
      {linkedLeads.length === 0 && (
        <div className="space-y-4">
          <EmptyState
            icon={AlertTriangle}
            title="Get Your Free Estimate"
            description="Start your roofing journey with a quick assessment. In just a few minutes, you'll receive a personalized estimate for your project."
            actionLabel="Get Your Estimate"
            actionHref="/"
            variant="encouraging"
          />
          <p className="text-center text-sm text-slate-500">
            Already have an estimate?{' '}
            <a href="/customer/login" className="text-[#c9a25c] hover:underline">
              Check your email
            </a>{' '}
            for the estimate link to connect it to your account.
          </p>
        </div>
      )}

      {/* Main content - show when leads exist */}
      {linkedLeads.length > 0 && (
        <>
          {/* Property switcher - only show when multiple properties */}
          {linkedLeads.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Property:</span>
              <select
                value={selectedLeadId || ''}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-[#c9a25c] focus:outline-none focus:ring-1 focus:ring-[#c9a25c]"
              >
                {linkedLeads.map((lead) => (
                  <option key={lead.lead_id} value={lead.lead_id}>
                    {lead.nickname || lead.lead?.property?.street_address || 'Property'}{' '}
                    {lead.is_primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Next Step Hero */}
          <NextStepHero
            hasEstimate={!!estimate}
            estimatePrice={estimate?.price_likely}
            quoteAccepted={quoteAccepted}
            hasFinancingApp={!!currentFinancing}
            financingStatus={currentFinancing?.status}
            hasInsuranceClaim={!!currentClaim}
            insuranceStatus={currentClaim?.status}
            hasAppointment={hasAppointment}
            programCount={currentPrograms.length}
            hasStormDamage={hasStormDamage}
            onNavigate={(href) => router.push(href)}
            onScrollTo={scrollToSection}
          />

          {/* Progress tracker */}
          <Card variant="dark" className="border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTimeline steps={progressSteps} orientation="horizontal" />
            </CardContent>
          </Card>

          {/* Estimate summary */}
          {estimate && (
            <EstimateSummary
              estimate={{
                priceLow: estimate.price_low,
                priceLikely: estimate.price_likely,
                priceHigh: estimate.price_high,
                explanation: estimate.ai_explanation || undefined,
                factors: estimate.adjustments as Array<{ name: string; impact: number; description: string }> || [],
              }}
              property={{
                address: property?.street_address || undefined,
                city: property?.city || undefined,
                state: property?.state || undefined,
              }}
            />
          )}

          {/* Quote and Updates Grid */}
          <div id="quote-section" className="grid gap-4 lg:grid-cols-2">
            {/* Quote Viewer */}
            {estimate && selectedLeadId && (
              <QuoteViewer
                leadId={selectedLeadId}
                estimate={{
                  price_low: estimate.price_low,
                  price_likely: estimate.price_likely,
                  price_high: estimate.price_high,
                  created_at: estimate.created_at,
                  valid_until: estimate.valid_until || undefined,
                }}
                customerName={customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}` : undefined}
                jobType={currentLead?.lead?.intake?.job_type || undefined}
              />
            )}

            {/* Project Updates */}
            {selectedLeadId && (
              <ProjectUpdates leadId={selectedLeadId} />
            )}
          </div>

          {/* Document Hub / Photos */}
          {selectedLeadId && (
            <DocumentHub
              photos={currentLead?.lead?.uploads || []}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
              leadId={selectedLeadId}
              onUpload={handlePhotoUpload}
              isUploading={isUploading}
            />
          )}

          {/* Qualification cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatusCard
              title="Financing"
              description={currentFinancing
                ? 'View your pre-qualification status'
                : 'Explore financing options for your project'}
              icon={DollarSign}
              status={financingStatus}
              href="/portal/financing"
              variant={currentFinancing ? 'default' : 'highlight'}
              contextMessage={financingContext}
            />

            <StatusCard
              title="Insurance Claim"
              description={currentClaim
                ? 'Track your insurance claim progress'
                : 'Get help with your insurance claim'}
              icon={Shield}
              status={claimStatus}
              href="/portal/insurance"
              variant={insuranceBadge ? 'warning' : 'default'}
              contextMessage={insuranceContext}
              badge={insuranceBadge}
            />

            <StatusCard
              title="Assistance Programs"
              description={currentPrograms.length > 0
                ? `Tracking ${currentPrograms.length} program${currentPrograms.length > 1 ? 's' : ''}`
                : 'Find programs you may qualify for'}
              icon={HandHeart}
              href="/portal/assistance"
              contextMessage={programsContext}
            />
          </div>

          {/* Next steps CTA */}
          <Card className="border-gold-light/30 bg-gradient-to-r from-gold-light/10 to-transparent">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Ready to Get Started?</h3>
                  <p className="text-slate-400">
                    Schedule a free consultation with our roofing experts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                    leftIcon={<Calendar className="h-5 w-5" />}
                    rightIcon={CALENDLY_URL ? <ExternalLink className="h-4 w-4" /> : undefined}
                    onClick={() => {
                      if (CALENDLY_URL) {
                        window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
                      } else {
                        window.location.href = getPhoneLink()
                      }
                    }}
                  >
                    Schedule Consultation
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    leftIcon={<Phone className="h-5 w-5" />}
                    onClick={() => {
                      window.location.href = getPhoneLink()
                    }}
                  >
                    Call {getPhoneDisplay()}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
