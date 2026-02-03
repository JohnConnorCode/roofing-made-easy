// Comparison Page FAQ Component
// City-specific FAQ with schema markup

'use client'

import { useState } from 'react'
import { MSCity } from '@/lib/data/ms-locations'
import { ChevronDown } from 'lucide-react'
import { generateComparisonFaqs, ComparisonFAQItem } from '@/lib/data/comparison-faqs'

// Re-export for backwards compatibility
export { generateComparisonFaqs, type ComparisonFAQItem } from '@/lib/data/comparison-faqs'

interface ComparisonFAQProps {
  city: MSCity
  customFaqs?: ComparisonFAQItem[]
}

export function ComparisonFAQ({ city, customFaqs }: ComparisonFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = customFaqs || generateComparisonFaqs(city)

  return (
    <section className="py-12 md:py-16 bg-slate-deep">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400">
              Common questions about finding roofers in {city.name}, {city.stateCode}
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-ink/50 border border-gold/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 pb-5">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
