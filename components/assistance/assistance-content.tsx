'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter } from '@/components/layout'
import {
  HandHeart,
  ArrowRight,
  CheckCircle,
  Building,
  Landmark,
  Heart,
  Zap,
  UserPlus,
  DollarSign,
  Search,
  Sparkles,
  ListChecks,
  FileText,
  Calculator,
  MessageSquare,
  ClipboardList,
} from 'lucide-react'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { usePhoneDisplay, usePhoneLink } from '@/lib/config/business-provider'
import { useAnalytics } from '@/lib/analytics'

const programTypes = [
  {
    icon: Landmark,
    title: 'Federal Programs',
    description: 'FEMA disaster relief, FHA loans, USDA grants, and weatherization assistance for qualifying homeowners.',
    color: 'bg-blue-400/10 border-blue-400/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: Building,
    title: 'State Programs',
    description: 'State housing authority programs that provide grants and low-interest loans for home repairs.',
    color: 'bg-purple-400/10 border-purple-400/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: Heart,
    title: 'Nonprofit Programs',
    description: 'Organizations like Habitat for Humanity and Rebuilding Together that provide free or low-cost repairs.',
    color: 'bg-pink-400/10 border-pink-400/30',
    iconColor: 'text-pink-400',
  },
  {
    icon: Zap,
    title: 'Utility Rebates',
    description: 'Energy efficiency rebates for cool roofing and insulation improvements from local utility companies.',
    color: 'bg-yellow-400/10 border-yellow-400/30',
    iconColor: 'text-yellow-400',
  },
]

const featuredPrograms = [
  {
    name: 'FEMA Individual Assistance',
    type: 'Federal',
    maxBenefit: '$42,500',
    description: 'Grants for home repair after declared disasters. No repayment required.',
    eligibility: 'Disaster-affected areas',
  },
  {
    name: 'FHA Title I Loans',
    type: 'Federal',
    maxBenefit: '$25,000',
    description: 'Low-interest loans for home improvements. No equity requirement.',
    eligibility: 'Homeowners with qualifying credit',
  },
  {
    name: 'Weatherization Assistance',
    type: 'Federal',
    maxBenefit: '$8,000',
    description: 'Free energy efficiency improvements including roof-related repairs.',
    eligibility: 'Income below 200% poverty level',
  },
  {
    name: 'USDA Repair Grants',
    type: 'Federal',
    maxBenefit: '$10,000',
    description: 'Grants for rural homeowners 62+ who cannot afford a loan.',
    eligibility: 'Rural area, very low income, 62+',
  },
  {
    name: 'Habitat for Humanity',
    type: 'Nonprofit',
    maxBenefit: 'Varies',
    description: 'Low-cost or free critical home repairs through volunteer labor.',
    eligibility: 'Income below 80% AMI',
  },
]

