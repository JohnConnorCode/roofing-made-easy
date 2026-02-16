// Dynamic Service + City Page
// URL: /:service-:city-ms (e.g., /roof-replacement-tupelo-ms)
// Internal route: /service-city/[service]/[city] with rewrite

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Phone, ArrowRight, MapPin, Shield, Star, Clock } from 'lucide-react'
import { getCityBySlug, getAllCitySlugs } from '@/lib/data/ms-locations'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/data/ms-services'
import { SiteHeader, SiteFooter } from '@/components/layout'
import { Breadcrumbs } from '@/components/location'
import { ServiceLocationSchema, FAQLocationSchema, BreadcrumbSchema } from '@/components/seo/location-schema'
import { DetailedServiceSchema, HowToSchema, ReviewSchema, SpeakableSchema } from '@/components/seo/advanced-schema'
import { NAPSchema } from '@/components/seo/nap-schema'
import { ServiceCrossLinks, AllServicesInCity } from '@/components/seo/internal-links'
import { generateServiceCityMeta } from '@/lib/seo/meta-utils'
import { getPhoneLink, getPhoneDisplay, BUSINESS_CONFIG } from '@/lib/config/business'

interface ServiceCityPageProps {
  params: Promise<{
    service: string
    city: string
  }>
}

// Generate static params for all service + city combinations
// Note: Folder is [service]-[city]-ms, so params are { service, city }
export async function generateStaticParams() {
  const allCitySlugs = getAllCitySlugs()
  const allServiceSlugs = getAllServiceSlugs()

  const params: Array<{ service: string; city: string }> = []

  for (const serviceSlug of allServiceSlugs) {
    for (const citySlug of allCitySlugs) {
      params.push({ service: serviceSlug, city: citySlug })
    }
  }

  return params
}

// Generate metadata with enhanced SEO
export async function generateMetadata({ params }: ServiceCityPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const serviceSlug = resolvedParams.service
  const citySlug = resolvedParams.city

  const city = getCityBySlug(citySlug)
  const service = getServiceBySlug(serviceSlug)

  if (!city || !service) return { title: 'Page Not Found' }

  const title = `${service.serviceName} in ${city.name}, MS | Smart Roof Pricing`
  const description = `Professional ${service.serviceName.toLowerCase()} services in ${city.name}, Mississippi. ${service.serviceDescription} Free estimates available.`

  return generateServiceCityMeta({
    serviceName: service.serviceName,
    city,
    title,
    description,
    path: `/${serviceSlug}-${citySlug}-ms`,
    image: `/images/services/${serviceSlug}.jpg`,
  })
}

