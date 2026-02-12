// Regional SEO Schema Components
// Comprehensive structured data for regional ranking

import { MSCity, getAllCities, getAllCounties } from '@/lib/data/ms-locations'
import {
  BUSINESS_CONFIG,
  getSocialLinks,
  hasRealContactInfo,
  hasVerifiedReviews,
} from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://smartroofpricing.com'

// Complete Service Area Schema - Lists ALL served locations
export function ServiceAreaSchema() {
  const cities = getAllCities()
  const counties = getAllCounties()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE_URL}/#service-area`,
    name: 'Professional Roofing Services',
    provider: {
      '@type': 'RoofingContractor',
      '@id': `${BASE_URL}/#organization`,
      name: BUSINESS_CONFIG.name,
    },
    areaServed: [
      // All cities
      ...cities.map(city => ({
        '@type': 'City',
        name: city.name,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: `${city.county} County`,
          containedInPlace: {
            '@type': 'State',
            name: 'Mississippi',
          },
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city.coordinates.lat,
          longitude: city.coordinates.lng,
        },
      })),
      // All counties
      ...counties.map(county => ({
        '@type': 'AdministrativeArea',
        name: county.name,
        containedInPlace: {
          '@type': 'State',
          name: 'Mississippi',
        },
      })),
    ],
    serviceType: [
      'Roof Replacement',
      'Roof Repair',
      'Storm Damage Repair',
      'Roof Inspection',
      'Metal Roofing Installation',
      'Shingle Roofing',
      'Emergency Roof Repair',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Professional Credentials Schema - Only include verified credentials
export function ProfessionalCredentialsSchema() {
  const credentials = BUSINESS_CONFIG.credentials
  // Check if any credential is truthy (true for booleans or non-null string for license)
  const hasAnyCredentials = Object.values(credentials).some(v => Boolean(v))

  // Don't render if no real credentials
  if (!hasAnyCredentials) {
    return null
  }

  const credentialList = []

  if (credentials.stateLicensed && credentials.stateContractorLicense) {
    credentialList.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      name: 'Mississippi State Contractor License',
      identifier: credentials.stateContractorLicense,
      recognizedBy: {
        '@type': 'Organization',
        name: 'Mississippi State Board of Contractors',
      },
    })
  }

  if (credentials.gafCertified) {
    credentialList.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'GAF Certified Contractor',
      recognizedBy: {
        '@type': 'Organization',
        name: 'GAF',
        url: 'https://www.gaf.com',
      },
    })
  }

  if (credentials.owensCorningPreferred) {
    credentialList.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'Owens Corning Preferred Contractor',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Owens Corning',
        url: 'https://www.owenscorning.com',
      },
    })
  }

  if (credentials.certainteedMaster) {
    credentialList.push({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: 'CertainTeed SELECT ShingleMaster',
      recognizedBy: {
        '@type': 'Organization',
        name: 'CertainTeed',
        url: 'https://www.certainteed.com',
      },
    })
  }

  if (credentialList.length === 0) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${BASE_URL}/#credentials`,
    name: BUSINESS_CONFIG.name,
    hasCredential: credentialList,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Multi-Location Schema for regional presence
interface MultiLocationSchemaProps {
  primaryCity?: MSCity
}

export function MultiLocationSchema({ primaryCity }: MultiLocationSchemaProps) {
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const cities = getAllCities()
  const highPriorityCities = cities.filter(c => c.priority === 'high' || c.isHQ)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${BASE_URL}/#multi-location`,
    name: BUSINESS_CONFIG.name,
    description: `Professional roofing contractor serving ${BUSINESS_CONFIG.serviceArea.region}`,
    url: BASE_URL,
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
    areaServed: highPriorityCities.map(city => ({
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: 'Mississippi',
      },
    })),
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: primaryCity?.coordinates.lat || BUSINESS_CONFIG.coordinates.lat,
        longitude: primaryCity?.coordinates.lng || BUSINESS_CONFIG.coordinates.lng,
      },
      geoRadius: `${BUSINESS_CONFIG.serviceArea.radiusMiles * 1609}`, // Convert miles to meters
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Aggregate Rating Schema - ONLY renders if real reviews exist
interface AggregateReviewSchemaProps {
  city?: MSCity
}

