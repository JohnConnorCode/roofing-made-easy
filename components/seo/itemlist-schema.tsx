/**
 * ItemList Schema Component
 *
 * Generates Schema.org ItemList structured data for contractor type listings.
 * Lists types of contractors (educational content) rather than fake company names.
 */

import { ContractorType, getContractorTypesForCity } from '@/lib/data/ms-competitors'
import { BUSINESS_CONFIG } from '@/lib/config/business'

interface ItemListSchemaProps {
  cityName: string
  citySlug: string
  stateCode: string
  baseUrl?: string
}

/**
 * ItemList Schema for comparison pages
 * Lists contractor types as educational content (not fake company names)
 */
export function ItemListSchema({
  cityName,
  citySlug,
  stateCode,
  baseUrl = 'https://farrellroofing.com'
}: ItemListSchemaProps) {
  const contractorTypes = getContractorTypesForCity(citySlug)

  const listItems = [
    // Featured company (real)
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'RoofingContractor',
        name: BUSINESS_CONFIG.name,
        description: `Northeast Mississippi's trusted roofing contractor serving ${cityName} and surrounding areas.`,
        url: `${baseUrl}/${citySlug}-roofing`
      }
    },
    // Contractor types as educational content
    ...contractorTypes.map((type, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      item: {
        '@type': 'HowToTip',
        name: type.type,
        text: type.description
      }
    }))
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Roofing Contractor Guide for ${cityName}, ${stateCode}`,
    description: `A guide to finding quality roofing contractors in ${cityName}, Mississippi. Learn about different contractor types and what to look for.`,
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

// Legacy interface for backward compatibility
interface LegacyItemListSchemaProps {
  cityName: string
  stateCode: string
  competitors: Array<{
    id: string
    name: string
    description: string
    services: string[]
    yearsInBusiness?: number
    serviceArea: string
  }>
  baseUrl?: string
}
