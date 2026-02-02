/**
 * Demo Estimates Data
 *
 * Pre-calculated example estimates for the demo page showcasing
 * the estimation system capabilities.
 */

import type { RoofVariables, EstimateLineItem, LineItemCategory, UnitType } from '@/lib/supabase/types'
import type { PricingTier } from '@/lib/estimation/pricing-tiers'

// =============================================================================
// TYPES
// =============================================================================

export interface DemoEstimate {
  id: string
  name: string
  description: string
  roofType: string
  variables: RoofVariables
  lineItems: EstimateLineItem[]
  totals: {
    totalMaterial: number
    totalLabor: number
    totalEquipment: number
    subtotal: number
    overheadPercent: number
    overheadAmount: number
    profitPercent: number
    profitAmount: number
    taxPercent: number
    taxAmount: number
    priceLow: number
    priceLikely: number
    priceHigh: number
  }
  tiers: PricingTier[]
  highlights: string[]
}

// =============================================================================
// HELPER: Create line item
// =============================================================================

function createLineItem(
  id: string,
  code: string,
  name: string,
  category: LineItemCategory,
  unitType: UnitType,
  quantity: number,
  wasteQty: number,
  matUnit: number,
  laborUnit: number,
  equipUnit: number,
  sortOrder: number
): EstimateLineItem {
  const matTotal = wasteQty * matUnit
  const laborTotal = wasteQty * laborUnit
  const equipTotal = wasteQty * equipUnit
  return {
    id,
    detailed_estimate_id: 'demo',
    line_item_id: id,
    item_code: code,
    name,
    category,
    unit_type: unitType,
    quantity,
    quantity_formula: null,
    waste_factor: wasteQty / quantity,
    quantity_with_waste: wasteQty,
    material_unit_cost: matUnit,
    labor_unit_cost: laborUnit,
    equipment_unit_cost: equipUnit,
    material_total: Math.round(matTotal * 100) / 100,
    labor_total: Math.round(laborTotal * 100) / 100,
    equipment_total: Math.round(equipTotal * 100) / 100,
    line_total: Math.round((matTotal + laborTotal + equipTotal) * 100) / 100,
    is_included: true,
    is_optional: false,
    is_taxable: category !== 'labor',
    sort_order: sortOrder,
    group_name: null,
    notes: null,
    quantity_override: false,
    cost_override: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// =============================================================================
// SMALL HOME ESTIMATE (25 SQ)
// =============================================================================

const smallHomeVariables: RoofVariables = {
  SQ: 25,
  SF: 2500,
  P: 200,
  EAVE: 100,
  R: 50,
  VAL: 0,
  HIP: 0,
  RAKE: 80,
  SKYLIGHT_COUNT: 1,
  CHIMNEY_COUNT: 1,
  PIPE_COUNT: 3,
  VENT_COUNT: 2,
  GUTTER_LF: 100,
  DS_COUNT: 4,
  slopes: {
    F1: { SQ: 12.5, SF: 1250, PITCH: 5, EAVE: 50, RIDGE: 25, VALLEY: 0, HIP: 0, RAKE: 40 },
    F2: { SQ: 12.5, SF: 1250, PITCH: 5, EAVE: 50, RIDGE: 25, VALLEY: 0, HIP: 0, RAKE: 40 },
  },
}

const smallHomeLineItems: EstimateLineItem[] = [
  createLineItem('sh-1', 'RFG100', 'Tear Off - 1 Layer', 'tear_off', 'SQ', 25, 25, 5, 85, 15, 10),
  createLineItem('sh-2', 'RFG220', 'Underlayment - Synthetic', 'underlayment', 'SQ', 25, 26.25, 18, 22, 3, 20),
  createLineItem('sh-3', 'RFG420', 'Shingles - Architectural', 'shingles', 'SQ', 25, 27.5, 125, 95, 10, 30),
  createLineItem('sh-4', 'FLS100', 'Drip Edge - Aluminum', 'flashing', 'LF', 180, 189, 1.5, 2.0, 0.25, 40),
  createLineItem('sh-5', 'FLS130', 'Chimney Flashing', 'flashing', 'EA', 1, 1, 85, 150, 15, 50),
  createLineItem('sh-6', 'SKY100', 'Skylight Flashing Kit', 'skylights', 'EA', 1, 1, 95, 120, 10, 60),
  createLineItem('sh-7', 'VNT100', 'Ridge Vent', 'ventilation', 'LF', 50, 50, 3.5, 4.0, 0.5, 70),
  createLineItem('sh-8', 'VNT120', 'Pipe Boot Flashing', 'ventilation', 'EA', 3, 3, 12, 25, 2, 80),
  createLineItem('sh-9', 'DSP100', 'Disposal - Roofing Debris', 'disposal', 'SQ', 25, 25, 35, 0, 0, 90),
]

const smallHomeTotals = {
  totalMaterial: 6547.50,
  totalLabor: 5002.75,
  totalEquipment: 702.50,
  subtotal: 12252.75,
  overheadPercent: 10,
  overheadAmount: 1225.28,
  profitPercent: 15,
  profitAmount: 2021.70,
  taxPercent: 0,
  taxAmount: 0,
  priceLow: 13949.77,
  priceLikely: 15499.73,
  priceHigh: 17824.69,
}

const smallHomeTiers: PricingTier[] = [
  {
    level: 'good',
    name: 'Essential',
    description: 'Quality protection at an affordable price',
    priceMultiplier: 1.0,
    priceLow: 13950,
    priceLikely: 15500,
    priceHigh: 17825,
    material: { name: '3-Tab Shingles', warranty: '25-Year Limited', description: 'Traditional 3-tab asphalt shingles' },
    features: ['Standard 3-tab shingles', 'Synthetic underlayment', 'Basic ridge vent', '5-year workmanship warranty'],
    warranty: { workmanship: '5 Years', manufacturer: '25-Year Limited' },
    isRecommended: false,
  },
  {
    level: 'better',
    name: 'Premium',
    description: 'Enhanced durability and curb appeal',
    priceMultiplier: 1.15,
    priceLow: 16042,
    priceLikely: 17825,
    priceHigh: 20499,
    material: { name: 'Architectural Shingles', warranty: '30-Year Limited Lifetime', description: 'Dimensional shingles with improved aesthetics' },
    features: ['Architectural dimensional shingles', 'Premium synthetic underlayment', 'Enhanced ridge ventilation', 'Upgraded drip edge', '7-year workmanship warranty'],
    warranty: { workmanship: '7 Years', manufacturer: '30-Year Limited Lifetime' },
    isRecommended: true,
  },
  {
    level: 'best',
    name: 'Elite',
    description: 'Maximum protection and premium aesthetics',
    priceMultiplier: 1.35,
    priceLow: 18832,
    priceLikely: 20925,
    priceHigh: 24063,
    material: { name: 'Designer Shingles', warranty: '50-Year or Lifetime', description: 'High-definition designer shingles' },
    features: ['Designer high-definition shingles', 'Ice & water shield at all valleys', 'Premium ventilation system', 'Copper drip edge', 'Starter strip protection', '10-year workmanship warranty', 'Transferable warranty'],
    warranty: { workmanship: '10 Years', manufacturer: '50-Year or Lifetime' },
    isRecommended: false,
  },
]

// =============================================================================
// MEDIUM COMMERCIAL ESTIMATE (40 SQ)
// =============================================================================

const mediumCommercialVariables: RoofVariables = {
  SQ: 40,
  SF: 4000,
  P: 280,
  EAVE: 140,
  R: 30,
  VAL: 60,
  HIP: 80,
  RAKE: 0,
  SKYLIGHT_COUNT: 3,
  CHIMNEY_COUNT: 2,
  PIPE_COUNT: 6,
  VENT_COUNT: 5,
  GUTTER_LF: 140,
  DS_COUNT: 6,
  slopes: {
    F1: { SQ: 10, SF: 1000, PITCH: 6, EAVE: 35, RIDGE: 10, VALLEY: 15, HIP: 20, RAKE: 0 },
    F2: { SQ: 10, SF: 1000, PITCH: 6, EAVE: 35, RIDGE: 10, VALLEY: 15, HIP: 20, RAKE: 0 },
    F3: { SQ: 10, SF: 1000, PITCH: 6, EAVE: 35, RIDGE: 10, VALLEY: 15, HIP: 20, RAKE: 0 },
    F4: { SQ: 10, SF: 1000, PITCH: 6, EAVE: 35, RIDGE: 10, VALLEY: 15, HIP: 20, RAKE: 0 },
  },
}

const mediumCommercialLineItems: EstimateLineItem[] = [
  createLineItem('mc-1', 'RFG100', 'Tear Off - 1 Layer', 'tear_off', 'SQ', 40, 40, 5, 85, 15, 10),
  createLineItem('mc-2', 'RFG220', 'Underlayment - Synthetic', 'underlayment', 'SQ', 40, 42, 18, 22, 3, 20),
  createLineItem('mc-3', 'RFG420', 'Shingles - Architectural', 'shingles', 'SQ', 40, 44, 125, 95, 10, 30),
  createLineItem('mc-4', 'FLS100', 'Drip Edge - Aluminum', 'flashing', 'LF', 220, 231, 1.5, 2.0, 0.25, 40),
  createLineItem('mc-5', 'FLS120', 'Valley Metal - W-Style', 'flashing', 'LF', 60, 63, 4.5, 6.0, 0.5, 45),
  createLineItem('mc-6', 'FLS110', 'Hip & Ridge Cap', 'flashing', 'LF', 110, 115.5, 8, 7, 1, 48),
  createLineItem('mc-7', 'FLS130', 'Chimney Flashing', 'flashing', 'EA', 2, 2, 85, 150, 15, 50),
  createLineItem('mc-8', 'SKY100', 'Skylight Flashing Kit', 'skylights', 'EA', 3, 3, 95, 120, 10, 60),
  createLineItem('mc-9', 'VNT100', 'Ridge Vent', 'ventilation', 'LF', 30, 30, 3.5, 4.0, 0.5, 70),
  createLineItem('mc-10', 'VNT120', 'Pipe Boot Flashing', 'ventilation', 'EA', 6, 6, 12, 25, 2, 80),
  createLineItem('mc-11', 'VNT130', 'Static Vent', 'ventilation', 'EA', 5, 5, 35, 45, 5, 85),
  createLineItem('mc-12', 'DSP100', 'Disposal - Roofing Debris', 'disposal', 'SQ', 40, 40, 35, 0, 0, 90),
]

const mediumCommercialTotals = {
  totalMaterial: 13824.75,
  totalLabor: 10672.50,
  totalEquipment: 1476.25,
  subtotal: 25973.50,
  overheadPercent: 10,
  overheadAmount: 2597.35,
  profitPercent: 15,
  profitAmount: 4285.63,
  taxPercent: 0,
  taxAmount: 0,
  priceLow: 29570.83,
  priceLikely: 32856.48,
  priceHigh: 37784.95,
}

const mediumCommercialTiers: PricingTier[] = [
  {
    level: 'good',
    name: 'Essential',
    description: 'Reliable commercial-grade protection',
    priceMultiplier: 1.0,
    priceLow: 29571,
    priceLikely: 32856,
    priceHigh: 37785,
    material: { name: '3-Tab Shingles', warranty: '25-Year Limited', description: 'Commercial-grade 3-tab shingles' },
    features: ['Standard 3-tab shingles', 'Synthetic underlayment', 'Basic ventilation', '5-year workmanship warranty'],
    warranty: { workmanship: '5 Years', manufacturer: '25-Year Limited' },
    isRecommended: false,
  },
  {
    level: 'better',
    name: 'Premium',
    description: 'Enhanced durability for commercial properties',
    priceMultiplier: 1.15,
    priceLow: 34007,
    priceLikely: 37785,
    priceHigh: 43453,
    material: { name: 'Architectural Shingles', warranty: '30-Year Limited Lifetime', description: 'Impact-resistant architectural shingles' },
    features: ['Architectural dimensional shingles', 'Premium synthetic underlayment', 'Enhanced ridge ventilation', 'Upgraded valley metal', 'Commercial-grade flashing', '7-year workmanship warranty'],
    warranty: { workmanship: '7 Years', manufacturer: '30-Year Limited Lifetime' },
    isRecommended: true,
  },
  {
    level: 'best',
    name: 'Elite',
    description: 'Maximum protection for commercial investment',
    priceMultiplier: 1.35,
    priceLow: 39921,
    priceLikely: 44356,
    priceHigh: 51010,
    material: { name: 'Designer Shingles', warranty: '50-Year or Lifetime', description: 'Premium designer shingles with enhanced wind rating' },
    features: ['Designer high-definition shingles', 'Ice & water shield at all valleys', 'Premium ventilation package', 'Copper accents', 'Enhanced warranty coverage', '10-year workmanship warranty', 'Transferable warranty'],
    warranty: { workmanship: '10 Years', manufacturer: '50-Year or Lifetime' },
    isRecommended: false,
  },
]

// =============================================================================
// LARGE COMPLEX ESTIMATE (55 SQ)
// =============================================================================

const largeComplexVariables: RoofVariables = {
  SQ: 55,
  SF: 5500,
  P: 320,
  EAVE: 160,
  R: 45,
  VAL: 90,
  HIP: 120,
  RAKE: 40,
  SKYLIGHT_COUNT: 4,
  CHIMNEY_COUNT: 2,
  PIPE_COUNT: 8,
  VENT_COUNT: 6,
  GUTTER_LF: 160,
  DS_COUNT: 8,
  slopes: {
    F1: { SQ: 15, SF: 1500, PITCH: 7, EAVE: 45, RIDGE: 12, VALLEY: 25, HIP: 35, RAKE: 10 },
    F2: { SQ: 15, SF: 1500, PITCH: 7, EAVE: 45, RIDGE: 12, VALLEY: 25, HIP: 35, RAKE: 10 },
    F3: { SQ: 12.5, SF: 1250, PITCH: 9, EAVE: 35, RIDGE: 10, VALLEY: 20, HIP: 25, RAKE: 10 },
    F4: { SQ: 12.5, SF: 1250, PITCH: 9, EAVE: 35, RIDGE: 11, VALLEY: 20, HIP: 25, RAKE: 10 },
  },
}

const largeComplexLineItems: EstimateLineItem[] = [
  createLineItem('lc-1', 'RFG110', 'Tear Off - 2 Layers', 'tear_off', 'SQ', 55, 55, 8, 135, 25, 10),
  createLineItem('lc-2', 'RFG225', 'Ice & Water Shield', 'underlayment', 'SQ', 15, 15.75, 65, 35, 5, 15),
  createLineItem('lc-3', 'RFG220', 'Underlayment - Synthetic', 'underlayment', 'SQ', 55, 57.75, 18, 22, 3, 20),
  createLineItem('lc-4', 'RFG430', 'Shingles - Designer', 'shingles', 'SQ', 55, 60.5, 185, 115, 12, 30),
  createLineItem('lc-5', 'FLS100', 'Drip Edge - Aluminum', 'flashing', 'LF', 360, 378, 1.5, 2.0, 0.25, 40),
  createLineItem('lc-6', 'FLS120', 'Valley Metal - W-Style', 'flashing', 'LF', 90, 94.5, 4.5, 6.0, 0.5, 45),
  createLineItem('lc-7', 'FLS110', 'Hip & Ridge Cap - Premium', 'flashing', 'LF', 165, 173.25, 12, 9, 1.5, 48),
  createLineItem('lc-8', 'FLS130', 'Chimney Flashing - Counter', 'flashing', 'EA', 2, 2, 125, 200, 20, 50),
  createLineItem('lc-9', 'SKY100', 'Skylight Flashing Kit', 'skylights', 'EA', 4, 4, 95, 120, 10, 60),
  createLineItem('lc-10', 'VNT100', 'Ridge Vent - Premium', 'ventilation', 'LF', 45, 45, 5, 5, 1, 70),
  createLineItem('lc-11', 'VNT120', 'Pipe Boot Flashing', 'ventilation', 'EA', 8, 8, 12, 25, 2, 80),
  createLineItem('lc-12', 'VNT130', 'Power Vent', 'ventilation', 'EA', 2, 2, 175, 125, 15, 85),
  createLineItem('lc-13', 'VNT140', 'Static Vent', 'ventilation', 'EA', 4, 4, 35, 45, 5, 86),
  createLineItem('lc-14', 'DCK100', 'Decking Repair', 'decking', 'SF', 80, 80, 3.5, 4.5, 0.5, 88),
  createLineItem('lc-15', 'DSP100', 'Disposal - Heavy Debris', 'disposal', 'SQ', 55, 55, 45, 0, 0, 90),
]

const largeComplexTotals = {
  totalMaterial: 24892.88,
  totalLabor: 17548.25,
  totalEquipment: 2645.63,
  subtotal: 45086.76,
  overheadPercent: 10,
  overheadAmount: 4508.68,
  profitPercent: 15,
  profitAmount: 7439.32,
  taxPercent: 0,
  taxAmount: 0,
  priceLow: 51331.28,
  priceLikely: 57034.76,
  priceHigh: 65589.97,
}

const largeComplexTiers: PricingTier[] = [
  {
    level: 'good',
    name: 'Essential',
    description: 'Comprehensive coverage at best value',
    priceMultiplier: 1.0,
    priceLow: 51331,
    priceLikely: 57035,
    priceHigh: 65590,
    material: { name: 'Architectural Shingles', warranty: '30-Year Limited', description: 'Quality architectural shingles' },
    features: ['Architectural shingles', 'Synthetic underlayment', 'Standard ventilation', 'Basic flashing package', '5-year workmanship warranty'],
    warranty: { workmanship: '5 Years', manufacturer: '30-Year Limited' },
    isRecommended: false,
  },
  {
    level: 'better',
    name: 'Premium',
    description: 'Enhanced protection for complex roofs',
    priceMultiplier: 1.15,
    priceLow: 59031,
    priceLikely: 65590,
    priceHigh: 75429,
    material: { name: 'Premium Architectural', warranty: '40-Year Limited Lifetime', description: 'High-wind rated architectural shingles' },
    features: ['Premium architectural shingles', 'Ice & water shield at valleys', 'Enhanced ridge ventilation', 'Premium valley metal', 'Upgraded chimney flashing', 'Power attic ventilation', '7-year workmanship warranty'],
    warranty: { workmanship: '7 Years', manufacturer: '40-Year Limited Lifetime' },
    isRecommended: true,
  },
  {
    level: 'best',
    name: 'Elite',
    description: 'Ultimate protection for luxury homes',
    priceMultiplier: 1.35,
    priceLow: 69297,
    priceLikely: 76997,
    priceHigh: 88546,
    material: { name: 'Designer Shingles', warranty: 'Lifetime', description: 'Designer shingles with Class 4 impact rating' },
    features: ['Designer impact-resistant shingles', 'Full ice & water shield coverage', 'Premium ventilation system', 'Copper valley liners', 'Custom chimney work', 'Reinforced decking', '10-year workmanship warranty', 'Fully transferable warranty'],
    warranty: { workmanship: '10 Years', manufacturer: 'Lifetime' },
    isRecommended: false,
  },
]

// =============================================================================
// EXPORTS
// =============================================================================

export const smallHome: DemoEstimate = {
  id: 'small-home',
  name: 'Small Home',
  description: 'Typical single-story ranch with gable roof',
  roofType: 'Gable Roof',
  variables: smallHomeVariables,
  lineItems: smallHomeLineItems,
  totals: smallHomeTotals,
  tiers: smallHomeTiers,
  highlights: [
    '25 squares (~2,500 SF)',
    'Simple gable design',
    '1 skylight, 1 chimney',
    'Standard 5/12 pitch',
  ],
}

export const mediumCommercial: DemoEstimate = {
  id: 'medium-commercial',
  name: 'Medium Commercial',
  description: 'Hip roof with multiple valleys and penetrations',
  roofType: 'Hip Roof',
  variables: mediumCommercialVariables,
  lineItems: mediumCommercialLineItems,
  totals: mediumCommercialTotals,
  tiers: mediumCommercialTiers,
  highlights: [
    '40 squares (~4,000 SF)',
    'Complex hip design',
    '3 skylights, 2 chimneys',
    '60 LF of valleys',
  ],
}

export const largeComplex: DemoEstimate = {
  id: 'large-complex',
  name: 'Large Complex',
  description: 'Multi-slope luxury home with steep pitches',
  roofType: 'Mixed Hip & Gable',
  variables: largeComplexVariables,
  lineItems: largeComplexLineItems,
  totals: largeComplexTotals,
  tiers: largeComplexTiers,
  highlights: [
    '55 squares (~5,500 SF)',
    '4 distinct roof slopes',
    '2-layer tear-off required',
    'Mixed 7/12 and 9/12 pitches',
  ],
}

export const demoEstimates: Record<string, DemoEstimate> = {
  'small-home': smallHome,
  'medium-commercial': mediumCommercial,
  'large-complex': largeComplex,
}

export const demoEstimateList: DemoEstimate[] = [smallHome, mediumCommercial, largeComplex]
