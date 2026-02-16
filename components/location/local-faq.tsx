// Location-specific FAQ Component
'use client'

import { useState } from 'react'
import { MSCity, MSCounty } from '@/lib/data/ms-locations'
import { ChevronDown } from 'lucide-react'
import { FAQLocationSchema } from '@/components/seo/location-schema'

interface FAQItem {
  question: string
  answer: string
}

interface LocalFAQProps {
  city?: MSCity
  county?: MSCounty
}

export function LocalFAQ({ city, county }: LocalFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const locationName = city?.name || county?.name || ''
  const countyName = city?.county || county?.name.replace(' County', '') || ''
  const avgCost = city?.stats.avgReplacementCost || county?.stats.avgReplacementCost || '$8,000 - $15,000'

  const faqs: FAQItem[] = [
    {
      question: `How much does a roof replacement cost in ${locationName}?`,
      answer: `The average roof replacement cost in ${locationName} ranges from ${avgCost}, depending on the size of your roof, materials chosen, and complexity of the job. Factors like steep pitches, multiple levels, and removal of old layers can affect the final price. Contact us for a free, detailed estimate specific to your home.`
    },
    {
      question: `Do I need a permit for roofing work in ${countyName} County?`,
      answer: `Most roof replacements in ${countyName} County require a building permit. At Smart Roof Pricing, we handle all permitting requirements as part of our service, ensuring your project meets local building codes and passes all inspections. You don't need to worry about the paperwork.`
    },
    {
      question: `What are the best roofing materials for Mississippi weather?`,
      answer: `For Mississippi's humid subtropical climate with severe storms and hot summers, we recommend impact-resistant architectural shingles or metal roofing. These materials withstand high winds, resist algae growth from humidity, and reflect heat to improve energy efficiency. We'll help you choose the best option for your home and budget.`
    },
    {
      question: `How long does a roof replacement take in ${locationName}?`,
      answer: `Most residential roof replacements in ${locationName} are completed in 1-3 days, depending on the size and complexity of your roof. Larger homes or those requiring structural repairs may take longer. Weather can also affect timing, but we work efficiently to minimize disruption to your daily life.`
    },
    {
      question: `Does Smart Roof Pricing handle insurance claims for storm damage?`,
      answer: `Yes, we have extensive experience working with insurance companies on storm damage claims in ${locationName} and throughout Northeast Mississippi. We document all damage, provide detailed estimates, and communicate directly with your insurance adjuster to help ensure you receive fair compensation.`
    },
    {
      question: `What warranty do you offer on roofing work in ${locationName}?`,
      answer: `We provide a comprehensive warranty on all roofing projects. This includes manufacturer warranties on materials (typically 25-50 years for shingles) plus our own workmanship warranty. We stand behind our work and will address any installation-related issues promptly.`
    }
  ]

  return (
    <>
      <FAQLocationSchema faqs={faqs} />

      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-center mb-8">
              Common questions about roofing services in {locationName}, Mississippi
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-ink/50 border border-gold/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gold shrink-0 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openIndex === index && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
