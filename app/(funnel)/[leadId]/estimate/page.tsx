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
  const jobType = funnelData.jobType
  const factors: EstimateData['factors'] = []

  // Fixed-price services (don't scale with roof size)
  if (jobType === 'inspection') {
    return {
      priceLow: 0,
      priceLikely: 0,
      priceHigh: 250,
      explanation: 'Our comprehensive roof inspection includes a detailed assessment of your roof condition, identification of any issues, and a written report with recommendations. Many homeowners qualify for a free inspection.',
      factors: [],
    }
  }

  if (jobType === 'maintenance') {
    return {
      priceLow: 250,
      priceLikely: 400,
      priceHigh: 600,
      explanation: 'Routine maintenance includes gutter cleaning, debris removal, minor sealant repairs, and a condition assessment. Regular maintenance extends your roof life and prevents costly repairs.',
      factors: [],
    }
  }

  // Size-based pricing for replacement/repair
  const roofSize = funnelData.roofSizeSqft || 2000
  const material = funnelData.roofMaterial || 'asphalt_shingle'

  // Base price per sqft by material (for full replacement)
  const basePricePerSqft: Record<string, number> = {
    asphalt_shingle: 4.5,
    metal: 8.5,
    tile: 12.0,
    slate: 18.0,
    wood_shake: 9.0,
    flat_membrane: 7.0,
    unknown: 5.5,
  }

  const pricePerSqft = basePricePerSqft[material] || 5.5
  let basePrice = roofSize * pricePerSqft

  // Repairs are typically $500-$3,000 for common issues
  if (jobType === 'repair') {
    const repairBase = 800
    const repairMax = 2500
    return {
      priceLow: 350,
      priceLikely: repairBase,
      priceHigh: repairMax,
      explanation: 'Repair costs depend on the extent of damage and materials needed. Common repairs like fixing leaks, replacing damaged shingles, or resealing flashing typically fall within this range. We\'ll provide an exact quote after inspection.',
      factors: [],
    }
  }

  // Full replacement - add adjustments
  if (funnelData.stories >= 2) {
    const storyAdjust = Math.round(basePrice * 0.12 * (funnelData.stories - 1))
    factors.push({
      name: `${funnelData.stories}-Story Home`,
      impact: storyAdjust,
      description: 'Additional labor and safety equipment',
    })
    basePrice += storyAdjust
  }

  if (funnelData.hasSkylights) {
    factors.push({
      name: 'Skylights',
      impact: 400,
      description: 'Flashing and sealing around skylights',
    })
    basePrice += 400
  }

  if (funnelData.hasChimneys) {
    factors.push({
      name: 'Chimney Flashing',
      impact: 500,
      description: 'New chimney flashing installation',
    })
    basePrice += 500
  }

  if (funnelData.hasSolarPanels) {
    factors.push({
      name: 'Solar Panel Coordination',
      impact: 1800,
      description: 'Removal and reinstallation by solar provider',
    })
    basePrice += 1800
  }

  // Calculate realistic range (±15%)
  const priceLow = Math.round(basePrice * 0.85)
  const priceLikely = Math.round(basePrice)
  const priceHigh = Math.round(basePrice * 1.15)

  const materialName = material.replace(/_/g, ' ')
  const explanation = `Based on your ${roofSize.toLocaleString()} sq ft ${materialName} roof, a full replacement typically costs ${formatCurrency(priceLow)} to ${formatCurrency(priceHigh)}. This includes tear-off, new underlayment, materials, installation, and cleanup. Final pricing confirmed after on-site inspection.`

  return {
    priceLow,
    priceLikely,
    priceHigh,
    explanation,
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
