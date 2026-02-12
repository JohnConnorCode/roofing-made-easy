// Location-specific Schema.org structured data components
//
// IMPORTANT: These schemas include production guards to prevent
// fake/placeholder data from being rendered in search results.
import { MSCity, MSCounty } from '@/lib/data/ms-locations'
import {
  BUSINESS_CONFIG,
  hasRealContactInfo,
  hasVerifiedReviews,
  getSocialLinks,
} from '@/lib/config/business'

interface LocationSchemaProps {
  city: MSCity
  baseUrl?: string
}

/**
 * City-specific LocalBusiness schema
 *
 * NOTE: Returns null in production if real contact info is not configured.
 * This prevents Google penalties for fabricated structured data.
 */
export function CityLocationSchema({ city, baseUrl = 'https://www.smartroofpricing.com' }: LocationSchemaProps) {
  // SAFETY: Don't render LocalBusiness schema with fake contact info in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const socialLinks = getSocialLinks()

  // Build the schema object
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/${city.slug}-roofing/#localbusiness`,
    name: `${BUSINESS_CONFIG.name} - ${city.name}`,
    image: `${baseUrl}/images/smart-roof-pricing-${city.slug}.jpg`,
    url: `${baseUrl}/${city.slug}-roofing`,
    telephone: BUSINESS_CONFIG.phone.raw,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.stateCode,
      postalCode: city.zipCodes[0],
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.coordinates.lat,
      longitude: city.coordinates.lng
    },
    areaServed: {
      '@type': 'City',
      name: `${city.name}, ${city.state}`
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: BUSINESS_CONFIG.hours.weekdays.open,
        closes: BUSINESS_CONFIG.hours.weekdays.close
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: BUSINESS_CONFIG.hours.saturday.open,
        closes: BUSINESS_CONFIG.hours.saturday.close
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Roofing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Roof Replacement in ${city.name}, ${city.stateCode}`,
            description: `Professional roof replacement services in ${city.name}, ${city.state}`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Roof Repair in ${city.name}, ${city.stateCode}`,
            description: `Expert roof repair services in ${city.name}, ${city.state}`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Storm Damage Repair in ${city.name}, ${city.stateCode}`,
            description: `Emergency storm damage roof repair in ${city.name}, ${city.state}`
          }
        }
      ]
    }
  }

  // SAFETY: Only include aggregateRating if we have verified reviews
  if (hasVerifiedReviews()) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(BUSINESS_CONFIG.reviews.googleRating),
      reviewCount: String(BUSINESS_CONFIG.reviews.googleReviewCount)
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

interface CountySchemaProps {
  county: MSCounty
  baseUrl?: string
}

/**
 * County-specific LocalBusiness schema
 *
 * NOTE: Returns null in production if real contact info is not configured.
 * This prevents Google penalties for fabricated structured data.
 */
export function CountyLocationSchema({ county, baseUrl = 'https://www.smartroofpricing.com' }: CountySchemaProps) {
  // SAFETY: Don't render LocalBusiness schema with fake contact info in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  // Build the schema object
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/${county.slug}-roofing/#localbusiness`,
    name: `${BUSINESS_CONFIG.name} - ${county.name}`,
    url: `${baseUrl}/${county.slug}-roofing`,
    telephone: BUSINESS_CONFIG.phone.raw,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressRegion: county.stateCode,
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${county.name}, ${county.state}`
    }
  }

  // SAFETY: Only include aggregateRating if we have verified reviews
  if (hasVerifiedReviews()) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(BUSINESS_CONFIG.reviews.googleRating),
      reviewCount: String(BUSINESS_CONFIG.reviews.googleReviewCount)
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceLocationSchemaProps {
  city: MSCity
  serviceName: string
  serviceDescription: string
  baseUrl?: string
}

/**
 * Service+Location schema for service pages
 * This schema is safe to render as it doesn't include contact info
 */
export function ServiceLocationSchema({
  city,
  serviceName,
  serviceDescription,
  baseUrl = 'https://www.smartroofpricing.com'
}: ServiceLocationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${serviceName} in ${city.name}, ${city.stateCode}`,
    description: serviceDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_CONFIG.name,
      url: baseUrl
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: city.state
      }
    },
    serviceType: serviceName,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQLocationSchemaProps {
  faqs: Array<{ question: string; answer: string }>
}

export function FAQLocationSchema({ faqs }: FAQLocationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url?: string; href?: string }>
  baseUrl?: string
}

export function BreadcrumbSchema({ items, baseUrl = 'https://www.smartroofpricing.com' }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const itemUrl = item.url || item.href || ''
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: itemUrl.startsWith('http') ? itemUrl : `${baseUrl}${itemUrl}`
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
