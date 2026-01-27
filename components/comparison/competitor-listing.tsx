// Competitor Listing Component
// Neutral competitor cards showing other roofers serving the area

import { CompetitorCompany } from '@/lib/data/ms-competitors'
import { MSCity } from '@/lib/data/ms-locations'
import { MapPin, Briefcase, Clock } from 'lucide-react'

interface CompetitorListingProps {
  city: MSCity
  competitors: CompetitorCompany[]
}

export function CompetitorListing({ city, competitors }: CompetitorListingProps) {
  if (competitors.length === 0) return null

  return (
    <section className="py-12 bg-ink/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Other Roofers Serving {city.name}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These contractors also provide roofing services in the {city.name} area.
              We recommend getting multiple quotes to compare pricing and services.
            </p>
          </div>

          {/* Competitor Cards */}
          <div className="space-y-6">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                position={index + 2} // Position 1 is Farrell Roofing
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface CompetitorCardProps {
  competitor: CompetitorCompany
  position: number
}

function CompetitorCard({ competitor, position }: CompetitorCardProps) {
  return (
    <div className="bg-slate-deep border border-gold/10 rounded-xl p-6 hover:border-gold/20 transition-colors">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Position Badge */}
        <div className="shrink-0">
          <div className="w-12 h-12 bg-ink/50 border border-gold/10 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-gray-400">#{position}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {competitor.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{competitor.serviceArea}</span>
                </div>
                {competitor.yearsInBusiness && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{competitor.yearsInBusiness} years</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {competitor.description}
          </p>

          {/* Services */}
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {competitor.services.map((service) => (
                <span
                  key={service}
                  className="text-xs bg-ink/50 border border-gold/5 text-gray-400 px-2 py-1 rounded"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Single competitor card export for flexibility
export { CompetitorCard }
