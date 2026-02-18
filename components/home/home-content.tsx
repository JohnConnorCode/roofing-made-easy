'use client'

import { SiteHeader, SiteFooter, MobileCTABar } from '@/components/layout'
import { useStartFunnel } from '@/lib/hooks/use-start-funnel'
import { useSectionTracking } from '@/lib/hooks/use-section-tracking'
import {
  HeroSection,
  TrustBar,
  EstimatePreview,
  ProblemSolution,
  FundingWaterfall,
  HowItWorks,
  SocialProof,
  ServicesGrid,
  FAQSection,
  FinalCTA,
} from './sections'

export function HomePageContent() {
  const { handleGetStarted, isCreating, error } = useStartFunnel()
  const { trackSectionRef, trackCTAWithAttribution } = useSectionTracking()

  const handleHeroCTA = trackCTAWithAttribution('hero_cta', handleGetStarted)
  const handlePreviewCTA = trackCTAWithAttribution('preview_cta', handleGetStarted)
  const handleHowItWorksCTA = trackCTAWithAttribution('how_it_works_cta', handleGetStarted)
  const handleFinalCTA = trackCTAWithAttribution('final_cta', handleGetStarted)

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />
      <MobileCTABar />

      <div ref={trackSectionRef('hero')}>
        <HeroSection onGetStarted={handleHeroCTA} isCreating={isCreating} error={error} />
      </div>
      <div ref={trackSectionRef('trust_bar')}>
        <TrustBar />
      </div>
      <div ref={trackSectionRef('estimate_preview')}>
        <EstimatePreview onGetStarted={handlePreviewCTA} isCreating={isCreating} />
      </div>
      <div ref={trackSectionRef('problem_solution')}>
        <ProblemSolution />
      </div>
      <div ref={trackSectionRef('funding_waterfall')}>
        <FundingWaterfall />
      </div>
      <div ref={trackSectionRef('how_it_works')}>
        <HowItWorks onGetStarted={handleHowItWorksCTA} isCreating={isCreating} />
      </div>
      <div ref={trackSectionRef('social_proof')}>
        <SocialProof />
      </div>
      <div ref={trackSectionRef('services_grid')}>
        <ServicesGrid />
      </div>
      <div ref={trackSectionRef('faq')}>
        <FAQSection />
      </div>
      <div ref={trackSectionRef('final_cta')}>
        <FinalCTA onGetStarted={handleFinalCTA} isCreating={isCreating} />
      </div>

      <SiteFooter />
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
