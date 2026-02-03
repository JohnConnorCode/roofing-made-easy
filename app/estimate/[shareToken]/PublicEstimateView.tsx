'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/utils'
import { EstimateDocument } from '@/components/estimate'
import type { JobType, RoofMaterial } from '@/lib/supabase/types'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

interface PublicEstimateViewProps {
  leadId: string
  shareToken: string
  customerName?: string
  propertyAddress?: string
  city?: string
  state?: string
  jobType?: string | null
  roofMaterial?: string | null
  roofSizeSqft?: number | null
  priceLow: number
  priceLikely: number
  priceHigh: number
  explanation?: string
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
  validUntil?: string
}

export function PublicEstimateView({
  leadId,
  shareToken,
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
  validUntil,
}: PublicEstimateViewProps) {
  const { showToast } = useToast()

  const handleScheduleConsultation = useCallback(() => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    } else {
      showToast('Call us at (662) 555-0123 to schedule your free consultation', 'info')
    }
  }, [showToast])

  const handleDownloadPDF = useCallback(async () => {
    try {
      // Download PDF from API
      const response = await fetch(`/api/estimate/${shareToken}/pdf`)

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
  }, [shareToken, showToast])

  const handleShare = useCallback(async () => {
    const shareUrl = `${BASE_URL}/estimate/${shareToken}`
    const shareData = {
      title: 'My Roofing Estimate',
      text: `I got a roofing estimate: ${formatCurrency(priceLikely)}`,
      url: shareUrl,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied to clipboard', 'success')
      } catch {
        showToast('Unable to copy link', 'error')
      }
    }
  }, [shareToken, priceLikely, showToast])

  const handleStartNew = useCallback(() => {
    window.location.href = '/'
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      {/* Simple header for public view */}
      <header className="border-b border-slate-800 bg-[#0c0f14]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">
            <span className="text-[#c9a25c]">Farrell</span> Roofing
          </a>
          <a
            href="tel:6625550123"
            className="text-sm text-slate-400 hover:text-[#c9a25c] transition-colors"
          >
            (662) 555-0123
          </a>
        </div>
      </header>

      {/* Estimate content */}
      <main className="pb-16">
        <EstimateDocument
          customerName={customerName}
          propertyAddress={propertyAddress}
          city={city}
          state={state}
          jobType={jobType as JobType | null}
          roofMaterial={roofMaterial as RoofMaterial | null}
          roofSizeSqft={roofSizeSqft ?? null}
          priceLow={priceLow}
          priceLikely={priceLikely}
          priceHigh={priceHigh}
          explanation={explanation}
          factors={factors}
          validUntil={validUntil}
          onScheduleConsultation={handleScheduleConsultation}
          onShare={handleShare}
          onDownload={handleDownloadPDF}
          onStartNew={handleStartNew}
          calendlyUrl={CALENDLY_URL}
          isPublicView
        />
      </main>

      {/* Simple footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Farrell Roofing LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
