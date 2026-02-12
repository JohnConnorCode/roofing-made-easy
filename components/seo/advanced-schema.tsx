// Advanced Schema.org Structured Data Components
// Comprehensive SEO markup for local business optimization

import { MSCity, MSCounty } from '@/lib/data/ms-locations'
import {
  BUSINESS_CONFIG,
  getSocialLinks,
  hasRealContactInfo,
  hasVerifiedReviews,
} from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

// Organization Schema - Use on homepage/layout
export function OrganizationSchema() {
  const socialLinks = getSocialLinks()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: BUSINESS_CONFIG.name,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/icon.svg`,
    },
    description: `Professional roofing contractor serving ${BUSINESS_CONFIG.serviceArea.primaryCity} and ${BUSINESS_CONFIG.serviceArea.region} since ${BUSINESS_CONFIG.foundedYear}.`,
    foundingDate: BUSINESS_CONFIG.foundedYear,
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
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONFIG.coordinates.lat,
      longitude: BUSINESS_CONFIG.coordinates.lng,
    },
    telephone: BUSINESS_CONFIG.phone.raw,
    email: BUSINESS_CONFIG.email.primary,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS_CONFIG.phone.raw,
        contactType: 'customer service',
        areaServed: 'US-MS',
        availableLanguage: ['English'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: BUSINESS_CONFIG.hours.weekdays.open,
          closes: BUSINESS_CONFIG.hours.weekdays.close,
        },
      },
    ],
    // Only include sameAs if we have real social profiles
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    slogan: BUSINESS_CONFIG.tagline,
    knowsAbout: [
      'Roof Replacement',
      'Roof Repair',
      'Storm Damage Repair',
      'Metal Roofing',
      'Asphalt Shingles',
      'Roof Inspection',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// WebSite Schema - Use on homepage
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: BUSINESS_CONFIG.name,
    description: `Professional roofing services in ${BUSINESS_CONFIG.serviceArea.primaryCity} and ${BUSINESS_CONFIG.serviceArea.region}`,
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'en-US',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Enhanced LocalBusiness Schema with full details
interface EnhancedLocalBusinessProps {
  city?: MSCity
  county?: MSCounty
}

export function EnhancedLocalBusinessSchema({ city, county }: EnhancedLocalBusinessProps) {
  // Don't render with placeholder data in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const locationName = city?.name || county?.name || BUSINESS_CONFIG.address.city
  const locationSlug = city?.slug || county?.slug || 'tupelo'

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['RoofingContractor', 'HomeAndConstructionBusiness', 'LocalBusiness'],
    '@id': `${BASE_URL}/${locationSlug}-roofing/#localbusiness`,
    name: `${BUSINESS_CONFIG.name} - ${locationName}`,
    url: `${BASE_URL}/${locationSlug}-roofing`,
    telephone: BUSINESS_CONFIG.phone.raw,
    email: BUSINESS_CONFIG.email.primary,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: city?.name || BUSINESS_CONFIG.address.city,
      addressRegion: BUSINESS_CONFIG.address.stateCode,
      postalCode: city?.zipCodes?.[0] || BUSINESS_CONFIG.address.zip,
      addressCountry: BUSINESS_CONFIG.address.countryCode,
    },
    geo: city ? {
      '@type': 'GeoCoordinates',
      latitude: city.coordinates.lat,
      longitude: city.coordinates.lng,
    } : {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONFIG.coordinates.lat,
      longitude: BUSINESS_CONFIG.coordinates.lng,
    },
    areaServed: city ? {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: `${city.county} County, Mississippi`,
      },
    } : county ? {
      '@type': 'AdministrativeArea',
      name: `${county.name}, Mississippi`,
    } : {
      '@type': 'State',
      name: 'Mississippi',
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: city?.coordinates.lat || BUSINESS_CONFIG.coordinates.lat,
        longitude: city?.coordinates.lng || BUSINESS_CONFIG.coordinates.lng,
      },
      geoRadius: `${BUSINESS_CONFIG.serviceArea.radiusMiles * 1609}`,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: BUSINESS_CONFIG.hours.weekdays.open,
        closes: BUSINESS_CONFIG.hours.weekdays.close,
      },
      ...(BUSINESS_CONFIG.hours.saturday ? [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: BUSINESS_CONFIG.hours.saturday.open,
        closes: BUSINESS_CONFIG.hours.saturday.close,
      }] : []),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Roofing Services',
      itemListElement: [
        createServiceOffer('Roof Replacement', `Complete roof replacement in ${locationName}`,
          BUSINESS_CONFIG.pricing.roofReplacement.min.toString(),
          BUSINESS_CONFIG.pricing.roofReplacement.max.toString()),
        createServiceOffer('Roof Repair', `Roof repair services in ${locationName}`,
          BUSINESS_CONFIG.pricing.roofRepair.min.toString(),
          BUSINESS_CONFIG.pricing.roofRepair.max.toString()),
        createServiceOffer('Storm Damage Repair', `Storm damage restoration in ${locationName}`,
          BUSINESS_CONFIG.pricing.stormDamage.min.toString(),
          BUSINESS_CONFIG.pricing.stormDamage.max.toString()),
        createServiceOffer('Roof Inspection', `Professional roof inspection in ${locationName}`,
          BUSINESS_CONFIG.pricing.inspection.min.toString(),
          BUSINESS_CONFIG.pricing.inspection.max.toString()),
      ],
    },
    paymentAccepted: ['Cash', 'Check', 'Credit Card', 'Financing Available'],
    currenciesAccepted: 'USD',
  }

  // Only add aggregate rating if we have verified reviews
  const { googleRating, googleReviewCount } = BUSINESS_CONFIG.reviews
  if (googleRating !== null && googleReviewCount !== null) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(googleRating),
      bestRating: '5',
      worstRating: '1',
      ratingCount: String(googleReviewCount),
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function createServiceOffer(name: string, description: string, minPrice: string, maxPrice: string) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name,
      description,
    },
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      minPrice,
      maxPrice,
    },
  }
}

