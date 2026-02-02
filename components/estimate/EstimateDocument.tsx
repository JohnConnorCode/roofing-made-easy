'use client'

import { useMemo, useCallback } from 'react'
import { CoverSection } from './CoverSection'
import { ScopeOfWork } from './ScopeOfWork'
import { MaterialsList } from './MaterialsList'
import { PricingTiers } from './PricingTiers'
import { WarrantySection } from './WarrantySection'
import { TrustSignals } from './TrustSignals'
import { NextSteps } from './NextSteps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculatePricingTiers } from '@/lib/estimation/pricing-tiers'
import { TERMS_AND_CONDITIONS, COMPANY_INFO } from '@/lib/data/estimate-content'
import { formatCurrency } from '@/lib/utils'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'
import type { TierLevel } from '@/lib/estimation/pricing-tiers'
import { Info, Download, Share2, Printer, ArrowLeft, RefreshCw } from 'lucide-react'

export interface EstimateDocumentProps {
  // Customer info
  customerName?: string

  // Property info
  propertyAddress?: string
  city?: string
  state?: string

  // Roof info
  jobType: JobType | null
  roofMaterial: RoofMaterial | null
  roofSizeSqft: number | null

  // Estimate pricing
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  factors?: Array<{
    name: string
    impact: number
    description: string
  }>

  // Callbacks
  onScheduleConsultation: () => void
  onShare?: () => void
  onDownload?: () => void
  onBack?: () => void
  onStartNew?: () => void

  // Config
  calendlyUrl?: string
}

export function EstimateDocument({
  customerName,
  propertyAddress,
  city,
  state,
  jobType,
  roofMaterial,
  roofSizeSqft,
  priceLow,
  priceLikely,
  priceHigh,
  explanation,
  factors,
  onScheduleConsultation,
  onShare,
  onDownload,
  onBack,
  onStartNew,
  calendlyUrl,
}: EstimateDocumentProps) {
  const phoneNumber = getPhoneDisplay()

  // Calculate pricing tiers from base estimate
  const { tiers } = useMemo(() => {
    return calculatePricingTiers(
      { priceLow, priceLikely, priceHigh },
      roofMaterial,
      'better' // Recommend the middle tier
    )
  }, [priceLow, priceLikely, priceHigh, roofMaterial])

  const handleCallNow = useCallback(() => {
    window.location.href = getPhoneLink()
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleTierSelect = useCallback((tier: TierLevel) => {
    // Could store selected tier for later use
    console.log('Selected tier:', tier)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action bar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={onDownload}
            >
              PDF
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              leftIcon={<Share2 className="h-4 w-4" />}
              onClick={onShare}
            >
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Section 1: Cover */}
      <CoverSection
        customerName={customerName}
        propertyAddress={propertyAddress}
        city={city}
        state={state}
      />

      {/* Section 1.5: Executive Summary - Quick overview */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
              1
            </span>
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Overview */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Project Overview
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Job Type:</span>
                  <span className="text-slate-100 font-medium">
                    {jobType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Roofing Project'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Material:</span>
                  <span className="text-slate-100 font-medium">
                    {roofMaterial?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'To Be Determined'}
                  </span>
                </div>
                {roofSizeSqft && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Size:</span>
                    <span className="text-slate-100 font-medium">
                      {roofSizeSqft.toLocaleString()} sq ft
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Investment Range */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                Investment Range
              </h4>
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#c9a25c]/10 to-transparent border border-[#c9a25c]/30">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#c9a25c]">
                    {formatCurrency(priceLikely)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Range: {formatCurrency(priceLow)} - {formatCurrency(priceHigh)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Explanation */}
          {explanation && (
            <div className="mt-6 p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#c9a25c] shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
              </div>
            </div>
          )}

          {/* Price factors */}
          {factors && factors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Price Factors</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {factors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-[#0c0f14]/50 text-sm"
                  >
                    <span className="text-slate-400">{factor.name}</span>
                    <span className={factor.impact > 0 ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}>
                      {factor.impact > 0 ? '+' : ''}{formatCurrency(factor.impact)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Scope of Work */}
      <ScopeOfWork jobType={jobType} />

      {/* Section 3: Materials */}
      <MaterialsList roofMaterial={roofMaterial} />

      {/* Section 4: Pricing Tiers */}
      <PricingTiers tiers={tiers} onSelectTier={handleTierSelect} />

      {/* Section 5: Warranty */}
      <WarrantySection />

      {/* Section 6: Trust Signals */}
      <TrustSignals />

      {/* Section 7: Next Steps & CTAs */}
      <NextSteps
        onScheduleConsultation={onScheduleConsultation}
        onCallNow={handleCallNow}
        phoneNumber={phoneNumber}
        calendlyUrl={calendlyUrl}
      />

      {/* Terms and Conditions */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-lg text-slate-100">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {TERMS_AND_CONDITIONS.map((term, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-slate-600">{index + 1}.</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4 text-center text-xs text-slate-500">
        <p>
          This preliminary estimate is for informational purposes only and does not constitute
          a binding quote or contract. Final pricing will be determined after an on-site
          inspection by a licensed contractor. Actual costs may vary based on factors not
          visible in photos or disclosed during intake. This estimate is provided by{' '}
          {COMPANY_INFO.legalName}.
        </p>
      </div>

      {/* Footer navigation (hidden on print) */}
      <div className="flex justify-between pt-4 border-t border-slate-700 print:hidden">
        <Button
          variant="ghost"
          size="md"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="md"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={onStartNew}
        >
          Start New Estimate
        </Button>
      </div>
    </div>
  )
}
