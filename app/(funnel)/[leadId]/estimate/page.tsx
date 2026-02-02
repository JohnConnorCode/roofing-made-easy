'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import { EstimateDocument } from '@/components/estimate'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

interface EstimateData {
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
}

// Generate demo estimate based on funnel data
function generateDemoEstimate(funnelData: {
  jobType: string | null
  roofSizeSqft: number | null
  roofMaterial: string | null
  stories: number
  hasSkylights: boolean
  hasChimneys: boolean
  hasSolarPanels: boolean
}): EstimateData {
  // Base price per sqft by material
  const basePricePerSqft: Record<string, number> = {
    asphalt_shingle: 4.5,
    metal: 8.0,
    tile: 10.0,
    slate: 15.0,
    wood_shake: 7.0,
    flat_membrane: 6.0,
    unknown: 5.0,
  }

  const roofSize = funnelData.roofSizeSqft || 2000
  const material = funnelData.roofMaterial || 'asphalt_shingle'
  const pricePerSqft = basePricePerSqft[material] || 5.0

  let basePrice = roofSize * pricePerSqft

  // Adjust for job type
  if (funnelData.jobType === 'repair') {
    basePrice = basePrice * 0.15 // Repairs are ~15% of full replacement
  } else if (funnelData.jobType === 'inspection') {
    basePrice = 250 // Flat fee for inspection
  } else if (funnelData.jobType === 'maintenance') {
    basePrice = 400 // Flat fee for maintenance
  }

  const factors: EstimateData['factors'] = []

  // Add story adjustment
  if (funnelData.stories >= 2) {
    const storyAdjust = basePrice * 0.15 * (funnelData.stories - 1)
    factors.push({
      name: `${funnelData.stories}-Story Home`,
      impact: storyAdjust,
      description: 'Additional labor and safety requirements',
    })
    basePrice += storyAdjust
  }

  // Add feature adjustments
  if (funnelData.hasSkylights) {
    factors.push({
      name: 'Skylights',
      impact: 350,
      description: 'Additional flashing and sealing work',
    })
    basePrice += 350
  }

  if (funnelData.hasChimneys) {
    factors.push({
      name: 'Chimney Flashing',
      impact: 450,
      description: 'Chimney flashing replacement',
    })
    basePrice += 450
  }

  if (funnelData.hasSolarPanels) {
    factors.push({
      name: 'Solar Panel Removal/Reinstall',
      impact: 1500,
      description: 'Temporary removal and reinstallation of panels',
    })
    basePrice += 1500
  }

  // Calculate range
  const priceLow = Math.round(basePrice * 0.85)
  const priceLikely = Math.round(basePrice)
  const priceHigh = Math.round(basePrice * 1.25)

  return {
    priceLow,
    priceLikely,
    priceHigh,
    explanation: `Based on your ${roofSize.toLocaleString()} sq ft ${material.replace('_', ' ')} roof, we estimate your ${funnelData.jobType?.replace('_', ' ') || 'roofing project'} will cost between ${formatCurrency(priceLow)} and ${formatCurrency(priceHigh)}, with ${formatCurrency(priceLikely)} being the most likely final cost. This estimate accounts for materials, labor, and the specific features of your property. Final pricing will be confirmed after an on-site inspection.`,
    factors,
  }
}

export default function EstimatePage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const {
    firstName,
    lastName,
    jobType,
    roofSizeSqft,
    roofMaterial,
    stories,
    hasSkylights,
    hasChimneys,
    hasSolarPanels,
    address,
    setEstimate,
    resetFunnel,
  } = useFunnelStore()

  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estimate, setEstimateData] = useState<EstimateData | null>(null)

  // Generate demo estimate from funnel data
  const demoEstimate = useMemo(() => {
    return generateDemoEstimate({
      jobType,
      roofSizeSqft,
      roofMaterial,
      stories,
      hasSkylights,
      hasChimneys,
      hasSolarPanels,
    })
  }, [jobType, roofSizeSqft, roofMaterial, stories, hasSkylights, hasChimneys, hasSolarPanels])

  const handleScheduleConsultation = useCallback(() => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    } else {
      showToast('Call us to schedule your free consultation', 'info')
    }
  }, [showToast])

  const handleDownloadPDF = useCallback(() => {
    window.print()
  }, [])

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

  useEffect(() => {
    async function fetchEstimate() {
      // In demo mode, use generated estimate
      if (isDemoMode) {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setEstimateData(demoEstimate)
        setEstimate(demoEstimate)
        setIsLoading(false)
        return
      }

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
          factors: data.adjustments || [],
        }

        setEstimateData(estimateData)
        setEstimate(estimateData)
      } catch (err) {
        // Fallback to demo estimate on error
        setEstimateData(demoEstimate)
        setEstimate(demoEstimate)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstimate()
  }, [leadId, isDemoMode, demoEstimate, setEstimate])

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-[#c9a25c]" />
        <p className="mt-4 text-lg text-slate-100">{error || 'Something went wrong'}</p>
        <Button
          variant="outline"
          className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
          onClick={() => router.refresh()}
        >
          Try Again
        </Button>
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
      factors={estimate.factors}
      onScheduleConsultation={handleScheduleConsultation}
      onShare={handleShare}
      onDownload={handleDownloadPDF}
      onBack={handleBack}
      onStartNew={handleStartNew}
      calendlyUrl={CALENDLY_URL}
    />
  )
}
