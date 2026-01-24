/**
 * Schema.org Structured Data Components
 *
 * These components add structured data to pages for better SEO
 * and rich snippets in search results.
 */

interface LocalBusinessSchemaProps {
  name?: string
  description?: string
  url?: string
  priceRange?: string
}

/**
 * LocalBusiness schema for the company
 * Add this to the root layout
 */
export function LocalBusinessSchema({
  name = 'RoofEstimate by Farrell Roofing',
  description = 'Free instant roofing estimates. Get accurate pricing for roof repair, replacement, and inspection without the sales pressure.',
  url = 'https://roofestimate.com',
  priceRange = '$$',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    '@id': url,
    url,
    priceRange,
    image: `${url}/og-image.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    serviceType: [
      'Roofing Estimate',
      'Roof Repair',
      'Roof Replacement',
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
  name = 'Free Roofing Estimate Calculator',
  description = 'Get an instant, accurate roofing estimate in under 2 minutes. No contractors calling, no pressure. Just honest pricing for your roof repair or replacement.',
  provider = 'Farrell Roofing',
  url = 'https://roofestimate.com',
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'LocalBusiness',
      name: provider,
    },
    serviceType: 'Roofing Estimate',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free instant roofing estimate',
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
      name: 'RoofEstimate',
      url: 'https://roofestimate.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
