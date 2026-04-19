// Dynamic City Roofing Page
// URL: /:city-roofing (e.g., /tupelo-roofing, /oxford-roofing)
// Internal route: /city/[city] with rewrite from /:city-roofing

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getCityBySlug,
  getAllCitySlugs,
  isValidCitySlug,
} from '@/lib/data/ms-locations'
import { msServices } from '@/lib/data/ms-services'
import {
  CityHero,
  LocalStats,
  LocalContent,
  TestimonialSection,
  ServicesCTA,
  NearbyAreas,
  LocalFAQ,
  Breadcrumbs
} from '@/components/location'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { CityLocationSchema, BreadcrumbSchema, FAQLocationSchema } from '@/components/seo/location-schema'
import { EnhancedLocalBusinessSchema, ReviewSchema, SpeakableSchema } from '@/components/seo/advanced-schema'
import { MultiLocationSchema, AggregateReviewSchema } from '@/components/seo/regional-schema'
import { NAPSchema } from '@/components/seo/nap-schema'
import { RelatedCitiesLinks, ComparisonPageLink } from '@/components/seo/internal-links'
import { generateCityMeta } from '@/lib/seo/meta-utils'
import { getPhoneLink, getPhoneDisplay } from '@/lib/config/business'

interface CityPageProps {
  params: Promise<{
    'city': string
  }>
}

// Generate static params for all cities
// Note: The folder is [city]-roofing, so params.city is just the city slug (e.g., "tupelo")
export async function generateStaticParams() {
  const citySlugs = getAllCitySlugs()
  return citySlugs.map(slug => ({
    city: slug
  }))
}

// Generate metadata per city with enhanced SEO
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const citySlug = resolvedParams['city']
  const city = getCityBySlug(citySlug)

  if (!city) {
    return { title: 'Page Not Found' }
  }

  return generateCityMeta({
    city,
    title: city.metaTitle,
    description: city.metaDescription,
    path: `/${city.slug}-roofing`,
    image: `/images/locations/${city.slug}-roofing.jpg`,
  })
}

