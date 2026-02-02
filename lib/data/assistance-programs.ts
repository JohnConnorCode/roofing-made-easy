// Assistance programs data for the customer portal
// Federal, state, local, and utility programs with eligibility criteria

export interface EligibilityCriteria {
  income_max_percent_ami?: number  // % of Area Median Income
  income_max_percent_poverty?: number  // % of Federal Poverty Level
  income_max?: number  // Absolute max income
  home_ownership?: boolean
  primary_residence?: boolean
  property_types?: string[]
  age_min?: number
  disabled?: boolean
  veteran?: boolean
  disaster_declared?: boolean
  citizenship?: string[]
  priority_groups?: string[]
}

export interface AssistanceProgramData {
  id: string
  name: string
  programCode: string
  programType: 'federal' | 'state' | 'local' | 'utility' | 'nonprofit'
  state?: string
  counties?: string[]
  description: string
  benefits: string
  maxBenefitAmount?: number
  eligibilityCriteria: EligibilityCriteria
  applicationUrl?: string
  applicationDeadline?: string
  contactPhone?: string
  contactEmail?: string
  requiredDocuments: string[]
  tips?: string
}

// Federal Programs - Available Nationwide
export const FEDERAL_PROGRAMS: AssistanceProgramData[] = [
  {
    id: 'fema-iha',
    name: 'FEMA Individual and Households Program',
    programCode: 'FEMA-IHP',
    programType: 'federal',
    description: 'Provides financial assistance to individuals and households affected by declared disasters when other assistance is not available.',
    benefits: 'Grants for home repair, replacement of essential items, and temporary housing. Maximum grant amounts vary by disaster declaration.',
    maxBenefitAmount: 42500,
    eligibilityCriteria: {
      disaster_declared: true,
      primary_residence: true,
      citizenship: ['us_citizen', 'qualified_alien'],
    },
    applicationUrl: 'https://www.disasterassistance.gov',
    contactPhone: '1-800-621-3362',
    requiredDocuments: [
      'Social Security Number',
      'Address of damaged property',
      'Current mailing address',
      'Phone numbers',
      'Insurance information',
      'Bank account information (for direct deposit)',
      'Description of damage',
    ],
    tips: 'Apply within 60 days of disaster declaration. Document all damage with photos before making repairs.',
  },
  {
    id: 'fha-title-i',
    name: 'FHA Title I Home Improvement Loan',
    programCode: 'FHA-TITLE-I',
    programType: 'federal',
    description: 'Federally insured loans for home improvements, including roofing, that may be easier to qualify for than conventional loans.',
    benefits: 'Loans up to $25,000 for single-family homes. Fixed interest rates with terms up to 20 years. No equity requirement.',
    maxBenefitAmount: 25000,
    eligibilityCriteria: {
      home_ownership: true,
      property_types: ['single_family', 'manufactured'],
    },
    applicationUrl: 'https://www.hud.gov/program_offices/housing/sfh/title',
    requiredDocuments: [
      'Proof of income',
      'Credit history',
      'Property ownership documentation',
      'Contractor estimates',
      'Loan application',
    ],
    tips: 'Apply through an FHA-approved lender. Good option if you have limited equity or less-than-perfect credit.',
  },
  {
    id: 'wap',
    name: 'Weatherization Assistance Program',
    programCode: 'WAP',
    programType: 'federal',
    description: 'Reduces energy costs for low-income households by improving home energy efficiency, which can include roof repairs related to insulation.',
    benefits: 'Free energy efficiency improvements including insulation, air sealing, and in some cases, roof repairs. Average benefit approximately $7,500.',
    maxBenefitAmount: 8000,
    eligibilityCriteria: {
      income_max_percent_poverty: 200,
      priority_groups: ['elderly', 'disabled', 'families_with_children'],
    },
    applicationUrl: 'https://www.energy.gov/eere/wap/weatherization-assistance-program',
    contactPhone: '1-800-366-4020',
    requiredDocuments: [
      'Proof of income for all household members',
      'Utility bills',
      'Social Security numbers',
      'Proof of home ownership or landlord permission',
    ],
    tips: 'Contact your local Community Action Agency to apply. Elderly, disabled, and families with children get priority.',
  },
  {
    id: 'usda-repair',
    name: 'USDA Single Family Housing Repair Loans & Grants',
    programCode: 'USDA-504',
    programType: 'federal',
    description: 'Provides loans and grants to very low-income homeowners in rural areas for home repairs, including roofing.',
    benefits: 'Loans up to $40,000 at 1% interest. Grants up to $10,000 for homeowners 62+ who cannot afford a loan.',
    maxBenefitAmount: 50000,
    eligibilityCriteria: {
      home_ownership: true,
      income_max_percent_ami: 50,
      age_min: 62,  // For grants
    },
    applicationUrl: 'https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants',
    requiredDocuments: [
      'Proof of ownership',
      'Proof of income',
      'Proof of rural area residence',
      'Contractor estimates',
      'Age verification (for grants)',
    ],
    tips: 'Property must be in a rural area. Grants are only available to homeowners 62 and older.',
  },
  {
    id: 'hud-203k',
    name: 'HUD 203(k) Rehabilitation Mortgage',
    programCode: 'HUD-203K',
    programType: 'federal',
    description: 'Allows homebuyers and homeowners to finance both the purchase/refinance and rehabilitation of a home through a single mortgage.',
    benefits: 'Finance home purchase/refinance plus repair costs in one loan. Can include roofing in rehabilitation scope.',
    eligibilityCriteria: {
      home_ownership: true,
      property_types: ['single_family', 'multi_family_4_or_less'],
    },
    applicationUrl: 'https://www.hud.gov/program_offices/housing/sfh/203k',
    requiredDocuments: [
      'Standard mortgage application documents',
      'Detailed work write-up with cost estimates',
      'Contractor bids',
      'Property appraisal',
    ],
    tips: 'Good for extensive repairs. Requires working with 203(k) consultants for larger projects.',
  },
]

