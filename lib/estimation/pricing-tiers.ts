/**
 * Pricing Tiers Calculation
 *
 * Generates Good/Better/Best pricing tiers from a base estimate.
 * Used to present customers with upgrade options that fit their budget and needs.
 */

import type { RoofMaterial } from '@/lib/supabase/types'

// =============================================================================
// TIER TYPES
// =============================================================================

export type TierLevel = 'good' | 'better' | 'best'

export interface PricingTier {
  level: TierLevel
  name: string
  description: string
  priceMultiplier: number
  priceLow: number
  priceLikely: number
  priceHigh: number
  material: {
    name: string
    warranty: string
    description: string
  }
  features: string[]
  warranty: {
    workmanship: string
    manufacturer: string
  }
  isRecommended: boolean
}

export interface TierConfig {
  name: string
  description: string
  priceMultiplier: number
  materialName: string
  materialDescription: string
  warrantyYears: number
  manufacturerWarranty: string
  features: string[]
}

// =============================================================================
// TIER CONFIGURATIONS BY MATERIAL
// =============================================================================

const ASPHALT_TIERS: Record<TierLevel, TierConfig> = {
  good: {
    name: 'Essential',
    description: 'Quality protection at an affordable price',
    priceMultiplier: 1.0,
    materialName: '3-Tab Shingles',
    materialDescription: 'Traditional 3-tab asphalt shingles - reliable and economical',
    warrantyYears: 25,
    manufacturerWarranty: '25-Year Limited',
    features: [
      'Standard 3-tab shingles',
      'Synthetic underlayment',
      'Basic ridge vent',
      '5-year workmanship warranty',
    ],
  },
  better: {
    name: 'Premium',
    description: 'Enhanced durability and curb appeal',
    priceMultiplier: 1.15,
    materialName: 'Architectural Shingles',
    materialDescription: 'Dimensional shingles with improved aesthetics and durability',
    warrantyYears: 30,
    manufacturerWarranty: '30-Year Limited Lifetime',
    features: [
      'Architectural dimensional shingles',
      'Premium synthetic underlayment',
      'Enhanced ridge ventilation',
      'Upgraded drip edge',
      '7-year workmanship warranty',
    ],
  },
  best: {
    name: 'Elite',
    description: 'Maximum protection and premium aesthetics',
    priceMultiplier: 1.35,
    materialName: 'Designer Shingles',
    materialDescription: 'High-definition designer shingles with superior performance',
    warrantyYears: 50,
    manufacturerWarranty: '50-Year or Lifetime',
    features: [
      'Designer high-definition shingles',
      'Ice & water shield at all valleys',
      'Premium ventilation system',
      'Copper or aluminum drip edge',
      'Starter strip protection',
      '10-year workmanship warranty',
      'Transferable warranty',
    ],
  },
}

const METAL_TIERS: Record<TierLevel, TierConfig> = {
  good: {
    name: 'Essential',
    description: 'Quality metal roofing at a great value',
    priceMultiplier: 1.0,
    materialName: 'Corrugated Metal',
    materialDescription: 'Galvanized corrugated metal panels',
    warrantyYears: 25,
    manufacturerWarranty: '25-Year Paint Warranty',
    features: [
      'Corrugated metal panels',
      'Standard underlayment',
      'Basic trim package',
      '5-year workmanship warranty',
    ],
  },
  better: {
    name: 'Premium',
    description: 'Standing seam for superior performance',
    priceMultiplier: 1.20,
    materialName: 'Standing Seam',
    materialDescription: 'Concealed fastener standing seam metal roofing',
    warrantyYears: 40,
    manufacturerWarranty: '40-Year Warranty',
    features: [
      'Standing seam panels',
      'High-temp synthetic underlayment',
      'Premium trim & flashing',
      'Color-matched accessories',
      '7-year workmanship warranty',
    ],
  },
  best: {
    name: 'Elite',
    description: 'Premium metal with maximum longevity',
    priceMultiplier: 1.40,
    materialName: 'Premium Standing Seam',
    materialDescription: 'Kynar/PVDF coated premium standing seam',
    warrantyYears: 50,
    manufacturerWarranty: 'Lifetime Limited',
    features: [
      'Kynar/PVDF coated panels',
      'Premium underlayment system',
      'Snow guards (if needed)',
      'Custom fabricated trim',
      'Color-matched ventilation',
      '10-year workmanship warranty',
      'Transferable warranty',
    ],
  },
}

