'use client'

import { Loader2, ArrowRight, Star, Zap } from 'lucide-react'
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
    trackCTAClick('hero_see_how_it_works')
    document.getElementById('estimate-preview')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative overflow-hidden min-h-[100svh] md:min-h-[700px] flex items-center">
      <div className="absolute inset-0">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/90 via-[#0c0f14]/75 to-[#0c0f14]/95" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass-card border-[#c9a25c]/40 px-3 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 text-[#c9a25c] mb-6 md:mb-6 animate-hero-badge">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            AI-powered from 50,000+ roofing projects
          </div>

          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl animate-hero-title delay-100 font-display">
            Know Your Roof Cost
            <br className="sm:hidden" />
            {' '}in <span className="bg-gradient-to-r from-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">2 Minutes</span>, Not 2 Weeks
          </h1>

          <p className="mt-5 md:mt-6 text-base md:text-xl text-slate-300 leading-relaxed animate-hero-subtitle delay-200 max-w-3xl mx-auto">
            Stop guessing what your roof costs. Get a real estimate based on your actual roof and local prices—instantly.
          </p>

          <div className="mt-10 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-hero-cta delay-300">
            <Button
              variant="primary"
              size="xl"
              onClick={onGetStarted}
              disabled={isCreating}
              className="text-lg btn-press shadow-lg glow-gold btn-shimmer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Get My Instant Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-center animate-fade-up">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 animate-hero-subtitle delay-400">
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
            <p className="text-sm text-slate-500">
              Free forever • No account required • No contractors calling you
            </p>
            <button
              onClick={scrollToPreview}
              className="mt-1 text-sm text-[#c9a25c]/80 hover:text-[#c9a25c] transition-colors cursor-pointer"
            >
              See how it works ↓
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent shadow-[0_0_8px_rgba(201,162,92,0.15)]" />
    </section>
  )
}
