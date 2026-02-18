'use client'

import { FileText, HandHeart, CreditCard, LayoutDashboard, ArrowRight, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'
import { CountUp } from '@/components/ui/count-up'

const WATERFALL_STEPS = [
  {
    icon: Sparkles,
    label: 'Estimated Roof Cost',
    amount: 25000,
    deduction: null,
    barPercent: 100,
    color: 'from-slate-500 to-slate-600',
    textColor: 'text-slate-300',
  },
  {
    icon: Shield,
    label: 'Insurance Coverage',
    amount: 10000,
    deduction: -15000,
    barPercent: 40,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-400',
  },
  {
    icon: HandHeart,
    label: 'Assistance Programs',
    amount: 5000,
    deduction: -5000,
    barPercent: 20,
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-400',
  },
  {
    icon: CreditCard,
    label: 'Finance the Rest',
    amount: 5000,
    deduction: null,
    barPercent: 20,
    color: 'from-[#c9a25c] to-[#9a7432]',
    textColor: 'text-[#c9a25c]',
    highlight: true,
  },
]

const QUICK_LINKS = [
  { icon: CreditCard, label: 'Financing Calculator', href: '/financing' },
  { icon: Shield, label: 'Insurance Help', href: '/insurance-help' },
  { icon: HandHeart, label: 'Assistance Programs', href: '/assistance-programs' },
  { icon: LayoutDashboard, label: 'Customer Portal', href: null },
]

export function FundingWaterfall() {
  return (
    <section className="py-14 md:py-20 bg-glow-warm border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            See How Funding Stacks Up
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Insurance, assistance programs, and financing work together so you never pay full price out of pocket.
          </p>
        </ScrollAnimate>

        {/* Waterfall */}
        <ScrollStagger simple className="max-w-2xl mx-auto space-y-4 mb-8">
          {WATERFALL_STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.label}
                className={`bg-[#1a1f2e] border rounded-xl p-4 md:p-5 ${
                  step.highlight
                    ? 'border-[#c9a25c]/40 shadow-gold-glow'
                    : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    step.highlight ? 'bg-[#c9a25c]/20 border border-[#c9a25c]/30' : 'bg-slate-700/50'
                  }`}>
                    <Icon className={`h-5 w-5 ${step.highlight ? 'text-[#c9a25c]' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-300">{step.label}</span>
                      <div className="flex items-center gap-2">
                        {step.deduction !== null && (
                          <span className="text-sm font-semibold text-emerald-400">
                            -$<CountUp end={Math.abs(step.deduction)} duration={1200} />
                          </span>
                        )}
                        <span className={`text-lg font-bold ${step.highlight ? 'text-[#c9a25c]' : 'text-slate-100'}`}>
                          $<CountUp end={step.amount} duration={1200} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-2.5 rounded-full bg-slate-700/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-700`}
                    style={{ width: `${step.barPercent}%` }}
                  />
                </div>
              </div>
            )
          })}

          {/* Final emphasized result */}
          <div className="text-center pt-2">
            <p className="text-lg text-slate-300">
              <span className="font-bold text-[#c9a25c]">$5,000</span> remaining &mdash; from{' '}
              <span className="font-bold text-[#c9a25c]">~$89/mo</span>
            </p>
          </div>
        </ScrollStagger>

        {/* Quick links */}
        <ScrollAnimate delay={200}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {QUICK_LINKS.map(({ icon: Icon, label, href }) => {
              const inner = (
                <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-700/50 rounded-xl px-3 py-2.5 hover:border-[#c9a25c]/30 transition-colors group">
                  <Icon className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                  <span className="text-xs text-slate-300">{label}</span>
                  {href && <ArrowRight className="h-3 w-3 text-slate-500 ml-auto group-hover:text-[#c9a25c] transition-colors" />}
                </div>
              )
              if (href) {
                return <Link key={label} href={href}>{inner}</Link>
              }
              return <div key={label}>{inner}</div>
            })}
          </div>
        </ScrollAnimate>
      </div>
    </section>
  )
}
