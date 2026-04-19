'use client'

import Link from 'next/link'
import { ArrowRight, Shield, CreditCard, HandHeart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ResourceKey = 'insurance' | 'financing' | 'assistance'

interface Resource {
  key: ResourceKey
  href: string
  eyebrow: string
  title: string
  body: string
  icon: LucideIcon
  accent: string
}

const RESOURCES: Resource[] = [
  {
    key: 'insurance',
    href: '/insurance-help',
    eyebrow: 'Insurance',
    title: 'Navigate your claim',
    body: 'Document storm damage, meet the adjuster, and make sure the claim reflects what\u2019s really on your roof.',
    icon: Shield,
    accent: 'text-blue-400',
  },
  {
    key: 'financing',
    href: '/financing',
    eyebrow: 'Financing',
    title: 'Turn it into a monthly number',
    body: 'Pre-qualify without a credit pull. Real terms, real APRs, and three plans before you commit.',
    icon: CreditCard,
    accent: 'text-[#c9a25c]',
  },
  {
    key: 'assistance',
    href: '/assistance-programs',
    eyebrow: 'Assistance',
    title: 'Programs you may qualify for',
    body: 'State, county, and nonprofit programs for Northeast Mississippi homeowners. Most don\u2019t know they exist.',
    icon: HandHeart,
    accent: 'text-emerald-400',
  },
]

interface ResourceTriangleProps {
  exclude: ResourceKey
  className?: string
}

export function ResourceTriangle({ exclude, className }: ResourceTriangleProps) {
  const items = RESOURCES.filter((r) => r.key !== exclude)

  return (
    <section
      aria-label="Related resources"
      className={`border-t border-slate-800/80 bg-[#0c0f14] py-20 md:py-24 ${className ?? ''}`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c]">
            Keep going
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-50 font-display leading-tight">
            Your roof is usually a stack &mdash; not a single bill.
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-300 leading-relaxed">
            Most homeowners end up combining insurance, assistance, and
            financing. Here&rsquo;s the next piece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {items.map((r) => {
            const Icon = r.icon
            return (
              <Link
                key={r.key}
                href={r.href}
                className="group relative flex flex-col rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#141925] via-[#11151e] to-[#0e1218] p-7 transition-all duration-300 hover:border-slate-700 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${r.accent}`} />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-500">
                    {r.eyebrow}
                  </span>
                </div>

                <h3 className="mt-6 text-xl md:text-2xl font-semibold text-slate-50 font-display leading-snug">
                  {r.title}
                </h3>

                <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-grow">
                  {r.body}
                </p>

                <p className={`mt-6 inline-flex items-center gap-1.5 text-sm font-medium ${r.accent} group-hover:gap-2 transition-all`}>
                  Open the guide
                  <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