// State Programs - Texas (as example, can be expanded)
export const TEXAS_PROGRAMS: AssistanceProgramData[] = [
  {
    id: 'tx-home',
    name: 'Texas HOME Investment Partnerships Program',
    programCode: 'TX-HOME',
    programType: 'state',
    state: 'TX',
    description: 'State-funded program providing assistance for low-income homeowners needing critical home repairs.',
    benefits: 'Grants up to $30,000 for critical home repairs including roofing for eligible homeowners.',
    maxBenefitAmount: 30000,
    eligibilityCriteria: {
      income_max_percent_ami: 80,
      home_ownership: true,
      primary_residence: true,
    },
    applicationUrl: 'https://www.tdhca.state.tx.us/home',
    contactPhone: '1-800-525-0657',
    requiredDocuments: [
      'Proof of home ownership',
      'Proof of income for all household members',
      'Tax returns',
      'Property tax records',
      'Homeowner insurance documentation',
    ],
    tips: 'Apply through your local participating organization. Priority given to elderly and disabled homeowners.',
  },
  {
    id: 'tx-amy-young',
    name: 'Amy Young Barrier Removal Program',
    programCode: 'TX-AYBRP',
    programType: 'state',
    state: 'TX',
    description: 'Provides one-time grants to persons with disabilities for home modifications and barrier removal.',
    benefits: 'Up to $20,000 for home modifications. Can include roof repairs if related to accessibility needs.',
    maxBenefitAmount: 20000,
    eligibilityCriteria: {
      income_max_percent_ami: 80,
      home_ownership: true,
      disabled: true,
    },
    applicationUrl: 'https://www.tdhca.state.tx.us/htf/single-family/amy-young.htm',
    requiredDocuments: [
      'Proof of disability',
      'Proof of income',
      'Proof of home ownership',
      'Medical documentation if applicable',
    ],
    tips: 'Must demonstrate how repairs relate to accessibility needs.',
  },
]

// Nonprofit Programs
export const NONPROFIT_PROGRAMS: AssistanceProgramData[] = [
  {
    id: 'habitat-repair',
    name: 'Habitat for Humanity Home Repair Program',
    programCode: 'HABITAT-REPAIR',
    programType: 'nonprofit',
    description: 'Provides critical home repairs for qualified homeowners through local Habitat affiliates.',
    benefits: 'Low-cost or no-cost home repairs including roofing. Terms vary by local affiliate.',
    eligibilityCriteria: {
      home_ownership: true,
      income_max_percent_ami: 80,
    },
    applicationUrl: 'https://www.habitat.org/local/find-your-local-habitat',
    requiredDocuments: [
      'Proof of home ownership',
      'Proof of income',
      'Application varies by affiliate',
    ],
    tips: 'Contact your local Habitat affiliate directly. Programs vary significantly by location.',
  },
  {
    id: 'rebuilding-together',
    name: 'Rebuilding Together',
    programCode: 'REBUILD-TOGETHER',
    programType: 'nonprofit',
    description: 'National nonprofit providing free home repairs for low-income homeowners, especially seniors and veterans.',
    benefits: 'Free critical home repairs including roofing performed by volunteers.',
    eligibilityCriteria: {
      home_ownership: true,
      income_max_percent_ami: 80,
      priority_groups: ['elderly', 'disabled', 'veteran', 'families_with_children'],
    },
    applicationUrl: 'https://rebuildingtogether.org/find-your-local-affiliate',
    requiredDocuments: [
      'Proof of home ownership',
      'Proof of income',
      'Application form',
    ],
    tips: 'Priority given to seniors, veterans, and people with disabilities. Most repairs done during annual rebuilding events.',
  },
]

