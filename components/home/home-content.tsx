'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/lib/analytics'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter, MobileCTABar } from '@/components/layout'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import {
  Loader2,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  HelpCircle,
  Home,
  Quote,
  CreditCard,
  FileText,
  HandHeart,
  AlertTriangle,
  Zap,
  Brain,
  Calculator,
  Target,
  BarChart3,
  ShieldCheck,
  MapPin,
} from 'lucide-react'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { HeroSlider } from './hero-slider'
import Link from 'next/link'
import { getFeaturedTestimonials } from '@/lib/data/testimonials'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'

const AVATAR_COLORS = ['bg-[#c9a25c]', 'bg-[#5b7fa4]', 'bg-[#3d7a5a]'] as const

export function HomePageContent() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trackCTAClick, trackConversion } = useAnalytics()

  const handleGetStarted = useCallback(async () => {
    trackCTAClick('get_estimate_clicked')
    setIsCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web_funnel',
          referrerUrl: typeof window !== 'undefined' ? document.referrer : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        trackConversion('lead_created', { lead_id: data.lead.id })
        router.push(`/${data.lead.id}/property`)
      } else {
        setError('Unable to start your estimate. Please try again.')
        setIsCreating(false)
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
      setIsCreating(false)
    }
  }, [router, trackCTAClick, trackConversion])

  const testimonials = getFeaturedTestimonials(3)

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <SiteHeader />
      <MobileCTABar />

      {/* HERO - Problem -> Solution */}
      <section id="hero" className="relative overflow-hidden min-h-[100svh] md:min-h-[700px] flex items-center">
        {/* Background Image */}
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
                onClick={handleGetStarted}
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
            </div>
          </div>
        </div>

        {/* Hero bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent shadow-[0_0_8px_rgba(201,162,92,0.15)]" />
      </section>

      {/* Trust Bar - Left-aligned metrics with gold accent bars */}
      <section className="border-y border-slate-800 bg-ink">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-8">
          <ScrollStagger simple className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            <div className="flex items-center gap-4 md:first:pl-0 md:pl-8">
              <div className="h-10 w-1 rounded-full bg-gold flex-shrink-0" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={50000} suffix="+" /></div>
                <div className="text-sm text-slate-500 mt-1">Estimates Generated</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-14 w-1 rounded-full bg-gold flex-shrink-0" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={92} suffix="%" /></div>
                <div className="text-sm text-slate-500 mt-1">Within 15% of Final Quote</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-10 w-1 rounded-full bg-gold flex-shrink-0" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={2} suffix=" min" duration={1200} /></div>
                <div className="text-sm text-slate-500 mt-1">Average Time to Estimate</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-14 w-1 rounded-full bg-gold flex-shrink-0" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-100 font-display"><CountUp end={20} suffix="+ yrs" duration={1500} /></div>
                <div className="text-sm text-slate-500 mt-1">Roofing Experience</div>
              </div>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* THE PROBLEM - Why Traditional Quoting Sucks */}
      <section className="py-20 md:py-28 bg-mesh-dark">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              Sound Familiar?
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
              The traditional way of getting a roofing estimate is broken.
            </p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 gap-12 items-center relative">
            <ScrollAnimate animation="slide-in-left">
              {/* The Problem Side */}
              <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-8 card-inner-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-900/20 border border-red-900/30">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">The Old Way</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">&#x2715;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Schedule 3+ appointments</p>
                      <p className="text-slate-500 text-sm">Take time off work, wait around for contractors who may or may not show up</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">&#x2715;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Get wildly different quotes</p>
                      <p className="text-slate-500 text-sm">One says $12,000, another says $24,000—who&apos;s right?</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">&#x2715;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Deal with pressure tactics</p>
                      <p className="text-slate-500 text-sm">&ldquo;This price is only good today&rdquo; or &ldquo;Sign now before prices go up&rdquo;</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-900/20 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-sm">&#x2715;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Wonder if you&apos;re getting ripped off</p>
                      <p className="text-slate-500 text-sm">No way to know the fair market price without industry knowledge</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            {/* Arrow connector between cards on desktop */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-ink border-2 border-gold/30 items-center justify-center shadow-card-md icon-pulse-ring">
              <ArrowRight className="w-6 h-6 text-gold" />
            </div>

            <ScrollAnimate animation="slide-in-right" delay={100}>
              {/* The Solution Side */}
              <div className="bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-5 md:p-8 card-inner-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a25c]/15 border border-[#c9a25c]/30">
                    <CheckCircle className="h-6 w-6 text-[#c9a25c]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Our Way</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c]/15 flex items-center justify-center mt-0.5">
                      <span className="text-[#c9a25c] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Get your estimate in 2 minutes</p>
                      <p className="text-slate-500 text-sm">Answer a few questions, get an instant price range</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c]/15 flex items-center justify-center mt-0.5">
                      <span className="text-[#c9a25c] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Know the fair market price</p>
                      <p className="text-slate-500 text-sm">AI analyzes 50,000+ projects to show you what jobs like yours actually cost</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c]/15 flex items-center justify-center mt-0.5">
                      <span className="text-[#c9a25c] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Zero pressure, zero spam</p>
                      <p className="text-slate-500 text-sm">We don&apos;t sell your info to contractors. Period.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c]/15 flex items-center justify-center mt-0.5">
                      <span className="text-[#c9a25c] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Negotiate from a position of knowledge</p>
                      <p className="text-slate-500 text-sm">Walk into any contractor meeting knowing what&apos;s fair</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Technology Explanation */}
      <section className="py-16 md:py-24 bg-glow-cool border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-accent/10 border border-blue-accent/30 px-4 py-2 text-sm text-blue-accent-light mb-4">
              <Brain className="h-4 w-4" />
              AI-Powered Technology
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              How We Calculate Your Estimate
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Our AI doesn&apos;t guess. It analyzes real data to give you accurate pricing.
            </p>
          </ScrollAnimate>

          <ScrollStagger simple className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 relative">
            <div className="relative text-center bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-4 md:p-6 card-hover-premium">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center shadow-lg z-10">
                1
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-4 shadow-lg">
                <MapPin className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">1. Your Property</h3>
              <p className="text-slate-400 text-sm">
                We analyze your roof size, pitch, and complexity using satellite imagery and your input
              </p>
            </div>

            <div className="relative text-center bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-4 md:p-6 card-hover-premium">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-blue-accent text-white text-xs font-bold flex items-center justify-center shadow-lg z-10">
                2
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-accent-light to-blue-accent-muted mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">2. Material Costs</h3>
              <p className="text-slate-400 text-sm">
                Current prices for shingles, underlayment, flashing, and all materials specific to your job
              </p>
            </div>

            <div className="relative text-center bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-4 md:p-6 card-hover-premium">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center shadow-lg z-10">
                3
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-4 shadow-lg">
                <Users className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">3. Local Labor</h3>
              <p className="text-slate-400 text-sm">
                Labor rates specific to your area—not national averages that don&apos;t apply to Mississippi
              </p>
            </div>

            <div className="relative text-center bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-4 md:p-6 card-hover-premium">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-blue-accent text-white text-xs font-bold flex items-center justify-center shadow-lg z-10">
                4
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-accent-light to-blue-accent-muted mx-auto mb-4 shadow-lg">
                <Calculator className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">4. Similar Projects</h3>
              <p className="text-slate-400 text-sm">
                Data from 50,000+ roofing jobs to ensure your estimate reflects real-world pricing
              </p>
            </div>
          </ScrollStagger>

          {/* Sample Estimate Card */}
          <ScrollAnimate delay={100}>
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#1a1f2e] border border-[#c9a25c]/20 rounded-2xl p-8 shadow-gold-glow card-inner-glow">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 text-[#c9a25c] font-semibold">
                    <Target className="h-5 w-5" />
                    Sample Estimate Breakdown
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Roof Size</span>
                      <span className="font-medium text-slate-100">2,200 sq ft</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Material</span>
                      <span className="font-medium text-slate-100">Architectural Shingles</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Pitch</span>
                      <span className="font-medium text-slate-100">6/12 (Standard)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Location</span>
                      <span className="font-medium text-slate-100">Tupelo, MS</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Layers</span>
                      <span className="font-medium text-slate-100">1 (Tear-off needed)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">Complexity</span>
                      <span className="font-medium text-slate-100">Moderate</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <div className="text-center">
                    <div className="text-sm text-slate-500 mb-1">Estimated Cost Range</div>
                    <div className="text-4xl font-bold text-slate-100 font-display">$12,400 - $15,800</div>
                    <div className="text-sm text-slate-500 mt-2">Based on current market rates in your area</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimate>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="btn-press"
            >
              {isCreating ? 'Starting...' : 'Calculate My Estimate'}
            </Button>
          </div>
        </div>
      </section>

      {/* PROOF POINTS - Why Trust Us */}
      <section className="py-20 md:py-28 bg-diagonal-dark">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              Why Mississippi Homeowners Trust Us
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              We&apos;re not a lead generation site. We&apos;re real roofers who built a better way.
            </p>
          </ScrollAnimate>

          <ScrollStagger simple className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Card 1: Accuracy */}
            <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-8 card-inner-glow card-hover-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c9a25c]/15 border border-[#c9a25c]/30 mb-6">
                <Target className="h-7 w-7 text-[#c9a25c]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">92% Accuracy Rate</h3>
              <p className="text-slate-400 mb-4">
                Our estimates land within 15% of final contractor quotes. We&apos;ve tested this across thousands of projects—we&apos;re not guessing.
              </p>
              <div className="text-sm text-slate-500">
                Verified across 50,000+ estimates
              </div>
            </div>

            {/* Card 2: Local */}
            <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-8 card-inner-glow card-hover-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c9a25c]/15 border border-[#c9a25c]/30 mb-6">
                <ShieldCheck className="h-7 w-7 text-[#c9a25c]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Local Expertise</h3>
              <p className="text-slate-400 mb-4">
                Based in Tupelo with 20+ years serving Northeast Mississippi. We know the local climate challenges, material availability, and fair labor rates.
              </p>
              <div className="text-sm text-slate-500">
                Serving a 75-mile radius
              </div>
            </div>

            {/* Card 3: Privacy */}
            <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-8 card-inner-glow card-hover-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-accent/10 border border-blue-accent/20 mb-6">
                <Shield className="h-7 w-7 text-blue-accent" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Privacy Protected</h3>
              <p className="text-slate-400 mb-4">
                We never sell your information. Unlike lead sites that blast your info to 5+ contractors, your data stays with us. No spam calls, guaranteed.
              </p>
              <div className="text-sm text-slate-500">
                Your info is never shared
              </div>
            </div>
          </ScrollStagger>

          {/* Testimonials */}
          <ScrollAnimate className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-100 font-display">
              What Homeowners Say
            </h3>
          </ScrollAnimate>

          <ScrollStagger simple className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`min-w-[85vw] snap-center sm:min-w-0 bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-6 card-inner-glow card-hover-premium ${index === 1 ? 'testimonial-featured' : ''}`}
              >
                <Quote className="h-8 w-8 text-[#c9a25c]/50 mb-4" />
                <p className="text-slate-300 mb-4 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c] star-glow" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${AVATAR_COLORS[index]} flex items-center justify-center text-sm font-bold text-[#0c0f14]`}>
                    {testimonial.name.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.location} • {testimonial.projectType}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* BEYOND THE ESTIMATE - Connected Journey */}
      <section className="py-14 md:py-20 bg-glow-warm border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              Your Estimate Is Just the Beginning
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Once you know the cost, we help you figure out how to pay for it.
            </p>
          </ScrollAnimate>

          <ScrollStagger simple className="grid md:grid-cols-3 gap-8">
            {/* Financing */}
            <Link href="/financing" className="block group">
              <div className="md:text-left bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-8 h-full card-inner-glow card-hover-premium">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a25c]/15 md:mx-0 mx-auto mb-6 border border-[#c9a25c]/30">
                  <CreditCard className="h-8 w-8 text-[#c9a25c]" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Finance Your Roof
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  Pre-qualify for affordable monthly payments with no impact to your credit score. Options from $89/month.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  Check Your Options <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Insurance */}
            <Link href="/insurance-help" className="block group">
              <div className="md:text-left bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-8 h-full card-inner-glow card-hover-premium">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a25c]/15 md:mx-0 mx-auto mb-6 border border-[#c9a25c]/30">
                  <FileText className="h-8 w-8 text-[#c9a25c]" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Navigate Insurance Claims
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  Storm damage? We&apos;ll guide you through the claims process step by step. Know what to say and what to document.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  Get Help <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Assistance */}
            <Link href="/assistance-programs" className="block group">
              <div className="md:text-left bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-8 h-full card-inner-glow card-hover-premium">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a25c]/15 md:mx-0 mx-auto mb-6 border border-[#c9a25c]/30">
                  <HandHeart className="h-8 w-8 text-[#c9a25c]" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Find Assistance Programs
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  You may qualify for federal, state, or local programs you didn&apos;t know existed. Check your eligibility.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  See Programs <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </ScrollStagger>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 md:py-20 bg-[#161a23] bg-texture-dark border-t border-slate-800">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#c9a25c]/15 border border-[#c9a25c]/30 mb-6">
              <HelpCircle className="h-7 w-7 text-[#c9a25c]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              Common Questions
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to know about our instant estimates
            </p>
          </ScrollAnimate>

          <ScrollAnimate delay={100}>
            <FAQAccordion items={HOMEPAGE_FAQ_ITEMS} />
          </ScrollAnimate>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28 bg-glow-warm border-t border-slate-800 relative overflow-hidden">
        <Image
          src="/images/services/roof-replacement.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.06] pointer-events-none"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg glow-gold animate-float icon-pulse-ring">
                <Home className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
              Stop Guessing. Start Knowing.
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
              In 2 minutes, you&apos;ll know exactly what your roof should cost—before talking to a single contractor.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                disabled={isCreating}
                className="text-lg btn-press shadow-lg"
              >
                {isCreating ? 'Starting...' : 'Get My Free Estimate Now'}
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free forever • No account required • Results in 2 minutes
            </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />

      {/* Spacer for fixed mobile CTA bar */}
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
    </div>
  )
}
