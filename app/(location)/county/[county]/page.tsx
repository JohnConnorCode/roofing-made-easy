// Dynamic County Roofing Page
// URL: /:county-county-roofing (e.g., /lee-county-roofing)
// Internal route: /county/[county] with rewrite from /:county-county-roofing

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Shield, Star, Phone, ArrowRight } from 'lucide-react'
import {
  getCountyBySlug,
  getAllCountySlugs,
  isValidCountySlug,
  getCitiesByCounty,
} from '@/lib/data/ms-locations'
import { LocalStats, CountyAreas, LocalFAQ, Breadcrumbs } from '@/components/location'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { CountyLocationSchema, FAQLocationSchema, BreadcrumbSchema } from '@/components/seo/location-schema'
import { EnhancedLocalBusinessSchema } from '@/components/seo/advanced-schema'
import { RegionalNavigation } from '@/components/seo/internal-links'
import { generateCountyMeta } from '@/lib/seo/meta-utils'
import { getPhoneLink, getPhoneDisplay, BUSINESS_CONFIG } from '@/lib/config/business'

interface CountyPageProps {
  params: Promise<{
    'county': string
  }>
}

// Generate static params for all counties
// Note: The folder is [county]-county-roofing, so params.county is just the county slug (e.g., "lee")
export async function generateStaticParams() {
  const countySlugs = getAllCountySlugs()
  // countySlugs are like "lee-county", so extract just the first part for the route param
  return countySlugs.map(slug => ({
    county: slug.replace('-county', '')
  }))
}

// Generate metadata per county with enhanced SEO
export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const resolvedParams = await params
  // params.county is like "lee", need "lee-county" for lookup
  const countySlug = `${resolvedParams['county']}-county`
  const county = getCountyBySlug(countySlug)

  if (!county) {
    return { title: 'Page Not Found' }
  }

  return generateCountyMeta({
    county,
    title: county.metaTitle,
    description: county.metaDescription,
    path: `/${county.slug}-roofing`,
    image: `/images/locations/${county.slug}-roofing.jpg`,
  })
}

export default async function CountyPage({ params }: CountyPageProps) {
  const resolvedParams = await params
  // params.county is like "lee", need "lee-county" for lookup
  const countySlug = `${resolvedParams['county']}-county`

  // Validate county slug
  if (!isValidCountySlug(countySlug)) {
    notFound()
  }

  const county = getCountyBySlug(countySlug)

  if (!county) {
    notFound()
  }

  const citiesInCounty = getCitiesByCounty(countySlug)

  // Build breadcrumbs
  const breadcrumbItems = [
    { name: 'Mississippi', href: '/service-areas' },
    { name: `${county.name} Roofing`, href: `/${county.slug}-roofing` }
  ]

  // FAQ data for schema
  const countyFaqs = [
    {
      question: `How much does roof replacement cost in ${county.name}?`,
      answer: `Roof replacement costs in ${county.name} typically range from $8,000 to $15,000 for an average-sized home. Factors include roof size, materials, and complexity.`
    },
    {
      question: `Do I need a permit for roofing work in ${county.name}?`,
      answer: `Yes, most roofing projects in ${county.name} require permits. We handle all permitting as part of our service.`
    },
    {
      question: `How long does a roof last in Mississippi?`,
      answer: `In Mississippi's climate, asphalt shingles typically last 15-20 years, while metal roofs can last 40-70 years with proper maintenance.`
    }
  ]

  return (
    <>
      <SiteHeader />

      {/* Schema Markup - Multiple types for comprehensive coverage */}
      <CountyLocationSchema county={county} />
      <EnhancedLocalBusinessSchema county={county} />
      <FAQLocationSchema faqs={countyFaqs} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-dark py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/images/roof-pattern.svg')] opacity-5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Location Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-deep/50 border border-gold/20 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-sm text-gray-300">
                {county.name}, {county.stateCode}
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {county.h1}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Serving {county.population.toLocaleString()}+ residents across {citiesInCounty.length} communities with professional roofing services.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {BUSINESS_CONFIG.reviews.googleRating && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span>{BUSINESS_CONFIG.reviews.googleRating} Rating</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-5 h-5 text-gold" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-5 h-5 text-gold" />
                <span>{citiesInCounty.length} Cities Served</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
              >
                Get Free Estimate
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={getPhoneLink()}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* County Statistics */}
      <LocalStats county={county} />

      {/* County Intro Content */}
      <section className="py-12 bg-ink">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Roofing Services Throughout {county.name}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {county.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Cities in County */}
      <CountyAreas countySlug={countySlug} countyName={county.name} />

      {/* Services Overview */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Our Services in {county.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Roof Replacement', description: 'Complete tear-off and installation', slug: 'roof-replacement' },
                { name: 'Roof Repair', description: 'Fix leaks and damage', slug: 'roof-repair' },
                { name: 'Storm Damage', description: 'Emergency repairs & insurance help', slug: 'emergency-repair' },
                { name: 'Inspections', description: 'Comprehensive assessments', slug: 'roof-inspection' }
              ].map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group bg-ink/50 border border-gold/10 hover:border-gold/30 rounded-xl p-6 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-gold text-sm group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <LocalFAQ county={county} />

      {/* Regional Navigation - Cross-County Links */}
      <section className="py-12 bg-ink">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <RegionalNavigation currentCounty={countySlug} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready for Your Free Estimate?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Contact Smart Roof Pricing today for professional roofing services anywhere in {county.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all btn-press"
            >
              Get Free Estimate
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={getPhoneLink()}
              className="inline-flex items-center justify-center bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
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
