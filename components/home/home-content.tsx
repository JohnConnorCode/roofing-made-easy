'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter, MobileCTABar } from '@/components/layout'
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
import Link from 'next/link'
import { getFeaturedTestimonials } from '@/lib/data/testimonials'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'

export function HomePageContent() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetStarted = async () => {
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
        router.push(`/${data.lead.id}/property`)
      } else {
        setError('Unable to start your estimate. Please try again.')
        setIsCreating(false)
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
      setIsCreating(false)
    }
  }

  const testimonials = getFeaturedTestimonials(3)

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <SiteHeader />
      <MobileCTABar />

      {/* HERO - Problem -> Solution */}
      <section id="hero" className="relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-roof.jpg"
            alt="Professional roofing work"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/95 via-[#0c0f14]/85 to-[#0c0f14]/98" />
        </div>
        <div className="absolute inset-0 bg-texture-dark opacity-50" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1f2e] border border-[#c9a25c]/40 px-3 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2 text-[#c9a25c] mb-5 md:mb-6 animate-hero-badge">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              AI-powered from 50,000+ roofing projects
            </div>

            <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-slate-100 sm:text-4xl md:text-5xl lg:text-6xl animate-hero-title delay-200">
              Know Your Roof Cost
              <br className="sm:hidden" />
              {' '}in <span className="text-[#c9a25c]">2 Minutes</span>
              <span className="hidden sm:inline">, Not 2 Weeks</span>
              <span className="sm:hidden block text-slate-400 text-xl mt-1 font-semibold">Not 2 Weeks</span>
            </h1>

            <p className="mt-4 md:mt-6 text-base md:text-xl text-slate-300 leading-relaxed animate-hero-subtitle delay-450 max-w-3xl mx-auto">
              Stop guessing what your roof costs. Get a real estimate based on your actual roof and local prices—instantly.
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-hero-cta delay-700">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                disabled={isCreating}
                className="text-lg btn-press shadow-lg glow-gold bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
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
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-center animate-slide-up">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <p className="mt-4 text-sm text-slate-500 animate-hero-subtitle delay-900">
              Free forever • No account required • No contractors calling you
            </p>
          </div>
        </div>

        {/* Hero bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>

      {/* Trust Bar - Left-aligned metrics with gold accent bars */}
      <section className="border-y border-slate-800 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <ScrollStagger className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
            <div className="flex items-center gap-4 md:first:pl-0 md:pl-8">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-gold to-gold-muted flex-shrink-0" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100">50,000+</div>
                <div className="text-sm text-slate-500 mt-0.5">Estimates Generated</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-gold to-gold-muted flex-shrink-0" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100">92%</div>
                <div className="text-sm text-slate-500 mt-0.5">Within 15% of Final Quote</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-gold to-gold-muted flex-shrink-0" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100">2 min</div>
                <div className="text-sm text-slate-500 mt-0.5">Average Time to Estimate</div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:pl-8 md:border-l md:border-slate-800/50">
              <div className="h-12 w-1 rounded-full bg-gradient-to-b from-gold to-gold-muted flex-shrink-0" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-100">20+ yrs</div>
                <div className="text-sm text-slate-500 mt-0.5">Roofing Experience</div>
              </div>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* THE PROBLEM - Why Traditional Quoting Sucks */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Sound Familiar?
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
              The traditional way of getting a roofing estimate is broken.
            </p>
          </ScrollAnimate>

          <div className="grid md:grid-cols-2 gap-12 items-center relative">
            <ScrollAnimate animation="slide-up">
              {/* The Problem Side */}
              <div className="bg-ink/80 border border-red-900/30 border-t-2 border-t-red-900/40 rounded-2xl p-5 md:p-8">
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
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-ink border-2 border-slate-700 items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gold" />
            </div>

            <ScrollAnimate animation="slide-up" delay={100}>
              {/* The Solution Side */}
              <div className="bg-[#1a1f2e]/50 border border-[#3d7a5a]/30 border-t-2 border-t-success/40 rounded-2xl p-5 md:p-8 shadow-[0_0_40px_-15px_rgba(61,122,90,0.12)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3d7a5a]/20 border border-[#3d7a5a]/30">
                    <CheckCircle className="h-6 w-6 text-[#3d7a5a]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Our Way</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center mt-0.5">
                      <span className="text-[#3d7a5a] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Get your estimate in 2 minutes</p>
                      <p className="text-slate-500 text-sm">Answer a few questions, get an instant price range</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center mt-0.5">
                      <span className="text-[#3d7a5a] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Know the fair market price</p>
                      <p className="text-slate-500 text-sm">AI analyzes 50,000+ projects to show you what jobs like yours actually cost</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center mt-0.5">
                      <span className="text-[#3d7a5a] text-sm">&#x2713;</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Zero pressure, zero spam</p>
                      <p className="text-slate-500 text-sm">We don&apos;t sell your info to contractors. Period.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center mt-0.5">
                      <span className="text-[#3d7a5a] text-sm">&#x2713;</span>
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
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1f2e] border border-slate-700 px-4 py-2 text-sm text-[#c9a25c] mb-4">
              <Brain className="h-4 w-4" />
              AI-Powered Technology
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              How We Calculate Your Estimate
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Our AI doesn&apos;t guess. It analyzes real data to give you accurate pricing.
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 relative">
            {/* Connecting line behind steps on desktop */}
            <div className="hidden md:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-gold/5 via-gold/25 to-gold/5" />

            <div className="relative text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 md:p-6">
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

            <div className="relative text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 md:p-6">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center shadow-lg z-10">
                2
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">2. Material Costs</h3>
              <p className="text-slate-400 text-sm">
                Current prices for shingles, underlayment, flashing, and all materials specific to your job
              </p>
            </div>

            <div className="relative text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 md:p-6">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center shadow-lg z-10">
                3
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-4 shadow-lg">
                <Users className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">3. Local Labor</h3>
              <p className="text-slate-400 text-sm">
                Labor rates specific to your area—not national averages that don&apos;t apply to Mississippi
              </p>
            </div>

            <div className="relative text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 md:p-6">
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center shadow-lg z-10">
                4
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-4 shadow-lg">
                <Calculator className="h-7 w-7 text-[#0c0f14]" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">4. Similar Projects</h3>
              <p className="text-slate-400 text-sm">
                Data from 50,000+ roofing jobs to ensure your estimate reflects real-world pricing
              </p>
            </div>
          </ScrollStagger>

          {/* Sample Estimate Card */}
          <ScrollAnimate animation="slide-up" delay={100}>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-card border border-slate-700 border-t-2 border-t-gold/30 rounded-2xl p-8 shadow-xl">
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
                    <div className="text-4xl font-bold text-slate-100">$12,400 - $15,800</div>
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
              className="btn-press bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
            >
              {isCreating ? 'Starting...' : 'Calculate My Estimate'}
            </Button>
          </div>
        </div>
      </section>

      {/* Section divider: How It Works -> Why Trust Us */}
      <div className="section-divider" />

      {/* PROOF POINTS - Why Trust Us */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Why Mississippi Homeowners Trust Us
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              We&apos;re not a lead generation site. We&apos;re real roofers who built a better way.
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Card 1: Accuracy — left gold accent */}
            <div className="bg-[#1a1f2e] border border-slate-800 border-l-2 border-l-gold rounded-2xl p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#3d7a5a]/20 border border-[#3d7a5a]/30 mb-6">
                <Target className="h-7 w-7 text-[#3d7a5a]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">92% Accuracy Rate</h3>
              <p className="text-slate-400 mb-4">
                Our estimates land within 15% of final contractor quotes. We&apos;ve tested this across thousands of projects—we&apos;re not guessing.
              </p>
              <div className="text-sm text-slate-500">
                Verified across 50,000+ estimates
              </div>
            </div>

            {/* Card 2: Local — circle icon container */}
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c]/20 border border-[#c9a25c]/30 mb-6">
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

            {/* Card 3: Privacy — dashed border */}
            <div className="bg-[#1a1f2e] border border-dashed border-slate-700 rounded-2xl p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-700/50 border border-slate-600 mb-6">
                <Shield className="h-7 w-7 text-slate-400" />
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
          <ScrollAnimate className="text-center mb-8 relative">
            {/* Decorative quote mark */}
            <div className="absolute -top-4 left-4 text-[100px] leading-none text-gold/[0.04] font-serif select-none pointer-events-none">&ldquo;</div>
            <h3 className="text-2xl font-bold text-slate-100 relative">
              What Homeowners Say
            </h3>
          </ScrollAnimate>

          <ScrollStagger className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`min-w-[85vw] snap-center sm:min-w-0 bg-[#1a1f2e] border border-slate-700 border-t-2 border-t-gold/20 rounded-2xl p-6 ${index === 1 ? 'testimonial-featured' : ''}`}
              >
                <Quote className="h-8 w-8 text-[#c9a25c]/50 mb-4" />
                <p className="text-slate-300 mb-4 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c]" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location} • {testimonial.projectType}</p>
                </div>
              </div>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* BEYOND THE ESTIMATE - Connected Journey */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Your Estimate Is Just the Beginning
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Once you know the cost, we help you figure out how to pay for it.
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-8">
            {/* Financing — Gold accent */}
            <Link href="/financing" className="block">
              <div className="md:text-left card-hover bg-[#1a1f2e] border border-slate-800 border-t-2 border-t-gold/40 rounded-2xl p-5 md:p-8 h-full transition-all hover:border-[#c9a25c]/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c]/20 to-[#c9a25c]/5 md:mx-0 mx-auto mb-6 border border-[#c9a25c]/30">
                  <CreditCard className="h-8 w-8 text-[#c9a25c]" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Finance Your Roof
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  Pre-qualify for affordable monthly payments with no impact to your credit score. Options from $89/month.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  Check Your Options <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Insurance — Blue accent */}
            <Link href="/insurance-help" className="block">
              <div className="md:text-left card-hover bg-[#1a1f2e] border border-slate-800 border-t-2 border-t-blue-400/30 rounded-2xl p-5 md:p-8 h-full transition-all hover:border-blue-400/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 md:mx-0 mx-auto mb-6 border border-blue-500/20">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Navigate Insurance Claims
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  Storm damage? We&apos;ll guide you through the claims process step by step. Know what to say and what to document.
                </p>
                <span className="text-blue-400 text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  Get Help <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Assistance — Green accent */}
            <Link href="/assistance-programs" className="block">
              <div className="md:text-left card-hover bg-[#1a1f2e] border border-slate-800 border-t-2 border-t-emerald-500/30 rounded-2xl p-5 md:p-8 h-full transition-all hover:border-emerald-500/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 md:mx-0 mx-auto mb-6 border border-emerald-500/20">
                  <HandHeart className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 text-center md:text-left">
                  Find Assistance Programs
                </h3>
                <p className="text-slate-400 mb-4 text-center md:text-left">
                  You may qualify for federal, state, or local programs you didn&apos;t know existed. Check your eligibility.
                </p>
                <span className="text-emerald-400 text-sm font-medium inline-flex items-center gap-1 md:justify-start justify-center w-full md:w-auto">
                  See Programs <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </ScrollStagger>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1a1f2e] border border-slate-700 mb-6">
              <HelpCircle className="h-7 w-7 text-[#c9a25c]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
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

      {/* Section divider: FAQ -> Final CTA */}
      <div className="section-divider" />

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 bg-[#0c0f14] border-y border-slate-800 relative overflow-hidden">
        <Image
          src="/images/services/completed-roof.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.04] pointer-events-none"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg glow-gold animate-float">
                <Home className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
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
                className="text-lg btn-press shadow-lg glow-gold bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
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
