'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { getPhoneDisplay, getPhoneLink } from '@/lib/config/business'
import { COMPANY_INFO } from '@/lib/data/estimate-content'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'
import {
  CheckCircle,
  ClipboardCheck,
  Phone,
  Calendar,
  Download,
  Share2,
  ExternalLink,
  Shield,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Home,
  Layers,
  AlertTriangle,
  FileText,
  Image,
} from 'lucide-react'
import type { RoofPitch, TimelineUrgency } from '@/lib/supabase/types'

function getIncludedItems(jobType: JobType | null): string[] {
  switch (jobType) {
    case 'inspection':
      return [
        'Complete roof assessment',
        'Damage identification',
        'Photo documentation',
        'Written condition report',
        'Repair recommendations',
        'No obligation quote',
      ]
    case 'maintenance':
      return [
        'Debris & leaf removal',
        'Gutter cleaning',
        'Minor sealant repairs',
        'Flashing inspection',
        'Condition assessment',
        'Maintenance report',
      ]
    case 'repair':
      return [
        'Damage assessment',
        'Material matching',
        'Professional repair work',
        'Weatherproof sealing',
        'Site cleanup',
        'Workmanship warranty',
      ]
    case 'gutter':
      return [
        'Old gutter removal',
        'Fascia inspection',
        'Seamless gutter install',
        'Downspout routing',
        'Leak testing',
        'Cleanup & disposal',
      ]
    default:
      // Full replacement
      return [
        'Complete tear-off & disposal',
        'Deck inspection & repair',
        'Premium underlayment',
        'Quality roofing materials',
        'Professional installation',
        'Full cleanup & inspection',
        '10-year workmanship warranty',
        'Manufacturer warranty',
      ]
  }
}

export interface EstimateDocumentProps {
  customerName?: string
  propertyAddress?: string
  city?: string
  state?: string
  jobType: JobType | null
  roofMaterial: RoofMaterial | null
  roofSizeSqft: number | null
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  aiExplanationStatus?: 'success' | 'fallback' | 'failed'
  factors?: Array<{
    name: string
    impact: number
    description: string
  }>
  validUntil?: string
  onScheduleConsultation: () => void
  onShare?: () => void
  onDownload?: () => void
  onBack?: () => void
  onStartNew?: () => void
  calendlyUrl?: string
  isPublicView?: boolean
  // Project details
  roofAgeYears?: number | null
  roofPitch?: RoofPitch | null
  stories?: number
  hasSkylights?: boolean
  hasChimneys?: boolean
  hasSolarPanels?: boolean
  issues?: string[]
  timelineUrgency?: TimelineUrgency | null
  hasInsuranceClaim?: boolean
  insuranceCompany?: string
  photos?: Array<{ previewUrl: string }>
  estimateNumber?: string
  estimateDate?: string
}

