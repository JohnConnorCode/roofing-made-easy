/**
 * List/Collection Schema Components
 *
 * Generates Schema.org structured data for list and collection pages:
 * - ServicesListSchema: For service index pages
 * - CollectionPageSchema: For blog/article index pages
 * - BreadcrumbSchema: Reusable breadcrumb navigation schema
 */

import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * BreadcrumbList schema for navigation hierarchy
 * Helps search engines understand page structure
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ============================================================================
// SERVICES LIST SCHEMA
// ============================================================================

interface ServiceItem {
  name: string
  slug: string
  description: string
  priceRange?: string
}

interface ServicesListSchemaProps {
  services: ServiceItem[]
  pageTitle?: string
  pageDescription?: string
}

/**
 * ItemList schema for service collection pages
 * Lists all services with links to detail pages
 */
export function ServicesListSchema({
  services,
  pageTitle = 'Roofing Services',
  pageDescription = `Professional roofing services offered by ${BUSINESS_CONFIG.name} in ${BUSINESS_CONFIG.serviceArea.region}`,
}: ServicesListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: pageDescription,
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.description,
        url: `${BASE_URL}/services/${service.slug}`,
        provider: {
          '@type': 'RoofingContractor',
          name: BUSINESS_CONFIG.name,
        },
        ...(service.priceRange && {
          offers: {
            '@type': 'Offer',
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'USD',
            },
          },
        }),
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

// ============================================================================
// COLLECTION PAGE SCHEMA (Blog/Articles)
// ============================================================================

interface BlogPostItem {
  title: string
  slug: string
  excerpt: string
  author: string
  publishedAt?: string
  image?: string
}

interface CollectionPageSchemaProps {
  posts: BlogPostItem[]
  pageTitle?: string
  pageDescription?: string
}

/**
 * CollectionPage schema for blog/article index pages
 * Lists articles with metadata for rich results
 */
export function CollectionPageSchema({
  posts,
  pageTitle = 'Roofing Resources & Blog',
  pageDescription = `Expert roofing advice, tips, and guides from ${BUSINESS_CONFIG.name}`,
}: CollectionPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: `${BASE_URL}/blog`,
    isPartOf: {
      '@type': 'WebSite',
      name: BUSINESS_CONFIG.name,
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url: `${BASE_URL}/blog/${post.slug}`,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          publisher: {
            '@type': 'Organization',
            name: BUSINESS_CONFIG.name,
          },
          ...(post.publishedAt && { datePublished: post.publishedAt }),
          ...(post.image && { image: post.image }),
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ============================================================================
// ORGANIZATION SCHEMA (for About page)
// ============================================================================

interface OrganizationSchemaProps {
  name?: string
  description?: string
  foundingDate?: string
  numberOfEmployees?: string
}

/**
 * Organization schema for About/Company pages
 * Provides E-E-A-T signals to search engines
 */
export function OrganizationSchema({
  name = BUSINESS_CONFIG.name,
  description,
  foundingDate = BUSINESS_CONFIG.foundedYear,
  numberOfEmployees,
}: OrganizationSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'RoofingContractor'],
    '@id': `${BASE_URL}/#organization`,
    name,
    legalName: BUSINESS_CONFIG.legalName,
    url: BASE_URL,
    foundingDate,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: BUSINESS_CONFIG.address.city,
        addressRegion: BUSINESS_CONFIG.address.stateCode,
        addressCountry: BUSINESS_CONFIG.address.countryCode,
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: BUSINESS_CONFIG.address.city,
      addressRegion: BUSINESS_CONFIG.address.stateCode,
      postalCode: BUSINESS_CONFIG.address.zip,
      addressCountry: BUSINESS_CONFIG.address.countryCode,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_CONFIG.phone.raw,
      contactType: 'customer service',
      email: BUSINESS_CONFIG.email.primary,
      availableLanguage: 'English',
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
  }

  if (description) {
    schema.description = description
  }

  if (numberOfEmployees) {
    schema.numberOfEmployees = {
      '@type': 'QuantitativeValue',
      value: numberOfEmployees,
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ============================================================================
// ABOUT PAGE SCHEMA (WebPage type)
// ============================================================================

interface AboutPageSchemaProps {
  name?: string
  description?: string
}

/**
 * AboutPage schema for company/about pages
 */
export function AboutPageSchema({
  name = `About ${BUSINESS_CONFIG.name}`,
  description = `Learn about ${BUSINESS_CONFIG.name}, a family-owned roofing company serving ${BUSINESS_CONFIG.serviceArea.region} since ${BUSINESS_CONFIG.foundedYear}.`,
}: AboutPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    url: `${BASE_URL}/about`,
    isPartOf: {
      '@type': 'WebSite',
      name: BUSINESS_CONFIG.name,
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
