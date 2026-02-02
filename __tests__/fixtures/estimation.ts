/**
 * Test Fixtures for Estimation System
 */

import type {
  RoofVariables,
  SlopeVariables,
  LineItem,
  GeographicPricing,
  EstimateLineItem,
} from '@/lib/supabase/types'

// =============================================================================
// ROOF VARIABLES FIXTURES
// =============================================================================

/**
 * Sample 25 SQ residential roof
 * Typical single-story home with gable roof
 */
export const sampleVariables: RoofVariables = {
  SQ: 25,
  SF: 2500,
  P: 200,
  EAVE: 100,
  R: 50,
  VAL: 20,
  HIP: 0,
  RAKE: 80,
  SKYLIGHT_COUNT: 1,
  CHIMNEY_COUNT: 1,
  PIPE_COUNT: 4,
  VENT_COUNT: 3,
  GUTTER_LF: 100,
  DS_COUNT: 4,
  slopes: {
    F1: {
      SQ: 12.5,
      SF: 1250,
      PITCH: 5,
      EAVE: 50,
      RIDGE: 25,
      VALLEY: 10,
      HIP: 0,
      RAKE: 40,
    },
    F2: {
      SQ: 12.5,
      SF: 1250,
      PITCH: 5,
      EAVE: 50,
      RIDGE: 25,
      VALLEY: 10,
      HIP: 0,
      RAKE: 40,
    },
  },
}

/**
 * Simple 20 SQ roof with no features
 */
export const simpleVariables: RoofVariables = {
  SQ: 20,
  SF: 2000,
  P: 180,
  EAVE: 90,
  R: 45,
  VAL: 0,
  HIP: 0,
  RAKE: 70,
  SKYLIGHT_COUNT: 0,
  CHIMNEY_COUNT: 0,
  PIPE_COUNT: 2,
  VENT_COUNT: 2,
  GUTTER_LF: 90,
  DS_COUNT: 3,
  slopes: {},
}

/**
 * Complex hip roof with multiple features
 */
