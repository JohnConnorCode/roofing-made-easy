'use client'

import { CreditCard, FileText, HandHeart, LayoutDashboard, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ScrollAnimate, ScrollStagger } from '@/components/scroll-animate'

const CARDS = [
  {
    icon: CreditCard,
    title: 'Financing Calculator',
    subtitle: 'See your monthly payment in 30 seconds',
    features: [
      'Pre-qualify with no credit impact',
      'AI-powered payment scenarios',
      'Rates from $89/month',
    ],
    href: '/financing',
    linkText: 'Check Your Options',
  },
  {
    icon: FileText,
    title: 'Insurance Claim Help',
    subtitle: 'Maximize your insurance payout',
    features: [
      'AI demand letter generator',
      'Step-by-step claim tracker',
      'Documentation guide',
    ],
    href: '/insurance-help',
    linkText: 'Get Help',
  },
  {
    icon: HandHeart,
    title: 'Assistance Programs',
    subtitle: '50+ programs you might qualify for',
    features: [
      'Federal, state, and local grants',
      'Eligibility checker',
      'Benefit calculator',
    ],
    href: '/assistance-programs',
    linkText: 'See Programs',
  },
  {
    icon: LayoutDashboard,
    title: 'Customer Portal',
    subtitle: 'Your project, tracked start to finish',
    features: [
      'Shareable estimates & PDF downloads',
      'Project timeline tracking',
      'All tools in one dashboard',
    ],
    href: null,
    linkText: null,
  },
] as const

export function PlatformValue() {
  return (
    <section className="py-14 md:py-20 bg-glow-warm border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            Everything You Need, Under One Roof
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Your estimate is just the beginning. We help you finance it, insure it, and track it.
          </p>
        </ScrollAnimate>

        <ScrollStagger simple className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon
            const inner = (
              <div className="bg-[#1a1f2e] border border-slate-700/50 rounded-2xl p-5 md:p-6 h-full card-inner-glow card-hover-premium flex flex-col">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c9a25c]/15 border border-[#c9a25c]/30 mb-4">
                  <Icon className="h-7 w-7 text-[#c9a25c]" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{card.title}</h3>
                <p className="text-sm text-[#c9a25c] mb-4">{card.subtitle}</p>
                <ul className="space-y-2 mb-4 flex-1">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-[#c9a25c] mt-0.5 flex-shrink-0">&#x2713;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {card.linkText && (
                  <span className="text-[#c9a25c] text-sm font-medium inline-flex items-center gap-1 mt-auto">
                    {card.linkText} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </div>
            )

            if (card.href) {
              return (
                <Link key={card.title} href={card.href} className="block group">
                  {inner}
                </Link>
              )
            }
            return <div key={card.title}>{inner}</div>
          })}
        </ScrollStagger>
      </div>
    </section>
  )
}
