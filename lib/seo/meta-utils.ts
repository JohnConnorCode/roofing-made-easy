// SEO Meta Utilities
// Helper functions for generating comprehensive meta tags

import { Metadata } from 'next'
import { MSCity, MSCounty } from '@/lib/data/ms-locations'
import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'
const SITE_NAME = 'Smart Roof Pricing'
const DEFAULT_IMAGE = '/images/og-default.jpg'

interface BaseMetaParams {
  title: string
  description: string
  path: string
  image?: string
  noIndex?: boolean
}

interface CityMetaParams extends BaseMetaParams {
  city: MSCity
}

interface CountyMetaParams extends BaseMetaParams {
  county: MSCounty
}

interface ServiceMetaParams extends BaseMetaParams {
  serviceName: string
  city?: MSCity
}

interface ComparisonMetaParams {
  city: MSCity
  path: string
  image?: string
}

// Generate base metadata with all recommended fields
export function generateBaseMeta({
  title,
  description,
  path,
  image,
  noIndex = false,
}: BaseMetaParams): Metadata {
  const url = `${BASE_URL}${path}`
  const imageUrl = image ? `${BASE_URL}${image}` : `${BASE_URL}${DEFAULT_IMAGE}`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@smartroofpricing',
      site: '@smartroofpricing',
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    authors: [{ name: SITE_NAME, url: BASE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    category: 'Home Services',
  }
}

// Generate city-specific metadata with local SEO optimizations
export function generateCityMeta({ city, title, description, path, image }: CityMetaParams): Metadata {
  const baseMeta = generateBaseMeta({ title, description, path, image })

  // Generate comprehensive keywords
  const keywords = [
    // Primary keywords
    `${city.name} roofing`,
    `${city.name} roofer`,
    `${city.name} roofing company`,
    `roofing contractor ${city.name}`,
    `roofers near ${city.name}`,

    // Service + location
    `roof repair ${city.name}`,
    `roof replacement ${city.name}`,
    `storm damage repair ${city.name}`,
    `roof inspection ${city.name}`,

    // County keywords
    `${city.county} County roofing`,
    `${city.county} County roofer`,

    // State keywords
    `${city.name} MS roofing`,
    `${city.name} Mississippi roofer`,
    `Northeast Mississippi roofing`,

    // Long-tail keywords
    `best roofer in ${city.name}`,
    `affordable roofing ${city.name}`,
    `emergency roof repair ${city.name}`,
    `free roofing estimate ${city.name}`,
  ]

  return {
    ...baseMeta,
    keywords,
    other: {
      'geo.region': 'US-MS',
      'geo.placename': city.name,
      'geo.position': `${city.coordinates.lat};${city.coordinates.lng}`,
      'ICBM': `${city.coordinates.lat}, ${city.coordinates.lng}`,
      'business:contact_data:locality': city.name,
      'business:contact_data:region': 'MS',
      'business:contact_data:country_name': 'United States',
      'business:contact_data:postal_code': city.zipCodes[0],
    },
  }
}

// Generate county-specific metadata
export function generateCountyMeta({ county, title, description, path, image }: CountyMetaParams): Metadata {
  const baseMeta = generateBaseMeta({ title, description, path, image })

  const keywords = [
    `${county.name} roofing`,
    `${county.name} roofer`,
    `${county.name} roofing contractor`,
    `${county.name} MS roofing`,
    `roofing services ${county.name}`,
    `roof repair ${county.name}`,
    `roof replacement ${county.name}`,
    'Mississippi roofing contractor',
    'Northeast Mississippi roofing',
  ]

  return {
    ...baseMeta,
    keywords,
    other: {
      'geo.region': 'US-MS',
      'geo.placename': county.name,
    },
  }
}

// Generate comparison page metadata for "Best Roofers in [City]" pages
export function generateComparisonMeta({ city, path, image }: ComparisonMetaParams): Metadata {
  const currentYear = new Date().getFullYear()
  const title = `Best Roofing Companies in ${city.name}, ${city.stateCode} (${currentYear} Guide)`
  const description = `Looking for trusted roofers in ${city.name}? Compare the top roofing companies in ${city.county} County, read expert recommendations, and get a free estimate.`

  // Use dynamic OG image for comparison pages
  const ogImageUrl = image || `/api/og/compare?city=${encodeURIComponent(city.name)}&state=${city.stateCode}`

  const baseMeta = generateBaseMeta({
    title,
    description,
    path,
    image: ogImageUrl
  })

  const keywords = [
    // Primary comparison keywords
    `best roofers ${city.name}`,
    `best roofing companies ${city.name}`,
    `top roofers ${city.name} ${city.stateCode}`,
    `roofing companies ${city.name} Mississippi`,
    `best roofing contractor ${city.name}`,

    // Local variations
    `${city.name} roofing companies`,
    `roofers near ${city.name}`,
    `roofing contractors ${city.county} County`,

    // Intent keywords
    `compare roofers ${city.name}`,
    `find roofer ${city.name}`,
    `roofing quotes ${city.name}`,
    `roofing estimates ${city.name}`,

    // Long-tail
    `who is the best roofer in ${city.name}`,
    `top rated roofers ${city.name} ${city.stateCode}`,
    `recommended roofing company ${city.name}`,
  ]

  return {
    ...baseMeta,
    keywords,
    other: {
      'geo.region': 'US-MS',
      'geo.placename': city.name,
      'geo.position': `${city.coordinates.lat};${city.coordinates.lng}`,
      'ICBM': `${city.coordinates.lat}, ${city.coordinates.lng}`,
      'business:contact_data:locality': city.name,
      'business:contact_data:region': 'MS',
      'business:contact_data:country_name': 'United States',
      'article:published_time': `${currentYear}-01-01`,
      'article:modified_time': new Date().toISOString().split('T')[0],
    },
  }
}

// Generate service + city metadata
export function generateServiceCityMeta({ serviceName, city, title, description, path, image }: ServiceMetaParams): Metadata {
  const baseMeta = generateBaseMeta({ title, description, path, image })

  const cityKeywords = city ? [
    `${serviceName.toLowerCase()} ${city.name}`,
    `${serviceName.toLowerCase()} ${city.name} MS`,
    `${city.name} ${serviceName.toLowerCase()}`,
    `${serviceName.toLowerCase()} near ${city.name}`,
    `best ${serviceName.toLowerCase()} ${city.name}`,
    `${city.county} County ${serviceName.toLowerCase()}`,
  ] : []

  const keywords = [
    serviceName.toLowerCase(),
    `${serviceName.toLowerCase()} Mississippi`,
    `${serviceName.toLowerCase()} service`,
    `professional ${serviceName.toLowerCase()}`,
    ...cityKeywords,
  ]

  return {
    ...baseMeta,
    keywords,
    ...(city && {
      other: {
        'geo.region': 'US-MS',
        'geo.placename': city.name,
        'geo.position': `${city.coordinates.lat};${city.coordinates.lng}`,
        'ICBM': `${city.coordinates.lat}, ${city.coordinates.lng}`,
      },
    }),
  }
}

// Truncate description to optimal length (150-160 chars)
export function optimizeDescription(description: string, maxLength: number = 155): string {
  if (description.length <= maxLength) return description

  // Find the last complete word within the limit
  const truncated = description.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

// Generate title with proper format and length (50-60 chars ideal)
export function optimizeTitle(
  primary: string,
  secondary?: string,
  brand: string = 'Smart Roof Pricing'
): string {
  const maxLength = 60

  // Try full format: Primary | Secondary | Brand
  if (secondary) {
    const fullTitle = `${primary} | ${secondary} | ${brand}`
    if (fullTitle.length <= maxLength) return fullTitle

    // Try without secondary
    const shortTitle = `${primary} | ${brand}`
    if (shortTitle.length <= maxLength) return shortTitle
  }

  // Try: Primary | Brand
  const standardTitle = `${primary} | ${brand}`
  if (standardTitle.length <= maxLength) return standardTitle

  // Just primary if too long
  return primary.length <= maxLength ? primary : primary.substring(0, maxLength - 3) + '...'
}

// Generate JSON-LD script tag
export function generateJsonLd(schema: object): string {
  return JSON.stringify(schema, null, 0)
}

// Common schema fragments for reuse
export const schemaFragments = {
  organization: {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: SITE_NAME,
    url: BASE_URL,
  },

  address: (city?: MSCity) => ({
    '@type': 'PostalAddress',
    streetAddress: BUSINESS_CONFIG.address.street,
    addressLocality: city?.name || BUSINESS_CONFIG.address.city,
    addressRegion: BUSINESS_CONFIG.address.stateCode,
    postalCode: city?.zipCodes?.[0] || BUSINESS_CONFIG.address.zip,
    addressCountry: BUSINESS_CONFIG.address.countryCode,
  }),

  geoCoordinates: (city?: MSCity) => ({
    '@type': 'GeoCoordinates',
    latitude: city?.coordinates.lat || 34.2576,
    longitude: city?.coordinates.lng || -88.7034,
  }),

  openingHours: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '14:00',
    },
  ],

  // Only include aggregateRating when real review data is available
  aggregateRating: BUSINESS_CONFIG.reviews.googleRating && BUSINESS_CONFIG.reviews.googleReviewCount
    ? {
        '@type': 'AggregateRating',
        ratingValue: String(BUSINESS_CONFIG.reviews.googleRating),
        bestRating: '5',
        worstRating: '1',
        ratingCount: String(BUSINESS_CONFIG.reviews.googleReviewCount),
        reviewCount: String(BUSINESS_CONFIG.reviews.googleReviewCount),
      }
    : null,
}
