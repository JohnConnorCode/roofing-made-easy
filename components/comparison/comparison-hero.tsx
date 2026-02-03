// Comparison Page Hero Section
// H1 optimized for "Best Roofing Companies in [City]" searches

import { MSCity } from '@/lib/data/ms-locations'
import { MapPin, Award, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ComparisonHeroProps {
  city: MSCity
}

export function ComparisonHero({ city }: ComparisonHeroProps) {
  const currentYear = new Date().getFullYear()

  return (
    <section className="relative bg-gradient-dark py-16 md:py-20">
      <div className="absolute inset-0 bg-[url('/images/roof-pattern.svg')] opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Editorial Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-deep/50 border border-gold/20 rounded-full px-4 py-2 mb-6">
            <Award className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300">
              Editorial Review
            </span>
            <span className="w-1 h-1 bg-gray-500 rounded-full" />
            <Calendar className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300">
              Updated for {currentYear}
            </span>
          </div>

          {/* H1 Title - Primary SEO Target */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Best Roofing Companies in {city.name}, {city.stateCode}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Compare top-rated local roofers serving {city.name} and {city.county} County.
            Find trusted contractors, compare services, and get your free estimate.
          </p>

          {/* Location Context */}
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-8">
            <MapPin className="w-4 h-4 text-gold" />
            <span className="text-sm">
              Serving {city.name}, {city.county} County, Mississippi
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-5 h-5 text-gold" />
              <span>Licensed Contractors</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-5 h-5 text-gold" />
              <span>Verified Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-5 h-5 text-gold" />
              <span>Free Estimates</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
          >
            Get Your Free Estimate
          </Link>
        </div>
      </div>
    </section>
  )
}