export default async function ServiceCityPage({ params }: ServiceCityPageProps) {
  const resolvedParams = await params
  const serviceSlug = resolvedParams.service
  const citySlug = resolvedParams.city

  const city = getCityBySlug(citySlug)
  const service = getServiceBySlug(serviceSlug)

  if (!city || !service) notFound()

  // City-specific FAQs
  const localFaqs = service.faqs.map(faq => ({
    question: faq.question.includes('{city}')
      ? faq.question.replace('{city}', city.name)
      : faq.question,
    answer: faq.answer
  }))

  // Breadcrumbs
  const breadcrumbItems = [
    { name: 'Services', href: '/services' },
    { name: service.serviceName, href: `/services/${serviceSlug}` },
    { name: city.name, href: `/${city.slug}-roofing` },
  ]

  // HowTo steps for schema
  const howToSteps = service.process.map((step, index) => ({
    name: `Step ${index + 1}`,
    text: step,
  }))

  // Review data for schema
  const reviewData = city.testimonial ? [{
    author: city.testimonial.name,
    text: city.testimonial.text,
    rating: 5,
    location: city.testimonial.neighborhood || city.name,
  }] : []

  return (
    <>
      <SiteHeader />

      {/* Schema Markup - Comprehensive regional SEO coverage */}
      <ServiceLocationSchema
        city={city}
        serviceName={service.serviceName}
        serviceDescription={service.serviceDescription}
      />
      <DetailedServiceSchema
        serviceName={service.serviceName}
        serviceSlug={serviceSlug}
        description={service.serviceDescription}
        cityName={city.name}
        citySlug={city.slug}
        priceRange={{ min: '500', max: '25000' }}
      />
      <NAPSchema city={city} pageType="service" />
      <HowToSchema
        name={`${service.serviceName} Process in ${city.name}`}
        description={`Our professional ${service.serviceName.toLowerCase()} process for ${city.name} homeowners`}
        steps={howToSteps}
        totalTime="P2D"
        estimatedCost={{ min: '500', max: '25000' }}
      />
      <FAQLocationSchema faqs={localFaqs} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <SpeakableSchema
        headline={`${service.serviceName} in ${city.name}, Mississippi`}
        summary={`Professional ${service.serviceName.toLowerCase()} services in ${city.name}. ${service.serviceDescription}`}
        url={`/${serviceSlug}-${city.slug}-ms`}
      />
      {reviewData.length > 0 && (
        <ReviewSchema
          reviews={reviewData}
          itemReviewed={{ name: `${service.serviceName} - ${city.name}`, type: 'Service' }}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-dark py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('/images/roof-pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-slate-deep/50 border border-gold/20 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-sm text-gray-300">{city.name}, {city.county} County, MS</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {service.serviceName} in {city.name}, Mississippi
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {service.serviceDescription} Serving {city.name} and {city.county} County with professional results.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
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
                <Clock className="w-5 h-5 text-gold" />
                <span>Free Estimates</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Get Free Estimate
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={getPhoneLink()}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                <Phone className="w-5 h-5" />
                {getPhoneDisplay()}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Why Choose Us for {service.serviceName} in {city.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-ink/50 rounded-lg border border-gold/10">
                  <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 bg-ink">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Our {service.serviceName} Process
            </h2>

            <div className="space-y-4">
              {service.process.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-deep/50 rounded-lg border border-gold/10">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <span className="text-gold font-semibold">{index + 1}</span>
                  </div>
                  <span className="text-gray-300 pt-1">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Local Content */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {service.serviceName} for {city.name} Homes
            </h2>
            <div className="prose prose-invert prose-gold max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed">
                {city.name} homeowners face unique roofing challenges due to Mississippi&apos;s climate.
                {city.localContent.weatherChallenges.slice(0, 2).map((challenge, i) => (
                  <span key={i}> {challenge.toLowerCase()}.</span>
                ))}
                {' '}Our {service.serviceName.toLowerCase()} services are designed specifically to address these local conditions.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With over a decade of experience serving {city.county} County, we understand the common roof types in the area
                including {city.localContent.commonRoofTypes.slice(0, 3).join(', ')}. Whether you&apos;re in
                {city.localContent.neighborhoods.length > 0 ? ` ${city.localContent.neighborhoods.slice(0, 2).join(' or ')}` : ` ${city.name}`},
                our team delivers professional {service.serviceName.toLowerCase()} with lasting results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-ink">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Common Questions About {service.serviceName}
            </h2>

            <div className="space-y-4">
              {localFaqs.map((faq, index) => (
                <div key={index} className="bg-slate-deep/50 border border-gold/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Internal Linking - Service Cross-Links */}
      <section className="py-12 bg-slate-deep">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Same service in other cities */}
            <ServiceCrossLinks
              currentService={serviceSlug}
              currentCity={city}
              maxLinks={10}
            />

            {/* All services in this city */}
            <div className="pt-8 border-t border-gold/10">
              <AllServicesInCity city={city} currentService={serviceSlug} />
            </div>

            {/* Link back to city page */}
            <div className="pt-6 text-center">
              <Link
                href={`/${city.slug}-roofing`}
                className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                View All Roofing Services in {city.name}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready for {service.serviceName} in {city.name}?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Get a free, no-obligation estimate from {city.name}&apos;s trusted roofing experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-ink font-semibold px-8 py-4 rounded-lg transition-all"
            >
              Get Your Free Estimate
            </Link>
            <Link
              href={`/${city.slug}-roofing`}
              className="inline-flex items-center justify-center bg-transparent border-2 border-gold/50 hover:border-gold text-white font-semibold px-8 py-4 rounded-lg transition-all"
            >
              All Services in {city.name}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
