/**
 * Detailed Pricing Engine
 *
 * Line item-based calculations with geographic pricing, material/labor/equipment
 * breakdowns, overhead, profit, and tax calculations.
 */

import type {
  LineItem,
  GeographicPricing,
  RoofVariables,
  DetailedEstimate,
  EstimateLineItem,
  EstimateMacro,
  MacroLineItemWithLineItem,
  LineItemCategory,
  UnitType,
  Json,
} from '@/lib/supabase/types'
import { evaluateFormula, calculateQuantityWithWaste } from './formula-parser'
import { getEmptyVariables } from './variables'

// =============================================================================
// TYPES
// =============================================================================

export interface EstimateInput {
  leadId: string
  sketchId?: string
  variables: RoofVariables
  macroId?: string
  geographicPricingId?: string
  overheadPercent?: number
  profitPercent?: number
  taxPercent?: number
  existingLayers?: number
}

export interface LineItemInput {
  lineItemId: string
  lineItem: LineItem
  quantityFormula?: string | null
  wasteFactor?: number
  quantity?: number // Manual override
  materialUnitCost?: number // Override
  laborUnitCost?: number // Override
  equipmentUnitCost?: number // Override
  isIncluded?: boolean
  isOptional?: boolean
  groupName?: string
  notes?: string
}

export interface CalculatedLineItem {
  lineItemId: string
  itemCode: string
  name: string
  category: LineItemCategory
  unitType: UnitType
  quantity: number
  quantityFormula: string | null
  wasteFactor: number
  quantityWithWaste: number
  materialUnitCost: number
  laborUnitCost: number
  equipmentUnitCost: number
  materialTotal: number
  laborTotal: number
  equipmentTotal: number
  lineTotal: number
  isIncluded: boolean
  isOptional: boolean
  isTaxable: boolean
  sortOrder: number
  groupName: string | null
  notes: string | null
}

export interface EstimateCalculation {
  lineItems: CalculatedLineItem[]
  totalMaterial: number
  totalLabor: number
  totalEquipment: number
  subtotal: number
  overheadPercent: number
  overheadAmount: number
  profitPercent: number
  profitAmount: number
  taxableAmount: number
  taxPercent: number
  taxAmount: number
  priceLow: number
  priceLikely: number
  priceHigh: number
  geographicAdjustment: number
}

// =============================================================================
// ENGINE CLASS
// =============================================================================

export class DetailedPricingEngine {
  private lineItems: Map<string, LineItem>
  private geographicPricing: GeographicPricing | null
  private macros: Map<string, EstimateMacro>

  constructor(
    lineItems: LineItem[] = [],
    geographicPricing: GeographicPricing | null = null,
    macros: EstimateMacro[] = []
  ) {
    this.lineItems = new Map(lineItems.map((li) => [li.id, li]))
    this.geographicPricing = geographicPricing
    this.macros = new Map(macros.map((m) => [m.id, m]))
  }

  /**
   * Set geographic pricing
   */
  setGeographicPricing(pricing: GeographicPricing | null): void {
    this.geographicPricing = pricing
  }

  /**
   * Get geographic multipliers
   */
  getGeographicMultipliers(): {
    material: number
    labor: number
    equipment: number
  } {
    if (!this.geographicPricing) {
      return { material: 1, labor: 1, equipment: 1 }
    }

    return {
      material: this.geographicPricing.material_multiplier,
      labor: this.geographicPricing.labor_multiplier,
      equipment: this.geographicPricing.equipment_multiplier,
    }
  }

