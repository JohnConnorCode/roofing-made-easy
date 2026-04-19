'use client'

import Link from 'next/link'
import { ArrowRight, Shield, HandHeart, CreditCard, Sparkles } from 'lucide-react'
import { ScrollAnimate } from '@/components/scroll-animate'

/**
 * Funding waterfall — insurance, assistance, and financing stacked against
 * a typical replacement. Content is illustrative; every number is labeled.
 */

const PATHS = [
  {
    icon: Shield,
    label: 'Insurance',
    body: "Hail or wind damage in the last year? Often the single biggest lever. We document the roof and walk the claim with you.",
    href: '/insurance-help',
    accent: 'text-blue-400',
    edge: 'before:bg-blue-500/70',
  },
  {
    icon: HandHeart,
    label: 'Assistance programs',
    body: 'State, county, and nonprofit programs. A lot of homeowners qualify and never knew the programs existed.',
    href: '/assistance-programs',
    accent: 'text-emerald-400',
    edge: 'before:bg-emerald-500/70',
  },
  {
    icon: CreditCard,
    label: 'Financing',
    body: 'If there\u2019s a gap, pre-qualify without a credit pull. Real monthly numbers, real APR, no surprises.',
    href: '/financing',
    accent: 'text-[#c9a25c]',
    edge: 'before:bg-[#c9a25c]/80',
  },
] as const

export function FundingWaterfall() {
  return (
    <section
      aria-label="Ways to pay"
      className="relative py-24 md:py-32 bg-gradient-to-b from-[#0c0f14] via-[#0e1218] to-[#0c0f14] border-t border-slate-900 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 70% 0%, rgba(201,162,92,0.1), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* LEFT: Editorial headline + context + CTA */}
          <div className="lg:col-span-5 lg:pt-6 lg:sticky lg:top-24">
            <ScrollAnimate>
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
                <Sparkles className="h-3.5 w-3.5" />
                Ways to pay
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.02] tracking-tight">
                Most homeowners
                <br />
                <span className="bg-gradient-to-r from-[#e6c588] via-[#d4b06c] to-[#c9a25c] bg-clip-text text-transparent">
                  don&rsquo;t pay sticker.
                </span>
              </h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Insurance, assistance programs, and financing stack in a
                specific order. Here&rsquo;s what&rsquo;s usually left when
                they do.
              </p>

              <div className="mt-8 hidden lg:block">
                <Link
                  href="/financing"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#c9a25c] hover:text-[#e6c588] transition-colors"
                >
                  See a real payment breakdown
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollAnimate>
          </div>

          {/* RIGHT: Premium waterfall card */}
          <div className="lg:col-span-7">
            <ScrollAnimate delay={100}>
              <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#141925] via-[#11151e] to-[#0e1218] p-5 md:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] card-inner-glow">
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a25c] font-medium">
                      Illustrative example
                    </p>
                    <p className="mt-1 text-sm text-slate-300 font-medium">
                      $25,000 replacement
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Yours will differ
                  </p>
                </div>

                <div className="space-y-4">
                  <Row
                    label="Starting estimate"
                    amount="$25,000"
                    percent={100}
                    tone="base"
                  />
                  <Row
                    label="After insurance"
                    amount="−$15,000"
                    percent={40}
                    tone="blue"
                  />
                  <Row
                    label="After assistance"
                    amount="−$5,000"
                    percent={20}
                    tone="emerald"
                  />
                  <Row
                    label="What you finance"
                    amount="$5,000"
                    percent={20}
                    tone="gold"
                    emphasize
                  />
                </div>

                <div className="mt-7 rounded-2xl border border-[#c9a25c]/25 bg-[#c9a25c]/5 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a25c] font-medium">
                      Monthly payment on what&rsquo;s left
                    </p>
                    <p className="mt-1 text-2xl md:text-3xl font-bold text-slate-50 font-display tabular-nums">
                      ~$89<span className="text-slate-500 font-normal text-lg">/mo</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 leading-snug flex-shrink-0">
                    60-month term
                    <br />
                    sample APR
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          </div>
        </div>

        {/* Editorial path cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {PATHS.map((path, idx) => {
            const Icon = path.icon
            return (
              <ScrollAnimate key={path.label} delay={150 + idx * 80}>
                <Link
                  href={path.href}
                  className={`group relative flex h-full flex-col rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#141925] via-[#11151e] to-[#0e1218] p-7 overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 hover:before:opacity-100 ${path.edge}`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl md:text-5xl font-bold text-[#c9a25c]/80 font-display tabular-nums leading-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <Icon className={`h-5 w-5 ${path.accent}`} />
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold text-slate-50 font-display leading-snug">
                    {path.label}
                  </h3>

                  <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-grow">
                    {path.body}
                  </p>

                  <p className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${path.accent} group-hover:gap-2 transition-all`}>
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
          ? 'bg-gradient-to-r from-[#c9a25c] to-[#9a7432] shadow-[0_0_20px_rgba(201,162,92,0.25)]'
          : 'bg-gradient-to-r from-slate-600/60 to-slate-500/40'

  const amountClass = emphasize ? 'text-[#c9a25c]' : 'text-slate-100'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <span className={`text-lg font-semibold tabular-nums ${amountClass}`}>
          {amount}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800/70 overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass} transition-[width] duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
