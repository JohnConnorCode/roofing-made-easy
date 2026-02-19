'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useContact } from '@/lib/hooks/use-contact'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'
import {
  CheckCircle,
  ClipboardCheck,
  Phone,
  Calendar,
  Download,
  Share2,
  ExternalLink,
  MapPin,
  ArrowRight,
  Home,
  Layers,
  AlertTriangle,
  FileText,
  Image,
  Search,
  MessageSquare,
  Handshake,
  UserPlus,
  LogIn,
  Mail,
  Loader2,
} from 'lucide-react'
import { TrustSignals } from './TrustSignals'
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
  onCreateAccount?: () => void
  accountStatus?: 'created' | 'existed' | 'failed' | null
  isDownloading?: boolean
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

// Helper to render AI explanation with proper formatting
function FormattedExplanation({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean)

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        const lines = trimmed.split('\n')
        const isList = lines.every(
          (line) => /^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line) || line.trim() === ''
        )

        if (isList) {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {lines
                .filter((line) => line.trim())
                .map((line, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a25c] shrink-0" />
                    <span>{line.replace(/^\s*[-*]\s*/, '').replace(/^\s*\d+[.)]\s*/, '')}</span>
                  </li>
                ))}
            </ul>
          )
        }

        const inlineLines = trimmed.split('\n')
        return (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">
            {inlineLines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
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

// Shared CTA block used in two places
function CTABlock({
  onScheduleConsultation,
  handleCallNow,
  phoneNumber,
  calendlyUrl,
}: {
  onScheduleConsultation: () => void
  handleCallNow: () => void
  phoneNumber: string
  calendlyUrl?: string
}) {
  return (
    <div className="space-y-3 print:hidden">
      <Button
        variant="primary"
        size="xl"
        className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0 shadow-lg shadow-[#c9a25c]/20"
        leftIcon={<Calendar className="h-5 w-5" />}
        rightIcon={calendlyUrl ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        onClick={onScheduleConsultation}
      >
        Schedule Free Consultation
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        leftIcon={<Phone className="h-5 w-5" />}
        onClick={handleCallNow}
      >
        Call Us: {phoneNumber}
      </Button>
    </div>
  )
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
  onCreateAccount,
  accountStatus,
  isDownloading = false,
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
  const { phoneDisplay, phoneLink } = useContact()

  const handleCallNow = useCallback(() => {
    window.location.href = phoneLink
  }, [phoneLink])

  const fullAddress = propertyAddress
    ? city && state
      ? `${propertyAddress}, ${city}, ${state}`
      : propertyAddress
    : null

  const jobTypeLabel = jobType?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Roofing Project'
  const materialLabel = roofMaterial?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'

  const displayEstimateNumber = estimateNumber || `EST-${Date.now().toString(36).toUpperCase()}`
  const displayEstimateDate = estimateDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const validityDate = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const hasProjectDetails = roofSizeSqft || roofAgeYears || stories > 1 || hasSkylights || hasChimneys || hasSolarPanels || issues.length > 0 || timelineUrgency || hasInsuranceClaim || photos.length > 0

  const validityDateObj = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((validityDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysUntilExpiry < 0
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 7

  return (
    <div className="space-y-8">
      {/* ================================================================
          SECTION 1: EXPIRATION WARNINGS (conditional)
          ================================================================ */}
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

      {/* ================================================================
          SECTION 2: HEADER - Emotional win + context
          ================================================================ */}
      <div className="text-center pt-2">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#3d7a5a]/15 border-2 border-[#3d7a5a]/40 shadow-[0_0_30px_rgba(61,122,90,0.15)]">
          <CheckCircle className="h-11 w-11 text-[#3d7a5a]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 md:text-4xl tracking-tight">
          {customerName ? `${customerName}, Your Estimate is Ready` : 'Your Estimate is Ready'}
        </h1>
        {fullAddress && (
          <p className="mt-3 text-slate-400 flex items-center justify-center gap-1.5 text-base">
            <MapPin className="h-4 w-4 text-slate-500" />
            {fullAddress}
          </p>
        )}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {displayEstimateNumber}
          </span>
          <span className="h-3 w-px bg-slate-700" />
          <span>{displayEstimateDate}</span>
        </div>
      </div>

      {/* ================================================================
          SECTION 3: PRICE CARD - The hero number
          ================================================================ */}
      <Card className="overflow-hidden border-0 shadow-xl shadow-black/20">
        <CardHeader className="bg-gradient-to-r from-[#c9a25c] to-[#9a7432] text-[#0c0f14] py-3 px-6">
          <CardTitle className="text-center text-sm font-semibold text-[#0c0f14] uppercase tracking-wider">
            Estimated Investment &mdash; {jobTypeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-[#161a23]">
          {/* Hero price */}
          <div className="px-6 pt-8 pb-6">
            <div className="text-center mb-6">
              <p className="text-xs font-medium text-[#c9a25c] uppercase tracking-widest mb-2">Your Estimated Cost</p>
              <p className="text-5xl font-bold text-[#c9a25c] tracking-tight md:text-6xl">
                {formatCurrency(priceLikely)}
              </p>
            </div>

            {/* Range bar */}
            <div className="max-w-sm mx-auto">
              <div className="relative h-2.5 rounded-full bg-gradient-to-r from-[#3d7a5a] via-[#c9a25c] to-red-700/80">
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0f14] bg-[#c9a25c] shadow-[0_0_10px_rgba(201,162,92,0.4)]"
                  style={{
                    left: `${((priceLikely - priceLow) / (priceHigh - priceLow)) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <div className="text-slate-500">
                  <span className="block text-[10px] uppercase tracking-wide">Low</span>
                  <span className="font-medium text-slate-400">{formatCurrency(priceLow)}</span>
                </div>
                <div className="text-slate-500 text-right">
                  <span className="block text-[10px] uppercase tracking-wide">High</span>
                  <span className="font-medium text-slate-400">{formatCurrency(priceHigh)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price factors */}
          {factors && factors.length > 0 && (
            <div className="border-t border-slate-700/50 mx-6 pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price Factors</p>
              <div className="space-y-2">
                {factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{factor.name}</span>
                    <span className={cn(
                      'font-medium tabular-nums',
                      factor.impact > 0 ? 'text-[#c9a25c]' : 'text-[#3d7a5a]'
                    )}>
                      {factor.impact > 0 ? '+' : ''}
                      {formatCurrency(factor.impact)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          <div className="m-4 rounded-lg bg-[#0c0f14]/60 border border-slate-700/50 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Estimate Summary</p>
            {explanation ? (
              <FormattedExplanation text={explanation} />
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed italic">
                This estimate is calculated using current market rates for your area, roof specifications, and
                material costs. A personalized analysis will be provided during your free consultation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          SECTION 4: WHAT'S INCLUDED - Justify the price
          ================================================================ */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-[#3d7a5a]" />
            <h3 className="font-semibold text-slate-100">What&apos;s Included</h3>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {getIncludedItems(jobType).map((item, index) => (
              <div key={index} className="flex items-center gap-2.5 text-sm rounded-md px-3 py-2 bg-[#1a1f2e]/60">
                <CheckCircle className="h-4 w-4 text-[#3d7a5a] shrink-0" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          SECTION 5: PRIMARY CTA - Don't make them scroll further
          ================================================================ */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-slate-400">
            Ready to move forward? Your free consultation confirms exact pricing.
          </p>
        </div>
        <CTABlock
          onScheduleConsultation={onScheduleConsultation}
          handleCallNow={handleCallNow}
          phoneNumber={phoneDisplay}
          calendlyUrl={calendlyUrl}
        />
      </div>

      {/* ================================================================
          SECTION 6: WHAT HAPPENS NEXT - Reduce anxiety, show the path
          ================================================================ */}
      <Card className="border-[#c9a25c]/20 bg-[#161a23]">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-100 text-center mb-6">What Happens Next</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, icon: Search, title: 'Review Estimate', desc: 'Take your time reviewing the details above' },
              { step: 2, icon: Calendar, title: 'Free Consultation', desc: 'We visit your property at no cost' },
              { step: 3, icon: MessageSquare, title: 'Finalize Details', desc: 'Confirm scope, materials & exact price' },
              { step: 4, icon: Handshake, title: 'Project Begins', desc: 'We handle everything from start to finish' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30">
                  <Icon className="h-5 w-5 text-[#c9a25c]" />
                </div>
                <p className="text-xs font-bold text-[#c9a25c] uppercase tracking-wider mb-1">Step {step}</p>
                <p className="text-sm font-semibold text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          SECTION 7: TRUST SIGNALS - Build confidence
          ================================================================ */}
      <TrustSignals />

      {/* ================================================================
          SECTION 8: PROJECT DETAILS - For detail-oriented customers
          ================================================================ */}
      {hasProjectDetails && (
        <Card className="border-slate-700/50 bg-[#161a23]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[#c9a25c]" />
              <h3 className="font-semibold text-slate-100">Your Project Details</h3>
            </div>

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
                  <p className="text-slate-200 font-medium">{stories} Stories</p>
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

            {(hasSkylights || hasChimneys || hasSolarPanels) && (
              <div className="border-t border-slate-700/50 pt-4 mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Roof Features</p>
                <div className="flex flex-wrap gap-2">
                  {hasSkylights && (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Skylights</span>
                  )}
                  {hasChimneys && (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Chimneys</span>
                  )}
                  {hasSolarPanels && (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Solar Panels</span>
                  )}
                </div>
              </div>
            )}

            {issues.length > 0 && (
              <div className="border-t border-slate-700/50 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Issues Identified</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {issues.map((issue) => (
                    <span key={issue} className="px-2.5 py-1 bg-red-900/30 text-red-300 text-xs rounded-md">
                      {formatIssue(issue)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasInsuranceClaim && (
              <div className="border-t border-slate-700/50 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Insurance Claim</p>
                </div>
                <p className="text-slate-200 text-sm">
                  {insuranceCompany || 'Insurance claim in progress'}
                </p>
              </div>
            )}

            {photos.length > 0 && (
              <div className="border-t border-slate-700/50 pt-4">
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

      {/* ================================================================
          SECTION 9: CHECKLIST - Educational, lower priority
          ================================================================ */}
      <Card className="border-slate-700/50 bg-[#161a23]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="h-5 w-5 text-[#c9a25c]" />
            <h3 className="font-semibold text-slate-100">Before You Accept Any Roofing Bid</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Protect yourself and your investment. Use this checklist when comparing estimates.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
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
              <div key={index} className="flex items-start gap-2.5 text-sm rounded-md px-3 py-2 bg-[#1a1f2e]/40">
                <CheckCircle className="h-4 w-4 text-[#3d7a5a] shrink-0 mt-0.5" />
                <span className="text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          SECTION 10: SECOND CTA - For people who scrolled through everything
          ================================================================ */}
      <Card className="border-[#c9a25c]/20 bg-gradient-to-b from-[#161a23] to-[#1a1f2e]">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Ready to Get Started?
          </h3>
          <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
            Your free on-site consultation confirms exact pricing with no obligation. We handle everything from permits to cleanup.
          </p>
          <CTABlock
            onScheduleConsultation={onScheduleConsultation}
            handleCallNow={handleCallNow}
            phoneNumber={phoneDisplay}
            calendlyUrl={calendlyUrl}
          />
        </CardContent>
      </Card>

      {/* ================================================================
          SECTION 10b: ACCOUNT / PORTAL CTA
          ================================================================ */}
      {onCreateAccount && (
        <Card className="border-[#3d7a5a]/30 bg-gradient-to-b from-[#3d7a5a]/10 to-[#161a23] print:hidden">
          <CardContent className="p-6 text-center">
            {accountStatus === 'created' ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3d7a5a]/15 border border-[#3d7a5a]/30">
                  <Mail className="h-6 w-6 text-[#3d7a5a]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Your Project Portal is Ready
                </h3>
                <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
                  We&apos;ve set up your project portal — check your email for access. View your estimate, explore financing options, and track your project anytime.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#3d7a5a] hover:bg-[#4a9068] text-white border-0"
                  leftIcon={<LogIn className="h-5 w-5" />}
                  onClick={onCreateAccount}
                >
                  Access Your Portal
                </Button>
              </>
            ) : accountStatus === 'existed' ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3d7a5a]/15 border border-[#3d7a5a]/30">
                  <LogIn className="h-6 w-6 text-[#3d7a5a]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Welcome Back
                </h3>
                <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
                  Your project portal is already set up. Log in to view all your estimates, explore financing options, and track your project.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#3d7a5a] hover:bg-[#4a9068] text-white border-0"
                  leftIcon={<LogIn className="h-5 w-5" />}
                  onClick={onCreateAccount}
                >
                  Access Your Portal
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3d7a5a]/15 border border-[#3d7a5a]/30">
                  <UserPlus className="h-6 w-6 text-[#3d7a5a]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Save &amp; Track Your Project
                </h3>
                <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
                  Create a free account to access your estimate anytime, explore financing options, and track your project progress.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#3d7a5a] hover:bg-[#4a9068] text-white border-0"
                  leftIcon={<UserPlus className="h-5 w-5" />}
                  onClick={onCreateAccount}
                >
                  Create Free Account
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================
          SECTION 11: UTILITY ACTIONS - PDF, Share
          ================================================================ */}
      <div className="flex gap-3 print:hidden">
        <Button
          variant="ghost"
          size="md"
          className="flex-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          leftIcon={isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          onClick={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? 'Generating PDF...' : 'Save PDF'}
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

      {/* ================================================================
          SECTION 12: DISCLAIMER + FOOTER
          ================================================================ */}
      <div className="rounded-lg bg-[#1a1f2e]/60 border border-slate-700/50 px-5 py-4 text-center text-xs text-slate-500 space-y-1">
        <p>
          This is a preliminary estimate based on the information you provided.
          Final pricing confirmed after free on-site inspection. No obligation.
        </p>
        <p className="text-slate-400 font-medium">
          Valid until {validityDate}
        </p>
      </div>

      <div className="flex items-center justify-center pt-4 pb-2 border-t border-slate-700/50">
        <Logo size="sm" showText={true} linkToHome={false} />
      </div>
    </div>
  )
}
