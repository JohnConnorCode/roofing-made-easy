'use client'

import { Loader2, ArrowRight, Star, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { HeroSlider } from '../hero-slider'
import { useAnalytics } from '@/lib/analytics'

interface HeroSectionProps {
  onGetStarted: () => void
  isCreating: boolean
  error: string | null
}

export function HeroSection({ onGetStarted, isCreating, error }: HeroSectionProps) {
  const { trackCTAClick } = useAnalytics()

  const scrollToPreview = () => {
    trackCTAClick('hero_see_sample')
    document.getElementById('estimate-preview')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" aria-label="Hero" className="relative overflow-hidden min-h-[100svh] md:min-h-[700px] flex items-center">
      <div className="absolute inset-0">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/90 via-[#0c0f14]/75 to-[#0c0f14]/95" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl animate-hero-title font-display">
            Your Roof Shouldn&apos;t
            <br className="sm:hidden" />
            {' '}Keep You Up{' '}
            <span className="bg-gradient-to-r from-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">at Night</span>
          </h1>

          <p className="mt-5 md:mt-6 text-base md:text-xl text-slate-300 leading-relaxed animate-hero-subtitle delay-100 max-w-3xl mx-auto">
            Get a detailed roof estimate in 2 minutes &mdash; then see how insurance, financing,
            and assistance programs can cover the cost. Free. Private. No strings.
          </p>

          {/* Founder line */}
          <p className="mt-3 text-sm text-slate-400 animate-hero-subtitle delay-150">
            Built by {BUSINESS_CONFIG.legalName.replace(' LLC', '')} &mdash; {BUSINESS_CONFIG.foundedYear ? `${new Date().getFullYear() - parseInt(BUSINESS_CONFIG.foundedYear)}+ years` : '20+ years'} roofing in {BUSINESS_CONFIG.serviceArea.region}
          </p>

          <div className="mt-10 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-hero-cta delay-200">
            <Button
              variant="primary"
              size="xl"
              onClick={onGetStarted}
              disabled={isCreating}
              className="text-lg btn-press shadow-lg glow-gold btn-shimmer hero-cta-pulse"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Get My Free Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="xl"
              onClick={scrollToPreview}
              className="text-lg text-slate-300 hover:text-slate-100 border border-slate-600 hover:border-slate-500"
            >
              See a Sample Estimate
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {error && (
            <div className="mt-4 bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-center animate-fade-up" role="alert">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 animate-hero-subtitle delay-300">
            {BUSINESS_CONFIG.reviews.googleRating && BUSINESS_CONFIG.reviews.googleReviewCount ? (
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c] star-glow" />
                ))}
                <span className="text-sm text-slate-300 ml-1.5">
                  {BUSINESS_CONFIG.reviews.googleRating}/5 from {BUSINESS_CONFIG.reviews.googleReviewCount}+ reviews
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-300">Trusted by Mississippi homeowners</p>
            )}
            <p className="text-sm text-slate-400">
              Free forever &bull; No account needed &bull; Your info stays private
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent shadow-[0_0_8px_rgba(201,162,92,0.15)]" />
    </section>
  )
}
