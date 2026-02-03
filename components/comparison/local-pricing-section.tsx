// Local Pricing Section
// Displays pricing factors and estimate CTA

import { MSCity } from '@/lib/data/ms-locations'
import { CTACard } from '@/components/shared'

interface LocalPricingSectionProps {
  city: MSCity
}

export function LocalPricingSection({ city }: LocalPricingSectionProps) {
  const pricingFactors = [
    {
      factor: 'Roof Size',
      description: 'Measured in roofing squares (100 sq ft each). Most homes range from 15-30 squares.'
    },
    {
      factor: 'Material Choice',
      description: '3-tab shingles are most affordable; architectural shingles offer better durability; metal costs more but lasts longer.'
    },
    {
      factor: 'Roof Pitch & Complexity',
      description: 'Steeper roofs and multiple levels increase labor costs. Dormers, skylights, and chimneys add complexity.'
    },
    {
      factor: 'Removal & Disposal',
      description: 'Removing old layers costs more than a simple overlay. Most codes limit to 2 layers before tear-off is required.'
    },
    {
      factor: 'Permits & Inspections',
      description: `${city.county} County requires permits for most roof work. Professional contractors include this in their quotes.`
    }
  ]

  return (
    <section className="py-12 md:py-16 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              What Affects Roofing Costs in {city.name}?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Understanding pricing factors helps you evaluate estimates and budget for your project.
            </p>
          </div>

          {/* Price Factors */}
          <div className="bg-slate-deep border border-gold/10 rounded-xl p-6 md:p-8 mb-10">
            <div className="space-y-4">
              {pricingFactors.map(({ factor, description }) => (
                <div
                  key={factor}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-4 border-b border-gold/5 last:border-0 last:pb-0"
                >
                  <span className="text-white font-medium sm:w-40 shrink-0">{factor}</span>
                  <span className="text-slate-300 text-sm">{description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <CTACard
            title="Get Your Free Estimate"
            description={`Find out exactly what your ${city.name} roofing project will cost. Our estimates are free, detailed, and come with no obligation.`}
          />
        </div>
      </div>
    </section>
  )
}
