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
  // Generate service-specific FAQs
  const faqs = getServiceFAQs(service)

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
function getServiceFAQs(service: Service): Array<{ question: string; answer: string }> {
  const serviceFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    replacement: [
      {
        question: 'How long does a roof replacement take?',
        answer: `Most roof replacements take ${service.timeframe || '1-3 days'}, depending on the size and complexity of your roof. We work efficiently while maintaining quality craftsmanship and complete all cleanup before leaving.`,
      },
      {
        question: 'What is included in a roof replacement?',
        answer: `Our roof replacement includes: ${service.features.slice(0, 4).join(', ')}. We use premium materials like ${service.materials.slice(0, 2).join(' and ')} for lasting protection.`,
      },
      {
        question: 'How much does a new roof cost?',
        answer: `Roof replacement costs typically range from ${service.priceRange || '$8,000 to $25,000'}, depending on roof size, pitch, material choice, and any repairs needed. We provide free, detailed estimates.`,
      },
    ],
    repair: [
      {
        question: 'Can a damaged roof be repaired instead of replaced?',
        answer: 'Many roof issues can be repaired rather than requiring full replacement. We provide honest assessments to help you make the most cost-effective decision for your situation.',
      },
      {
        question: 'How quickly can you repair my roof?',
        answer: `We offer ${service.timeframe || 'same-day service'} for most repairs. Emergency repairs are prioritized and we can typically respond within hours for urgent situations.`,
      },
      {
        question: 'What types of roof repairs do you handle?',
        answer: `We handle all types of repairs including: ${service.features.slice(0, 5).join(', ')}. No job is too small or too large for our experienced team.`,
      },
    ],
    inspection: [
      {
        question: 'How often should I get my roof inspected?',
        answer: 'We recommend annual roof inspections, plus after any major storm. Regular inspections catch small problems before they become expensive repairs.',
      },
      {
        question: 'What does a roof inspection include?',
        answer: `Our comprehensive inspection includes: ${service.features.slice(0, 4).join(', ')}. You receive a detailed written report with photos and recommendations.`,
      },
      {
        question: 'How long does a roof inspection take?',
        answer: `A thorough roof inspection typically takes ${service.timeframe || '1-2 hours'}. We examine every aspect of your roof including the attic space.`,
      },
    ],
    gutters: [
      {
        question: 'Why are gutters important for my roof?',
        answer: 'Proper drainage protects your roof, foundation, and landscaping. Without functioning gutters, water can damage your fascia, cause basement flooding, and erode your foundation.',
      },
      {
        question: 'What types of gutters do you install?',
        answer: `We install: ${service.materials.slice(0, 3).join(', ')}. Seamless aluminum is most popular for its durability and value.`,
      },
      {
        question: 'Do you offer gutter guards?',
        answer: 'Yes! We offer several gutter guard options to reduce maintenance and keep debris out. Gutter guards are especially valuable in wooded areas.',
      },
    ],
    maintenance: [
      {
        question: 'What is included in a roof maintenance plan?',
        answer: `Our maintenance plans include: ${service.features.slice(0, 4).join(', ')}. Regular maintenance extends your roof life and catches issues early.`,
      },
      {
        question: 'How often do you service the roof?',
        answer: 'Maintenance plans typically include annual or bi-annual visits. We schedule services to address seasonal concerns and post-storm checks.',
      },
      {
        question: 'Is a maintenance plan worth it?',
        answer: 'Regular maintenance can extend your roof life by years and save thousands in emergency repairs. It also helps maintain your warranty coverage.',
      },
    ],
    emergency: [
      {
        question: 'Do you offer 24/7 emergency roof repair?',
        answer: 'Yes! We provide 24/7 emergency response for urgent roof damage. Call us immediately for storm damage, sudden leaks, or fallen trees.',
      },
      {
        question: 'How quickly can you respond to an emergency?',
        answer: 'We prioritize emergencies and typically respond within hours. Our team can provide temporary repairs to prevent further damage while planning permanent solutions.',
      },
      {
        question: 'Will insurance cover my emergency roof repair?',
        answer: 'Storm damage and sudden incidents are typically covered by homeowners insurance. We document all damage thoroughly and can work directly with your insurance company.',
      },
    ],
  }

  return serviceFAQs[service.id] || []
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
    </>
  )
}