// Utility Rebate Programs
export const UTILITY_PROGRAMS: AssistanceProgramData[] = [
  {
    id: 'cool-roof-rebate',
    name: 'Cool Roof Rebate Programs',
    programCode: 'COOL-ROOF',
    programType: 'utility',
    description: 'Utility rebates for installing energy-efficient cool roofing materials that reflect sunlight and reduce cooling costs.',
    benefits: 'Rebates typically range from $0.10 to $0.30 per square foot for qualifying cool roof materials.',
    eligibilityCriteria: {
      property_types: ['single_family', 'multi_family', 'commercial'],
    },
    applicationUrl: 'https://www.energystar.gov/products/building_products/roof_products/find_rebates',
    requiredDocuments: [
      'Proof of installation',
      'Product specifications showing Energy Star qualification',
      'Contractor invoice',
      'Before and after photos',
    ],
    tips: 'Check with your local utility company for specific rebate amounts. Must use ENERGY STAR certified products.',
  },
]

// All programs combined
export const ALL_ASSISTANCE_PROGRAMS: AssistanceProgramData[] = [
  ...FEDERAL_PROGRAMS,
  ...TEXAS_PROGRAMS,
  ...NONPROFIT_PROGRAMS,
  ...UTILITY_PROGRAMS,
]

// Helper functions
export function getProgramsByType(type: AssistanceProgramData['programType']): AssistanceProgramData[] {
  return ALL_ASSISTANCE_PROGRAMS.filter((p) => p.programType === type)
}

export function getProgramsByState(state: string): AssistanceProgramData[] {
  return ALL_ASSISTANCE_PROGRAMS.filter(
    (p) => !p.state || p.state === state
  )
}

export function getProgramById(id: string): AssistanceProgramData | undefined {
  return ALL_ASSISTANCE_PROGRAMS.find((p) => p.id === id)
}

// Eligibility checking helpers
export interface UserEligibilityData {
  income?: number
  areaMedianIncome?: number
  povertyLevel?: number
  isHomeowner?: boolean
  isPrimaryResidence?: boolean
  propertyType?: string
  age?: number
  isDisabled?: boolean
  isVeteran?: boolean
  state?: string
  hasDisasterDeclaration?: boolean
  citizenship?: string
}

export function checkEligibility(
  program: AssistanceProgramData,
  userData: UserEligibilityData
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = []
  let eligible = true

  const criteria = program.eligibilityCriteria

  // Check income vs AMI
  if (criteria.income_max_percent_ami && userData.income && userData.areaMedianIncome) {
    const maxIncome = (criteria.income_max_percent_ami / 100) * userData.areaMedianIncome
    if (userData.income > maxIncome) {
      eligible = false
      reasons.push(`Income exceeds ${criteria.income_max_percent_ami}% of Area Median Income`)
    }
  }

  // Check income vs poverty level
  if (criteria.income_max_percent_poverty && userData.income && userData.povertyLevel) {
    const maxIncome = (criteria.income_max_percent_poverty / 100) * userData.povertyLevel
    if (userData.income > maxIncome) {
      eligible = false
      reasons.push(`Income exceeds ${criteria.income_max_percent_poverty}% of Federal Poverty Level`)
    }
  }

  // Check absolute income max
  if (criteria.income_max && userData.income) {
    if (userData.income > criteria.income_max) {
      eligible = false
      reasons.push(`Income exceeds maximum of $${criteria.income_max.toLocaleString()}`)
    }
  }

  // Check home ownership
  if (criteria.home_ownership && userData.isHomeowner === false) {
    eligible = false
    reasons.push('Requires home ownership')
  }

  // Check primary residence
  if (criteria.primary_residence && userData.isPrimaryResidence === false) {
    eligible = false
    reasons.push('Must be primary residence')
  }

  // Check property type
  if (criteria.property_types && userData.propertyType) {
    if (!criteria.property_types.includes(userData.propertyType)) {
      eligible = false
      reasons.push(`Property type not eligible (requires: ${criteria.property_types.join(', ')})`)
    }
  }

  // Check age requirement
  if (criteria.age_min && userData.age) {
    if (userData.age < criteria.age_min) {
      eligible = false
      reasons.push(`Must be at least ${criteria.age_min} years old`)
    }
  }

  // Check disability requirement
  if (criteria.disabled && userData.isDisabled === false) {
    eligible = false
    reasons.push('Requires disability status')
  }

  // Check veteran requirement
  if (criteria.veteran && userData.isVeteran === false) {
    eligible = false
    reasons.push('Requires veteran status')
  }

  // Check disaster declaration
  if (criteria.disaster_declared && !userData.hasDisasterDeclaration) {
    eligible = false
    reasons.push('Requires active disaster declaration for your area')
  }

  // Check state
  if (program.state && userData.state && program.state !== userData.state) {
    eligible = false
    reasons.push(`Only available in ${program.state}`)
  }

  return { eligible, reasons }
}