// Helper to format issue names
function formatIssue(issue: string): string {
  return issue
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper to format timeline urgency
function formatTimeline(urgency: TimelineUrgency | null): string {
  if (!urgency) return 'Not specified'
  const labels: Record<TimelineUrgency, string> = {
    emergency: 'Emergency (24-48hrs)',
    asap: 'ASAP (1 week)',
    within_month: 'Within a Month',
    within_3_months: 'Within 3 Months',
    flexible: 'Flexible',
    just_exploring: 'Just Exploring',
  }
  return labels[urgency] || urgency
}

// Helper to format roof pitch
function formatPitch(pitch: RoofPitch | null): string {
  if (!pitch) return 'Not specified'
  const labels: Record<RoofPitch, string> = {
    flat: 'Flat (0-2/12)',
    low: 'Low (3-4/12)',
    medium: 'Medium (5-7/12)',
    steep: 'Steep (8-10/12)',
    very_steep: 'Very Steep (11+/12)',
    unknown: 'Unknown',
  }
  return labels[pitch] || pitch
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
  aiExplanationStatus,
  factors,
  validUntil,
  onScheduleConsultation,
  onShare,
  onDownload,
  onBack,
  onStartNew,
  calendlyUrl,
  isPublicView,
  // Project details
  roofAgeYears,
  roofPitch,
  stories = 1,
  hasSkylights = false,
  hasChimneys = false,
  hasSolarPanels = false,
  issues = [],
  timelineUrgency,
  hasInsuranceClaim = false,
  insuranceCompany,
  photos = [],
  estimateNumber,
  estimateDate,
}: EstimateDocumentProps) {
  const phoneNumber = getPhoneDisplay()

  const handleCallNow = useCallback(() => {
    window.location.href = getPhoneLink()
  }, [])

  const fullAddress = propertyAddress
    ? city && state
      ? `${propertyAddress}, ${city}, ${state}`
      : propertyAddress
    : null

  const jobTypeLabel = jobType?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Roofing Project'
  const materialLabel = roofMaterial?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'

  // Generate estimate number if not provided
  const displayEstimateNumber = estimateNumber || `EST-${Date.now().toString(36).toUpperCase()}`
  const displayEstimateDate = estimateDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Calculate validity (30 days from now)
  const validityDate = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Check if we have any project details to show
  const hasProjectDetails = roofSizeSqft || roofAgeYears || stories > 1 || hasSkylights || hasChimneys || hasSolarPanels || issues.length > 0 || timelineUrgency || hasInsuranceClaim || photos.length > 0

  // Check estimate expiration status
  const validityDateObj = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((validityDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysUntilExpiry < 0
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 7

  return (
    <div className="space-y-6">
      {/* Expiration warnings */}
      {isExpired && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-center">
          <p className="text-sm font-medium text-red-400">
            This estimate expired on {validityDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Contact us for updated pricing.
          </p>
        </div>
      )}
      {isExpiringSoon && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-center">
          <p className="text-sm font-medium text-amber-400">
            This estimate expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}. Schedule your consultation soon to lock in this pricing.
          </p>
        </div>
      )}

      {/* Estimate Header with number and date */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{displayEstimateNumber}</span>
        </div>
        <div>{displayEstimateDate}</div>
      </div>

      {/* Header with success message */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1f2e] border border-[#3d7a5a]">
          <CheckCircle className="h-10 w-10 text-[#3d7a5a]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
          {customerName ? `${customerName}, Your Estimate is Ready!` : 'Your Estimate is Ready!'}
        </h1>
        {fullAddress && (
          <p className="mt-2 text-slate-400 flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            {fullAddress}
          </p>
        )}
      </div>

      {/* Main price card */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#c9a25c] to-[#9a7432] text-[#0c0f14] py-4">
          <CardTitle className="text-center text-lg text-[#0c0f14]">
            Estimated Investment for {jobTypeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-[#161a23]">
          {/* Price display */}
          <div className="flex items-end justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">Low</p>
              <p className="text-xl font-semibold text-slate-300">
                {formatCurrency(priceLow)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#c9a25c]">Most Likely</p>
              <p className="text-4xl font-bold text-[#c9a25c]">
                {formatCurrency(priceLikely)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">High</p>
              <p className="text-xl font-semibold text-slate-300">
                {formatCurrency(priceHigh)}
              </p>
            </div>
          </div>

          {/* Visual range bar */}
          <div className="mb-6">
            <div className="relative h-3 rounded-full bg-gradient-to-r from-[#3d7a5a] via-[#c9a25c] to-red-700">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0f14] bg-[#c9a25c] shadow-lg"
                style={{
                  left: `${((priceLikely - priceLow) / (priceHigh - priceLow)) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{formatCurrency(priceLow)}</span>
              <span>{formatCurrency(priceHigh)}</span>
            </div>
          </div>

          {/* Price factors */}
          {factors && factors.length > 0 && (
            <div className="border-t border-slate-700 pt-4 mb-4">
              <p className="text-sm font-medium text-slate-400 mb-3">What affects your price:</p>
              <div className="space-y-2">
                {factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{factor.name}</span>
                    <span className={factor.impact > 0 ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'}>
                      {factor.impact > 0 ? '+' : ''}
                      {formatCurrency(factor.impact)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4">
            {explanation ? (
              <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed italic">
                This estimate is calculated using current market rates for your area, roof specifications, and
                material costs. A personalized analysis will be provided during your free consultation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What's included - job-type specific */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-100 mb-4">What&apos;s Included</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {getIncludedItems(jobType).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-[#3d7a5a] shrink-0" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roofing Estimate Checklist */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-5 w-5 text-[#c9a25c]" />
            <h3 className="font-semibold text-slate-100">Before You Accept Any Roofing Bid</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Protect yourself and your investment. Use this checklist when comparing estimates.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Verify the contractor is licensed and insured in your state',
              'Ask for proof of workers\' compensation insurance',
              'Get at least 3 written estimates for comparison',
              'Check online reviews and ask for local references',
              'Confirm the exact materials and brands to be used',
              'Ensure the contract includes a start and completion date',
              'Ask about the warranty \u2014 workmanship AND manufacturer',
              'Understand the payment schedule (never pay 100% upfront)',
              'Ask if they pull the necessary building permits',
              'Check for a lien waiver clause protecting your property',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-[#3d7a5a] shrink-0 mt-0.5" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Summary - Show collected data */}
      {hasProjectDetails && (
        <Card className="border-slate-700/50 bg-[#161a23]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[#c9a25c]" />
              <h3 className="font-semibold text-slate-100">Your Project Details</h3>
            </div>

            {/* Property Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {roofSizeSqft && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Roof Size</p>
                  <p className="text-slate-200 font-medium">{roofSizeSqft.toLocaleString()} sq ft</p>
                </div>
              )}
              {roofMaterial && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Material</p>
                  <p className="text-slate-200 font-medium">{materialLabel}</p>
                </div>
              )}
              {roofAgeYears !== null && roofAgeYears !== undefined && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Roof Age</p>
                  <p className="text-slate-200 font-medium">{roofAgeYears} years</p>
                </div>
              )}
              {stories > 1 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Stories</p>
                  <p className="text-slate-200 font-medium">{stories} {stories === 1 ? 'Story' : 'Stories'}</p>
                </div>
              )}
              {roofPitch && roofPitch !== 'unknown' && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Roof Pitch</p>
                  <p className="text-slate-200 font-medium">{formatPitch(roofPitch)}</p>
                </div>
              )}
              {timelineUrgency && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Timeline</p>
                  <p className="text-slate-200 font-medium">{formatTimeline(timelineUrgency)}</p>
                </div>
              )}
            </div>

            {/* Roof Features */}
            {(hasSkylights || hasChimneys || hasSolarPanels) && (
              <div className="border-t border-slate-700 pt-4 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Roof Features</p>
                <div className="flex flex-wrap gap-2">
                  {hasSkylights && (
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      Skylights
                    </span>
                  )}
                  {hasChimneys && (
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      Chimneys
                    </span>
                  )}
                  {hasSolarPanels && (
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      Solar Panels
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Issues Identified */}
            {issues.length > 0 && (
              <div className="border-t border-slate-700 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Issues Identified</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {issues.map((issue) => (
                    <span key={issue} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded">
                      {formatIssue(issue)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance Claim */}
            {hasInsuranceClaim && (
              <div className="border-t border-slate-700 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Insurance Claim</p>
                </div>
                <p className="text-slate-200 text-sm">
                  {insuranceCompany ? `${insuranceCompany}` : 'Insurance claim in progress'}
                </p>
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4 text-[#c9a25c]" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} Uploaded
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {photos.slice(0, 6).map((photo, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded bg-slate-800">
                      <img
                        src={photo.previewUrl}
                        alt={`Roof photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {photos.length > 6 && (
                  <p className="text-xs text-slate-500 mt-1">+{photos.length - 6} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trust signals - compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50 text-center">
          <Shield className="h-6 w-6 text-[#3d7a5a] mb-2" />
          <p className="text-sm font-medium text-slate-100">Licensed & Insured</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50 text-center">
          <Clock className="h-6 w-6 text-[#3d7a5a] mb-2" />
          <p className="text-sm font-medium text-slate-100">Since {COMPANY_INFO.foundedYear}</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50 text-center">
          <Star className="h-6 w-6 text-[#3d7a5a] mb-2" />
          <p className="text-sm font-medium text-slate-100">Local Experts</p>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="space-y-3 print:hidden">
        <Button
          variant="primary"
          size="xl"
          className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 shadow-lg"
          leftIcon={<Calendar className="h-5 w-5" />}
          rightIcon={calendlyUrl ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          onClick={onScheduleConsultation}
        >
          Schedule Free Consultation
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100"
          leftIcon={<Phone className="h-5 w-5" />}
          onClick={handleCallNow}
        >
          Call Us: {phoneNumber}
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3 print:hidden">
        <Button
          variant="ghost"
          size="md"
          className="flex-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={<Download className="h-5 w-5" />}
          onClick={onDownload}
        >
          Save PDF
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="flex-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={<Share2 className="h-5 w-5" />}
          onClick={onShare}
        >
          Share
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-[#1a1f2e] border border-slate-700 p-4 text-center text-xs text-slate-500">
        <p>
          This is a preliminary estimate based on the information you provided.
          Final pricing confirmed after free on-site inspection.
          No obligation - just honest pricing.
        </p>
        <p className="mt-2 text-slate-400">
          Estimate valid until {validityDate}
        </p>
      </div>

      {/* Footer with logo */}
      <div className="flex items-center justify-center pt-4 border-t border-slate-700/50">
        <Logo size="sm" showText={true} linkToHome={false} />
      </div>
    </div>
  )
}