export function AggregateReviewSchema({ city }: AggregateReviewSchemaProps) {
  const { googleRating, googleReviewCount, featured } = BUSINESS_CONFIG.reviews

  // CRITICAL: Only render if we have verified real reviews
  if (googleRating === null || googleReviewCount === null) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': city ? `${BASE_URL}/${city.slug}-roofing/#reviews` : `${BASE_URL}/#reviews`,
    name: city ? `${BUSINESS_CONFIG.name} - ${city.name}` : BUSINESS_CONFIG.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(googleRating),
      bestRating: '5',
      worstRating: '1',
      ratingCount: String(googleReviewCount),
    },
    // Only include individual reviews if we have verified ones
    ...(featured.length > 0 && {
      review: featured.filter(r => r.verified).map(review => ({
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
        datePublished: review.date,
      })),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Speakable Schema for voice search optimization
interface SpeakableSchemaProps {
  headline: string
  summary: string
  url: string
}

export function SpeakableSchema({ headline, summary, url }: SpeakableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: headline,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description', '.speakable'],
    },
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Video Schema for any video content
interface VideoSchemaProps {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration = 'PT2M30S',
  contentUrl,
  embedUrl,
}: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: thumbnailUrl.startsWith('http') ? thumbnailUrl : `${BASE_URL}${thumbnailUrl}`,
    uploadDate,
    duration,
    contentUrl,
    embedUrl,
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Image Gallery Schema for portfolio
interface ImageGallerySchemaProps {
  images: Array<{
    url: string
    caption: string
    location?: string
  }>
  galleryName: string
}

export function ImageGallerySchema({ images, galleryName }: ImageGallerySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: galleryName,
    description: `Portfolio of roofing projects completed by ${BUSINESS_CONFIG.name} in ${BUSINESS_CONFIG.serviceArea.region}`,
    image: images.map(img => ({
      '@type': 'ImageObject',
      contentUrl: img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`,
      caption: img.caption,
      ...(img.location && {
        contentLocation: {
          '@type': 'Place',
          name: img.location,
        },
      }),
    })),
    author: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Geo Shape Schema for precise service area
export function ServiceAreaGeoSchema() {
  const cities = getAllCities()

  // Create a bounding box around all service area cities
  const lats = cities.map(c => c.coordinates.lat)
  const lngs = cities.map(c => c.coordinates.lng)

  const minLat = Math.min(...lats) - 0.1
  const maxLat = Math.max(...lats) + 0.1
  const minLng = Math.min(...lngs) - 0.1
  const maxLng = Math.max(...lngs) + 0.1

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Roofing Services',
    provider: {
      '@type': 'RoofingContractor',
      name: BUSINESS_CONFIG.name,
    },
    areaServed: {
      '@type': 'GeoShape',
      box: `${minLat},${minLng} ${maxLat},${maxLng}`,
    },
    serviceArea: {
      '@type': 'AdministrativeArea',
      name: BUSINESS_CONFIG.serviceArea.region,
      containedInPlace: {
        '@type': 'State',
        name: 'Mississippi',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Same-As Links for brand consistency - Only if real profiles exist
export function BrandSameAsSchema() {
  const socialLinks = getSocialLinks()

  // Don't render if no social links configured
  if (socialLinks.length === 0) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#brand`,
    name: BUSINESS_CONFIG.name,
    url: BASE_URL,
    sameAs: socialLinks,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Seasonal Promotion Schema - Only for real promotions
interface SeasonalPromotionSchemaProps {
  promotionName: string
  description: string
  startDate: string
  endDate: string
  discount?: string
}

export function SeasonalPromotionSchema({
  promotionName,
  description,
  startDate,
  endDate,
  discount,
}: SeasonalPromotionSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SaleEvent',
    name: promotionName,
    description,
    startDate,
    endDate,
    location: {
      '@type': 'Place',
      name: BUSINESS_CONFIG.serviceArea.region,
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'MS',
        addressCountry: 'US',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      name: promotionName,
      description: discount ? `${discount} off roofing services` : description,
      url: `${BASE_URL}/contact`,
      availability: 'https://schema.org/InStock',
      validFrom: startDate,
      validThrough: endDate,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
