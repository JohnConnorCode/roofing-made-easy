'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  Calculator,
  ArrowRight,
  DollarSign,
  CheckCircle,
  UserPlus,
  CreditCard,
  Clock,
  Shield,
  TrendingUp,
  Sparkles,
  MessageSquare,
  BarChart3,
  FileText,
  HandHeart,
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { usePhoneDisplay, usePhoneLink } from '@/lib/config/business-provider'
import { useAnalytics } from '@/lib/analytics'

const TERM_OPTIONS = [
  { value: '36', label: '36 months (3 years)' },
  { value: '60', label: '60 months (5 years)' },
  { value: '84', label: '84 months (7 years)' },
  { value: '120', label: '120 months (10 years)' },
]

const RATE_OPTIONS = [
  { value: '6.99', label: '6.99% (Excellent Credit)' },
  { value: '9.99', label: '9.99% (Good Credit)' },
  { value: '12.99', label: '12.99% (Fair Credit)' },
  { value: '15.99', label: '15.99% (Average Credit)' },
]

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

export default function FinancingContent() {
  const { trackCTAClick } = useAnalytics()
  const phoneDisplay = usePhoneDisplay()
  const phoneLinkHref = usePhoneLink()

  const [projectCost, setProjectCost] = useState('')
  const [term, setTerm] = useState('60')
  const [rate, setRate] = useState('9.99')

  const cost = parseFloat(projectCost) || 0
  const months = parseInt(term)
  const annualRate = parseFloat(rate)
  const monthlyPayment = cost > 0 ? calculateMonthlyPayment(cost, annualRate, months) : 0
  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - cost

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a25c]/20 mb-6">
              <Calculator className="h-8 w-8 text-[#c9a25c]" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100 md:text-5xl animate-slide-up">
              Affordable Monthly Payments for Your New Roof
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              Use the calculator below to estimate your monthly payment. Then create a free account to get 3 AI-generated payment plans tailored to your credit, budget, and insurance payout — with an affordability check before you apply.
            </p>
            <p className="mt-4 text-sm text-slate-500 animate-slide-up delay-200">
              Or call <a href={phoneLinkHref} className="text-[#c9a25c] hover:underline">{phoneDisplay}</a> — we&apos;re happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Estimate Your Payment</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Cost
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="number"
                      placeholder="15000"
                      value={projectCost}
                      onChange={(e) => setProjectCost(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-600 bg-[#0c0f14] text-slate-100 placeholder:text-slate-500 focus:border-[#c9a25c] focus:outline-none focus:ring-2 focus:ring-[#c9a25c]/20"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Don&apos;t know yet? <Link href="/" className="text-[#c9a25c] hover:underline">Get a free estimate</Link>
                  </p>
                </div>

                <Select
                  label="Loan Term"
                  options={TERM_OPTIONS}
                  value={term}
                  onChange={setTerm}
                />

                <Select
                  label="Interest Rate (based on credit)"
                  options={RATE_OPTIONS}
                  value={rate}
                  onChange={setRate}
                />
              </div>
            </div>

            {/* Results */}
            <div>
              <div className="bg-gradient-to-br from-[#c9a25c]/20 to-[#1a1f2e] border border-[#c9a25c]/30 rounded-2xl p-8 mb-6">
                <p className="text-slate-400 mb-2">Estimated Monthly Payment</p>
                <p className="text-5xl font-bold text-[#c9a25c]">
                  ${monthlyPayment.toFixed(2)}
                </p>
                <p className="text-slate-500 text-sm mt-2">per month for {months} months</p>
              </div>

              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Project Cost</span>
                  <span className="text-slate-100 font-medium">${cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Interest</span>
                  <span className="text-slate-100 font-medium">${totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-4">
                  <span className="text-slate-400">Total Payment</span>
                  <span className="text-slate-100 font-bold">${totalPayment.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/customer/register?source=financing">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    onClick={() => trackCTAClick('financing_cta_clicked')}
                  >
                    Get Personalized Plans — Free
                  </Button>
                </Link>
                <p className="text-xs text-slate-500 text-center mt-2">No credit pull. No obligation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get with an account — AI Scenarios */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <Sparkles className="h-4 w-4" />
                AI Payment Scenarios
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                The Calculator Is Just the Start
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Create a free account and the AI generates 3 custom payment plans based on your credit range, your roof estimate, and your insurance payout. If insurance covers $12K of an $18K roof, the AI builds scenarios for the $6K you actually need to finance — not the full amount.
              </p>
              <div className="space-y-3">
                {[
                  'Plans tailored to your actual credit range and estimate',
                  'Automatically subtracts your insurance payout',
                  'Shows monthly payment, total interest, and a recommendation for each',
                  'Compares Lowest Total Cost vs. Best Monthly vs. Balanced',
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
                  <span className="text-sm text-slate-500">Your AI Payment Scenarios</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Lowest Total Cost', term: '36 mo', rate: '7.49%', monthly: '$187', interest: '$732', rec: true },
                    { name: 'Balanced', term: '60 mo', rate: '7.49%', monthly: '$119', interest: '$1,140', rec: false },
                    { name: 'Best Monthly', term: '120 mo', rate: '8.99%', monthly: '$76', interest: '$3,120', rec: false },
                  ].map((scenario, i) => (
                    <div key={i} className={`bg-[#0c0f14] rounded-lg p-4 ${scenario.rec ? 'border border-[#c9a25c]/30' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-200">{scenario.name}</span>
                        {scenario.rec && <span className="text-[10px] bg-[#c9a25c]/20 text-[#c9a25c] px-2 py-0.5 rounded-full">Recommended</span>}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#c9a25c]">{scenario.monthly}</span>
                        <span className="text-xs text-slate-500">/mo for {scenario.term}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500">
                        <span>{scenario.rate} APR</span>
                        <span>{scenario.interest} total interest</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Based on $6,000 after $12K insurance payout &bull; Good credit
                </p>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Affordability Analyzer */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Affordability Check</div>
                <div className="space-y-4">
                  {[
                    { term: '36 months', payment: '$187/mo', pct: '3.0%', level: 'Comfortable', color: 'bg-emerald-400', barWidth: 'w-[30%]', textColor: 'text-emerald-400' },
                    { term: '60 months', payment: '$119/mo', pct: '1.9%', level: 'Comfortable', color: 'bg-emerald-400', barWidth: 'w-[19%]', textColor: 'text-emerald-400' },
                    { term: '120 months', payment: '$76/mo', pct: '1.2%', level: 'Comfortable', color: 'bg-emerald-400', barWidth: 'w-[12%]', textColor: 'text-emerald-400' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#0c0f14] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">{item.term}</span>
                        <span className="text-sm font-bold text-slate-100">{item.payment}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full ${item.color} rounded-full ${item.barWidth}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${item.textColor}`}>{item.level}</span>
                        <span className="text-xs text-slate-500">{item.pct} of monthly income</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">Based on $75K annual income</p>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <BarChart3 className="h-4 w-4" />
                Affordability Analyzer
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Know If You Can Afford It Before You Apply
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Enter your income range and the analyzer maps each payment option against your budget. Green means comfortable (under 5% of income). Amber means manageable. Red means it&apos;s a stretch. You&apos;ll know before you ever fill out an application.
              </p>
              <div className="space-y-3">
                {[
                  'Color-coded: comfortable, manageable, or stretch',
                  'Compares all loan terms side by side',
                  'Uses your actual estimate and credit range',
                  'No credit pull — just enter your income bracket',
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

      {/* AI Financing Advisor */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <MessageSquare className="h-4 w-4" />
                AI Financing Advisor
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Ask It Anything About Your Financing Options
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Your AI advisor knows your roof estimate, your credit range, your income bracket, your insurance claim status, and your eligible assistance programs. Ask &ldquo;Should I do 60 or 120 months?&rdquo; and get an answer based on your actual numbers — not a generic rule of thumb.
              </p>
              <div className="space-y-3">
                {[
                  'Knows your estimate, credit, income, and insurance payout',
                  'Suggests whether to finance, use insurance, or apply for grants',
                  'Explains how a new roof affects your home value',
                  'Helps you decide between loan terms with real math',
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
                  <span className="text-sm font-medium text-slate-300">AI Financing Advisor</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#c9a25c]/10 rounded-lg p-3 text-sm text-slate-200 ml-8">
                    Should I do 60 or 120 months? I want the lowest monthly but don&apos;t want to pay too much interest.
                  </div>
                  <div className="bg-[#0c0f14] rounded-lg p-3 text-sm text-slate-400 mr-4 space-y-2">
                    <p>
                      With your good credit and the $6,000 you need to finance (after your $12K insurance payout), here&apos;s the tradeoff:
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">60 months:</span> $119/mo, $1,140 in total interest. That&apos;s 1.9% of your monthly income — very comfortable.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">120 months:</span> $76/mo saves $43/month but costs $1,980 more in interest over the life of the loan.
                    </p>
                    <p>
                      <span className="text-slate-300 font-medium">My recommendation:</span> Go with 60 months. You can comfortably afford it and you&apos;ll save nearly $2,000 in interest.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Pre-Qualification + Tracking */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimate delay={100} className="order-2 md:order-1">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="text-sm text-slate-500 mb-4">Application Status</div>
                <div className="space-y-0">
                  {[
                    { label: 'Submitted', detail: 'Feb 3', done: true, color: 'bg-blue-400' },
                    { label: 'In Review', detail: 'Feb 4', done: true, color: 'bg-purple-400' },
                    { label: 'Pre-Qualified', detail: 'Feb 5', done: true, color: 'bg-[#c9a25c]', current: true },
                    { label: 'Application Sent', detail: 'Pending', done: false, color: 'bg-slate-700' },
                    { label: 'Approved', detail: 'Pending', done: false, color: 'bg-slate-700' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < 4 && (
                        <div className={`absolute left-[5px] top-[14px] w-0.5 h-full ${step.done ? 'bg-slate-600' : 'bg-slate-800'}`} />
                      )}
                      <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${step.color} ${step.current ? 'ring-4 ring-[#c9a25c]/20' : ''}`} />
                      <div className="pb-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={step.done ? 'text-slate-100 font-medium text-sm' : 'text-slate-500 text-sm'}>{step.label}</span>
                          <span className="text-xs text-slate-600">{step.detail}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0c0f14] rounded-lg p-3 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pre-Approved Amount</span>
                    <span className="text-[#c9a25c] font-bold">$6,000</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Rate</span>
                    <span className="text-slate-200">7.49% APR</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <CreditCard className="h-4 w-4" />
                Pre-Qualification
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-4">
                Pre-Qualify in 60 Seconds. Track Every Step.
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Fill out a short form — just your amount, credit range, and optionally income and employment. No hard credit pull. Then track your application from submission through pre-qualification to approval, all in one dashboard.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Soft credit check only — no impact on your score',
                  'See pre-approved amount and rate when qualified',
                  'Track status updates in real time',
                  'Upload documents for faster processing',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/customer/register?source=financing">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => trackCTAClick('financing_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Pre-Qualified — Free
                </Button>
              </Link>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Cross-Topic: Lower What You Finance */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Finance Less by Using Insurance and Grants First
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Your AI advisor sees the full picture. If you have an insurance claim or qualify for grants, the financing tools automatically adjust — you only finance what&apos;s left.
            </p>
          </ScrollAnimate>

          {/* Visual Breakdown */}
          <div className="max-w-md mx-auto bg-[#1a1f2e] border border-slate-700 rounded-2xl p-6 mb-10">
            <div className="text-sm text-slate-500 mb-4 text-center">Example: How the Three Work Together</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Roof Estimate</span>
                <span className="text-slate-100 font-bold">$15,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Insurance covers</span>
                <span className="font-medium">- $8,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-400">
                <span>Assistance grants</span>
                <span className="font-medium">- $3,000</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700 pt-3 text-sm">
                <span className="text-slate-100 font-bold">You finance</span>
                <div className="text-right">
                  <span className="text-[#c9a25c] font-bold text-lg">$4,000</span>
                  <span className="block text-xs text-slate-500">~$89/mo for 60 months</span>
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
                <h3 className="text-lg font-bold text-slate-100 mb-2">Have Storm Damage?</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Track your insurance claim, generate AI letters, and model your payout with our free tools. Whatever insurance covers, you don&apos;t finance.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  Insurance Help <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link href="/assistance-programs" className="block">
              <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl p-8 card-hover h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 mb-4">
                  <HandHeart className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Qualify for Grants?</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Answer 5 questions, get matched with 60+ programs. Grants reduce your principal — money you don&apos;t borrow, don&apos;t pay interest on.
                </p>
                <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1">
                  Find Programs <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </ScrollStagger>
        </div>
      </section>

      {/* Why Finance */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimate className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
              Why Finance Your Roof?
            </h2>
          </ScrollAnimate>

          <ScrollStagger className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Protect Your Home Now',
                desc: 'A damaged roof gets worse. Fix it now and pay over time instead of waiting for savings.',
              },
              {
                icon: DollarSign,
                title: 'Keep Cash Available',
                desc: 'Preserve your savings for emergencies while still getting the roof you need.',
              },
              {
                icon: TrendingUp,
                title: 'Increase Home Value',
                desc: 'A new roof adds an average of $15,000+ in home value. It often pays for itself.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-[#3d7a5a]" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#161a23] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ScrollAnimate>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a25c] to-[#9a7432] shadow-lg">
                <Calculator className="h-8 w-8 text-[#0c0f14]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 md:text-4xl">
              Go Beyond the Calculator
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Create a free account to get AI-generated payment plans, an affordability check, pre-qualification tracking, and a personal advisor that knows your full financial picture.
            </p>
            <div className="mt-8">
              <Link href="/customer/register?source=financing">
                <Button
                  variant="primary"
                  size="xl"
                  className="text-lg shadow-lg bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  onClick={() => trackCTAClick('financing_cta_clicked')}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Or call <a href={phoneLinkHref} className="text-[#c9a25c] hover:underline">{phoneDisplay}</a> — we&apos;re happy to help.
            </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-[#0c0f14] border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs text-slate-500 text-center">
            * This calculator provides estimates only. Actual rates and terms depend on credit approval and lender requirements.
            Always compare offers from multiple lenders before making a decision.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
