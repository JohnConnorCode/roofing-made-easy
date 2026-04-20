'use client'

import { SiteHeader, SiteFooter, MobileCTABar } from '@/components/layout'
import { useStartFunnel } from '@/lib/hooks/use-start-funnel'
import { useSectionTracking } from '@/lib/hooks/use-section-tracking'
import {
  HeroSection,
  EstimatePreview,
  ServicesShowcase,
  FounderStrip,
  FundingWaterfall,
  HowItWorks,
  SocialProof,
  FaqCta,
} from './sections'

export function HomePageContent() {
  const { handleGetStarted, isCreating, error } = useStartFunnel()
  const { trackSectionRef, trackCTAWithAttribution } = useSectionTracking()

  const handleHeroCTA = trackCTAWithAttribution('hero_cta', handleGetStarted)
  const handlePreviewCTA = trackCTAWithAttribution('preview_cta', handleGetStarted)
  const handleHowItWorksCTA = trackCTAWithAttribution('how_it_works_cta', handleGetStarted)
  const handleFinalCTA = trackCTAWithAttribution('final_cta', handleGetStarted)

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <SiteHeader />
      <MobileCTABar />

      <main id="main-content">
        {/* 1. Hero */}
        <div ref={trackSectionRef('hero')}>
          <HeroSection onGetStarted={handleHeroCTA} isCreating={isCreating} error={error} />
        </div>

        {/* 2. Try the tool (interactive proof) */}
        <div ref={trackSectionRef('estimate_preview')}>
          <EstimatePreview onGetStarted={handlePreviewCTA} isCreating={isCreating} />
        </div>

        {/* 3. Services — the actual roofing solutions, with imagery + pricing */}
        <div ref={trackSectionRef('services_showcase')}>
          <ServicesShowcase />
        </div>

        {/* 4. Founder credibility strip */}
        <FounderStrip />

        {/* 5. Ways to pay — insurance, assistance, financing */}
        <div ref={trackSectionRef('funding_waterfall')}>
          <FundingWaterfall />
        </div>

        {/* 5. Guides (pricing breakdowns) */}
        <div ref={trackSectionRef('guides')}>
          <SocialProof />
        </div>

        {/* 6. How it works */}
        <div ref={trackSectionRef('how_it_works')}>
          <HowItWorks onGetStarted={handleHowItWorksCTA} isCreating={isCreating} />
        </div>

        {/* 7. FAQ + Final CTA (merged) */}
        <div ref={trackSectionRef('faq_cta')}>
          <FaqCta onGetStarted={handleFinalCTA} isCreating={isCreating} />
        </div>
      </main>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
