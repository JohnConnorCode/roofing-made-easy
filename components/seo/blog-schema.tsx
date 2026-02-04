/**
 * BlogPosting Schema Component
 *
 * Generates structured data for blog articles to enable
 * rich snippets in search results.
 */

import { BUSINESS_CONFIG } from '@/lib/config/business'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farrellroofing.com'

interface BlogPostingSchemaProps {
  title: string
  description: string
  slug: string
  image?: string
  datePublished: string
  dateModified?: string
  author: string
  category: string
  tags?: string[]
  wordCount?: number
}

/**
 * BlogPosting schema for blog articles
 * Adds structured data for Google rich snippets
 */
export function BlogPostingSchema({
  title,
  description,
  slug,
  image,
  datePublished,
  dateModified,
  author,
  category,
  tags = [],
  wordCount,
}: BlogPostingSchemaProps) {
  const articleUrl = `${BASE_URL}/blog/${slug}`
  const imageUrl = image ? `${BASE_URL}${image}` : `${BASE_URL}/images/og-default.jpg`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
      url: `${BASE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_CONFIG.name,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/farrell-roofing-logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    articleSection: category,
    keywords: tags.join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(wordCount && { wordCount }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * BreadcrumbList schema for blog navigation
 */
export function BlogBreadcrumbSchema({ title, slug }: { title: string; slug: string }) {
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
        name: 'Blog',
        item: `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${BASE_URL}/blog/${slug}`,
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
