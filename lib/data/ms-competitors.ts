// Mississippi Roofing Contractor Types - Educational Content
// Used for "Best Roofing Companies in [City]" comparison pages
// Provides educational information about types of contractors, NOT fake company names

export interface ContractorType {
  id: string
  type: string
  description: string
  bestFor: string[]
  considerations: string[]
}

// Types of roofing contractors homeowners may encounter
// Educational content to help homeowners make informed decisions
export const contractorTypes: ContractorType[] = [
  {
    id: 'local-family-owned',
    type: 'Local Family-Owned Roofer',
    description: 'Locally owned and operated roofing contractors are often deeply invested in their community reputation. They typically have direct accountability, with the owner often involved in estimates and quality control.',
    bestFor: [
      'Homeowners who value personal relationships',
      'Those wanting direct owner involvement',
      'Projects where local knowledge matters',
      'Long-term warranty support'
    ],
    considerations: [
      'Verify they have proper licensing and insurance',
      'Check how long they have been in business locally',
      'Ask for local references you can contact',
      'Confirm their physical business address'
    ]
  },
  {
    id: 'general-exterior-contractor',
    type: 'General Exterior Contractor',
    description: 'Companies offering roofing alongside siding, windows, and gutters may be convenient for whole-house exterior projects. However, specialization in roofing may vary.',
    bestFor: [
      'Complete exterior renovations',
      'Coordinating multiple projects',
      'Single-contractor convenience',
      'Budget-focused homeowners'
    ],
    considerations: [
      'Verify roofing-specific certifications',
      'Ask what percentage of their work is roofing',
      'Check if they subcontract roofing work',
      'Review roofing-specific warranties separately'
    ]
  },
  {
    id: 'regional-commercial-roofer',
    type: 'Regional Commercial Roofer',
    description: 'Larger companies that handle both residential and commercial projects across wide service areas. They may offer extensive material options but response times can vary by location.',
    bestFor: [
      'Complex or large-scale residential projects',
      'Commercial building owners',
      'Specialty roofing systems',
      'Multi-property investors'
    ],
    considerations: [
      'Ask about dedicated residential crews',
      'Verify response times for your specific area',
      'Understand their residential warranty terms',
      'Check local reviews, not just regional reputation'
    ]
  },
  {
    id: 'storm-restoration-specialist',
    type: 'Storm Restoration Specialist',
    description: 'Companies specializing in storm damage repair and insurance claims. They often arrive after severe weather events and have experience navigating the claims process.',
    bestFor: [
      'Active insurance claims',
      'Storm damage restoration',
      'Emergency repairs',
      'Insurance process assistance'
    ],
    considerations: [
      'Verify they will remain accessible after repairs',
      'Understand warranty coverage if they are not local',
      'Do not sign contracts before your insurance inspection',
      'Be cautious of door-to-door solicitation after storms'
    ]
  },
  {
    id: 'premium-specialty-roofer',
    type: 'Premium/Specialty Roofer',
    description: 'Contractors specializing in high-end materials like designer shingles, standing seam metal, slate, or cedar shake. They typically focus on quality over volume.',
    bestFor: [
      'Custom or luxury homes',
      'Historic property restoration',
      'Specialty materials (metal, slate, cedar)',
      'Homeowners prioritizing aesthetics'
    ],
    considerations: [
      'Pricing typically 20-50% higher than standard',
      'Verify certifications for specialty materials',
      'Check manufacturer warranty requirements',
      'Review portfolio of similar completed projects'
    ]
  }
]

// Legacy interface for compatibility (deprecated - use ContractorType)
export interface CompetitorCompany {
  id: string
  name: string
  description: string
  services: string[]
  yearsInBusiness?: number
  serviceArea: string
}

// Returns empty array - no fake competitors
// Pages should use ContractorType educational content instead
export function getCompetitorsForCity(_citySlug: string): CompetitorCompany[] {
  return []
}

// Get all contractor types for educational content
export function getContractorTypes(): ContractorType[] {
  return contractorTypes
}

// Get contractor types relevant to a specific city context
export function getContractorTypesForCity(citySlug: string): ContractorType[] {
  // College towns get rental-relevant types first
  if (['oxford', 'starkville'].includes(citySlug)) {
    return [
      contractorTypes.find(t => t.id === 'local-family-owned')!,
      contractorTypes.find(t => t.id === 'general-exterior-contractor')!,
      contractorTypes.find(t => t.id === 'storm-restoration-specialist')!,
      contractorTypes.find(t => t.id === 'premium-specialty-roofer')!,
    ]
  }

  // Historic areas get specialty roofer earlier
  if (['corinth', 'columbus', 'aberdeen'].includes(citySlug)) {
    return [
      contractorTypes.find(t => t.id === 'local-family-owned')!,
      contractorTypes.find(t => t.id === 'premium-specialty-roofer')!,
      contractorTypes.find(t => t.id === 'storm-restoration-specialist')!,
      contractorTypes.find(t => t.id === 'regional-commercial-roofer')!,
    ]
  }

  // Default ordering for most cities
  return contractorTypes.slice(0, 4)
}
