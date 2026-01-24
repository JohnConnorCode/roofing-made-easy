'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useFunnelStore } from '@/stores/funnelStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  Phone,
  Calendar,
  Download,
  Share2,
  Loader2,
  AlertTriangle,
  Info,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || '(555) 000-0000'
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
    jobType,
    roofSizeSqft,
    roofMaterial,
    stories,
    hasSkylights,
    hasChimneys,
    hasSolarPanels,
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
        <p className="mt-4 text-lg text-slate-200">Calculating your estimate...</p>
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

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1f2e] border border-[#3d7a5a]">
          <CheckCircle className="h-10 w-10 text-[#3d7a5a]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
          {firstName ? `Thanks, ${firstName}!` : 'Your Estimate is Ready!'}
        </h1>
        <p className="mt-2 text-slate-400">
          Here&apos;s your personalized roofing estimate
        </p>
      </div>

      {/* Price range card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#c9a25c] to-[#9a7432] text-[#0c0f14]">
          <CardTitle className="text-center text-lg text-[#0c0f14]">Estimated Cost Range</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-[#161a23]">
          <div className="flex items-end justify-center gap-8">
            {/* Low */}
            <div className="text-center">
              <p className="text-sm text-slate-500">Low</p>
              <p className="text-xl font-semibold text-slate-300">
                {formatCurrency(estimate.priceLow)}
              </p>
            </div>

            {/* Likely */}
            <div className="text-center">
              <p className="text-sm font-medium text-[#c9a25c]">Most Likely</p>
              <p className="text-4xl font-bold text-[#c9a25c]">
                {formatCurrency(estimate.priceLikely)}
              </p>
            </div>

            {/* High */}
            <div className="text-center">
              <p className="text-sm text-slate-500">High</p>
              <p className="text-xl font-semibold text-slate-300">
                {formatCurrency(estimate.priceHigh)}
              </p>
            </div>
          </div>

          {/* Visual range bar */}
          <div className="mt-6">
            <div className="relative h-3 rounded-full bg-gradient-to-r from-[#3d7a5a] via-[#c9a25c] to-red-700">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0f14] bg-[#c9a25c] shadow-lg"
                style={{
                  left: `${((estimate.priceLikely - estimate.priceLow) /
                    (estimate.priceHigh - estimate.priceLow)) *
                    100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{formatCurrency(estimate.priceLow)}</span>
              <span>{formatCurrency(estimate.priceHigh)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factors breakdown */}
      {estimate.factors.length > 0 && (
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">Price Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estimate.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-100">{factor.name}</p>
                    <p className="text-sm text-slate-500">{factor.description}</p>
                  </div>
                  <span
                    className={cn(
                      'font-semibold',
                      factor.impact > 0 ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'
                    )}
                  >
                    {factor.impact > 0 ? '+' : ''}
                    {formatCurrency(factor.impact)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI explanation */}
      {estimate.explanation && (
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
              <Info className="h-5 w-5 text-[#c9a25c]" />
              Estimate Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">{estimate.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* CTA buttons */}
      <div className="space-y-3 print:hidden">
        <Button
          variant="primary"
          size="xl"
          className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 glow-gold"
          leftIcon={<Calendar className="h-5 w-5" />}
          rightIcon={CALENDLY_URL ? <ExternalLink className="h-4 w-4" /> : undefined}
          onClick={handleScheduleConsultation}
        >
          Schedule Free Consultation
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
          leftIcon={<Phone className="h-5 w-5" />}
          onClick={() => {
            window.location.href = `tel:${PHONE_NUMBER.replace(/\D/g, '')}`
          }}
        >
          Call Us Now: {PHONE_NUMBER}
        </Button>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            className="flex-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            leftIcon={<Download className="h-5 w-5" />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="flex-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            leftIcon={<Share2 className="h-5 w-5" />}
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4 text-center text-xs text-slate-500">
        <p>
          This estimate is for informational purposes only and does not constitute
          a binding quote or contract. Final pricing will be determined after an
          on-site inspection by a licensed contractor. Actual costs may vary based
          on factors not visible in photos or disclosed during intake.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-700">
        <Button
          variant="ghost"
          size="md"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="md"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => {
            resetFunnel()
            window.location.href = '/'
          }}
        >
          Start New Estimate
        </Button>
      </div>
    </div>
  )
}
