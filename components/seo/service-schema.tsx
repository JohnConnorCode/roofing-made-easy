/**
 * Service Schema Components
 *
 * Generates structured data for service pages to enable
 * rich snippets in search results.
 */

import { BUSINESS_CONFIG } from '@/lib/config/business'
import { Service } from '@/lib/data/services'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

interface ServiceSchemaProps {
  service: Service
}

/**
 * Service schema for service detail pages
 * Adds structured data for Google rich snippets
 */
export function ServiceSchema({ service }: ServiceSchemaProps) {
  const serviceUrl = `${BASE_URL}/services/${service.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${serviceUrl}#service`,
    name: service.name,
    description: service.fullDescription,
    url: serviceUrl,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#organization`,
      name: BUSINESS_CONFIG.name,
      telephone: BUSINESS_CONFIG.phone.raw,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_CONFIG.address.street,
        addressLocality: BUSINESS_CONFIG.address.city,
        addressRegion: BUSINESS_CONFIG.address.stateCode,
        postalCode: BUSINESS_CONFIG.address.zip,
        addressCountry: BUSINESS_CONFIG.address.countryCode,
      },
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: BUSINESS_CONFIG.coordinates.lat,
        longitude: BUSINESS_CONFIG.coordinates.lng,
      },
      geoRadius: `${BUSINESS_CONFIG.serviceArea.radiusMiles} mi`,
    },
    serviceType: service.name,
    ...(service.priceRange && {
      offers: {
        '@type': 'Offer',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          price: service.priceRange,
        },
      },
    }),
    ...(service.image && {
      image: `${BASE_URL}${service.image}`,
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceFAQSchemaProps {
  service: Service
}

/**
 * FAQPage schema for service pages with common questions
 */
export function ServiceFAQSchema({ service }: ServiceFAQSchemaProps) {
  const faqs = service.commonFaqs

  if (faqs.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceBreadcrumbSchemaProps {
  service: Service
}

/**
 * BreadcrumbList schema for service navigation
 */
export function ServiceBreadcrumbSchema({ service }: ServiceBreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${BASE_URL}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: `${BASE_URL}/services/${service.slug}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Generate service-specific FAQs based on service type
 */
/**
 * HowTo schema for service process steps
 */
export function ServiceHowToSchema({ service }: ServiceSchemaProps) {
  if (!service.includedSteps || service.includedSteps.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How ${service.name} Works`,
    description: service.shortDescription,
    step: service.includedSteps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.body,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Combined schema bundle for service pages
 */
export function ServiceSchemaBundle({ service }: ServiceSchemaProps) {
  return (
    <>
      <ServiceSchema service={service} />
      <ServiceFAQSchema service={service} />
      <ServiceBreadcrumbSchema service={service} />
      <ServiceHowToSchema service={service} />
    </>
  )
}
