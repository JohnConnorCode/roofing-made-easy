'use client'

import { useCallback } from 'react'
import { Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { ScrollAnimate } from '@/components/scroll-animate'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'
import { useAnalytics } from '@/lib/analytics'

interface FaqCtaProps {
  onGetStarted: () => void
  isCreating: boolean
}

export function FaqCta({ onGetStarted, isCreating }: FaqCtaProps) {
  const { trackEngagement } = useAnalytics()

  const handleFAQToggle = useCallback(
    (question: string, isOpen: boolean) => {
      if (isOpen) trackEngagement('faq_open', { question })
    },
    [trackEngagement]
  )

  return (
    <section
      aria-label="Questions and estimate"
      className="py-24 md:py-32 bg-gradient-to-b from-[#0c0f14] to-[#161a23] border-t border-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* FAQ — takes the lead because homeowners read before they act */}
          <ScrollAnimate className="lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
              Common questions
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05]">
              What homeowners
              <br />
              actually ask.
            </h2>
            <div className="mt-10">
              <FAQAccordion items={HOMEPAGE_FAQ_ITEMS} onItemToggle={handleFAQToggle} />
            </div>
          </ScrollAnimate>

          {/* Sticky CTA card */}
          <ScrollAnimate delay={150} className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="relative rounded-2xl border border-[#c9a25c]/25 bg-gradient-to-br from-slate-900/80 to-[#0c0f14] p-8 md:p-10 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#c9a25c]/15 blur-3xl pointer-events-none" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-50 font-display leading-tight">
                  Ready to see the number?
                </h3>
                <p className="mt-3 text-base text-slate-400 leading-relaxed">
                  Two minutes. Free. You walk away with a real estimate, no strings attached.
                </p>

                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Clock className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                    Two minutes, no account required
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Shield className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                    Insurance + financing tools
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Shield className="h-4 w-4 text-[#c9a25c] flex-shrink-0" />
                    Free forever &mdash; your info stays private
                  </li>
                </ul>

                <Button
                  variant="primary"
                  size="xl"
                  onClick={onGetStarted}
                  disabled={isCreating}
                  className="mt-8 w-full text-lg btn-press shadow-xl glow-gold hero-cta-pulse"
                >
                  {isCreating ? 'Starting…' : 'Get my free estimate'}
                </Button>
              </div>
            </div>
          </ScrollAnimate>
        </div>
      </div>
    </section>
  )
}
