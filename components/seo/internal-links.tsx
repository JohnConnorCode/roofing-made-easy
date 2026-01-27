// Internal Linking Components for SEO
// Optimized cross-linking between location and service pages

import Link from 'next/link'
import { getAllCities, getAllCounties, MSCity } from '@/lib/data/ms-locations'
import { msServices } from '@/lib/data/ms-services'

// Related Cities Component - Shows nearby cities with relevance
interface RelatedCitiesProps {
  currentCity: MSCity
  maxCities?: number
  showCounty?: boolean
}

export function RelatedCitiesLinks({ currentCity, maxCities = 6, showCounty = true }: RelatedCitiesProps) {
  const allCities = getAllCities()

  // Get cities in same county first
  const sameCountyCities = allCities
    .filter(c => c.county === currentCity.county && c.slug !== currentCity.slug)
    .slice(0, 3)

  // Get nearby cities (from nearbyCities array)
  const nearbyCities = currentCity.nearbyCities
    .map(slug => allCities.find(c => c.slug === slug))
    .filter((c): c is MSCity => c !== undefined && !sameCountyCities.includes(c))
    .slice(0, maxCities - sameCountyCities.length)

  const citiesToShow = [...sameCountyCities, ...nearbyCities].slice(0, maxCities)

  return (
    <div className="space-y-4">
      {showCounty && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gold mb-2">
            More in {currentCity.county} County
          </h4>
          <div className="flex flex-wrap gap-2">
            {sameCountyCities.map(city => (
              <Link
                key={city.slug}
                href={`/${city.slug}-roofing`}
                className="text-sm px-3 py-1 bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-full text-gray-300 hover:text-white transition-all"
              >
                {city.name}
              </Link>
            ))}
            <Link
              href={`/${currentCity.county.toLowerCase()}-county-roofing`}
              className="text-sm px-3 py-1 bg-gold/10 border border-gold/20 hover:border-gold/40 rounded-full text-gold hover:text-gold-light transition-all"
            >
              All of {currentCity.county} County →
            </Link>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gold mb-2">Nearby Service Areas</h4>
        <div className="flex flex-wrap gap-2">
          {citiesToShow.map(city => (
            <Link
              key={city.slug}
              href={`/${city.slug}-roofing`}
              className="text-sm px-3 py-1 bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-full text-gray-300 hover:text-white transition-all"
            >
              {city.name} Roofing
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Service Cross-Links - Link to same service in other cities
interface ServiceCrossLinksProps {
  currentService: string
  currentCity: MSCity
  maxLinks?: number
}

export function ServiceCrossLinks({ currentService, currentCity, maxLinks = 8 }: ServiceCrossLinksProps) {
  const allCities = getAllCities()
  const service = msServices.find(s => s.serviceSlug === currentService)

  if (!service) return null

  // Prioritize nearby and high-priority cities
  const otherCities = allCities
    .filter(c => c.slug !== currentCity.slug)
    .sort((a, b) => {
      // Nearby cities first
      const aIsNearby = currentCity.nearbyCities.includes(a.slug) ? -1 : 0
      const bIsNearby = currentCity.nearbyCities.includes(b.slug) ? -1 : 0
      if (aIsNearby !== bIsNearby) return aIsNearby - bIsNearby

      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, maxLinks)

  return (
    <div>
      <h4 className="text-sm font-semibold text-gold mb-3">
        {service.serviceName} in Other Areas
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {otherCities.map(city => (
          <Link
            key={city.slug}
            href={`/${currentService}-${city.slug}-ms`}
            className="text-sm p-2 bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-lg text-gray-300 hover:text-white text-center transition-all"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

// All Services in City - Link to all service+city combos
interface AllServicesInCityProps {
  city: MSCity
  currentService?: string
}

export function AllServicesInCity({ city, currentService }: AllServicesInCityProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gold mb-3">
        All Services in {city.name}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {msServices.map(service => (
          <Link
            key={service.serviceSlug}
            href={`/${service.serviceSlug}-${city.slug}-ms`}
            className={`text-sm p-2 rounded-lg text-center transition-all ${
              currentService === service.serviceSlug
                ? 'bg-gold/20 border border-gold/40 text-gold'
                : 'bg-slate-deep/50 border border-gold/10 hover:border-gold/30 text-gray-300 hover:text-white'
            }`}
          >
            {service.serviceName}
          </Link>
        ))}
      </div>
    </div>
  )
}

// County Cities Grid - Show all cities in a county
interface CountyCitiesGridProps {
  countySlug: string
  countyName: string
  currentCity?: string
}

export function CountyCitiesGrid({ countySlug, countyName, currentCity }: CountyCitiesGridProps) {
  const allCities = getAllCities()
  const countyCities = allCities.filter(
    c => c.county.toLowerCase().replace(' ', '-') === countySlug.replace('-county', '')
  )

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">
        Cities in {countyName}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {countyCities.map(city => (
          <Link
            key={city.slug}
            href={`/${city.slug}-roofing`}
            className={`p-3 rounded-lg text-center transition-all ${
              currentCity === city.slug
                ? 'bg-gold/20 border border-gold text-white'
                : 'bg-slate-deep/50 border border-gold/10 hover:border-gold/30 text-gray-300 hover:text-white'
            }`}
          >
            <span className="font-medium">{city.name}</span>
            <span className="block text-xs text-gray-500 mt-1">
              Pop. {city.population.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Regional Navigation - All counties
interface RegionalNavigationProps {
  currentCounty?: string
}

export function RegionalNavigation({ currentCounty }: RegionalNavigationProps) {
  const counties = getAllCounties()

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">
        Counties We Serve
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {counties.map(county => (
          <Link
            key={county.slug}
            href={`/${county.slug}-roofing`}
            className={`p-3 rounded-lg text-center transition-all ${
              currentCounty === county.slug
                ? 'bg-gold/20 border border-gold text-white'
                : 'bg-slate-deep/50 border border-gold/10 hover:border-gold/30 text-gray-300 hover:text-white'
            }`}
          >
            <span className="font-medium">{county.name}</span>
            <span className="block text-xs text-gray-500 mt-1">
              {county.cities.length} cities
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Silo Navigation - Main category links
export function SiloNavigation() {
  const services = msServices.slice(0, 5)
  const topCities = getAllCities().filter(c => c.priority === 'high' || c.isHQ).slice(0, 6)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Services Silo */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Our Services</h4>
        <ul className="space-y-2">
          {services.map(service => (
            <li key={service.serviceSlug}>
              <Link
                href={`/services/${service.serviceSlug}`}
                className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                {service.serviceName}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/services"
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium"
            >
              View All Services →
            </Link>
          </li>
        </ul>
      </div>

      {/* Locations Silo */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Service Areas</h4>
        <ul className="space-y-2">
          {topCities.map(city => (
            <li key={city.slug}>
              <Link
                href={`/${city.slug}-roofing`}
                className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                {city.name}, MS
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/service-areas"
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium"
            >
              View All Areas →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

// Footer Location Links - Comprehensive for SEO juice
export function FooterLocationLinks() {
  const cities = getAllCities()
  const counties = getAllCounties()

  return (
    <div className="space-y-6">
      {/* Cities by County */}
      {counties.slice(0, 5).map(county => {
        const countyCities = cities.filter(
          c => c.county.toLowerCase() === county.name.toLowerCase().replace(' county', '')
        )
        return (
          <div key={county.slug}>
            <h5 className="text-sm font-semibold text-gold mb-2">
              <Link href={`/${county.slug}-roofing`} className="hover:text-gold-light">
                {county.name}
              </Link>
            </h5>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {countyCities.map(city => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}-roofing`}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Comparison Page Link for City Pages
interface ComparisonLinkProps {
  city: MSCity
  variant?: 'inline' | 'card'
}

export function ComparisonPageLink({ city, variant = 'inline' }: ComparisonLinkProps) {
  const href = `/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`

  if (variant === 'card') {
    return (
      <Link
        href={href}
        className="block p-4 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 hover:border-gold/40 rounded-xl transition-all"
      >
        <p className="text-sm text-gray-400 mb-1">Compare Local Contractors</p>
        <p className="text-white font-medium">
          Best Roofing Companies in {city.name} →
        </p>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="text-sm text-gold hover:text-gold-light transition-colors"
    >
      Compare roofers in {city.name} →
    </Link>
  )
}

// Nearby Comparison Pages - Link to comparison pages for nearby cities
interface NearbyComparisonLinksProps {
  currentCity: MSCity
  maxLinks?: number
}

export function NearbyComparisonLinks({ currentCity, maxLinks = 6 }: NearbyComparisonLinksProps) {
  const allCities = getAllCities()

  // Get nearby cities
  const nearbyCities = currentCity.nearbyCities
    .map(slug => allCities.find(c => c.slug === slug))
    .filter((c): c is MSCity => c !== undefined)
    .slice(0, maxLinks)

  if (nearbyCities.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-gold mb-3">
        Compare Roofers in Nearby Cities
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {nearbyCities.map(city => (
          <Link
            key={city.slug}
            href={`/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`}
            className="text-sm p-2 bg-slate-deep/50 border border-gold/10 hover:border-gold/30 rounded-lg text-gray-300 hover:text-white text-center transition-all"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
