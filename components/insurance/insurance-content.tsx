'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader, SiteFooter } from '@/components/layout'
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Camera,
  Phone,
  ClipboardList,
  Shield,
  UserPlus,
  AlertTriangle,
  FileCheck,
  Clock,
  Building2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  PieChart,
  DollarSign,
  HandHeart,
  Copy,
} from 'lucide-react'
import { INSURANCE_COMPANIES, INSURANCE_RESOURCES } from '@/lib/data/insurance-resources'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { usePhoneDisplay, usePhoneLink } from '@/lib/config/business-provider'
import { useAnalytics } from '@/lib/analytics'

export default function InsuranceContent() {
  const { trackCTAClick } = useAnalytics()
  const phoneDisplay = usePhoneDisplay()
  const phoneLinkHref = usePhoneLink()

  const filingGuide = INSURANCE_RESOURCES.find(r => r.id === 'filing-guide')
  const documentationChecklist = INSURANCE_RESOURCES.find(r => r.id === 'documentation-checklist')
  const adjusterPrep = INSURANCE_RESOURCES.find(r => r.id === 'adjuster-prep')
  const appealGuide = INSURANCE_RESOURCES.find(r => r.id === 'appeal-guide')

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <FileText className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Your Complete Insurance Claim Command Center
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Track your claim from filing to settlement. Generate professional letters with AI. Model your payout with RCV vs ACV scenarios. And get a personal advisor that knows your claim, your estimate, and your options — all free.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link href="/customer/register?source=insurance">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('insurance_cta_clicked')}
                >
                  Start Tracking Your Claim
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => document.getElementById('claim-tracker')?.scrollIntoView({ behavior: 'smooth' })}
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

      {/* Claim Tracker */}
      <section id="claim-tracker" className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Clock className="h-4 w-4" />
                Claim Tracker
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Two Fields to Start. Full Visibility from Day One.
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Enter your insurance company and what happened — that&apos;s all it takes to start tracking. As your claim progresses, add adjuster info, notes, and documents. Every status change is logged to a timeline you can reference later.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Visual timeline from filing through settlement (or appeal)',
                  'Store adjuster name, phone, and visit dates',
                  'Add notes after every call or inspection',
                  'Track approved amounts against your estimate',
                  'See your funding gap — what insurance doesn\'t cover',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/customer/register?source=insurance">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('insurance_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-500">Your Claim Timeline</div>
                  <div className="text-xs bg-orange-400/10 text-orange-400 px-2 py-1 rounded-full">Under Review</div>
                </div>
                <div className="space-y-0">
                  {[
                    { status: 'Claim Filed', detail: 'State Farm #CLM-2024-48291', date: 'Jan 15', color: 'bg-blue-400', done: true },
                    { status: 'Adjuster Scheduled', detail: 'Mike Thompson — (662) 555-0142', date: 'Jan 18', color: 'bg-yellow-400', done: true },
                    { status: 'Inspection Complete', detail: 'Note: Adjuster found hail damage on north slope', date: 'Jan 20', color: 'bg-purple-400', done: true },
                    { status: 'Under Review', detail: 'Waiting for decision', date: 'In Progress', color: 'bg-orange-400', done: false, current: true },
                    { status: 'Decision', detail: '', date: 'Pending', color: 'bg-slate-700', done: false },
                    { status: 'Settlement', detail: '', date: 'Pending', color: 'bg-slate-700', done: false },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4 relative">
                      {index < 5 && (
                        <div className={`absolute left-[5px] top-[14px] w-0.5 h-full ${step.done ? 'bg-slate-600' : 'bg-slate-800'}`} />
                      )}
                      <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${step.color} ${step.current ? 'ring-4 ring-orange-400/20' : ''}`} />
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={step.done ? 'text-slate-100 font-medium text-sm' : step.current ? 'text-slate-200 font-medium text-sm' : 'text-slate-500 text-sm'}>
                            {step.status}
                          </span>
                          <span className="text-xs text-slate-600">{step.date}</span>
                        </div>
                        {step.detail && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{step.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* AI Letter Generator */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-500">Generated Appeal Letter</div>
                  <button className="text-xs text-[#c9a25c] flex items-center gap-1">
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="bg-[#0c0f14] rounded-lg p-4 text-xs text-slate-400 leading-relaxed space-y-3 font-mono">
                  <p>Dear State Farm Claims Department,</p>
                  <p>
                    I am writing to formally appeal the denial of Claim #CLM-2024-48291 for roof damage at
                    <span className="text-[#c9a25c]"> 142 Oak Street, Tupelo, MS</span>.
                    The damage was caused by hail on January 12, 2024.
                  </p>
                  <p>
                    The independent inspection report documents significant granule loss and cracking across the north-facing slope.
                    Our contractor&apos;s estimate for replacement is
                    <span className="text-[#c9a25c]"> $18,500</span>,
                    consistent with current material and labor costs in Lee County.
                  </p>
                  <p className="text-slate-600">
                    I request that you re-evaluate this claim based on the enclosed documentation...
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Initial Claim</div>
                  <div className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded">Supplement</div>
                  <div className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-md border border-orange-400/30">Appeal</div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Sparkles className="h-4 w-4" />
                AI Letter Generator
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Claim Letters That Use Your Actual Data
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Our AI writes professional claim letters pre-filled with your property address, damage details, estimate amount, claim number, and adjuster info. Generate initial claims, supplement requests, or appeal letters — then copy, edit, and send.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Pulls from your estimate, claim tracker, and property details',
                  'Three letter types: initial claim, supplement, and appeal',
                  'Edit the draft, then copy to clipboard and send',
                  'References specific dollar amounts and damage documentation',
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

      {/* AI Insurance Advisor */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <MessageSquare className="h-4 w-4" />
                AI Insurance Advisor
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                An Advisor That Already Knows Your Situation
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                This isn&apos;t a generic chatbot. Your AI advisor sees your roof estimate, your claim status, your insurance company, your deductible, and your out-of-pocket gap. Ask it anything and get answers specific to your situation — not copy-pasted from a FAQ.
              </p>
              <div className="space-y-3">
                {[
                  'Knows your estimate amount, property, and damage type',
                  'Sees your claim status and adjuster info',
                  'Calculates your funding gap and suggests next steps',
                  'Aware of your financing and assistance program eligibility',
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
                  <span className="text-sm font-medium text-slate-300">AI Insurance Advisor</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#c9a25c]/10 rounded-lg p-3 text-sm text-slate-200 ml-8">
                    My adjuster is coming Thursday. What should I prepare?
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-3 text-sm text-slate-400 mr-4 space-y-2">
                    <p>
                      Based on your hail damage claim with State Farm, here&apos;s what to have ready for the adjuster visit:
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">1. Your documentation:</span> You&apos;ve uploaded 8 photos — make sure the close-ups of the north slope granule loss are accessible.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">2. Your estimate:</span> Your repair estimate is $18,500. Have a printed copy ready. The adjuster will compare against their own assessment.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">3. Don&apos;t agree on the spot.</span> If their number is lower, you can file a supplement request — I can generate that letter for you.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-[#c9a25c]/10 text-[#c9a25c] rounded-full px-2.5 py-1">Generate supplement letter</span>
                    <span className="text-[10px] bg-[#c9a25c]/10 text-[#c9a25c] rounded-full px-2.5 py-1">View documentation guide</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Coverage Gap Analysis */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Coverage Gap Calculator</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Roof Estimate</span>
                    <span className="text-slate-100 font-bold">$18,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Coverage Type</span>
                    <div className="flex bg-[#0c0f14] rounded-md overflow-hidden text-xs">
                      <span className="px-2.5 py-1 bg-[#c9a25c] text-[#0c0f14] font-medium">RCV</span>
                      <span className="px-2.5 py-1 text-slate-400">ACV</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deductible</span>
                    <div className="flex gap-1.5 text-xs">
                      <span className="px-2 py-1 bg-[#0c0f14] rounded text-slate-400">$500</span>
                      <span className="px-2 py-1 bg-[#c9a25c]/20 text-[#c9a25c] rounded font-medium border border-[#c9a25c]/30">$1,000</span>
                      <span className="px-2 py-1 bg-[#0c0f14] rounded text-slate-400">$2,500</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Expected Insurance Payout</span>
                      <span className="text-green-400 font-bold">$17,500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Your Out-of-Pocket</span>
                      <span className="text-[#c9a25c] font-bold">$1,000</span>
                    </div>
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-3 text-xs text-slate-500 mt-2">
                    With ACV and 15% depreciation, your payout drops to $14,725 and your gap increases to $3,775.
                    <span className="text-[#c9a25c]"> Try ACV mode to compare.</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <PieChart className="h-4 w-4" />
                Coverage Gap Analysis
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Know Your Out-of-Pocket Before You Commit
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Your payout depends on your deductible, whether you have Replacement Cost Value (RCV) or Actual Cash Value (ACV) coverage, and depreciation. Our calculator lets you model all of it so you know exactly what to expect — and what you&apos;ll need to cover another way.
              </p>
              <div className="space-y-3">
                {[
                  'Toggle between RCV and ACV to compare payouts',
                  'Adjust depreciation to see worst-case and best-case',
                  'See your exact funding gap — what insurance won\'t cover',
                  'Links directly to financing and assistance to close the gap',
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

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Get Started in Under 2 Minutes
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              No paperwork. No phone trees. Just enter what you know and the tools do the rest.
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <Camera className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Create Your Account
              </h3>
              <p className="text-slate-400">
                Sign up free and enter your insurance company and cause of damage. That&apos;s enough to start tracking and unlock all AI tools.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <ClipboardList className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Use the Tools
              </h3>
              <p className="text-slate-400">
                Generate letters, model your payout, document damage, and chat with your AI advisor. Each tool gets smarter as you add more info.
              </p>
            </div>

            <div className="text-center bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] mx-auto mb-6 shadow-lg">
                <Clock className="h-8 w-8 text-[#0c0f14]" />
              </div>
              <div className="text-sm text-[#c9a25c] font-medium mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Track to Settlement
              </h3>
              <p className="text-slate-400">
                Update your timeline as things move. If there&apos;s a gap, we&apos;ll show you exactly how financing and assistance programs can cover it.
              </p>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Guides, Checklists & Templates
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything you need to file correctly and build a strong claim
            </p>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{filingGuide?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{filingGuide?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide &bull; 6 Steps
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{documentationChecklist?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{documentationChecklist?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Checklist &bull; {Array.isArray(documentationChecklist?.content) ? documentationChecklist.content.length : 0} Items
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{adjusterPrep?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{adjusterPrep?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide &bull; Before, During & After
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-2">{appealGuide?.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{appealGuide?.description}</p>
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                    Guide &bull; Appeal Process
                  </span>
                </div>
              </div>
            </div>
          </ScrollStagger>
        </div>
      </section>

      {/* Insurance Company Directory */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1f2e] border border-slate-700 mb-6">
              <Building2 className="h-7 w-7 text-[#c9a25c]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Insurance Company Directory
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Quick access to claims hotlines for major insurance providers
            </p>
          </ScrollAnimate>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSURANCE_COMPANIES.map((company) => (
              <div
                key={company.name}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-100">{company.name}</h3>
                  <a
                    href={`tel:${company.claimsPhone.replace(/-/g, '')}`}
                    className="text-[#c9a25c] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {company.claimsPhone}
                  </a>
                </div>
                {company.claimsUrl && (
                  <a
                    href={company.claimsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={`Visit ${company.name} claims website`}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Topic: The Full Funding Picture */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Insurance Doesn&apos;t Cover Everything — Here&apos;s What Does
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Your AI advisor automatically calculates what insurance leaves uncovered and shows you how to close the gap with financing and assistance programs. All three tools share data so you get one complete funding picture.
            </p>
          </ScrollAnimate>

          {/* Funding waterfall */}
          <div className="max-w-md mx-auto bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 mb-10">
            <div className="text-sm text-slate-500 mb-4 text-center">How It Comes Together</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Your Roof Estimate</span>
                <span className="text-slate-100 font-bold">$18,500</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Insurance payout (after deductible)</span>
                <span className="font-medium">- $14,500</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Weatherization grant</span>
                <span className="font-medium">- $2,000</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700 pt-3 text-sm">
                <span className="text-slate-100 font-bold">Amount to finance</span>
                <div className="text-right">
                  <span className="text-[#c9a25c] font-bold text-lg">$2,000</span>
                  <span className="block text-xs text-slate-500">~$39/mo for 60 months</span>
                </div>
              </div>
            </div>
          </div>

          <ScrollStagger className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/financing" className="block">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 card-hover h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 mb-4">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Financing</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Get 3 AI-generated payment plans tailored to your credit and budget. The AI automatically subtracts your insurance payout.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  Explore Financing <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/assistance-programs" className="block">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 card-hover h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 mb-4">
                  <HandHeart className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Assistance Programs</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Answer 5 questions, get matched with 60+ programs. AI prioritizes which to apply for first. Grants don&apos;t require repayment.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  Check Eligibility <ArrowRight className="h-4 w-4" />
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
                <FileText className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Stop Wondering Where Your Claim Stands
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Create a free account, enter two fields, and unlock claim tracking, AI letters, payout modeling, and a personal advisor that knows your entire situation. Takes less than 2 minutes.
            </p>
            <div className="mt-8">
              <Link href="/customer/register?source=insurance">
                <Button
                  variant="primary"
                  size="xl"
                  className="text-lg shadow-lg bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  onClick={() => trackCTAClick('insurance_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Tracking Your Claim — It&apos;s Free
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
