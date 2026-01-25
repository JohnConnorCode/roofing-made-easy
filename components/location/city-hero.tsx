// City Hero Section Component
import { MSCity } from '@/lib/data/ms-locations'
import { MapPin, Shield, Star, Phone } from 'lucide-react'
import Link from 'next/link'

interface CityHeroProps {
  city: MSCity
}

export function CityHero({ city }: CityHeroProps) {
  return (
    <section className="relative bg-gradient-dark py-16 md:py-24">
      <div className="absolute inset-0 bg-[url('/images/roof-pattern.svg')] opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-deep/50 border border-gold/20 rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300">
              {city.name}, {city.county} County, {city.stateCode}
            </span>
            {city.isHQ && (
              <span className="bg-gold/20 text-gold text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                HQ
              </span>
            )}
          </div>

          {/* H1 Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {city.h1}
          </h1>

          {/* Subtitle with Population */}
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Protecting {city.population.toLocaleString()}+ residents with quality roofing services.
            {city.isHQ
              ? ' Born and raised in Tupelo, serving our community since 2010.'
              : ` Proudly serving ${city.name} from our Tupelo headquarters.`
            }
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span>4.9 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-5 h-5 text-gold" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-5 h-5 text-gold" />
              <span>Local Team</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
            >
              Get Free Estimate
            </Link>
            <a
              href="tel:+16620000000"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
