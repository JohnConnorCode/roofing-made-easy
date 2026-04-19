/**
 * Schema.org Structured Data Components
 *
 * These components add structured data to pages for better SEO
 * and rich snippets in search results.
 *
 * IMPORTANT: These schemas include production guards to prevent
 * fake/placeholder data from being rendered in search results.
 */

import {
  BUSINESS_CONFIG,
  hasRealContactInfo,
  getSocialLinks,
} from '@/lib/config/business'
import { getBusinessConfigFromDB } from '@/lib/config/business-loader'

interface LocalBusinessSchemaProps {
  name?: string
  description?: string
  url?: string
  priceRange?: string
}

/**
 * LocalBusiness schema for the company
 * Add this to the root layout
 *
 * NOTE: Returns null in production if real contact info is not configured.
 * This prevents Google penalties for fabricated structured data.
 */
export async function LocalBusinessSchema({
  name,
  description,
  url = 'https://www.smartroofpricing.com',
  priceRange = '$$',
}: LocalBusinessSchemaProps = {}) {
  const config = await getBusinessConfigFromDB()

  // SAFETY: Don't render LocalBusiness schema with fake contact info in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const resolvedName = name ?? config.name
  const resolvedDescription =
    description ??
    `Trusted roofing contractor serving ${config.address.city} and ${config.serviceArea.region}. Roof repair, replacement, and storm damage restoration with free estimates.`

  const socialLinks = getSocialLinks(config)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: resolvedName,
    description: resolvedDescription,
    '@id': `${url}/#organization`,
    url,
    priceRange,
    image: `${url}/images/og-default.jpg`,
    logo: `${url}/images/og-default.jpg`,
    telephone: config.phone.raw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      addressRegion: config.address.stateCode,
      postalCode: config.address.zip,
      addressCountry: config.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.coordinates.lat,
      longitude: config.coordinates.lng,
    },
    areaServed: [
      {
        '@type': 'State',
        name: config.address.state,
      },
    ],
    serviceType: [
      'Roof Replacement',
      'Roof Repair',
      'Storm Damage Repair',
      'Roof Inspection',
      'Gutter Installation',
      'Emergency Roof Repair',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: config.hours.weekdays.open,
        closes: config.hours.weekdays.close,
      },
      ...(config.hours.saturday
        ? [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Saturday',
              opens: config.hours.saturday.open,
              closes: config.hours.saturday.close,
            },
          ]
        : []),
    ],
  }

  if (config.reviews.googleRating !== null && config.reviews.googleReviewCount !== null) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(config.reviews.googleRating),
      reviewCount: String(config.reviews.googleReviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  }

  if (socialLinks.length > 0) {
    schema.sameAs = socialLinks
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceSchemaProps {
  name?: string
  description?: string
  provider?: string
  url?: string
}

/**
 * Service schema for the roofing estimate service
 */
export async function ServiceSchema({
  name = 'Free Roofing Estimate',
  description,
  provider,
  url = 'https://www.smartroofpricing.com',
}: ServiceSchemaProps = {}) {
  const config = await getBusinessConfigFromDB()
  const resolvedDescription =
    description ??
    `Get an instant, accurate roofing estimate for your ${config.serviceArea.region} home, built from real local material and labor rates. With guidance on insurance, financing, and assistance.`
  const resolvedProvider = provider ?? config.name

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description: resolvedDescription,
    provider: {
      '@type': 'RoofingContractor',
      name: resolvedProvider,
      address: {
        '@type': 'PostalAddress',
        addressLocality: config.address.city,
        addressRegion: config.address.stateCode,
        addressCountry: config.address.countryCode,
      },
    },
    serviceType: 'Roofing Estimate',
    areaServed: {
      '@type': 'State',
      name: config.address.state,
    },
    url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free roofing estimate',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  items: FAQItem[]
}

/**
 * FAQ schema for frequently asked questions
 * Helps with rich snippets in Google search results
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
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

interface WebPageSchemaProps {
  name: string
  description: string
  url: string
}

/**
 * WebPage schema for individual pages
 */
export function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: BUSINESS_CONFIG.name,
      url: 'https://www.smartroofpricing.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
