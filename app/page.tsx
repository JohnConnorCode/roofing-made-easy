'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter } from '@/components/layout'
import {
  Loader2,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  MapPin,
  HelpCircle,
  Home,
  Quote,
} from 'lucide-react'
import { FAQAccordion, DEFAULT_FAQ_ITEMS } from '@/components/faq/faq-accordion'
import { ServiceSchema, FAQSchema } from '@/components/seo/json-ld'
import { getFeaturedTestimonials } from '@/lib/data/testimonials'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { BUSINESS_CONFIG } from '@/lib/config/business'

function generateDemoLeadId(): string {
  return 'demo-' + Math.random().toString(36).substring(2, 15)
}

export default function HomePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleGetStarted = async () => {
    setIsCreating(true)
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
        router.push(`/${data.lead.id}/address`)
      } else {
        const demoId = generateDemoLeadId()
        router.push(`/${demoId}/address`)
      }
    } catch (error) {
      // Fall back to demo mode on error
      const demoId = generateDemoLeadId()
      router.push(`/${demoId}/address`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Schema.org structured data */}
      <ServiceSchema />
      <FAQSchema items={DEFAULT_FAQ_ITEMS} />

      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-roof.jpg"
            alt="Professional roofing work"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f14]/90 via-[#0c0f14]/80 to-[#0c0f14]/95" />
        </div>
        <div className="absolute inset-0 bg-texture-dark opacity-50" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1f2e] border border-slate-700 px-4 py-2 text-sm text-[#c9a25c] mb-6 animate-slide-up delay-100">
              <Clock className="h-4 w-4" />
              Get your estimate in under 2 minutes
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-100 md:text-5xl lg:text-6xl animate-slide-up delay-200">
              Find Out What Your
              <span className="text-[#c9a25c]"> Roof Really Costs</span>
            </h2>

            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-300">
              No contractors knocking on your door. No pressure. Just an honest,
              data-driven estimate based on your home and local market prices.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-400">
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
                    Get My Free Estimate
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-500 animate-slide-up delay-500">
              Free forever • No account needed • No spam calls
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-800 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <ScrollStagger className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">50,000+</div>
              <div className="text-sm text-slate-500 mt-1">Homeowners Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">92%</div>
              <div className="text-sm text-slate-500 mt-1">Estimate Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-100">2 min</div>
              <div className="text-sm text-slate-500 mt-1">Average Time</div>
            </div>
            {BUSINESS_CONFIG.reviews.googleRating && (
              <div className="text-center">
                <div className="flex justify-center gap-0.5 text-[#c9a25c]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <div className="text-sm text-slate-500 mt-1">{BUSINESS_CONFIG.reviews.googleRating} Rating</div>
              </div>
            )}
          </ScrollStagger>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Three simple steps to your estimate
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-hover bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg glow-gold">
                <MapPin className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                1. Tell Us About Your Home
              </h3>
              <p className="text-slate-400">
                Enter your address and answer a few quick questions about your roof's size, material, and condition.
              </p>
            </div>

            <div className="text-center card-hover bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg glow-gold">
                <TrendingUp className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                2. We Analyze the Data
              </h3>
              <p className="text-slate-400">
                Our system checks current material costs, labor rates in your area, and thousands of similar projects.
              </p>
            </div>

            <div className="text-center card-hover bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg glow-gold">
                <DollarSign className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                3. Get Your Estimate
              </h3>
              <p className="text-slate-400">
                Receive a detailed price range instantly. No waiting for callbacks, no sales pressure.
              </p>
            </div>
          </ScrollStagger>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="btn-press bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
            >
              {isCreating ? 'Starting...' : 'Start My Estimate'}
            </Button>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate animation="slide-up">
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
                Why Homeowners Trust Our Estimates
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                We built this because getting a roofing estimate shouldn't mean dealing
                with pushy salespeople or waiting days for a callback.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1f2e] border border-slate-700">
                      <CheckCircle className="h-6 w-6 text-[#3d7a5a]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">No Hidden Agenda</h4>
                    <p className="text-slate-400 mt-1">
                      We're not trying to sell you anything. Our estimates are based on real market data, not sales quotas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1f2e] border border-slate-700">
                      <Shield className="h-6 w-6 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Your Privacy Protected</h4>
                    <p className="text-slate-400 mt-1">
                      We never sell your information to contractors. No spam calls, no surprise visitors.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1f2e] border border-slate-700">
                      <Users className="h-6 w-6 text-[#c9a25c]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Built by Roofers</h4>
                    <p className="text-slate-400 mt-1">
                      Created in Tupelo, Mississippi with 20+ years of industry experience. We know what things actually cost.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate animation="slide-up" delay={100}>
              <div className="bg-gradient-card border border-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-[#c9a25c] font-semibold">
                  <Home className="h-5 w-5" />
                  Sample Estimate
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Roof Size</span>
                  <span className="font-medium text-slate-100">2,200 sq ft</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Material</span>
                  <span className="font-medium text-slate-100">Architectural Shingles</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Job Type</span>
                  <span className="font-medium text-slate-100">Full Replacement</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Estimated Cost</div>
                  <div className="text-4xl font-bold text-slate-100">$12,400 - $15,800</div>
                  <div className="text-sm text-slate-500 mt-2">Based on your area's market rates</div>
                </div>
              </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              What Homeowners Say
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Join thousands of satisfied customers
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-6">
            {getFeaturedTestimonials(3).map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 card-hover"
              >
                <Quote className="h-8 w-8 text-[#c9a25c]/50 mb-4" />
                <p className="text-slate-300 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#c9a25c] text-[#c9a25c]" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1a1f2e] border border-slate-700 mb-6">
              <HelpCircle className="h-7 w-7 text-[#c9a25c]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to know about getting your estimate
            </p>
          </ScrollAnimate>

          <ScrollAnimate delay={100}>
            <FAQAccordion items={DEFAULT_FAQ_ITEMS} />
          </ScrollAnimate>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#161a23] border-y border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg glow-gold animate-float">
                <Home className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Ready to Find Out What Your Roof Costs?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Join 50,000+ homeowners who've gotten their free estimate.
            </p>
            <div className="mt-8">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                disabled={isCreating}
                className="text-lg btn-press shadow-lg glow-gold bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] border-0"
              >
                {isCreating ? 'Starting...' : 'Get My Free Estimate'}
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Takes less than 2 minutes • Completely free
            </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