// Service Schema with detailed service info
interface ServiceSchemaProps {
  serviceName: string
  serviceSlug: string
  description: string
  cityName?: string
  citySlug?: string
  priceRange?: { min: string; max: string }
}

export function DetailedServiceSchema({
  serviceName,
  serviceSlug,
  description,
  cityName,
  citySlug,
  priceRange,
}: ServiceSchemaProps) {
  const url = citySlug
    ? `${BASE_URL}/${serviceSlug}-${citySlug}-ms`
    : `${BASE_URL}/services/${serviceSlug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}/#service`,
    name: cityName ? `${serviceName} in ${cityName}, MS` : serviceName,
    description,
    url,
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
    areaServed: cityName ? {
      '@type': 'City',
      name: cityName,
      containedInPlace: {
        '@type': 'State',
        name: 'Mississippi',
      },
    } : {
      '@type': 'State',
      name: 'Mississippi',
    },
    serviceType: serviceName,
    category: 'Roofing Services',
    hasOfferCatalog: priceRange ? {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      },
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
    } : undefined,
    termsOfService: `${BASE_URL}/terms`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// HowTo Schema for service processes
interface HowToStep {
  name: string
  text: string
}

interface HowToSchemaProps {
  name: string
  description: string
  steps: HowToStep[]
  totalTime?: string
  estimatedCost?: { min: string; max: string }
}

export function HowToSchema({ name, description, steps, totalTime, estimatedCost }: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime: totalTime || 'P2D',
    estimatedCost: estimatedCost ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      minValue: estimatedCost.min,
      maxValue: estimatedCost.max,
    } : undefined,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Review/Testimonial Schema - Only use with verified real reviews
interface ReviewSchemaProps {
  reviews: Array<{
    author: string
    text: string
    rating: number
    date?: string
    location?: string
  }>
  itemReviewed: {
    name: string
    type: 'LocalBusiness' | 'Service'
  }
}

export function ReviewSchema({ reviews, itemReviewed }: ReviewSchemaProps) {
  // Don't render if no verified reviews configured
  if (!hasVerifiedReviews() && reviews.length === 0) {
    return null
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  const schema = {
    '@context': 'https://schema.org',
    '@type': itemReviewed.type,
    name: itemReviewed.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviews.length.toString(),
      reviewCount: reviews.length.toString(),
    },
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: review.text,
      datePublished: review.date || new Date().toISOString().split('T')[0],
      ...(review.location && {
        locationCreated: {
          '@type': 'Place',
          name: review.location,
        },
      }),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// GeoTargeting Meta Tags Component
interface GeoMetaTagsProps {
  city?: MSCity
  county?: MSCounty
}

export function GeoMetaTags({ city, county }: GeoMetaTagsProps) {
  const lat = city?.coordinates.lat || BUSINESS_CONFIG.coordinates.lat
  const lng = city?.coordinates.lng || BUSINESS_CONFIG.coordinates.lng
  const placename = city?.name || county?.name || BUSINESS_CONFIG.address.city

  return (
    <>
      <meta name="geo.region" content="US-MS" />
      <meta name="geo.placename" content={placename} />
      <meta name="geo.position" content={`${lat};${lng}`} />
      <meta name="ICBM" content={`${lat}, ${lng}`} />
    </>
  )
}

// Comprehensive Meta Tags Generator
interface ComprehensiveMetaProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article' | 'local_business'
  city?: MSCity
  publishedTime?: string
  modifiedTime?: string
}

export function generateComprehensiveMeta({
  title,
  description,
  url,
  image,
  type = 'website',
  city,
  publishedTime,
  modifiedTime,
}: ComprehensiveMetaProps) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const imageUrl = image || `${BASE_URL}/images/og-default.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: BUSINESS_CONFIG.name,
      locale: 'en_US',
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [imageUrl],
    },
    other: {
      'geo.region': 'US-MS',
      'geo.placename': city?.name || BUSINESS_CONFIG.address.city,
      ...(city && {
        'geo.position': `${city.coordinates.lat};${city.coordinates.lng}`,
        'ICBM': `${city.coordinates.lat}, ${city.coordinates.lng}`,
      }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  }
}

// Article/Blog Schema
interface ArticleSchemaProps {
  title: string
  description: string
  url: string
  image?: string
  author?: string
  publishedDate: string
  modifiedDate?: string
  category?: string
}

export function ArticleSchema({
  title,
  description,
  url,
  image,
  author = `${BUSINESS_CONFIG.name} Team`,
  publishedDate,
  modifiedDate,
  category,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${BASE_URL}/images/og-default.jpg`,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Organization',
      name: author,
      url: BASE_URL,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.startsWith('http') ? url : `${BASE_URL}${url}`,
    },
    ...(category && { articleSection: category }),
    inLanguage: 'en-US',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Sitelinks Search Box Schema
export function SitelinksSearchBoxSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Re-export SpeakableSchema from regional for convenience
export { SpeakableSchema } from './regional-schema'
