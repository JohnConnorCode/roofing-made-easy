'use client'

import Link from 'next/link'
import { ArrowRight, Shield, HandHeart, CreditCard } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'

/**
 * Funding waterfall — shows how insurance + assistance + financing stack
 * against a typical replacement. Numbers are illustrative and disclosed
 * as such.
 */

const STEPS = [
  {
    icon: Shield,
    label: 'Insurance',
    body: "Hail or wind damage in the last year? Often the single biggest lever. We'll document and meet the adjuster.",
    href: '/insurance-help',
    accent: 'text-blue-400',
    ring: 'border-blue-500/25',
  },
  {
    icon: HandHeart,
    label: 'Assistance programs',
    body: 'State, county, and nonprofit programs. A lot of homeowners qualify and don\u2019t know it.',
    href: '/assistance-programs',
    accent: 'text-emerald-400',
    ring: 'border-emerald-500/25',
  },
  {
    icon: CreditCard,
    label: 'Financing',
    body: 'If there\u2019s a gap, pre-qualify without a credit pull. Real monthly numbers, real APR.',
    href: '/financing',
    accent: 'text-[#c9a25c]',
    ring: 'border-[#c9a25c]/30',
  },
]

export function FundingWaterfall() {
  return (
    <section
      aria-label="Ways to pay"
      className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate>
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              Ways to pay
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              Most homeowners
              <br />
              don&rsquo;t pay sticker.
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-xl">
              Insurance, assistance programs, and financing usually stack in a specific order.
              Here&rsquo;s how we think about it.
            </p>
          </div>
        </ScrollAnimate>

        {/* Illustrative stack chart */}
        <ScrollAnimate delay={100}>
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-[#0c0f14] p-6 md:p-8 mb-10">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Example: $25,000 replacement
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Illustrative numbers. Yours will differ.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Row label="Starting estimate" amount="$25,000" percent={100} tone="base" />
              <Row label="After insurance" amount="−$15,000" percent={40} tone="blue" />
              <Row label="After assistance" amount="−$5,000" percent={20} tone="emerald" />
              <Row label="What you finance" amount="$5,000" percent={20} tone="gold" emphasize />
            </div>

            <p className="mt-6 pt-5 border-t border-slate-800 text-sm text-slate-400">
              Roughly <span className="text-[#c9a25c] font-semibold">$89/mo</span> on a 60-month term at this example.
            </p>
          </div>
        </ScrollAnimate>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <ScrollAnimate key={step.label} delay={150 + idx * 80}>
                <Link
                  href={step.href}
                  className={`group block h-full rounded-2xl border ${step.ring} bg-slate-950/40 p-6 hover:bg-slate-900/60 transition-colors`}
                >
                  <Icon className={`h-5 w-5 ${step.accent} mb-4`} />
                  <h3 className="text-lg font-semibold text-slate-50 font-display">
                    {step.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {step.body}
                  </p>
                  <p className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${step.accent} group-hover:gap-2 transition-all`}>
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </Link>
              </ScrollAnimate>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Row({
  label,
  amount,
  percent,
  tone,
  emphasize,
}: {
  label: string
  amount: string
  percent: number
  tone: 'base' | 'blue' | 'emerald' | 'gold'
  emphasize?: boolean
}) {
  const barClass =
    tone === 'blue'
      ? 'bg-gradient-to-r from-blue-600/70 to-blue-500/50'
      : tone === 'emerald'
        ? 'bg-gradient-to-r from-emerald-600/70 to-emerald-500/50'
        : tone === 'gold'
          ? 'bg-gradient-to-r from-[#c9a25c] to-[#9a7432]'
          : 'bg-gradient-to-r from-slate-600/60 to-slate-500/40'

  const amountClass = emphasize ? 'text-[#c9a25c]' : 'text-slate-100'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-base font-semibold tabular-nums ${amountClass}`}>
          {amount}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass} transition-[width] duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
