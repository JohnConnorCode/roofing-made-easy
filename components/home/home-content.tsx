'use client'

import { SiteHeader, SiteFooter, MobileCTABar } from '@/components/layout'
import { useStartFunnel } from '@/lib/hooks/use-start-funnel'
import { useSectionTracking } from '@/lib/hooks/use-section-tracking'
import {
  HeroSection,
  TrustBar,
  EstimatePreview,
  FundingWaterfall,
  HowItWorks,
  SocialProof,
  WhyHomeowners,
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

        {/* 2. Honest trust strip */}
        <div ref={trackSectionRef('trust_bar')}>
          <TrustBar />
        </div>

        {/* 3. Try the tool (interactive proof) */}
        <div ref={trackSectionRef('estimate_preview')}>
          <EstimatePreview onGetStarted={handlePreviewCTA} isCreating={isCreating} />
        </div>

        {/* 4. Recent work — photo proof of real jobs */}
        <div ref={trackSectionRef('recent_work')}>
          <SocialProof />
        </div>

        {/* 5. Why homeowners pick us (bento) */}
        <div ref={trackSectionRef('why_homeowners')}>
          <WhyHomeowners />
        </div>

        {/* 6. How it works */}
        <div ref={trackSectionRef('how_it_works')}>
          <HowItWorks onGetStarted={handleHowItWorksCTA} isCreating={isCreating} />
        </div>

        {/* 7. Ways to pay */}
        <div ref={trackSectionRef('funding_waterfall')}>
          <FundingWaterfall />
        </div>

        {/* 8. FAQ + Final CTA (merged) */}
        <div ref={trackSectionRef('faq_cta')}>
          <FaqCta onGetStarted={handleFinalCTA} isCreating={isCreating} />
        </div>
      </main>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