// Get potentially eligible programs for a user
export function getEligiblePrograms(userData: UserEligibilityData): {
  eligible: AssistanceProgramData[]
  maybeEligible: AssistanceProgramData[]
  notEligible: Array<{ program: AssistanceProgramData; reasons: string[] }>
} {
  const eligible: AssistanceProgramData[] = []
  const maybeEligible: AssistanceProgramData[] = []
  const notEligible: Array<{ program: AssistanceProgramData; reasons: string[] }> = []

  // Filter by state first
  const statePrograms = userData.state
    ? getProgramsByState(userData.state)
    : ALL_ASSISTANCE_PROGRAMS

  for (const program of statePrograms) {
    const result = checkEligibility(program, userData)

    if (result.eligible) {
      // Check if we have enough data to confirm eligibility
      const hasEnoughData = Object.keys(program.eligibilityCriteria).every((key) => {
        switch (key) {
          case 'income_max_percent_ami':
            return userData.income !== undefined && userData.areaMedianIncome !== undefined
          case 'income_max_percent_poverty':
            return userData.income !== undefined && userData.povertyLevel !== undefined
          case 'income_max':
            return userData.income !== undefined
          case 'home_ownership':
            return userData.isHomeowner !== undefined
          case 'primary_residence':
            return userData.isPrimaryResidence !== undefined
          case 'age_min':
            return userData.age !== undefined
          case 'disabled':
            return userData.isDisabled !== undefined
          case 'veteran':
            return userData.isVeteran !== undefined
          case 'disaster_declared':
            return userData.hasDisasterDeclaration !== undefined
          default:
            return true
        }
      })

      if (hasEnoughData) {
        eligible.push(program)
      } else {
        maybeEligible.push(program)
      }
    } else {
      notEligible.push({ program, reasons: result.reasons })
    }
  }

  return { eligible, maybeEligible, notEligible }
}

// Status labels for program applications
export const APPLICATION_STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  researching: {
    label: 'Researching',
    color: 'text-slate-400',
    description: 'Learning about this program',
  },
  eligible: {
    label: 'Eligible',
    color: 'text-blue-400',
    description: 'You appear to meet eligibility requirements',
  },
  not_eligible: {
    label: 'Not Eligible',
    color: 'text-red-400',
    description: 'You do not meet eligibility requirements',
  },
  applied: {
    label: 'Applied',
    color: 'text-yellow-400',
    description: 'Application submitted, awaiting decision',
  },
  approved: {
    label: 'Approved',
    color: 'text-green-400',
    description: 'Your application was approved',
  },
  denied: {
    label: 'Denied',
    color: 'text-red-400',
    description: 'Your application was denied',
  },
}

// Program type labels
export const PROGRAM_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  federal: {
    label: 'Federal Program',
    color: 'text-blue-400 bg-blue-400/10',
    icon: '🏛️',
  },
  state: {
    label: 'State Program',
    color: 'text-purple-400 bg-purple-400/10',
    icon: '🏠',
  },
  local: {
    label: 'Local Program',
    color: 'text-green-400 bg-green-400/10',
    icon: '📍',
  },
  utility: {
    label: 'Utility Rebate',
    color: 'text-yellow-400 bg-yellow-400/10',
    icon: '⚡',
  },
  nonprofit: {
    label: 'Nonprofit',
    color: 'text-pink-400 bg-pink-400/10',
    icon: '❤️',
  },
}
