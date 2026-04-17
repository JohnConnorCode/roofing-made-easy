// City Hero Section Component
import { MSCity } from '@/lib/data/ms-locations'
import { MapPin, Shield, Star, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPhoneLink, BUSINESS_CONFIG } from '@/lib/config/business'

interface CityHeroProps {
  city: MSCity
}

export function CityHero({ city }: CityHeroProps) {
  const foundedYear = BUSINESS_CONFIG.foundedYear
  const years = foundedYear ? new Date().getFullYear() - parseInt(foundedYear) : null

  return (
    <section className="relative bg-[#0c0f14] py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/roof-pattern.svg')] opacity-[0.04] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Eyebrow with location */}
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#c9a25c] animate-slide-up">
            <MapPin className="h-3.5 w-3.5" />
            {city.name}, {city.county} County &middot; {city.stateCode}
            {city.isHQ && (
              <span className="ml-1 rounded-full bg-[#c9a25c]/15 border border-[#c9a25c]/30 text-[#e6c588] px-2 py-0.5 text-[10px] font-semibold tracking-normal normal-case">
                HQ
              </span>
            )}
          </p>

          {/* H1 — uses city's generated h1 */}
          <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold tracking-tight text-slate-50 font-display animate-slide-up delay-75">
            {city.h1}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl animate-slide-up delay-150">
            {city.isHQ
              ? `Born and raised in ${city.name}${years ? `, working roofs here for ${years}+ years` : ''}. Honest pricing, clean work, no pushy sales.`
              : `Serving ${city.name}${years ? ` from our ${BUSINESS_CONFIG.address.city} shop for ${years}+ years` : ''}. Same crew, same standard.`}
          </p>

          {/* Trust indicators — only real ones */}
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4 animate-slide-up delay-200">
            {BUSINESS_CONFIG.reviews.googleRating && (
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Star className="h-4 w-4 text-[#c9a25c] fill-[#c9a25c]" />
                <span>
                  <span className="text-slate-50 font-semibold">{BUSINESS_CONFIG.reviews.googleRating}</span>/5 rating
                </span>
              </li>
            )}
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <Shield className="h-4 w-4 text-[#c9a25c]" />
              <span>Licensed &amp; insured</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-[#c9a25c]" />
              <span>Local crew</span>
            </li>
          </ul>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-7 py-3.5 rounded-lg shadow-lg shadow-[#b5893a]/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a25c] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c0f14]"
            >
              Get my free estimate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={getPhoneLink()}
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-200 font-medium px-7 py-3.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c0f14]"
            >
              <Phone className="h-4 w-4" />
              Call now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
