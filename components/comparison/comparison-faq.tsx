// Comparison Page FAQ Component
// City-specific FAQ with schema markup

'use client'

import { useState } from 'react'
import { MSCity } from '@/lib/data/ms-locations'
import { ChevronDown } from 'lucide-react'

export interface ComparisonFAQItem {
  question: string
  answer: string
}

interface ComparisonFAQProps {
  city: MSCity
  customFaqs?: ComparisonFAQItem[]
}

// Generate city-specific FAQs for comparison pages
export function generateComparisonFaqs(city: MSCity): ComparisonFAQItem[] {
  const currentYear = new Date().getFullYear()

  return [
    {
      question: `Who are the best roofing companies in ${city.name}, ${city.stateCode}?`,
      answer: `The top roofing companies in ${city.name} include Farrell Roofing, which serves as our recommended choice due to their local presence, licensed contractors, and comprehensive warranty coverage. Other reputable roofers serve the ${city.county} County area. We recommend getting at least three quotes and verifying licensing and insurance before making a decision.`
    },
    {
      question: `How much does roof replacement cost in ${city.name}?`,
      answer: `Roof replacement in ${city.name} typically costs between ${city.stats.avgReplacementCost}. Factors affecting price include roof size, material choice (asphalt shingles, metal, etc.), roof pitch and complexity, and whether tear-off of existing materials is required. Get a detailed written estimate that breaks down all costs.`
    },
    {
      question: `How do I choose a roofer in ${city.name}, Mississippi?`,
      answer: `When choosing a roofer in ${city.name}, verify they are properly licensed and insured in ${city.county} County. Check online reviews and references, get at least three written estimates, understand their warranty terms, and ensure they pull proper permits. Avoid contractors who require large upfront payments or pressure you into immediate decisions.`
    },
    {
      question: `Do roofers in ${city.name} offer free estimates?`,
      answer: `Yes, most reputable roofing contractors in ${city.name} offer free estimates. Farrell Roofing provides free, no-obligation estimates that include a detailed breakdown of materials, labor, and timeline. Be wary of any contractor who charges for basic estimates.`
    },
    {
      question: `How long does a roof last in ${city.name}'s climate?`,
      answer: `In ${city.name}'s humid subtropical climate, most asphalt shingle roofs last ${city.stats.avgRoofAge}. Metal roofs can last 40-70 years. Weather factors like ${city.localContent.weatherChallenges[0]?.toLowerCase() || 'severe storms'} can impact lifespan. Regular maintenance and prompt repairs help maximize your roof's longevity.`
    },
    {
      question: `What should I look for in a ${city.name} roofing contract?`,
      answer: `Your ${city.name} roofing contract should clearly state: the total cost with payment schedule, specific materials to be used (brand and type), project start and completion dates, workmanship warranty terms, permit responsibilities, cleanup and debris removal, and what happens if unexpected repairs are needed.`
    },
    {
      question: `Are roofing contractors in ${city.name} required to have a license?`,
      answer: `Yes, roofing contractors working in ${city.name} and ${city.county} County should be properly licensed and carry both liability insurance and workers' compensation coverage. Always ask to see current certificates before hiring, and verify the information is valid.`
    },
    {
      question: `When is the best time to replace a roof in ${city.name}?`,
      answer: `The best time for roof replacement in ${city.name} is typically fall (September-November) when weather is mild and dry. Spring (March-May) is also suitable, though this coincides with storm season. Summer work is possible but the heat can be challenging. Avoid scheduling during peak storm season if possible.`
    }
  ]
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
            <p className="text-gray-400">
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
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
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