  /**
   * Calculate a single line item
   */
  calculateLineItem(
    input: LineItemInput,
    variables: RoofVariables,
    sortOrder: number = 0
  ): CalculatedLineItem {
    const { lineItem } = input
    const geo = this.getGeographicMultipliers()

    // Calculate quantity
    const formula = input.quantityFormula ?? lineItem.quantity_formula
    const wasteFactor = input.wasteFactor ?? lineItem.default_waste_factor

    let quantity: number
    let quantityFormula: string | null = formula

    if (input.quantity !== undefined) {
      // Manual override
      quantity = input.quantity
      quantityFormula = null
    } else if (formula) {
      // Calculate from formula
      const result = calculateQuantityWithWaste(formula, variables, 1.0, 0)
      quantity = result.quantity
    } else {
      quantity = 0
    }

    const quantityWithWaste = quantity * wasteFactor

    // Calculate unit costs with geographic adjustment
    const materialUnitCost =
      input.materialUnitCost ?? lineItem.base_material_cost * geo.material
    const laborUnitCost =
      input.laborUnitCost ?? lineItem.base_labor_cost * geo.labor
    const equipmentUnitCost =
      input.equipmentUnitCost ?? lineItem.base_equipment_cost * geo.equipment

    // Calculate totals
    const materialTotal = quantityWithWaste * materialUnitCost
    const laborTotal = quantityWithWaste * laborUnitCost
    const equipmentTotal = quantityWithWaste * equipmentUnitCost
    const lineTotal = materialTotal + laborTotal + equipmentTotal

    return {
      lineItemId: lineItem.id,
      itemCode: lineItem.item_code,
      name: lineItem.name,
      category: lineItem.category,
      unitType: lineItem.unit_type,
      quantity: Math.round(quantity * 100) / 100,
      quantityFormula,
      wasteFactor,
      quantityWithWaste: Math.round(quantityWithWaste * 100) / 100,
      materialUnitCost: Math.round(materialUnitCost * 100) / 100,
      laborUnitCost: Math.round(laborUnitCost * 100) / 100,
      equipmentUnitCost: Math.round(equipmentUnitCost * 100) / 100,
      materialTotal: Math.round(materialTotal * 100) / 100,
      laborTotal: Math.round(laborTotal * 100) / 100,
      equipmentTotal: Math.round(equipmentTotal * 100) / 100,
      lineTotal: Math.round(lineTotal * 100) / 100,
      isIncluded: input.isIncluded ?? true,
      isOptional: input.isOptional ?? false,
      isTaxable: lineItem.is_taxable,
      sortOrder: sortOrder,
      groupName: input.groupName ?? null,
      notes: input.notes ?? null,
    }
  }

