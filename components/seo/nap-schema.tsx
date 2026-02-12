// NAP (Name, Address, Phone) Consistency Schema
// Critical for local SEO - ensures consistent business information across all pages

import { MSCity } from '@/lib/data/ms-locations'
import {
  BUSINESS_CONFIG,
  getPhoneDisplay,
  getFullAddress,
  getSocialLinks,
  hasRealContactInfo,
} from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'

// Re-export for backwards compatibility
export const BUSINESS_INFO = {
  name: BUSINESS_CONFIG.name,
  legalName: BUSINESS_CONFIG.legalName,
  phone: BUSINESS_CONFIG.phone.raw,
  phoneDisplay: BUSINESS_CONFIG.phone.display,
  email: BUSINESS_CONFIG.email.primary,
  address: BUSINESS_CONFIG.address,
  coordinates: BUSINESS_CONFIG.coordinates,
  hours: BUSINESS_CONFIG.hours,
  url: BASE_URL,
}

// Comprehensive NAP Schema for any page
interface NAPSchemaProps {
  city?: MSCity
  pageType?: 'home' | 'service' | 'location' | 'contact'
}

export function NAPSchema({ city, pageType = 'home' }: NAPSchemaProps) {
  // Don't render schema with placeholder data in production
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const locationName = city ? `${BUSINESS_CONFIG.name} - ${city.name}` : BUSINESS_CONFIG.name
  const pageUrl = city ? `${BASE_URL}/${city.slug}-roofing` : BASE_URL

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['RoofingContractor', 'HomeAndConstructionBusiness', 'LocalBusiness'],
    '@id': `${pageUrl}/#nap-${pageType}`,

    // Name consistency
    name: locationName,
    legalName: BUSINESS_CONFIG.legalName,

    // Address consistency
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: city?.name || BUSINESS_CONFIG.address.city,
      addressRegion: BUSINESS_CONFIG.address.stateCode,
      postalCode: city?.zipCodes?.[0] || BUSINESS_CONFIG.address.zip,
      addressCountry: BUSINESS_CONFIG.address.countryCode,
    },

    // Phone consistency
    telephone: BUSINESS_CONFIG.phone.raw,

    // Additional contact
    email: BUSINESS_CONFIG.email.primary,
    url: pageUrl,

    // Geo coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city?.coordinates.lat || BUSINESS_CONFIG.coordinates.lat,
      longitude: city?.coordinates.lng || BUSINESS_CONFIG.coordinates.lng,
    },

    // Opening hours
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

    // Price range
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: ['Cash', 'Check', 'Credit Card', 'Financing'],

    // Only include sameAs if we have real social links
    ...(getSocialLinks().length > 0 && {
      sameAs: getSocialLinks(),
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Minimal NAP for footer/header (visible on every page)
export function MinimalNAPSchema() {
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': `${BASE_URL}/#footer-nap`,
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
        }),
      }}
    />
  )
}

// Contact Page specific NAP with extended info
export function ContactPageNAPSchema() {
  if (process.env.NODE_ENV === 'production' && !hasRealContactInfo()) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${BUSINESS_CONFIG.name}`,
    description: `Contact ${BUSINESS_CONFIG.name} for free roofing estimates in ${BUSINESS_CONFIG.serviceArea.region}`,
    url: `${BASE_URL}/contact`,
    mainEntity: {
      '@type': 'RoofingContractor',
      name: BUSINESS_CONFIG.name,
      telephone: BUSINESS_CONFIG.phone.raw,
      email: BUSINESS_CONFIG.email.primary,
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
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Export helper functions
export function getBusinessInfo() {
  return BUSINESS_INFO
}

export function formatPhone(): string {
  return getPhoneDisplay()
}

export function formatAddress(includeStreet = true): string {
  if (includeStreet) {
    return getFullAddress()
  }
  return `${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.stateCode}`
}
