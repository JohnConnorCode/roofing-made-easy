/**
 * Lightweight schema components that can be safely imported by client components.
 * These do NOT depend on business-loader or any server-only modules.
 */

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
