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
} from 'lucide-react'
import { SiteHeader, SiteFooter } from '@/components/layout'

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
              Financing Calculator
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed animate-slide-up delay-100">
              See what your new roof could cost per month. Make your project affordable with flexible financing options.
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
              <h2 className="text-xl font-bold text-slate-100 mb-6">Enter Your Details</h2>

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
                    Don't know yet? <Link href="/" className="text-[#c9a25c] hover:underline">Get an estimate</Link>
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
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Apply for Financing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-[#161a23]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
            Why Finance Your Roof?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {[
              {
                title: 'Protect Your Home Now',
                desc: 'Don\'t wait for roof damage to get worse. Fix it now and pay over time.',
              },
              {
                title: 'Keep Cash Available',
                desc: 'Preserve your savings for emergencies while still getting the roof you need.',
              },
              {
                title: 'Flexible Terms',
                desc: 'Choose a payment plan that fits your budget, from 3 to 10 years.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3d7a5a]/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-[#3d7a5a]" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Qualification Section */}
      <section className="py-16 md:py-24 bg-[#0c0f14]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a25c]/10 border border-[#c9a25c]/30 px-4 py-2 text-sm text-[#c9a25c] mb-6">
                <CreditCard className="h-4 w-4" />
                Pre-Qualification Available
              </div>
              <h2 className="text-3xl font-bold text-slate-100 md:text-4xl mb-6">
                Get Pre-Qualified in Minutes
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                Create a free account to get personalized financing options based on your credit profile. See what you qualify for without affecting your credit score.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#3d7a5a]/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[#3d7a5a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Quick Pre-Approval</h4>
                    <p className="text-sm text-slate-400">Get matched with lenders in as little as 60 seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#3d7a5a]/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#3d7a5a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">No Impact on Credit</h4>
                    <p className="text-sm text-slate-400">Soft credit check only during pre-qualification</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#3d7a5a]/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#3d7a5a]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">Compare Multiple Offers</h4>
                    <p className="text-sm text-slate-400">See rates from multiple lenders side by side</p>
                  </div>
                </div>
              </div>

              <Link href="/customer/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[#c9a25c] to-[#b5893a] text-[#0c0f14] border-0"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#161a23] border border-slate-700 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-100 mb-6">
                Benefits of Creating an Account
              </h3>
              <ul className="space-y-4">
                {[
                  'Get personalized rate quotes from multiple lenders',
                  'Track your pre-qualification status in real-time',
                  'Save and compare different financing options',
                  'Securely upload documents for faster approval',
                  'Get notified when better rates become available',
                  'Access special financing programs and promotions',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#3d7a5a] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