export const complexVariables: RoofVariables = {
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

/**
 * Empty/zero variables for edge case testing
 */
export const emptyVariables: RoofVariables = {
  SQ: 0,
  SF: 0,
  P: 0,
  EAVE: 0,
  R: 0,
  VAL: 0,
  HIP: 0,
  RAKE: 0,
  SKYLIGHT_COUNT: 0,
  CHIMNEY_COUNT: 0,
  PIPE_COUNT: 0,
  VENT_COUNT: 0,
  GUTTER_LF: 0,
  DS_COUNT: 0,
  slopes: {},
}

// =============================================================================
// LINE ITEM FIXTURES
// =============================================================================

/**
 * Sample shingle line item
 */
export const sampleLineItem: LineItem = {
  id: 'test-shingle-1',
  item_code: 'RFG420',
  name: 'Shingles - Architectural Laminate',
  description: 'GAF Timberline HDZ or equivalent',
  category: 'shingles',
  unit_type: 'SQ',
  base_material_cost: 125,
  base_labor_cost: 95,
  base_equipment_cost: 10,
  quantity_formula: 'SQ*1.10',
  default_waste_factor: 1.0,
  min_quantity: 1,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 100,
  tags: ['shingles', 'laminate', 'architectural'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Tear-off line item
 */
export const tearOffLineItem: LineItem = {
  id: 'test-tearoff-1',
  item_code: 'RFG100',
  name: 'Tear Off - 1 Layer',
  description: 'Remove existing shingle layer',
  category: 'tear_off',
  unit_type: 'SQ',
  base_material_cost: 5,
  base_labor_cost: 85,
  base_equipment_cost: 15,
  quantity_formula: 'SQ',
  default_waste_factor: 1.0,
  min_quantity: 1,
  max_quantity: null,
  is_active: true,
  is_taxable: false,
  sort_order: 10,
  tags: ['tear-off', 'removal'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Underlayment line item
 */
export const underlaymentLineItem: LineItem = {
  id: 'test-underlayment-1',
  item_code: 'RFG220',
  name: 'Underlayment - Felt 30#',
  description: '30# felt underlayment',
  category: 'underlayment',
  unit_type: 'SQ',
  base_material_cost: 15,
  base_labor_cost: 25,
  base_equipment_cost: 5,
  quantity_formula: 'SQ*1.05',
  default_waste_factor: 1.0,
  min_quantity: 1,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 50,
  tags: ['underlayment', 'felt'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Drip edge line item
 */
export const dripEdgeLineItem: LineItem = {
  id: 'test-drip-edge-1',
  item_code: 'FLS100',
  name: 'Drip Edge - Aluminum',
  description: 'Standard aluminum drip edge',
  category: 'flashing',
  unit_type: 'LF',
  base_material_cost: 1.5,
  base_labor_cost: 2.0,
  base_equipment_cost: 0.25,
  quantity_formula: 'EAVE+RAKE',
  default_waste_factor: 1.05,
  min_quantity: 10,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 60,
  tags: ['flashing', 'drip-edge'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Valley flashing line item
 */
export const valleyFlashingLineItem: LineItem = {
  id: 'test-valley-1',
  item_code: 'FLS120',
  name: 'Valley Metal - W-Style',
  description: 'Galvanized W-style valley metal',
  category: 'flashing',
  unit_type: 'LF',
  base_material_cost: 4.5,
  base_labor_cost: 6.0,
  base_equipment_cost: 0.5,
  quantity_formula: 'VAL*1.05',
  default_waste_factor: 1.0,
  min_quantity: 0,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 65,
  tags: ['flashing', 'valley'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Chimney flashing line item
 */
export const chimneyFlashingLineItem: LineItem = {
  id: 'test-chimney-1',
  item_code: 'FLS130',
  name: 'Chimney Flashing Kit',
  description: 'Complete chimney counter-flashing',
  category: 'flashing',
  unit_type: 'EA',
  base_material_cost: 85,
  base_labor_cost: 150,
  base_equipment_cost: 15,
  quantity_formula: 'CHIMNEY_COUNT',
  default_waste_factor: 1.0,
  min_quantity: 0,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 70,
  tags: ['flashing', 'chimney'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Ridge vent line item
 */
export const ridgeVentLineItem: LineItem = {
  id: 'test-ridge-vent-1',
  item_code: 'VNT100',
  name: 'Ridge Vent - Shingle Over',
  description: 'Continuous shingle-over ridge vent',
  category: 'ventilation',
  unit_type: 'LF',
  base_material_cost: 3.5,
  base_labor_cost: 4.0,
  base_equipment_cost: 0.5,
  quantity_formula: 'R',
  default_waste_factor: 1.0,
  min_quantity: 0,
  max_quantity: null,
  is_active: true,
  is_taxable: true,
  sort_order: 80,
  tags: ['ventilation', 'ridge-vent'],
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

// =============================================================================
// GEOGRAPHIC PRICING FIXTURES
// =============================================================================

/**
 * Default pricing (no adjustment)
 */
export const defaultGeoPricing: GeographicPricing = {
  id: 'geo-default',
  state: null,
  county: null,
  zip_codes: [],
  name: 'Default',
  description: 'Standard national pricing',
  material_multiplier: 1.0,
  labor_multiplier: 1.0,
  equipment_multiplier: 1.0,
  is_active: true,
  effective_from: '2024-01-01',
  effective_until: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * High cost region (e.g., California Bay Area)
 */
export const highCostGeoPricing: GeographicPricing = {
  id: 'geo-high-cost',
  state: 'CA',
  county: 'San Francisco',
  zip_codes: ['94102', '94103', '94104'],
  name: 'San Francisco Metro',
  description: 'High cost of living adjustment',
  material_multiplier: 1.15,
  labor_multiplier: 1.45,
  equipment_multiplier: 1.10,
  is_active: true,
  effective_from: '2024-01-01',
  effective_until: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

/**
 * Low cost region (e.g., rural midwest)
 */
export const lowCostGeoPricing: GeographicPricing = {
  id: 'geo-low-cost',
  state: 'OK',
  county: null,
  zip_codes: [],
  name: 'Oklahoma',
  description: 'Below average cost adjustment',
  material_multiplier: 0.95,
  labor_multiplier: 0.85,
  equipment_multiplier: 0.90,
  is_active: true,
  effective_from: '2024-01-01',
  effective_until: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: null,
}

// =============================================================================
// ESTIMATE LINE ITEM FIXTURES
// =============================================================================

/**
 * Sample estimate line item (for checkForMissingItems tests)
 */
export const sampleEstimateLineItem: EstimateLineItem = {
  id: 'eli-1',
  detailed_estimate_id: 'est-1',
  line_item_id: 'test-shingle-1',
  item_code: 'RFG420',
  name: 'Shingles - Architectural Laminate',
  category: 'shingles',
  unit_type: 'SQ',
  quantity: 25,
  quantity_formula: 'SQ*1.10',
  waste_factor: 1.0,
  quantity_with_waste: 27.5,
  material_unit_cost: 125,
  labor_unit_cost: 95,
  equipment_unit_cost: 10,
  material_total: 3437.5,
  labor_total: 2612.5,
  equipment_total: 275,
  line_total: 6325,
  is_included: true,
  is_optional: false,
  is_taxable: true,
  sort_order: 100,
  group_name: null,
  notes: null,
  quantity_override: false,
  cost_override: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// =============================================================================
// COLLECTION FIXTURES
// =============================================================================

/**
 * Complete set of line items for a typical replacement job
 */
export const replacementLineItems: LineItem[] = [
  tearOffLineItem,
  underlaymentLineItem,
  sampleLineItem,
  dripEdgeLineItem,
  valleyFlashingLineItem,
  chimneyFlashingLineItem,
  ridgeVentLineItem,
]