export default function AssistanceContent() {
  const { trackCTAClick } = useAnalytics()
  const phoneDisplay = usePhoneDisplay()
  const phoneLinkHref = usePhoneLink()

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <HandHeart className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Thousands in Grants and Programs — Matched to You in Seconds
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Answer 5 questions and our eligibility screener matches you with 60+ federal, state, and nonprofit programs. Then AI tells you exactly which to apply for first, how to stack them, and estimates your total benefit — all free.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/customer/register?source=assistance">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('assistance_cta_clicked')}
                >
                  Check Your Eligibility
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => document.getElementById('eligibility-screener')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500 animate-slide-up delay-200">
              Or call <a href={phoneLinkHref} className="text-[#c9a25c] hover:underline">{phoneDisplay}</a> — we&apos;re happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility Screener */}
      <section id="eligibility-screener" className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Search className="h-4 w-4" />
                Eligibility Screener
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Five Questions. Personalized Results.
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Tell us your state, income range, age, and whether you&apos;re a homeowner, veteran, disabled, or in a disaster-declared area. The screener instantly filters 60+ programs down to the ones you actually qualify for — with eligibility confidence for each.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Filters by income level, household size, and property type',
                  'Finds programs specific to your state and county',
                  'Identifies programs for seniors, veterans, and disabled homeowners',
                  'Shows disaster relief programs available in your area',
                  'Green/red eligibility indicators so you know before you apply',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/customer/register?source=assistance">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('assistance_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Check My Eligibility
                </Button>
              </Link>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Eligibility Screener</div>
                <div className="space-y-3">
                  <div className="bg-[#0c0f14] rounded-lg p-3">
                    <label className="block text-xs text-slate-500 mb-1.5">Household Income</label>
                    <div className="h-9 bg-[#161a23] rounded border border-slate-700 flex items-center px-3">
                      <DollarSign className="h-3.5 w-3.5 text-slate-500 mr-2" />
                      <span className="text-sm text-slate-300">$25,000 – $50,000</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0c0f14] rounded-lg p-3">
                      <label className="block text-xs text-slate-500 mb-1.5">State</label>
                      <div className="h-9 bg-[#161a23] rounded border border-slate-700 flex items-center px-3">
                        <span className="text-sm text-slate-300">Mississippi</span>
                      </div>
                    </div>
                    <div className="bg-[#0c0f14] rounded-lg p-3">
                      <label className="block text-xs text-slate-500 mb-1.5">Age</label>
                      <div className="h-9 bg-[#161a23] rounded border border-slate-700 flex items-center px-3">
                        <span className="text-sm text-slate-300">67</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-3">
                    <label className="block text-xs text-slate-500 mb-2">Circumstances</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-[#3d7a5a]/20 text-[#3d7a5a] rounded-full text-xs font-medium">Homeowner</span>
                      <span className="px-2.5 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs font-medium">Senior (62+)</span>
                      <span className="px-2.5 py-1 bg-orange-400/20 text-orange-400 rounded-full text-xs font-medium">Disaster Area</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Programs matched:</span>
                      <span className="text-[#c9a25c] font-bold">8 found</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-slate-300">FEMA Individual Assistance</span>
                        </div>
                        <span className="text-[#c9a25c]">$42,500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-slate-300">USDA Repair Grants (62+)</span>
                        </div>
                        <span className="text-[#c9a25c]">$10,000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-slate-300">Weatherization Assistance</span>
                        </div>
                        <span className="text-[#c9a25c]">$8,000</span>
                      </div>
                      <span className="text-slate-500 pl-5">+ 5 more programs</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* AI Prioritized Guidance */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-[#c9a25c]" />
                  <span className="text-sm text-slate-500">AI Prioritized Action Plan</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#0c0f14] rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c] text-[#0c0f14] flex items-center justify-center text-xs font-bold">1</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium">FEMA Individual Assistance</span>
                            <span className="text-[#c9a25c] text-xs font-bold">Up to $42,500</span>
                          </div>
                          <span className="text-xs text-slate-500">Highest benefit — your area has a disaster declaration. Apply within 60 days.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c] text-[#0c0f14] flex items-center justify-center text-xs font-bold">2</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium">USDA Section 504 Grant</span>
                            <span className="text-[#c9a25c] text-xs font-bold">Up to $10,000</span>
                          </div>
                          <span className="text-xs text-slate-500">You&apos;re 62+ in a rural area with qualifying income. This is free money.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c9a25c] text-[#0c0f14] flex items-center justify-center text-xs font-bold">3</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium">Weatherization Assistance</span>
                            <span className="text-[#c9a25c] text-xs font-bold">Up to $8,000</span>
                          </div>
                          <span className="text-xs text-slate-500">Your income qualifies. Includes roof repairs and insulation — free.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                    <span className="font-medium">Strategy:</span> Apply for grants first (items 1-3). These don&apos;t require repayment. Only take loans for any remaining gap.
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Estimated total benefit:</span>
                      <span className="text-[#c9a25c] font-bold">$50,500 – $60,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <ListChecks className="h-4 w-4" />
                AI Guidance
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                AI Tells You Exactly Where to Apply First
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                After the screener finds your programs, AI analyzes your income, location, age, and circumstances to build a prioritized action plan. It tells you which programs give you the most money, which to apply for first, and how to stack them so nothing overlaps or disqualifies you.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Ranks programs by benefit amount and approval likelihood',
                  'Tells you to apply for grants before loans — in the right order',
                  'Explains how to stack programs without disqualifying yourself',
                  'Estimates your total benefit across all qualifying programs',
                  'Warns about deadlines (FEMA has a 60-day window)',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/customer/register?source=assistance">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('assistance_cta_clicked')}
                >
                  Get Your Action Plan — Free
                </Button>
              </Link>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Benefit Stacking Calculator */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Calculator className="h-4 w-4" />
                Benefit Calculator
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                See How Programs Stack to Cover Your Roof
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                The benefit calculator takes your roof estimate, stacks every program you qualify for — grants first, then low-interest loans — and shows you exactly how much is covered and what&apos;s left. If there&apos;s a remaining gap, it links you directly to financing options.
              </p>
              <div className="space-y-3">
                {[
                  'Stacks programs automatically: federal first, then state, nonprofit, utility',
                  'Shows a running total as each program is applied',
                  'Green indicator when your roof is fully covered',
                  'Links to financing for any remaining balance',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Benefit Stacking Preview</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Your Roof Estimate</span>
                    <span className="text-slate-100 font-bold">$18,500</span>
                  </div>

                  {/* Stacked bar */}
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-blue-400 h-full" style={{ width: '54%' }} title="FEMA" />
                    <div className="bg-purple-400 h-full" style={{ width: '22%' }} title="USDA" />
                    <div className="bg-yellow-400 h-full" style={{ width: '16%' }} title="Weatherization" />
                    <div className="bg-slate-700 h-full" style={{ width: '8%' }} title="Remaining" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-400" />
                        <span className="text-slate-300">FEMA Individual Assistance</span>
                      </div>
                      <span className="text-green-400 font-medium">- $10,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-400" />
                        <span className="text-slate-300">USDA Section 504 Grant</span>
                      </div>
                      <span className="text-green-400 font-medium">- $4,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-400" />
                        <span className="text-slate-300">Weatherization Assistance</span>
                      </div>
                      <span className="text-green-400 font-medium">- $3,000</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-100 font-bold">Remaining gap</span>
                      <div className="text-right">
                        <span className="text-[#c9a25c] font-bold text-lg">$1,500</span>
                        <span className="block text-xs text-slate-500">~$29/mo to finance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* AI Assistance Advisor */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <MessageSquare className="h-4 w-4" />
                AI Programs Advisor
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                An Advisor That Knows Your Full Funding Picture
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Your AI advisor doesn&apos;t just know about assistance programs — it sees your insurance claim status, your roof estimate, your financing pre-qualification, and your eligible programs. Ask it anything and get advice that accounts for everything, not just one piece.
              </p>
              <div className="space-y-3">
                {[
                  'Knows your estimate, insurance claim, and financing status',
                  'Sees which programs you qualify for and how much you\'ve applied for',
                  'Suggests whether to file insurance, apply for grants, or finance — and in what order',
                  'Explains program requirements in plain language',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-[#c9a25c]" />
                  <span className="text-sm font-medium text-slate-300">AI Programs Advisor</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#c9a25c]/10 rounded-lg p-3 text-sm text-slate-200 ml-8">
                    I&apos;m a 67-year-old veteran in Mississippi. My roof estimate is $18,500. What should I do first?
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-3 text-sm text-slate-400 mr-4 space-y-2">
                    <p>
                      Great news — you qualify for several programs that could cover most or all of your $18,500 estimate. Here&apos;s what I&apos;d recommend:
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">1. Start with FEMA.</span> Your area has an active disaster declaration, and as a homeowner you&apos;re eligible for up to $42,500 in grants. Apply within 60 days — this has a deadline.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">2. Apply for USDA Section 504.</span> At 67, you qualify for the grant portion — up to $10,000 with no repayment. This stacks with FEMA.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">3. Check veteran-specific programs.</span> Your state may have additional VA housing assistance. I&apos;d check that before looking at any loans.
                    </p>
                    <p className="text-slate-500 text-xs">
                      Between FEMA, USDA, and veteran programs, you may not need financing at all. Want me to show your benefit breakdown?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-[#c9a25c]/10 text-[#c9a25c] rounded-full px-2.5 py-1">Show benefit breakdown</span>
                    <span className="text-[10px] bg-[#c9a25c]/10 text-[#c9a25c] rounded-full px-2.5 py-1">FEMA application steps</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Application Tracking */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Your Applications</div>
                <div className="space-y-3">
                  {[
                    {
                      name: 'FEMA Individual Assistance',
                      status: 'Applied',
                      statusColor: 'bg-yellow-400/10 text-yellow-400',
                      ref: 'FEMA-2024-MS-48291',
                      date: 'Feb 1',
                    },
                    {
                      name: 'USDA Section 504 Grant',
                      status: 'Eligible',
                      statusColor: 'bg-blue-400/10 text-blue-400',
                      ref: null,
                      date: null,
                    },
                    {
                      name: 'Weatherization Assistance',
                      status: 'Approved',
                      statusColor: 'bg-green-400/10 text-green-400',
                      ref: 'WAP-MS-7721',
                      date: 'Jan 28',
                    },
                  ].map((app, i) => (
                    <div key={i} className="bg-[#0c0f14] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">{app.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${app.statusColor}`}>{app.status}</span>
                      </div>
                      {app.ref && (
                        <div className="text-xs text-slate-500">
                          Ref: {app.ref}
                          {app.date && <span className="ml-2">&bull; {app.date}</span>}
                        </div>
                      )}
                      {!app.ref && (
                        <div className="text-xs text-slate-500">Ready to apply — documents listed in portal</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-medium">Weatherization approved</span>
                    <span className="text-green-400 font-bold">$7,500 awarded</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <ClipboardList className="h-4 w-4" />
                Application Tracking
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Track Every Application in One Place
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                When you&apos;re applying for 3, 4, or 5 programs at once, it&apos;s easy to lose track. The portal tracks each application&apos;s status — from researching to eligible to applied to approved — with reference numbers, dates, and notes. You&apos;ll know exactly where everything stands.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  '6 status stages: researching, eligible, applied, approved, not eligible, denied',
                  'Store application reference numbers and submission dates',
                  'Add notes for each program — deadlines, follow-ups, required documents',
                  'See which applications are waiting and which are decided',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Program Types Overview */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Types of Assistance Available
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Multiple sources of funding you may qualify for
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programTypes.map((type) => (
              <div
                key={type.title}
                className={`bg-[#1a1f2e] border ${type.color} rounded-2xl p-6 text-center card-hover`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${type.color} mx-auto mb-4`}>
                  <type.icon className={`h-7 w-7 ${type.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{type.title}</h3>
                <p className="text-sm text-slate-400">{type.description}</p>
              </div>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Featured Programs
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Popular programs that help homeowners with roofing costs
            </p>
          </ScrollAnimate>

          <div className="space-y-4">
            {featuredPrograms.map((program, index) => (
              <ScrollAnimate key={index} delay={index * 50}>
                <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 card-hover">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-100 text-lg">{program.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        program.type === 'Federal'
                          ? 'bg-blue-400/10 text-blue-400'
                          : 'bg-pink-400/10 text-pink-400'
                      }`}>
                        {program.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{program.description}</p>
                    <p className="text-slate-500 text-xs">
                      <span className="text-slate-400">Eligibility:</span> {program.eligibility}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <div className="text-sm text-slate-500">Up to</div>
                    <div className="text-2xl font-bold text-[#c9a25c]">{program.maxBenefit}</div>
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm mb-4">
              These are 5 of the 60+ programs in our database. Create an account to see all programs filtered to your eligibility.
            </p>
            <Link href="/customer/register?source=assistance">
              <Button
                variant="outline"
                size="lg"
                className="border-[#c9a25c]/30 text-[#c9a25c] hover:bg-[#c9a25c]/10"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                onClick={() => trackCTAClick('assistance_cta_clicked')}
              >
                See All Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Get Started in Under 2 Minutes
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              No paperwork. No research. Just answer a few questions and the tools do the rest.
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-4 gap-6">
            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Create Account</h3>
              <p className="text-sm text-slate-400">
                Sign up free — takes 30 seconds. Unlocks the eligibility screener, AI guidance, and application tracking.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Answer 5 Questions</h3>
              <p className="text-sm text-slate-400">
                Income, state, age, and circumstances. The screener instantly filters 60+ programs to the ones you qualify for.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Get AI Guidance</h3>
              <p className="text-sm text-slate-400">
                AI prioritizes programs, estimates your total benefit, and tells you which to apply for first.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Apply & Track</h3>
              <p className="text-sm text-slate-400">
                Submit applications with our guides and track every one from submission to approval in your dashboard.
              </p>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#0c0f14] border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">60+</div>
              <div className="text-sm text-slate-500 mt-1">Programs in Database</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">$50K+</div>
              <div className="text-sm text-slate-500 mt-1">Available in Grants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">5</div>
              <div className="text-sm text-slate-500 mt-1">Questions to Screen</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">Free</div>
              <div className="text-sm text-slate-500 mt-1">Eligibility + AI Guidance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Topic: Assistance + Insurance + Financing */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Assistance + Insurance + Financing = Your Roof, Funded
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Your AI advisor sees all three. Insurance covers storm damage. Grants reduce what you owe. Financing handles the rest. The tools share data so you get one complete picture — not three separate guesses.
            </p>
          </ScrollAnimate>

          {/* Funding waterfall */}
          <div className="max-w-md mx-auto bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 mb-10">
            <div className="text-sm text-slate-500 mb-4 text-center">How the Three Work Together</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Roof Estimate</span>
                <span className="text-slate-100 font-bold">$18,500</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Insurance payout</span>
                <span className="font-medium">- $10,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Assistance grants (USDA + WAP)</span>
                <span className="font-medium">- $7,000</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700 pt-3 text-sm">
                <span className="text-slate-100 font-bold">Amount to finance</span>
                <div className="text-right">
                  <span className="text-[#c9a25c] font-bold text-lg">$1,500</span>
                  <span className="block text-xs text-slate-500">~$29/mo for 60 months</span>
                </div>
              </div>
            </div>
          </div>

          <ScrollStagger className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/insurance-help" className="block">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 card-hover h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 mb-4">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">File an Insurance Claim</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Storm damage? Track your claim, generate AI letters, and model your payout. Whatever insurance covers, you don&apos;t need grants or financing for.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  Insurance Help <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/financing" className="block">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 card-hover h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 mb-4">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Finance the Remainder</h3>
                <p className="text-slate-400 text-sm mb-4">
                  After insurance and grants, finance what&apos;s left. AI generates 3 payment plans and an affordability check — using your actual remaining balance.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  View Financing <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </ScrollStagger>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <HandHeart className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Don&apos;t Leave Money on the Table
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Most homeowners qualify for at least one program but never apply because they don&apos;t know it exists. Create a free account, answer 5 questions, and get an AI-powered action plan that tells you exactly what to apply for and in what order.
            </p>
            <div className="mt-8">
              <Link href="/customer/register?source=assistance">
                <Button
                  variant="primary"
                  size="xl"
                  className="text-lg shadow-lg bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  onClick={() => trackCTAClick('assistance_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Check Your Eligibility — It&apos;s Free
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Or call <a href={phoneLinkHref} className="text-[#c9a25c] hover:underline">{phoneDisplay}</a> — we&apos;re happy to help.
            </p>
          </ScrollAnimate>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
