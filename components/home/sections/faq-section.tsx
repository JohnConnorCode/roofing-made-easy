'use client'

import { useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import { FAQAccordion } from '@/components/faq/faq-accordion'
import { ScrollAnimate } from '@/components/scroll-animate'
import { HOMEPAGE_FAQ_ITEMS } from '@/lib/data/homepage-faq'
import { useAnalytics } from '@/lib/analytics'

export function FAQSection() {
  const { trackEngagement } = useAnalytics()

  const handleFAQToggle = useCallback(
    (question: string, isOpen: boolean) => {
      if (isOpen) {
        trackEngagement('faq_open', { question })
      }
    },
    [trackEngagement]
  )

  return (
    <section className="py-14 md:py-20 bg-[#161a23] bg-texture-dark border-t border-slate-800">
      <div className="mx-auto max-w-3xl px-4">
        <ScrollAnimate className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#c9a25c]/15 border border-[#c9a25c]/30 mb-6">
            <HelpCircle className="h-7 w-7 text-[#c9a25c]" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 md:text-4xl font-display">
            Common Questions
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Everything you need to know about our instant estimates
          </p>
        </ScrollAnimate>

        <ScrollAnimate delay={100}>
          <FAQAccordion items={HOMEPAGE_FAQ_ITEMS} onItemToggle={handleFAQToggle} />
        </ScrollAnimate>
      </div>
    </section>
  )
}
