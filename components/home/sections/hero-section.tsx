'use client'

import { Loader2, ArrowRight, Check, Clock, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroSlider } from '../hero-slider'
import { useAnalytics } from '@/lib/analytics'
import { useBusinessConfig } from '@/lib/config/business-provider'

interface HeroSectionProps {
  onGetStarted: () => void
  isCreating: boolean
  error: string | null
}

export function HeroSection({ onGetStarted, isCreating, error }: HeroSectionProps) {
  const { trackCTAClick } = useAnalytics()
  const config = useBusinessConfig()

  const scrollToPreview = () => {
    trackCTAClick('hero_see_sample')
    document.getElementById('estimate-preview')?.scrollIntoView({ behavior: 'smooth' })
  }

  const years = config.foundedYear
    ? new Date().getFullYear() - parseInt(config.foundedYear)
    : null
  const region = config.serviceArea.region
  const ownerName = config.legalName.replace(/\s+LLC$/i, '').replace(/\s+Inc\.?$/i, '')

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative overflow-hidden min-h-[100svh] flex items-center"
    >
      <div className="absolute inset-0">
        <HeroSlider />
        {/* Reduced overlay so the rotating photos actually read */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/70 via-[#0c0f14]/40 to-[#0c0f14]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,15,20,0.4)_80%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div className="max-w-4xl">
          {/* Local eyebrow — grounds the brand in its region */}
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9a25c]/30 bg-[#c9a25c]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#e6c588] animate-hero-subtitle">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a25c] animate-pulse" />
            {region} roofing, priced honestly
          </p>

          <h1 className="mt-6 text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] font-bold tracking-tight text-slate-50 animate-hero-title font-display">
            Know what your
            <br />
            new roof{' '}
            <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
              really costs
            </span>
            .
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl text-slate-300 leading-relaxed animate-hero-subtitle delay-100">
            A free, honest estimate in two minutes — built from real local pricing.
            No contractors calling. No pressure. Just the number.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 animate-hero-cta delay-200">
            <Button
              variant="primary"
              size="xl"
              onClick={onGetStarted}
              disabled={isCreating}
              className="text-lg btn-press shadow-xl glow-gold btn-shimmer hero-cta-pulse"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Get my free estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={scrollToPreview}
              className="inline-flex items-center justify-center gap-1.5 text-slate-300 hover:text-[#e6c588] transition-colors font-medium group"
            >
              See a sample estimate
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {error && (
            <div
              className="mt-5 max-w-md bg-red-950/80 backdrop-blur-sm border border-red-800 rounded-lg px-4 py-3 animate-fade-up"
              role="alert"
            >
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Trust strip — immediate, honest signals */}
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 max-w-2xl animate-hero-subtitle delay-300">
            <li className="flex items-center gap-2.5 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
              <span>2 minutes, no account</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-300">
              <ShieldOff className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
              <span>No sales calls, ever</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-300">
              <Check className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
              <span>
                {years ? `${years}+ years` : 'Local'} in {region}
              </span>
            </li>
          </ul>

          {/* Provenance — brand tool + parent company honestly linked */}
          {ownerName && (
            <p className="mt-10 text-sm text-slate-400 animate-hero-subtitle delay-400">
              A pricing tool from{' '}
              <span className="text-slate-200 font-medium">{ownerName}</span>,
              a family roofing business in {region}.
            </p>
          )}
        </div>
      </div>

      {/* Scroll cue — a small animated hint */}
      <button
        onClick={scrollToPreview}
        aria-label="Scroll to sample estimate"
        className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-slate-400 hover:text-[#e6c588] transition-colors group"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <div className="relative h-9 w-[1px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/60 to-slate-500/60" />
          <div className="absolute top-0 h-3 w-[1px] bg-[#c9a25c] animate-scroll-cue" />
        </div>
      </button>

      {/* Bottom gradient line — subtle signature */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a25c]/40 to-transparent shadow-[0_0_8px_rgba(201,162,92,0.2)]" />
    </section>
  )
}
