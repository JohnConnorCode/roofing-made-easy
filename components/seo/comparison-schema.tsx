/**
 * Comparison Page Schema Bundle
 *
 * Combines all structured data schemas needed for "Best Roofing Companies" comparison pages.
 * Includes ItemList, FAQPage, BreadcrumbList, and LocalBusiness schemas.
 */

import { MSCity } from '@/lib/data/ms-locations'
import { BUSINESS_CONFIG } from '@/lib/config/business'
import { ItemListSchema } from './itemlist-schema'

interface ComparisonFAQ {
  question: string
  answer: string
}

interface ComparisonSchemaProps {
  city: MSCity
  faqs: ComparisonFAQ[]
  baseUrl?: string
}

/**
 * Complete schema bundle for comparison pages
 * Renders all relevant structured data in a single component
 */
export function ComparisonSchemaBundle({
  city,
  faqs,
  baseUrl = 'https://smartroofpricing.com'
}: ComparisonSchemaProps) {
  const pageUrl = `${baseUrl}/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`

  return (
    <>
      {/* ItemList Schema for contractor guide */}
      <ItemListSchema
        cityName={city.name}
        citySlug={city.slug}
        stateCode={city.stateCode}
        baseUrl={baseUrl}
      />

      {/* FAQPage Schema */}
      <ComparisonFAQSchema faqs={faqs} />

      {/* BreadcrumbList Schema */}
      <ComparisonBreadcrumbSchema city={city} baseUrl={baseUrl} />

      {/* Article Schema for editorial content */}
      <ComparisonArticleSchema city={city} pageUrl={pageUrl} />
    </>
  )
}

interface ComparisonFAQSchemaProps {
  faqs: ComparisonFAQ[]
}

/**
 * FAQ Schema for comparison page questions
 */
export function ComparisonFAQSchema({ faqs }: ComparisonFAQSchemaProps) {
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

interface ComparisonBreadcrumbSchemaProps {
  city: MSCity
  baseUrl: string
}

/**
 * Breadcrumb Schema for comparison pages
 */
export function ComparisonBreadcrumbSchema({ city, baseUrl }: ComparisonBreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Service Areas',
        item: `${baseUrl}/service-areas`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${city.county} County`,
        item: `${baseUrl}/${city.county.toLowerCase()}-county-roofing`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `Best Roofers in ${city.name}`,
        item: `${baseUrl}/best-roofers-in-${city.slug}-${city.stateCode.toLowerCase()}`
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ComparisonArticleSchemaProps {
  city: MSCity
  pageUrl: string
}

/**
 * Article Schema for editorial content credibility
 */
export function ComparisonArticleSchema({ city, pageUrl }: ComparisonArticleSchemaProps) {
  const currentYear = new Date().getFullYear()
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Best Roofing Companies in ${city.name}, ${city.stateCode} (${currentYear} Guide)`,
    description: `Compare top-rated roofing contractors serving ${city.name}, Mississippi. Expert recommendations, pricing information, and tips for choosing the right roofer.`,
    author: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
      url: 'https://smartroofpricing.com'
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: 'https://smartroofpricing.com/images/smart-roof-pricing-logo.png'
      }
    },
    // Only use dateModified - don't claim publication date without real date
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * LocalBusiness Schema specifically for Farrell Roofing on comparison pages
 * Highlights the featured company
 */
export function FeaturedCompanySchema({ city }: { city: MSCity }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: BUSINESS_CONFIG.name,
    description: `${BUSINESS_CONFIG.tagline}. Serving ${city.name} and ${city.county} County with professional roofing services.`,
    url: 'https://smartroofpricing.com',
    telephone: BUSINESS_CONFIG.phone.raw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: BUSINESS_CONFIG.address.city,
      addressRegion: BUSINESS_CONFIG.address.stateCode,
      postalCode: BUSINESS_CONFIG.address.zip,
      addressCountry: BUSINESS_CONFIG.address.countryCode
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONFIG.coordinates.lat,
      longitude: BUSINESS_CONFIG.coordinates.lng
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: city.state
      }
    },
    priceRange: '$$',
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
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