export default async function CityPage({ params }: CityPageProps) {
  const resolvedParams = await params
  const citySlug = resolvedParams['city']

  // Validate city slug
  if (!isValidCitySlug(citySlug)) {
    notFound()
  }

  const city = getCityBySlug(citySlug)

  if (!city) {
    notFound()
  }

  // Build breadcrumbs
  const breadcrumbItems = [
    { name: 'Mississippi', href: '/service-areas' },
    { name: `${city.county} County`, href: `/${city.county.toLowerCase()}-county-roofing` },
    { name: `${city.name} Roofing`, href: `/${city.slug}-roofing` }
  ]

  // Prepare review data for schema
  const reviewData = city.testimonial ? [{
    author: city.testimonial.name,
    text: city.testimonial.text,
    rating: 5,
    location: city.testimonial.neighborhood || city.name,
  }] : []

  // City-specific FAQs for schema
  const cityFaqs = [
    {
      question: `What is the average cost of roof replacement in ${city.name}?`,
      answer: `In ${city.name}, Mississippi, roof replacement typically costs between ${city.stats.avgReplacementCost}. Factors include roof size, materials chosen, and complexity of the installation.`
    },
    {
      question: `How long does a roof last in ${city.name}?`,
      answer: `With ${city.localContent.weatherChallenges[0]?.toLowerCase() || 'Mississippi weather conditions'}, roofs in ${city.name} typically last ${city.stats.avgRoofAge}. Regular maintenance can extend your roof's lifespan.`
    },
    {
      question: `Do you offer free estimates in ${city.name}?`,
      answer: `Yes! Farrell Roofing offers completely free, no-obligation roofing estimates for homeowners in ${city.name} and throughout ${city.county} County.`
    },
    {
      question: `What roofing services do you offer in ${city.name}?`,
      answer: `We provide comprehensive roofing services in ${city.name} including roof replacement, roof repair, storm damage restoration, roof inspections, and metal roofing installation.`
    }
  ]

  return (
    <>
      <SiteHeader />

      {/* Schema Markup - Comprehensive regional SEO coverage */}
      <CityLocationSchema city={city} />
      <EnhancedLocalBusinessSchema city={city} />
      <NAPSchema city={city} pageType="location" />
      <MultiLocationSchema primaryCity={city} />
      <AggregateReviewSchema city={city} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQLocationSchema faqs={cityFaqs} />
      <SpeakableSchema
        headline={city.h1}
        summary={city.metaDescription}
        url={`/${city.slug}-roofing`}
      />
      {reviewData.length > 0 && (
        <ReviewSchema
          reviews={reviewData}
          itemReviewed={{ name: `Farrell Roofing - ${city.name}`, type: 'LocalBusiness' }}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <CityHero city={city} />

      {/* Local Statistics */}
      <LocalStats city={city} />

      {/* Unique Local Content */}
      <LocalContent city={city} />

      {/* Services CTA */}
      <ServicesCTA city={city} />

      {/* Service + Location Links - Enhanced Internal Linking */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              Roofing Services in {city.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {msServices.map(service => (
                <Link
                  key={service.serviceSlug}
                  href={`/${service.serviceSlug}-${city.slug}-ms`}
                  className="group text-center p-3 bg-ink/50 border border-gold/10 hover:border-gold/30 rounded-lg transition-all"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {service.serviceName}
                  </span>
                </Link>
              ))}
            </div>

            {/* Compare Roofers Link */}
            <div className="mt-8">
              <ComparisonPageLink city={city} variant="card" />
            </div>

            {/* Related Cities Internal Links */}
            <div className="mt-10 pt-8 border-t border-gold/10">
              <RelatedCitiesLinks currentCity={city} maxCities={8} showCounty={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial (if available) */}
      <TestimonialSection city={city} />

      {/* FAQ Section */}
      <LocalFAQ city={city} />

      {/* Nearby Areas / Internal Links */}
      <NearbyAreas city={city} />

      {/* Resources strip */}
      <section className="py-12 md:py-16 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-5xl px-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a25c] text-center">
            More for {city.name} homeowners
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/pricing/roof-replacement-cost"
              className="group flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/30 px-4 py-3 transition-colors hover:border-[#c9a25c]/40"
            >
              <span className="text-sm text-slate-200 font-medium">Replacement pricing guide</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#c9a25c] transition-colors" />
            </Link>
            <Link
              href="/insurance-help"
              className="group flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/30 px-4 py-3 transition-colors hover:border-[#c9a25c]/40"
            >
              <span className="text-sm text-slate-200 font-medium">Insurance claim help</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#c9a25c] transition-colors" />
            </Link>
            <Link
              href="/financing"
              className="group flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/30 px-4 py-3 transition-colors hover:border-[#c9a25c]/40"
            >
              <span className="text-sm text-slate-200 font-medium">Financing options</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#c9a25c] transition-colors" />
            </Link>
            <Link
              href="/assistance-programs"
              className="group flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/30 px-4 py-3 transition-colors hover:border-[#c9a25c]/40"
            >
              <span className="text-sm text-slate-200 font-medium">Assistance programs</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#c9a25c] transition-colors" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-[#0c0f14] border-t border-slate-900">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9a25c]">
            {city.name}, {city.stateCode}
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-slate-50 font-display leading-[1.05] tracking-tight">
            Your roof, priced honestly.
          </h2>
          <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
            Two minutes for a real number, built from real {city.name} material and labor rates.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a25c] to-[#b5893a] hover:from-[#d4b06c] hover:to-[#c9a25c] text-[#0c0f14] font-semibold px-7 py-3.5 rounded-lg shadow-lg shadow-[#b5893a]/20 transition-all"
            >
              Get my free estimate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={getPhoneLink()}
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-200 font-medium px-7 py-3.5 rounded-lg transition-colors"
            >
              Call {getPhoneDisplay()}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
