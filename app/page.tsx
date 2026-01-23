'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Shield,
  Clock,
  Zap,
  Brain,
  TrendingUp,
  Database,
  BarChart3,
  CheckCircle,
  ArrowRight,
  LineChart,
  Target,
  Lock
} from 'lucide-react'

// Generate a demo lead ID for when the API isn't available
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
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">RoofEstimate AI</h1>
                <p className="text-xs text-slate-500">by Farrell Roofing</p>
              </div>
            </div>
            <a
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Contractor Portal
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400 mb-8">
              <Zap className="h-4 w-4" />
              AI-Powered • Data-Driven • Unbiased
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Get an Accurate Roofing Estimate
              <span className="text-amber-500"> in Minutes</span>
            </h2>

            <p className="mt-6 text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Our AI analyzes <span className="text-white font-medium">thousands of data points</span> and
              real-time market trends to give you an unbiased estimate—no contractors, no pressure,
              just honest numbers.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                disabled={isCreating}
                className="text-lg group"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get Your Free Estimate
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Free forever • No account required • Results in under 2 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Data Stats */}
      <div className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500">50K+</div>
              <div className="text-sm text-slate-400 mt-1">Estimates Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500">1M+</div>
              <div className="text-sm text-slate-400 mt-1">Data Points Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500">±8%</div>
              <div className="text-sm text-slate-400 mt-1">Average Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500">2 min</div>
              <div className="text-sm text-slate-400 mt-1">Average Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* How AI Works */}
      <div className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              How Our AI Creates Your Estimate
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Transparent, data-driven pricing you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-6">
                <Database className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Analyzes Your Property
              </h3>
              <p className="text-slate-400 leading-relaxed">
                We gather details about your roof size, material, pitch, and condition to understand exactly what you need.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-6">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Checks Market Data
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Our AI cross-references current material costs, labor rates in your area, and seasonal pricing trends.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-6">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Generates Your Range
              </h3>
              <p className="text-slate-400 leading-relaxed">
                You get a realistic price range based on actual market data—not a sales pitch or lowball quote.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Trust Our Estimates */}
      <div className="py-20 md:py-28 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Why Trust Our Estimates?
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                We built this tool because getting honest roofing prices shouldn't require
                five sales calls and three in-home visits.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">No Hidden Agenda</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      We're not trying to sell you a roof. Our estimates are based purely on data,
                      not commission structures.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <LineChart className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Real Market Prices</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Our AI tracks actual project costs, material prices, and labor rates
                      updated regularly across different regions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Lock className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Your Data Stays Private</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      We don't sell your information to contractors. Get your estimate
                      without the spam calls.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-amber-500 mb-4">
                  <Brain className="h-6 w-6" />
                  <span className="font-semibold">AI Confidence Score</span>
                </div>
                <div className="text-6xl font-bold text-white mb-2">92%</div>
                <p className="text-slate-400 text-sm">
                  Average accuracy when compared to final contractor quotes
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">$0</div>
                    <div className="text-xs text-slate-500">Cost to you</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-xs text-slate-500">Sales calls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              What You'll Get
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Price Range', desc: 'Low, likely, and high estimates' },
              { icon: TrendingUp, title: 'Market Context', desc: 'How your area affects pricing' },
              { icon: CheckCircle, title: 'Scope Breakdown', desc: 'What the job actually involves' },
              { icon: Brain, title: 'AI Insights', desc: 'Factors that impact your cost' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-center">
                <item.icon className="h-8 w-8 text-amber-500 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-28 bg-gradient-to-b from-amber-600 to-amber-700">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to See What Your Roof Really Costs?
          </h2>
          <p className="mt-4 text-lg text-amber-100">
            Get your AI-powered estimate in under 2 minutes. Free, unbiased, no strings attached.
          </p>
          <div className="mt-8">
            <Button
              variant="secondary"
              size="xl"
              onClick={handleGetStarted}
              disabled={isCreating}
              className="text-lg"
            >
              {isCreating ? 'Loading...' : 'Start My Free Estimate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">RoofEstimate AI</span>
                  <p className="text-xs text-slate-500">by Farrell Roofing</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                AI-powered roofing estimates using real market data. Get unbiased pricing
                information without the sales pressure.
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
