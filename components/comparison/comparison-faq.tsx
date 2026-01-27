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

// Check if city is a college town
function isCollegeTown(slug: string): boolean {
  return ['oxford', 'starkville'].includes(slug)
}

// Check if city has high storm damage frequency
function isHighStormArea(city: MSCity): boolean {
  return city.stats.stormDamageFrequency.toLowerCase().includes('high')
}

// Generate city-specific FAQs based on city characteristics
export function generateComparisonFaqs(city: MSCity): ComparisonFAQItem[] {
  const currentYear = new Date().getFullYear()
  const faqs: ComparisonFAQItem[] = []

  // Core FAQ: Pricing (always include)
  faqs.push({
    question: `How much does roof replacement cost in ${city.name}?`,
    answer: `Roof replacement in ${city.name} typically costs between ${city.stats.avgReplacementCost}. Factors affecting price include roof size, material choice (${city.localContent.commonRoofTypes.slice(0, 2).join(', ')}), roof pitch and complexity, and whether tear-off of existing materials is required. Get a detailed written estimate that breaks down all costs.`
  })

  // Core FAQ: Choosing contractor (always include)
  faqs.push({
    question: `How do I choose a roofer in ${city.name}, Mississippi?`,
    answer: `When choosing a roofer in ${city.name}, verify they are properly licensed and insured in ${city.county} County. Check online reviews and references, get at least three written estimates, understand their warranty terms, and ensure they pull proper permits. Avoid contractors who require large upfront payments or pressure you into immediate decisions.`
  })

  // College town specific FAQs
  if (isCollegeTown(city.slug)) {
    faqs.push({
      question: `Do ${city.name} roofers work on rental properties and student housing?`,
      answer: `Yes, roofers in ${city.name} regularly work on rental properties and student housing near campus. Property investors and landlords should look for contractors experienced with multi-unit properties, fast turnaround times between tenants, and maintenance programs. Farrell Roofing offers property management partnerships for ${city.name} rental investors.`
    })
    faqs.push({
      question: `When should ${city.name} property owners schedule roof work around the school year?`,
      answer: `For properties near campus in ${city.name}, summer months (May-August) when students are away offer the best opportunity for major roof work. This allows contractors full access without disrupting tenants. For occupied properties, spring and fall during mild weather work well. Plan ahead—${city.name}'s roofing contractors are busiest after spring storms.`
    })
  }

  // High storm area specific FAQs
  if (isHighStormArea(city)) {
    faqs.push({
      question: `How do I handle storm damage claims in ${city.name}?`,
      answer: `${city.name} is in a ${city.stats.stormDamageFrequency.toLowerCase()} storm damage area. After a storm: 1) Document damage with photos, 2) Contact your insurance company to file a claim, 3) Get a professional roof inspection, 4) Get repair estimates from licensed contractors. Many ${city.name} roofers, including Farrell Roofing, work directly with insurance adjusters.`
    })
    faqs.push({
      question: `What roofing materials hold up best to ${city.name}'s severe weather?`,
      answer: `Given ${city.name}'s weather challenges—${city.localContent.weatherChallenges.slice(0, 2).join(' and ').toLowerCase()}—impact-resistant shingles rated Class 3 or 4 perform best. Metal roofing also excels in high-wind areas. Many homeowners in ${city.name} are upgrading to architectural shingles with enhanced wind warranties for better protection.`
    })
  }

  // Roof lifespan FAQ (varies by climate)
  faqs.push({
    question: `How long does a roof last in ${city.name}'s climate?`,
    answer: `In ${city.name}'s humid subtropical climate, most asphalt shingle roofs last ${city.stats.avgRoofAge}. Metal roofs can last 40-70 years. Weather factors like ${city.localContent.weatherChallenges[0]?.toLowerCase() || 'severe storms'} can reduce lifespan. Regular maintenance and prompt repairs help maximize longevity. Schedule annual inspections, especially after storm season.`
  })

  // Neighborhood-specific FAQ (if neighborhoods available)
  if (city.localContent.neighborhoods.length >= 4) {
    const neighborhoodList = city.localContent.neighborhoods.slice(0, 4).join(', ')
    faqs.push({
      question: `Which ${city.name} neighborhoods do roofing contractors serve?`,
      answer: `Roofing contractors in ${city.name} typically serve all areas including ${neighborhoodList}, and surrounding communities. When getting estimates, confirm the contractor has worked in your specific neighborhood before, as different areas may have varying requirements for permits or HOA guidelines.`
    })
  }

  // Timing FAQ (adjusted for storm patterns)
  faqs.push({
    question: `When is the best time to replace a roof in ${city.name}?`,
    answer: `The best time for roof replacement in ${city.name} is typically fall (September-November) when weather is mild and dry. Spring (March-May) is also suitable, though this coincides with Mississippi's storm season. Summer work is possible but heat increases contractor fatigue. Avoid scheduling during peak storm season if your roof can wait.`
  })

  // Licensing FAQ
  faqs.push({
    question: `Are roofing contractors in ${city.name} required to be licensed?`,
    answer: `Yes, roofing contractors working in ${city.name} and ${city.county} County should be properly licensed and carry both liability insurance and workers' compensation coverage. Always ask to see current certificates before hiring, and verify the information is valid with the Mississippi State Board of Contractors.`
  })

  return faqs
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
