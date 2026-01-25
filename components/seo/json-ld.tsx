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
  hasVerifiedReviews,
  getSocialLinks,
} from '@/lib/config/business'

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
export function LocalBusinessSchema({
  name = BUSINESS_CONFIG.name,
  description = 'Trusted roofing contractor serving Tupelo and Northeast Mississippi. Professional roof repair, replacement, and storm damage restoration with free estimates.',
  url = 'https://farrellroofing.com',
  priceRange = '$$',
}: LocalBusinessSchemaProps) {
  // SAFETY: Don't render LocalBusiness schema with fake contact info in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const socialLinks = getSocialLinks()

  // Build the schema object
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name,
    description,
    '@id': `${url}/#organization`,
    url,
    priceRange,
    image: `${url}/images/farrell-roofing-logo.png`,
    logo: `${url}/images/farrell-roofing-logo.png`,
    telephone: BUSINESS_CONFIG.phone.raw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: BUSINESS_CONFIG.address.city,
      addressRegion: BUSINESS_CONFIG.address.stateCode,
      postalCode: BUSINESS_CONFIG.address.zip,
      addressCountry: BUSINESS_CONFIG.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONFIG.coordinates.lat,
      longitude: BUSINESS_CONFIG.coordinates.lng,
    },
    areaServed: [
      {
        '@type': 'State',
        name: 'Mississippi',
        containsPlace: [
          { '@type': 'City', name: 'Tupelo' },
          { '@type': 'City', name: 'Oxford' },
          { '@type': 'City', name: 'Starkville' },
          { '@type': 'City', name: 'Columbus' },
          { '@type': 'City', name: 'Corinth' },
          { '@type': 'City', name: 'New Albany' },
          { '@type': 'City', name: 'Pontotoc' },
          { '@type': 'City', name: 'Booneville' },
        ],
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
        opens: BUSINESS_CONFIG.hours.weekdays.open,
        closes: BUSINESS_CONFIG.hours.weekdays.close,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: BUSINESS_CONFIG.hours.saturday.open,
        closes: BUSINESS_CONFIG.hours.saturday.close,
      },
    ],
  }

  // SAFETY: Only include aggregateRating if we have verified reviews
  if (hasVerifiedReviews()) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(BUSINESS_CONFIG.reviews.googleRating),
      reviewCount: String(BUSINESS_CONFIG.reviews.googleReviewCount),
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Only include social links if we have real ones configured
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
export function ServiceSchema({
  name = 'Free Roofing Estimate',
  description = 'Get an instant, accurate roofing estimate for your Northeast Mississippi home. No contractors calling, no pressure. Just honest pricing for roof repair or replacement.',
  provider = BUSINESS_CONFIG.name,
  url = 'https://farrellroofing.com',
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'RoofingContractor',
      name: provider,
      address: {
        '@type': 'PostalAddress',
        addressLocality: BUSINESS_CONFIG.address.city,
        addressRegion: BUSINESS_CONFIG.address.stateCode,
        addressCountry: BUSINESS_CONFIG.address.countryCode,
      },
    },
    serviceType: 'Roofing Estimate',
    areaServed: {
      '@type': 'State',
      name: BUSINESS_CONFIG.address.state,
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
      url: 'https://farrellroofing.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
