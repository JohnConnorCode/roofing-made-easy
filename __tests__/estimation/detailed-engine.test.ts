/**
 * Detailed Pricing Engine Unit Tests
 *
 * Tests line item calculations, estimate totals, and helper functions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  DetailedPricingEngine,
  formatCurrency,
  formatQuantity,
  groupLineItems,
  calculateCostPerSquare,
  generateEstimateSummary,
  calculationToEstimate,
  calculatedToEstimateLineItem,
  createDefaultEngine,
  type LineItemInput,
  type EstimateInput,
} from '@/lib/estimation/detailed-engine'
import type { EstimateMacro, MacroLineItemWithLineItem } from '@/lib/supabase/types'
import {
  sampleVariables,
  simpleVariables,
  emptyVariables,
  sampleLineItem,
  tearOffLineItem,
  underlaymentLineItem,
  dripEdgeLineItem,
  replacementLineItems,
  defaultGeoPricing,
  highCostGeoPricing,
  lowCostGeoPricing,
} from '../fixtures/estimation'

describe('DetailedPricingEngine', () => {
  let engine: DetailedPricingEngine

  beforeEach(() => {
    engine = new DetailedPricingEngine(replacementLineItems, null, [])
  })

  describe('constructor', () => {
    it('initializes with line items', () => {
      expect(engine.getAllLineItems()).toHaveLength(replacementLineItems.length)
    })

    it('initializes with geographic pricing', () => {
      const geoEngine = new DetailedPricingEngine([], highCostGeoPricing)
      const multipliers = geoEngine.getGeographicMultipliers()
      expect(multipliers.labor).toBe(1.45)
    })
  })

  describe('setGeographicPricing', () => {
    it('updates geographic multipliers', () => {
      engine.setGeographicPricing(highCostGeoPricing)
      const multipliers = engine.getGeographicMultipliers()
      expect(multipliers.material).toBe(1.15)
      expect(multipliers.labor).toBe(1.45)
      expect(multipliers.equipment).toBe(1.10)
    })

    it('resets to 1.0 when set to null', () => {
      engine.setGeographicPricing(highCostGeoPricing)
      engine.setGeographicPricing(null)
      const multipliers = engine.getGeographicMultipliers()
      expect(multipliers.material).toBe(1)
      expect(multipliers.labor).toBe(1)
      expect(multipliers.equipment).toBe(1)
    })
  })

  describe('getGeographicMultipliers', () => {
    it('returns 1.0 multipliers when no pricing set', () => {
      const multipliers = engine.getGeographicMultipliers()
      expect(multipliers).toEqual({ material: 1, labor: 1, equipment: 1 })
    })
  })

  describe('calculateLineItem', () => {
    it('calculates material cost: qty * unit cost', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, sampleVariables)

      // SQ*1.10 with SQ=25 = 27.5
      expect(result.quantity).toBeCloseTo(27.5, 1)
      // 27.5 * $125 = $3437.50
      expect(result.materialTotal).toBeCloseTo(3437.5, 0)
    })

    it('calculates labor cost', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      // 27.5 * $95 = $2612.50
      expect(result.laborTotal).toBeCloseTo(2612.5, 0)
    })

    it('calculates equipment cost', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      // 27.5 * $10 = $275
      expect(result.equipmentTotal).toBeCloseTo(275, 0)
    })

    it('applies waste factor', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
        wasteFactor: 1.15, // 15% waste
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      // quantity = 27.5, with waste = 27.5 * 1.15 = 31.625
      expect(result.quantityWithWaste).toBeCloseTo(31.63, 1)
    })

    it('applies geographic multiplier', () => {
      engine.setGeographicPricing(highCostGeoPricing)
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      // Material: $125 * 1.15 = $143.75
      expect(result.materialUnitCost).toBeCloseTo(143.75, 0)
      // Labor: $95 * 1.45 = $137.75
      expect(result.laborUnitCost).toBeCloseTo(137.75, 0)
    })

    it('allows manual quantity override', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
        quantity: 30, // Override formula
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      expect(result.quantity).toBe(30)
      expect(result.quantityFormula).toBeNull()
    })

    it('allows unit cost overrides', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
        materialUnitCost: 150,
        laborUnitCost: 100,
        equipmentUnitCost: 20,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      expect(result.materialUnitCost).toBe(150)
      expect(result.laborUnitCost).toBe(100)
      expect(result.equipmentUnitCost).toBe(20)
    })

    it('calculates line total correctly', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      const expectedTotal = result.materialTotal + result.laborTotal + result.equipmentTotal
      expect(result.lineTotal).toBeCloseTo(expectedTotal, 0)
    })

    it('handles zero quantity', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
      }
      const result = engine.calculateLineItem(input, emptyVariables)
      expect(result.quantity).toBe(0)
      expect(result.lineTotal).toBe(0)
    })

    it('handles line item with no formula and no manual quantity', () => {
      const lineItemNoFormula = {
        ...sampleLineItem,
        quantity_formula: null,
      }
      const input: LineItemInput = {
        lineItemId: lineItemNoFormula.id,
        lineItem: lineItemNoFormula,
        // No quantity override, no formula
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      expect(result.quantity).toBe(0)
      expect(result.quantityFormula).toBeNull()
      expect(result.lineTotal).toBe(0)
    })

    it('preserves isIncluded and isOptional flags', () => {
      const input: LineItemInput = {
        lineItemId: sampleLineItem.id,
        lineItem: sampleLineItem,
        isIncluded: false,
        isOptional: true,
      }
      const result = engine.calculateLineItem(input, sampleVariables)
      expect(result.isIncluded).toBe(false)
      expect(result.isOptional).toBe(true)
    })
  })

  describe('calculateEstimate', () => {
    it('sums all line item totals', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: tearOffLineItem.id, lineItem: tearOffLineItem },
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables)

      expect(result.lineItems).toHaveLength(2)
      expect(result.subtotal).toBeGreaterThan(0)
      expect(result.subtotal).toBe(
        result.totalMaterial + result.totalLabor + result.totalEquipment
      )
    })

    it('applies overhead percentage', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables, {
        overheadPercent: 10,
      })

      expect(result.overheadPercent).toBe(10)
      expect(result.overheadAmount).toBeCloseTo(result.subtotal * 0.10, 0)
    })

    it('applies profit percentage', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables, {
        overheadPercent: 10,
        profitPercent: 15,
      })

      expect(result.profitPercent).toBe(15)
      // Profit is calculated on subtotal + overhead
      const baseForProfit = result.subtotal + result.overheadAmount
      expect(result.profitAmount).toBeCloseTo(baseForProfit * 0.15, 0)
    })

    it('applies tax percentage', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables, {
        taxPercent: 8.25,
      })

      expect(result.taxPercent).toBe(8.25)
      // Tax only on taxable items
      expect(result.taxAmount).toBeCloseTo(result.taxableAmount * 0.0825, 0)
    })

    it('calculates low/likely/high prices', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables, {
        overheadPercent: 10,
        profitPercent: 15,
      })

      expect(result.priceLow).toBeLessThan(result.priceLikely)
      expect(result.priceHigh).toBeGreaterThan(result.priceLikely)
      expect(result.priceLow).toBeCloseTo(result.priceLikely * 0.9, 0)
      expect(result.priceHigh).toBeCloseTo(result.priceLikely * 1.15, 0)
    })

    it('only includes items marked as included in totals', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem, isIncluded: true },
        { lineItemId: tearOffLineItem.id, lineItem: tearOffLineItem, isIncluded: false },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables)

      // Should only include the shingle line item
      const shingleCalc = engine.calculateLineItem(
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
        sampleVariables
      )
      expect(result.subtotal).toBeCloseTo(shingleCalc.lineTotal, 0)
    })

    it('uses default percentages when not specified', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables)

      expect(result.overheadPercent).toBe(10) // Default
      expect(result.profitPercent).toBe(15) // Default
      expect(result.taxPercent).toBe(0) // Default
    })

    it('sorts line items by sort order', () => {
      const inputs: LineItemInput[] = [
        { lineItemId: sampleLineItem.id, lineItem: { ...sampleLineItem, sort_order: 100 } },
        { lineItemId: tearOffLineItem.id, lineItem: { ...tearOffLineItem, sort_order: 10 } },
      ]
      const result = engine.calculateEstimate(inputs, sampleVariables)

      expect(result.lineItems[0].sortOrder).toBe(10) // Tear-off first
      expect(result.lineItems[1].sortOrder).toBe(100) // Shingles second
    })
  })

  describe('getLineItem and getAllLineItems', () => {
    it('retrieves line item by ID', () => {
      const item = engine.getLineItem(sampleLineItem.id)
      expect(item).toBeDefined()
      expect(item?.item_code).toBe('RFG420')
    })

    it('returns undefined for unknown ID', () => {
      const item = engine.getLineItem('unknown-id')
      expect(item).toBeUndefined()
    })

    it('returns all line items', () => {
      const all = engine.getAllLineItems()
      expect(all.length).toBe(replacementLineItems.length)
    })
  })

  describe('getLineItemsByCategory', () => {
    it('filters by category', () => {
      const flashing = engine.getLineItemsByCategory('flashing')
      expect(flashing.length).toBeGreaterThan(0)
      flashing.forEach(item => {
        expect(item.category).toBe('flashing')
      })
    })

    it('returns empty array for non-existent category', () => {
      const insulation = engine.getLineItemsByCategory('insulation')
      expect(insulation).toEqual([])
    })
  })

  describe('getMacro and getAllMacros', () => {
    it('returns undefined for unknown macro ID', () => {
      const macro = engine.getMacro('unknown-macro-id')
      expect(macro).toBeUndefined()
    })

    it('returns empty array when no macros loaded', () => {
      const macros = engine.getAllMacros()
      expect(macros).toEqual([])
    })

    it('retrieves macro by ID when macros are loaded', () => {
      const testMacro: EstimateMacro = {
        id: 'macro-1',
        name: 'Standard Replacement',
        description: 'Standard roof replacement macro',
        roof_type: 'any',
        job_type: 'full_replacement',
        is_active: true,
        is_default: true,
        is_system: false,
        usage_count: 0,
        last_used_at: null,
        notes: null,
        tags: ['standard'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: null,
      }
      const engineWithMacros = new DetailedPricingEngine([], null, [testMacro])

      const result = engineWithMacros.getMacro('macro-1')
      expect(result).toBeDefined()
      expect(result?.name).toBe('Standard Replacement')
    })

    it('returns all macros when macros are loaded', () => {
      const testMacros: EstimateMacro[] = [
        {
          id: 'macro-1',
          name: 'Standard Replacement',
          description: 'Standard roof replacement macro',
          roof_type: 'any',
          job_type: 'full_replacement',
          is_active: true,
          is_default: true,
          is_system: false,
          usage_count: 0,
          last_used_at: null,
          notes: null,
          tags: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: null,
        },
        {
          id: 'macro-2',
          name: 'Premium Replacement',
          description: 'Premium roof replacement macro',
          roof_type: 'any',
          job_type: 'full_replacement',
          is_active: true,
          is_default: false,
          is_system: false,
          usage_count: 0,
          last_used_at: null,
          notes: null,
          tags: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: null,
        },
      ]
      const engineWithMacros = new DetailedPricingEngine([], null, testMacros)

      const result = engineWithMacros.getAllMacros()
      expect(result).toHaveLength(2)
    })
  })

  describe('applyMacro', () => {
    it('returns empty array when macro has no line_items', () => {
      const macroWithoutLineItems: EstimateMacro = {
        id: 'macro-no-items',
        name: 'Empty Macro',
        description: 'Macro with no line items',
        roof_type: 'any',
        job_type: 'full_replacement',
        is_active: true,
        is_default: false,
        is_system: false,
        usage_count: 0,
        last_used_at: null,
        notes: null,
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: null,
      }

      const result = engine.applyMacro(macroWithoutLineItems, sampleVariables)
      expect(result).toEqual([])
    })

    it('returns empty array when macro.line_items is undefined', () => {
      const macroUndefinedItems: EstimateMacro & { line_items?: MacroLineItemWithLineItem[] } = {
        id: 'macro-undefined',
        name: 'Undefined Items Macro',
        description: 'Macro with undefined line_items',
        roof_type: 'any',
        job_type: 'full_replacement',
        is_active: true,
        is_default: false,
        is_system: false,
        usage_count: 0,
        last_used_at: null,
        notes: null,
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: null,
        line_items: undefined,
      }

      const result = engine.applyMacro(macroUndefinedItems, sampleVariables)
      expect(result).toEqual([])
    })

    it('generates line item inputs from macro with line items', () => {
      const macroWithItems: EstimateMacro & { line_items: MacroLineItemWithLineItem[] } = {
        id: 'macro-with-items',
        name: 'Full Macro',
        description: 'Macro with line items',
        roof_type: 'any',
        job_type: 'full_replacement',
        is_active: true,
        is_default: false,
        is_system: false,
        usage_count: 0,
        last_used_at: null,
        notes: null,
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: null,
        line_items: [
          {
            id: 'mli-1',
            macro_id: 'macro-with-items',
            line_item_id: sampleLineItem.id,
            quantity_formula: 'SQ*1.15',
            waste_factor: 1.05,
            material_cost_override: null,
            labor_cost_override: null,
            equipment_cost_override: null,
            is_selected_by_default: true,
            is_optional: false,
            group_name: 'Shingles',
            sort_order: 10,
            notes: 'Test note',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            line_item: sampleLineItem,
          },
        ],
      }

      const result = engine.applyMacro(macroWithItems, sampleVariables)
      expect(result).toHaveLength(1)
      expect(result[0].lineItemId).toBe(sampleLineItem.id)
      expect(result[0].quantityFormula).toBe('SQ*1.15')
      expect(result[0].wasteFactor).toBe(1.05)
      expect(result[0].isIncluded).toBe(true)
      expect(result[0].isOptional).toBe(false)
      expect(result[0].groupName).toBe('Shingles')
      expect(result[0].notes).toBe('Test note')
    })

    it('filters out macro line items without expanded line_item', () => {
      const macroWithMissingLineItem: EstimateMacro & { line_items: MacroLineItemWithLineItem[] } = {
        id: 'macro-missing-li',
        name: 'Partial Macro',
        description: 'Macro with missing line item expansion',
        roof_type: 'any',
        job_type: 'full_replacement',
        is_active: true,
        is_default: false,
        is_system: false,
        usage_count: 0,
        last_used_at: null,
        notes: null,
        tags: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_by: null,
        line_items: [
          {
            id: 'mli-1',
            macro_id: 'macro-missing-li',
            line_item_id: 'missing-id',
            quantity_formula: 'SQ',
            waste_factor: null,
            material_cost_override: null,
            labor_cost_override: null,
            equipment_cost_override: null,
            is_selected_by_default: true,
            is_optional: false,
            group_name: null,
            sort_order: 10,
            notes: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            line_item: null as any, // Missing line item
          },
        ],
      }

      const result = engine.applyMacro(macroWithMissingLineItem, sampleVariables)
      expect(result).toHaveLength(0)
    })
  })
})

describe('createDefaultEngine', () => {
  it('creates engine with empty collections', () => {
    const engine = createDefaultEngine()
    expect(engine.getAllLineItems()).toEqual([])
    expect(engine.getAllMacros()).toEqual([])
  })

  it('returns 1.0 geographic multipliers', () => {
    const engine = createDefaultEngine()
    const multipliers = engine.getGeographicMultipliers()
    expect(multipliers).toEqual({ material: 1, labor: 1, equipment: 1 })
  })
})

describe('formatCurrency', () => {
  it('formats 1234.56 as $1,234.56', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles negative', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('handles large numbers', () => {
    expect(formatCurrency(12345678.90)).toBe('$12,345,678.90')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00')
    expect(formatCurrency(10.001)).toBe('$10.00')
  })
})

describe('formatQuantity', () => {
  it('formats with SQ unit', () => {
    expect(formatQuantity(25.5, 'SQ')).toBe('25.50 SQ')
  })

  it('formats with LF unit', () => {
    expect(formatQuantity(180, 'LF')).toBe('180.00 LF')
  })

  it('formats with EA unit', () => {
    expect(formatQuantity(4, 'EA')).toBe('4.00 EA')
  })

  it('handles all unit types', () => {
    expect(formatQuantity(10, 'SF')).toBe('10.00 SF')
    expect(formatQuantity(8, 'HR')).toBe('8.00 HR')
    expect(formatQuantity(2, 'DAY')).toBe('2.00 DAY')
    expect(formatQuantity(1.5, 'TON')).toBe('1.50 TON')
    expect(formatQuantity(5, 'GAL')).toBe('5.00 GAL')
    expect(formatQuantity(3, 'BDL')).toBe('3.00 BDL')
    expect(formatQuantity(2, 'RL')).toBe('2.00 RL')
  })
})

describe('groupLineItems', () => {
  it('groups by category when no group name', () => {
    const items = [
      { ...createMockCalcItem('1'), category: 'shingles' as const, groupName: null },
      { ...createMockCalcItem('2'), category: 'shingles' as const, groupName: null },
      { ...createMockCalcItem('3'), category: 'flashing' as const, groupName: null },
    ]

    const groups = groupLineItems(items)
    expect(groups.get('shingles')?.length).toBe(2)
    expect(groups.get('flashing')?.length).toBe(1)
  })

  it('groups by group name when provided', () => {
    const items = [
      { ...createMockCalcItem('1'), groupName: 'Materials' },
      { ...createMockCalcItem('2'), groupName: 'Materials' },
      { ...createMockCalcItem('3'), groupName: 'Labor' },
    ]

    const groups = groupLineItems(items)
    expect(groups.get('Materials')?.length).toBe(2)
    expect(groups.get('Labor')?.length).toBe(1)
  })
})

describe('calculateCostPerSquare', () => {
  it('calculates correctly', () => {
    expect(calculateCostPerSquare(25000, 25)).toBe(1000)
    expect(calculateCostPerSquare(15000, 20)).toBe(750)
  })

  it('returns 0 for zero squares', () => {
    expect(calculateCostPerSquare(10000, 0)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    expect(calculateCostPerSquare(10000, 3)).toBeCloseTo(3333.33, 2)
  })
})

describe('generateEstimateSummary', () => {
  it('generates summary statistics', () => {
    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]
    const calc = engine.calculateEstimate(inputs, sampleVariables)
    const summary = generateEstimateSummary(calc)

    expect(summary.totalCost).toBe(calc.priceLikely)
    expect(summary.costPerSquare).toBeGreaterThan(0)
    expect(summary.materialPercentage).toBeGreaterThan(0)
    expect(summary.laborPercentage).toBeGreaterThan(0)
    expect(summary.includedItemsCount).toBe(1)
  })
})

describe('calculationToEstimate', () => {
  it('converts calculation to estimate record', () => {
    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]
    const calc = engine.calculateEstimate(inputs, sampleVariables)

    const input: EstimateInput = {
      leadId: 'lead-123',
      sketchId: 'sketch-456',
      variables: sampleVariables,
      overheadPercent: 10,
      profitPercent: 15,
    }

    const record = calculationToEstimate(calc, input)
    expect(record.lead_id).toBe('lead-123')
    expect(record.sketch_id).toBe('sketch-456')
    expect(record.total_material).toBe(calc.totalMaterial)
    expect(record.price_likely).toBe(calc.priceLikely)
  })
})

describe('calculatedToEstimateLineItem', () => {
  it('converts calculated line item to record', () => {
    const engine = new DetailedPricingEngine(replacementLineItems)
    const input: LineItemInput = {
      lineItemId: sampleLineItem.id,
      lineItem: sampleLineItem,
    }
    const calc = engine.calculateLineItem(input, sampleVariables)
    const record = calculatedToEstimateLineItem(calc, 'estimate-123')

    expect(record.detailed_estimate_id).toBe('estimate-123')
    expect(record.line_item_id).toBe(sampleLineItem.id)
    expect(record.item_code).toBe('RFG420')
    expect(record.quantity).toBe(calc.quantity)
    expect(record.material_total).toBe(calc.materialTotal)
  })
})

// Helper to create mock calculated line item
function createMockCalcItem(id: string) {
  return {
    lineItemId: id,
    itemCode: `CODE-${id}`,
    name: `Item ${id}`,
    category: 'shingles' as const,
    unitType: 'SQ' as const,
    quantity: 10,
    quantityFormula: 'SQ',
    wasteFactor: 1,
    quantityWithWaste: 10,
    materialUnitCost: 100,
    laborUnitCost: 50,
    equipmentUnitCost: 10,
    materialTotal: 1000,
    laborTotal: 500,
    equipmentTotal: 100,
    lineTotal: 1600,
    isIncluded: true,
    isOptional: false,
    isTaxable: true,
    sortOrder: 0,
    groupName: null,
    notes: null,
  }
}
