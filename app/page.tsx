'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Home,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  MapPin
} from 'lucide-react'

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
      console.log('Using demo mode')
      const demoId = generateDemoLeadId()
      router.push(`/${demoId}/address`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm animate-fade-in">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-slide-up">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/20 animate-float">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">RoofEstimate</h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </div>
            <a
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Contractor Login
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700 mb-6 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Clock className="h-4 w-4" />
              Get your estimate in under 2 minutes
            </div>

            <h2
              className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              Find Out What Your
              <span className="text-amber-600"> Roof Really Costs</span>
            </h2>

            <p
              className="mt-6 text-xl text-slate-600 leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              No contractors knocking on your door. No pressure. Just an honest,
              data-driven estimate based on your home and local market prices.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                disabled={isCreating}
                className="text-lg btn-press shadow-lg shadow-amber-500/20"
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

            <p
              className="mt-4 text-sm text-slate-500 animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              Free forever • No account needed • No spam calls
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">50,000+</div>
              <div className="text-sm text-slate-500 mt-1">Homeowners Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">92%</div>
              <div className="text-sm text-slate-500 mt-1">Estimate Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">2 min</div>
              <div className="text-sm text-slate-500 mt-1">Average Time</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <div className="text-sm text-slate-500 mt-1">4.9 Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three simple steps to your estimate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            <div className="text-center card-hover bg-slate-50 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                1. Tell Us About Your Home
              </h3>
              <p className="text-slate-600">
                Enter your address and answer a few quick questions about your roof's size, material, and condition.
              </p>
            </div>

            <div className="text-center card-hover bg-slate-50 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                2. We Analyze the Data
              </h3>
              <p className="text-slate-600">
                Our system checks current material costs, labor rates in your area, and thousands of similar projects.
              </p>
            </div>

            <div className="text-center card-hover bg-slate-50 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                3. Get Your Estimate
              </h3>
              <p className="text-slate-600">
                Receive a detailed price range instantly. No waiting for callbacks, no sales pressure.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="btn-press"
            >
              {isCreating ? 'Starting...' : 'Start My Estimate'}
            </Button>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                Why Homeowners Trust Our Estimates
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                We built this because getting a roofing estimate shouldn't mean dealing
                with pushy salespeople or waiting days for a callback.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">No Hidden Agenda</h4>
                    <p className="text-slate-600 mt-1">
                      We're not trying to sell you anything. Our estimates are based on real market data, not sales quotas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Your Privacy Protected</h4>
                    <p className="text-slate-600 mt-1">
                      We never sell your information to contractors. No spam calls, no surprise visitors.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Built by Roofers</h4>
                    <p className="text-slate-600 mt-1">
                      Created by Farrell Roofing with 20+ years of industry experience. We know what things actually cost.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-amber-600 font-semibold">
                  <Home className="h-5 w-5" />
                  Sample Estimate
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Roof Size</span>
                  <span className="font-medium text-slate-900">2,200 sq ft</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Material</span>
                  <span className="font-medium text-slate-900">Architectural Shingles</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Job Type</span>
                  <span className="font-medium text-slate-900">Full Replacement</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Estimated Cost</div>
                  <div className="text-4xl font-bold text-slate-900">$12,400 - $15,800</div>
                  <div className="text-sm text-slate-500 mt-2">Based on your area's market rates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30 animate-float">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Find Out What Your Roof Costs?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join 50,000+ homeowners who've gotten their free estimate.
          </p>
          <div className="mt-8">
            <Button
              variant="primary"
              size="xl"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="text-lg btn-press shadow-lg shadow-amber-500/30"
            >
              {isCreating ? 'Starting...' : 'Get My Free Estimate'}
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Takes less than 2 minutes • Completely free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">RoofEstimate</span>
                  <p className="text-xs text-slate-500">by Farrell Roofing</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Helping homeowners get honest, accurate roofing estimates without the hassle.
                Built with 20+ years of roofing industry experience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="/terms" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Contractors</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="/login" className="block hover:text-white transition-colors">Contractor Portal</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Farrell Roofing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
