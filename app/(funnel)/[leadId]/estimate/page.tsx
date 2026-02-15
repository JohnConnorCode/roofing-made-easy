'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import { EstimateDocument } from '@/components/estimate'
import { Loader2, AlertTriangle, Phone, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

interface EstimateData {
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  aiExplanationStatus?: 'success' | 'fallback' | 'failed'
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
}

export default function EstimatePage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.leadId as string

  const {
    firstName,
    lastName,
    jobType,
    roofSizeSqft,
    roofMaterial,
    roofAgeYears,
    roofPitch,
    stories,
    hasSkylights,
    hasChimneys,
    hasSolarPanels,
    issues,
    timelineUrgency,
    hasInsuranceClaim,
    insuranceCompany,
    photos,
    address,
    setEstimate,
    resetFunnel,
  } = useFunnelStore()

  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estimate, setEstimateData] = useState<EstimateData | null>(null)

  const handleScheduleConsultation = useCallback(() => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    } else {
      showToast('Call us to schedule your free consultation', 'info')
    }
  }, [showToast])

  const handleDownloadPDF = useCallback(async () => {
    try {
      // Download PDF from API
      const response = await fetch(`/api/leads/${leadId}/estimate/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the blob and create a download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'estimate.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('PDF downloaded successfully', 'success')
    } catch {
      // Fallback to print if PDF generation fails
      showToast('Opening print dialog instead...', 'info')
      window.print()
    }
  }, [leadId, showToast])

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: 'My Roofing Estimate',
      text: estimate
        ? `I got a roofing estimate: ${formatCurrency(estimate.priceLikely)}`
        : 'Check out my roofing estimate',
      url: shareUrl,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled share or share failed - silent handling
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied to clipboard', 'success')
      } catch (err) {
        showToast('Unable to copy link', 'error')
      }
    }
  }, [estimate, showToast])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleStartNew = useCallback(() => {
    resetFunnel()
    window.location.href = '/'
  }, [resetFunnel])

  const handleCreateAccount = useCallback(() => {
    router.push(`/customer/register?leadId=${leadId}&source=estimate`)
  }, [router, leadId])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function fetchEstimate() {
      try {
        const response = await fetch(`/api/leads/${leadId}/estimate`)
        if (!response.ok) {
          throw new Error('Failed to fetch estimate')
        }
        const data = await response.json()

        const estimateData: EstimateData = {
          priceLow: data.price_low,
          priceLikely: data.price_likely,
          priceHigh: data.price_high,
          explanation: data.ai_explanation,
          aiExplanationStatus: data.ai_explanation_status,
          factors: data.adjustments || [],
        }

        setEstimateData(estimateData)
        setEstimate(estimateData)
      } catch {
        setError('We\'re having trouble loading your estimate. Your information has been saved \u2014 please try refreshing, or call us for immediate help.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstimate()
  }, [leadId, setEstimate])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#c9a25c]" />
        <p className="mt-4 text-lg text-slate-200">Preparing your estimate...</p>
        <p className="text-sm text-slate-500">This usually takes a few seconds</p>
      </div>
    )
  }

  if (error || !estimate) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertTriangle className="h-12 w-12 text-[#c9a25c]" />
        <p className="mt-4 text-lg text-slate-100 text-center max-w-md">
          {error || 'Something went wrong'}
        </p>
        <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            leftIcon={<Phone className="h-4 w-4" />}
            onClick={() => { window.location.href = getPhoneLink() }}
          >
            Call Us: {getPhoneDisplay()}
          </Button>
        </div>
      </div>
    )
  }

  // Build customer name
  const customerName = firstName
    ? lastName
      ? `${firstName} ${lastName}`
      : firstName
    : undefined

  return (
    <EstimateDocument
      customerName={customerName}
      propertyAddress={address?.streetAddress}
      city={address?.city}
      state={address?.state}
      jobType={jobType}
      roofMaterial={roofMaterial}
      roofSizeSqft={roofSizeSqft}
      priceLow={estimate.priceLow}
      priceLikely={estimate.priceLikely}
      priceHigh={estimate.priceHigh}
      explanation={estimate.explanation}
      aiExplanationStatus={estimate.aiExplanationStatus}
      factors={estimate.factors}
      onScheduleConsultation={handleScheduleConsultation}
      onShare={handleShare}
      onDownload={handleDownloadPDF}
      onBack={handleBack}
      onStartNew={handleStartNew}
      onCreateAccount={handleCreateAccount}
      calendlyUrl={CALENDLY_URL}
      // Project details
      roofAgeYears={roofAgeYears}
      roofPitch={roofPitch}
      stories={stories}
      hasSkylights={hasSkylights}
      hasChimneys={hasChimneys}
      hasSolarPanels={hasSolarPanels}
      issues={issues}
      timelineUrgency={timelineUrgency}
      hasInsuranceClaim={hasInsuranceClaim}
      insuranceCompany={insuranceCompany}
      photos={photos}
    />
  )
}