const DEFAULT_TIERS: Record<TierLevel, TierConfig> = {
  good: {
    name: 'Essential',
    description: 'Quality materials at an affordable price',
    priceMultiplier: 1.0,
    materialName: 'Standard Materials',
    materialDescription: 'Quality roofing materials from trusted manufacturers',
    warrantyYears: 25,
    manufacturerWarranty: '25-Year Limited',
    features: [
      'Standard roofing materials',
      'Synthetic underlayment',
      'Basic ventilation',
      '5-year workmanship warranty',
    ],
  },
  better: {
    name: 'Premium',
    description: 'Enhanced quality and durability',
    priceMultiplier: 1.15,
    materialName: 'Premium Materials',
    materialDescription: 'Upgraded materials with enhanced performance',
    warrantyYears: 30,
    manufacturerWarranty: '30-Year Limited Lifetime',
    features: [
      'Premium roofing materials',
      'High-performance underlayment',
      'Enhanced ventilation system',
      'Upgraded accessories',
      '7-year workmanship warranty',
    ],
  },
  best: {
    name: 'Elite',
    description: 'Top-tier materials and maximum protection',
    priceMultiplier: 1.35,
    materialName: 'Elite Materials',
    materialDescription: 'Best-in-class materials with superior performance',
    warrantyYears: 50,
    manufacturerWarranty: '50-Year or Lifetime',
    features: [
      'Premium designer materials',
      'Ice & water shield protection',
      'Premium ventilation package',
      'All upgraded accessories',
      '10-year workmanship warranty',
      'Transferable warranty',
    ],
  },
}

// =============================================================================
// TIER CALCULATION
// =============================================================================

function getTierConfigs(material: RoofMaterial | null): Record<TierLevel, TierConfig> {
  switch (material) {
    case 'asphalt_shingle':
      return ASPHALT_TIERS
    case 'metal':
      return METAL_TIERS
    // Add more material-specific tiers as needed
    default:
      return DEFAULT_TIERS
  }
}

export interface BaseEstimate {
  priceLow: number
  priceLikely: number
  priceHigh: number
}

export interface PricingTiersResult {
  tiers: PricingTier[]
  selectedTier: TierLevel
}

/**
 * Calculate Good/Better/Best pricing tiers from a base estimate.
 *
 * The base estimate represents the "Good" tier.
 * Better = +15% (typical)
 * Best = +35% (typical)
 *
 * Multipliers vary by material type.
 */
export function calculatePricingTiers(
  baseEstimate: BaseEstimate,
  material: RoofMaterial | null = null,
  recommendedTier: TierLevel = 'better'
): PricingTiersResult {
  const configs = getTierConfigs(material)

  const tiers: PricingTier[] = (['good', 'better', 'best'] as TierLevel[]).map((level) => {
    const config = configs[level]

    // Calculate prices for this tier
    const priceLow = Math.round(baseEstimate.priceLow * config.priceMultiplier)
    const priceLikely = Math.round(baseEstimate.priceLikely * config.priceMultiplier)
    const priceHigh = Math.round(baseEstimate.priceHigh * config.priceMultiplier)

    return {
      level,
      name: config.name,
      description: config.description,
      priceMultiplier: config.priceMultiplier,
      priceLow,
      priceLikely,
      priceHigh,
      material: {
        name: config.materialName,
        warranty: config.manufacturerWarranty,
        description: config.materialDescription,
      },
      features: config.features,
      warranty: {
        workmanship: level === 'good' ? '5 Years' : level === 'better' ? '7 Years' : '10 Years',
        manufacturer: config.manufacturerWarranty,
      },
      isRecommended: level === recommendedTier,
    }
  })

  return {
    tiers,
    selectedTier: recommendedTier,
  }
}

/**
 * Get the price difference between tiers as a formatted string.
 */
export function getTierPriceDifference(
  currentTier: PricingTier,
  upgradeTier: PricingTier
): string {
  const diff = upgradeTier.priceLikely - currentTier.priceLikely
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(diff)
}

/**
 * Calculate monthly payment estimate for a tier.
 */
export function calculateMonthlyPayment(
  price: number,
  termMonths: number = 60,
  interestRate: number = 0.0699 // 6.99% APR
): number {
  if (interestRate === 0) {
    return Math.round(price / termMonths)
  }

  const monthlyRate = interestRate / 12
  const payment =
    (price * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)

  return Math.round(payment)
}