  /**
   * Calculate estimate from line item inputs
   */
  calculateEstimate(
    lineItemInputs: LineItemInput[],
    variables: RoofVariables,
    options: {
      overheadPercent?: number
      profitPercent?: number
      taxPercent?: number
    } = {}
  ): EstimateCalculation {
    const overheadPercent = options.overheadPercent ?? 10
    const profitPercent = options.profitPercent ?? 15
    const taxPercent = options.taxPercent ?? 0

    // Calculate all line items
    const calculatedLineItems = lineItemInputs.map((input, index) =>
      this.calculateLineItem(input, variables, input.lineItem.sort_order || index)
    )

    // Sort by sort order
    calculatedLineItems.sort((a, b) => a.sortOrder - b.sortOrder)

    // Sum totals (only included items)
    const includedItems = calculatedLineItems.filter((li) => li.isIncluded)

    const totalMaterial = includedItems.reduce(
      (sum, li) => sum + li.materialTotal,
      0
    )
    const totalLabor = includedItems.reduce((sum, li) => sum + li.laborTotal, 0)
    const totalEquipment = includedItems.reduce(
      (sum, li) => sum + li.equipmentTotal,
      0
    )
    const subtotal = totalMaterial + totalLabor + totalEquipment

    // Calculate overhead and profit
    const overheadAmount = subtotal * (overheadPercent / 100)
    const profitAmount = (subtotal + overheadAmount) * (profitPercent / 100)

    // Calculate tax (on taxable items only)
    const taxableAmount = includedItems
      .filter((li) => li.isTaxable)
      .reduce((sum, li) => sum + li.lineTotal, 0)
    const taxAmount = taxableAmount * (taxPercent / 100)

    // Final price
    const priceLikely = subtotal + overheadAmount + profitAmount + taxAmount

    // Calculate geographic adjustment factor
    const geo = this.getGeographicMultipliers()
    const geographicAdjustment =
      (geo.material + geo.labor + geo.equipment) / 3

    return {
      lineItems: calculatedLineItems,
      totalMaterial: Math.round(totalMaterial * 100) / 100,
      totalLabor: Math.round(totalLabor * 100) / 100,
      totalEquipment: Math.round(totalEquipment * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      overheadPercent,
      overheadAmount: Math.round(overheadAmount * 100) / 100,
      profitPercent,
      profitAmount: Math.round(profitAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      taxPercent,
      taxAmount: Math.round(taxAmount * 100) / 100,
      priceLow: Math.round(priceLikely * 0.9 * 100) / 100,
      priceLikely: Math.round(priceLikely * 100) / 100,
      priceHigh: Math.round(priceLikely * 1.15 * 100) / 100,
      geographicAdjustment: Math.round(geographicAdjustment * 100) / 100,
    }
  }

  /**
   * Apply a macro to generate line item inputs
   */
  applyMacro(
    macro: EstimateMacro & { line_items?: MacroLineItemWithLineItem[] },
    variables: RoofVariables
  ): LineItemInput[] {
    if (!macro.line_items) {
      return []
    }

    return macro.line_items
      .filter((mli) => mli.line_item) // Has expanded line item
      .map((mli) => ({
        lineItemId: mli.line_item_id,
        lineItem: mli.line_item!,
        quantityFormula: mli.quantity_formula,
        wasteFactor: mli.waste_factor ?? undefined,
        materialUnitCost: mli.material_cost_override ?? undefined,
        laborUnitCost: mli.labor_cost_override ?? undefined,
        equipmentUnitCost: mli.equipment_cost_override ?? undefined,
        isIncluded: mli.is_selected_by_default,
        isOptional: mli.is_optional,
        groupName: mli.group_name ?? undefined,
        notes: mli.notes ?? undefined,
      }))
  }

  /**
   * Get line item by ID
   */
  getLineItem(id: string): LineItem | undefined {
    return this.lineItems.get(id)
  }

  /**
   * Get all line items
   */
  getAllLineItems(): LineItem[] {
    return Array.from(this.lineItems.values())
  }

  /**
   * Get line items by category
   */
  getLineItemsByCategory(category: LineItemCategory): LineItem[] {
    return this.getAllLineItems().filter((li) => li.category === category)
  }

  /**
   * Get macro by ID
   */
  getMacro(id: string): EstimateMacro | undefined {
    return this.macros.get(id)
  }

  /**
   * Get all macros
   */
  getAllMacros(): EstimateMacro[] {
    return Array.from(this.macros.values())
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity: number, unit: UnitType): string {
  const unitLabels: Record<UnitType, string> = {
    SQ: 'SQ',
    SF: 'SF',
    LF: 'LF',
    EA: 'EA',
    HR: 'HR',
    DAY: 'DAY',
    TON: 'TON',
    GAL: 'GAL',
    BDL: 'BDL',
    RL: 'RL',
  }

  return `${quantity.toFixed(2)} ${unitLabels[unit]}`
}

/**
 * Group line items by category or group name
 */
export function groupLineItems(
  lineItems: CalculatedLineItem[]
): Map<string, CalculatedLineItem[]> {
  const groups = new Map<string, CalculatedLineItem[]>()

  for (const item of lineItems) {
    const groupKey = item.groupName || item.category
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(item)
  }

  return groups
}

/**
 * Calculate cost per square
 */
export function calculateCostPerSquare(
  totalCost: number,
  squares: number
): number {
  if (squares <= 0) return 0
  return Math.round((totalCost / squares) * 100) / 100
}

/**
 * Generate estimate summary
 */
export function generateEstimateSummary(calc: EstimateCalculation): {
  totalCost: number
  costPerSquare: number
  materialPercentage: number
  laborPercentage: number
  includedItemsCount: number
  optionalItemsCount: number
} {
  const includedItems = calc.lineItems.filter((li) => li.isIncluded)
  const optionalItems = calc.lineItems.filter((li) => li.isOptional)

  const materialPercentage =
    calc.subtotal > 0 ? (calc.totalMaterial / calc.subtotal) * 100 : 0
  const laborPercentage =
    calc.subtotal > 0 ? (calc.totalLabor / calc.subtotal) * 100 : 0

  // Estimate squares from line items or use a default
  const squaresItem = calc.lineItems.find(
    (li) => li.unitType === 'SQ' && li.category === 'shingles'
  )
  const squares = squaresItem?.quantityWithWaste || 20

  return {
    totalCost: calc.priceLikely,
    costPerSquare: calculateCostPerSquare(calc.priceLikely, squares),
    materialPercentage: Math.round(materialPercentage),
    laborPercentage: Math.round(laborPercentage),
    includedItemsCount: includedItems.length,
    optionalItemsCount: optionalItems.length,
  }
}

/**
 * Convert calculation to detailed estimate record
 */
export function calculationToEstimate(
  calc: EstimateCalculation,
  input: EstimateInput
): Partial<DetailedEstimate> {
  return {
    lead_id: input.leadId,
    sketch_id: input.sketchId || null,
    variables: input.variables as unknown as Json,
    total_material: calc.totalMaterial,
    total_labor: calc.totalLabor,
    total_equipment: calc.totalEquipment,
    subtotal: calc.subtotal,
    overhead_percent: calc.overheadPercent,
    overhead_amount: calc.overheadAmount,
    profit_percent: calc.profitPercent,
    profit_amount: calc.profitAmount,
    taxable_amount: calc.taxableAmount,
    tax_percent: calc.taxPercent,
    tax_amount: calc.taxAmount,
    price_low: calc.priceLow,
    price_likely: calc.priceLikely,
    price_high: calc.priceHigh,
    geographic_pricing_id: input.geographicPricingId || null,
    geographic_adjustment: calc.geographicAdjustment,
    source_macro_id: input.macroId || null,
  }
}

/**
 * Convert calculated line item to estimate line item record
 */
export function calculatedToEstimateLineItem(
  calc: CalculatedLineItem,
  estimateId: string
): Partial<EstimateLineItem> {
  return {
    detailed_estimate_id: estimateId,
    line_item_id: calc.lineItemId,
    item_code: calc.itemCode,
    name: calc.name,
    category: calc.category,
    unit_type: calc.unitType,
    quantity: calc.quantity,
    quantity_formula: calc.quantityFormula,
    waste_factor: calc.wasteFactor,
    quantity_with_waste: calc.quantityWithWaste,
    material_unit_cost: calc.materialUnitCost,
    labor_unit_cost: calc.laborUnitCost,
    equipment_unit_cost: calc.equipmentUnitCost,
    material_total: calc.materialTotal,
    labor_total: calc.laborTotal,
    equipment_total: calc.equipmentTotal,
    line_total: calc.lineTotal,
    is_included: calc.isIncluded,
    is_optional: calc.isOptional,
    is_taxable: calc.isTaxable,
    sort_order: calc.sortOrder,
    group_name: calc.groupName,
    notes: calc.notes,
  }
}

// =============================================================================
// DEFAULT INSTANCE
// =============================================================================

/**
 * Create engine with default/fallback line items
 */
export function createDefaultEngine(): DetailedPricingEngine {
  // In production, this would load from the database
  // For now, return empty engine
  return new DetailedPricingEngine([], null, [])
}
