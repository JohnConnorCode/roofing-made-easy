// Best Roofing Companies in [City], [State] - Comparison Page
// URL: /best-roofers-in-[city]-[state] (e.g., /best-roofers-in-tupelo-ms)

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getCityBySlug,
  getAllCities,
  isValidCitySlug,
  getNearbyCities,
  MSCity
} from '@/lib/data/ms-locations'
import {
  ComparisonHero,
  FeaturedCompanyCard,
  CompetitorListing,
  HowToChooseSection,
  LocalPricingSection,
  ComparisonFAQ,
  generateComparisonFaqs
} from '@/components/comparison'
import { Breadcrumbs, LocalStats } from '@/components/location'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { CTASection } from '@/components/shared'
import {
  ComparisonSchemaBundle,
  FeaturedCompanySchema
} from '@/components/seo/comparison-schema'
import { generateComparisonMeta } from '@/lib/seo/meta-utils'

interface ComparisonPageProps {
  params: Promise<{
    city: string
    state: string
  }>
}

// Generate static params for all cities
export async function generateStaticParams() {
  const cities = getAllCities()
  return cities.map(city => ({
    city: city.slug,
    state: city.stateCode.toLowerCase()
  }))
}

// Generate metadata per city
export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { city: citySlug, state } = resolvedParams

  if (state !== 'ms') {
    return { title: 'Page Not Found' }
  }

  const city = getCityBySlug(citySlug)

  if (!city) {
    return { title: 'Page Not Found' }
  }

  return generateComparisonMeta({
    city,
    path: `/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`
  })
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const resolvedParams = await params
  const { city: citySlug, state } = resolvedParams

  if (state !== 'ms') {
    notFound()
  }

  if (!isValidCitySlug(citySlug)) {
    notFound()
  }

  const city = getCityBySlug(citySlug)

  if (!city) {
    notFound()
  }

  const faqs = generateComparisonFaqs(city)
  const nearbyCities = getNearbyCities(citySlug)

  const breadcrumbItems = [
    { name: 'Service Areas', href: '/service-areas' },
    { name: `${city.county} County`, href: `/${city.county.toLowerCase()}-county-roofing` },
    { name: `Best Roofers in ${city.name}`, href: `/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}` }
  ]

  return (
    <>
      <SiteHeader />

      {/* Schema Markup */}
      <ComparisonSchemaBundle city={city} faqs={faqs} />
      <FeaturedCompanySchema city={city} />

      {/* Breadcrumbs - reusing location component */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <ComparisonHero city={city} />

      {/* Editorial Intro */}
      <section className="py-12 bg-ink/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <EditorialIntro city={city} />
          </div>
        </div>
      </section>

      {/* Featured Company */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FeaturedCompanyCard city={city} />
          </div>
        </div>
      </section>

      {/* Local Stats - reusing location component */}
      <LocalStats city={city} />

      {/* Contractor Types - Educational Content */}
      <CompetitorListing city={city} />

      {/* How to Choose */}
      <HowToChooseSection city={city} />

      {/* Pricing Factors */}
      <LocalPricingSection city={city} />

      {/* FAQ */}
      <ComparisonFAQ city={city} />

      {/* Related Links */}
      <RelatedLinksSection city={city} nearbyCities={nearbyCities} />

      {/* Final CTA - using shared component */}
      <CTASection
        title="Ready to Get Started?"
        description={`Get your free, no-obligation roofing estimate from ${city.name}'s top-rated contractor.`}
      />

      <SiteFooter />
    </>
  )
}

// Editorial intro using unique city content
function EditorialIntro({ city }: { city: MSCity }) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="prose prose-invert max-w-none">
      {/* Unique city intro from location data */}
      <p className="text-gray-300 leading-relaxed text-lg">
        {city.localContent.intro}
      </p>

      {/* Local weather challenges */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Weather Challenges in {city.name}
        </h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          {city.name} homeowners face specific roofing challenges due to local weather patterns.
          When selecting a roofing contractor, ensure they have experience with:
        </p>
        <ul className="space-y-2">
          {city.localContent.weatherChallenges.map((challenge, index) => (
            <li key={index} className="text-gray-400 flex items-start gap-2">
              <span className="text-gold mt-1">•</span>
              {challenge}
            </li>
          ))}
        </ul>
      </div>

      {/* Local context */}
      {city.localContent.neighborhoods.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Neighborhoods We Serve in {city.name}
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Quality roofing services are available throughout {city.name}, including{' '}
            {city.localContent.neighborhoods.slice(0, 5).join(', ')}
            {city.localContent.neighborhoods.length > 5 && ', and more'}.
            The average roof replacement in {city.name} costs {city.stats.avgReplacementCost}, with
            roofs typically lasting {city.stats.avgRoofAge} in our local climate.
          </p>
        </div>
      )}

      {/* Guide context */}
      <p className="text-gray-400 leading-relaxed mt-6">
        This {currentYear} guide helps {city.name} homeowners compare local roofing contractors
        based on licensing, insurance, service offerings, and reputation in {city.county} County.
      </p>
    </div>
  )
}

// Related links section
function RelatedLinksSection({ city, nearbyCities }: { city: MSCity; nearbyCities: MSCity[] }) {
  return (
    <section className="py-12 bg-ink/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Explore More Service Areas
          </h2>

          {/* Link to city roofing page */}
          <div className="bg-slate-deep border border-gold/10 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Roofing Services in {city.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  View all roofing services available in {city.name}, {city.stateCode}
                </p>
              </div>
              <Link
                href={`/${city.slug}-roofing`}
                className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/20 text-gold px-4 py-2 rounded-lg transition-all"
              >
                View Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Nearby comparison pages */}
          {nearbyCities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                Compare Roofers in Nearby Cities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {nearbyCities.slice(0, 8).map(nearbyCity => (
                  <Link
                    key={nearbyCity.slug}
                    href={`/best-roofers-in-${nearbyCity.slug}-${nearbyCity.stateCode.toLowerCase()}`}
                    className="text-center p-3 bg-slate-deep border border-gold/10 hover:border-gold/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                  >
                    {nearbyCity.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
