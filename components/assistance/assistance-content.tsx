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
} from 'lucide-react'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'

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
              Find Programs That Can Help Fund Your Roof
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Thousands of dollars in grants, loans, and rebates are available to help homeowners afford a new roof. Many people don't know these programs exist.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Check Your Eligibility
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => document.getElementById('program-types')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Programs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Types Overview */}
      <section id="program-types" className="py-16 md:py-24 bg-[#0c0f14]">
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
      <section className="py-16 md:py-24 bg-[#161a23]">
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
            <p className="text-slate-500 text-sm">
              These are just a few of the programs available. Create an account to see all programs and check your eligibility.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility Screener Teaser */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Search className="h-4 w-4" />
                Eligibility Screener
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-6">
                Find Programs You Qualify For
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Answer a few simple questions about your situation, and we'll show you which programs you may be eligible for. No guessing, no wasted time on applications you won't qualify for.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Filter programs by income level and household size',
                  'Find programs specific to your state and county',
                  'Identify programs for seniors, veterans, and disabled homeowners',
                  'See disaster relief programs available in your area',
                  'Get AI-powered personalized guidance on which programs to apply for first',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Check My Eligibility
                </Button>
              </Link>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Eligibility Screener Preview</div>
                <div className="space-y-4">
                  <div className="bg-[#0c0f14] rounded-lg p-4">
                    <label className="block text-sm text-slate-400 mb-2">Household Income</label>
                    <div className="h-10 bg-[#161a23] rounded border border-slate-700 flex items-center px-3">
                      <DollarSign className="h-4 w-4 text-slate-500 mr-2" />
                      <span className="text-slate-400">$45,000</span>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-4">
                    <label className="block text-sm text-slate-400 mb-2">Your State</label>
                    <div className="h-10 bg-[#161a23] rounded border border-slate-700 flex items-center px-3">
                      <span className="text-slate-400">Mississippi</span>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-4">
                    <label className="block text-sm text-slate-400 mb-2">Special Circumstances</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-[#3d7a5a]/20 text-[#3d7a5a] rounded-full text-sm">Homeowner</span>
                      <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm">Senior (62+)</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Programs you may qualify for:</span>
                      <span className="text-[#c9a25c] font-bold">7 found</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              How to Find and Apply for Programs
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Simple steps to access the funding you need
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Create Account</h3>
              <p className="text-sm text-slate-400">
                Sign up for free to access our eligibility screener and program database.
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Answer Questions</h3>
              <p className="text-sm text-slate-400">
                Tell us about your income, location, and circumstances to filter programs.
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Review Options</h3>
              <p className="text-sm text-slate-400">
                See which programs you likely qualify for with details on benefits and requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a25c] text-[#0c0f14] font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Apply</h3>
              <p className="text-sm text-slate-400">
                Use our guides and checklists to submit strong applications.
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
              <div className="text-3xl font-bold text-[#c9a25c]">$50K+</div>
              <div className="text-sm text-slate-500 mt-1">Available in Grants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">15+</div>
              <div className="text-sm text-slate-500 mt-1">Federal Programs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">50+</div>
              <div className="text-sm text-slate-500 mt-1">State & Local Programs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#c9a25c]">Free</div>
              <div className="text-sm text-slate-500 mt-1">Eligibility Screening</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <DollarSign className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Don't Leave Money on the Table
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Many homeowners qualify for assistance but never apply because they don't know it exists. Find out what you're eligible for today.
            </p>
            <div className="mt-8">
              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="xl"
                  className="text-lg shadow-lg bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Check Your Eligibility
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free forever • No credit check • No obligation
            </p>
          </ScrollAnimate>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
