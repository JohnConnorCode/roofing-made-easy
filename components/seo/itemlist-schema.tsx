/**
 * ItemList Schema Component
 *
 * Generates Schema.org ItemList structured data for competitor/company listings.
 * Enables rich snippets in search results for "best roofers" type queries.
 */

import { CompetitorCompany } from '@/lib/data/ms-competitors'
import { BUSINESS_CONFIG } from '@/lib/config/business'

interface ItemListSchemaProps {
  cityName: string
  stateCode: string
  competitors: CompetitorCompany[]
  baseUrl?: string
}

/**
 * ItemList Schema for comparison pages
 * Lists Farrell Roofing as position 1, then competitors in order
 */
export function ItemListSchema({
  cityName,
  stateCode,
  competitors,
  baseUrl = 'https://farrellroofing.com'
}: ItemListSchemaProps) {
  const listItems = [
    // Farrell Roofing is always #1 (Featured/Our Top Pick)
    {
      '@type': 'ListItem',
      position: 1,
      name: BUSINESS_CONFIG.name,
      description: `Northeast Mississippi's trusted roofing contractor serving ${cityName} and surrounding areas.`,
      url: `${baseUrl}/${cityName.toLowerCase().replace(/\s+/g, '-')}-roofing`
    },
    // Add competitors
    ...competitors.map((competitor, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: competitor.name,
      description: competitor.description.substring(0, 160) // Truncate for schema
    }))
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Roofing Companies in ${cityName}, ${stateCode}`,
    description: `A curated list of top-rated roofing contractors serving ${cityName}, Mississippi. Compare services, coverage areas, and get free estimates.`,
    numberOfItems: listItems.length,
    itemListElement: listItems
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface RankedCompanyListSchemaProps {
  cityName: string
  stateCode: string
  items: Array<{
    name: string
    position: number
    description?: string
    url?: string
  }>
}

/**
 * Generic ranked list schema for any company listing
 */
export function RankedCompanyListSchema({
  cityName,
  stateCode,
  items
}: RankedCompanyListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top Roofing Companies in ${cityName}, ${stateCode}`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      ...(item.description && { description: item.description }),
      ...(item.url && { url: item.url })
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
