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
import { getCompetitorsForCity } from '@/lib/data/ms-competitors'
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

  const competitors = getCompetitorsForCity(citySlug)
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
      <ComparisonSchemaBundle city={city} competitors={competitors} faqs={faqs} />
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

      {/* Competitors */}
      <CompetitorListing city={city} competitors={competitors} />

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

// Editorial intro (150-200 words localized)
function EditorialIntro({ city }: { city: MSCity }) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="prose prose-invert max-w-none">
      <p className="text-gray-300 leading-relaxed text-lg">
        Finding a reliable roofing contractor in {city.name}, Mississippi can be challenging.
        With numerous companies competing for your business, it's important to evaluate your
        options carefully before making a decision that will protect your home for decades.
      </p>

      <p className="text-gray-400 leading-relaxed">
        This {currentYear} guide compares the top roofing companies serving {city.name} and
        {' '}{city.county} County. We've evaluated local contractors based on licensing,
        insurance coverage, customer reviews, warranty offerings, and responsiveness. Whether
        you need a complete roof replacement, emergency storm damage repair, or routine
        maintenance, the contractors listed here serve {city.name} homeowners with
        professionalism and quality workmanship.
      </p>

      <p className="text-gray-400 leading-relaxed">
        Given {city.name}'s climate—including {city.localContent.weatherChallenges[0]?.toLowerCase() || 'seasonal severe weather'} and
        high humidity—your roof faces significant challenges. Choosing a contractor who understands
        local conditions is essential for long-term protection. The average roof in {city.name} costs
        {' '}{city.stats.avgReplacementCost} to replace, making it one of your largest home investments.
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
