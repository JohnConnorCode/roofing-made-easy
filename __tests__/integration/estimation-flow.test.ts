/**
 * Integration Tests for Estimation Flow
 *
 * Tests the complete flow from dimensions to final estimate.
 */

import { describe, it, expect } from 'vitest'
import { calculateVariablesFromDimensions } from '@/lib/estimation/variables'
import { evaluateFormula } from '@/lib/estimation/formula-parser'
import {
  DetailedPricingEngine,
  type LineItemInput,
} from '@/lib/estimation/detailed-engine'
import {
  sampleLineItem,
  tearOffLineItem,
  underlaymentLineItem,
  dripEdgeLineItem,
  ridgeVentLineItem,
  replacementLineItems,
  defaultGeoPricing,
  highCostGeoPricing,
} from '../fixtures/estimation'
import type { RoofVariables } from '@/lib/supabase/types'

describe('Full Estimation Flow', () => {
  it('dimensions → variables → macro → estimate', () => {
    // 1. Create variables from dimensions
    // 50ft x 30ft at 5/12 pitch
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
      skylights: 1,
      chimneys: 1,
      pipeBoots: 3,
    })

    // 2. Verify variables are calculated correctly
    // Base: 1500 sqft, with pitch multiplier 1.083 = 1624.5 sqft = 16.245 SQ
    expect(vars.SQ).toBeCloseTo(16.25, 1)
    expect(vars.SF).toBeCloseTo(1625, 0)
    expect(vars.P).toBe(160) // 2 * (50 + 30)
    expect(vars.EAVE).toBe(100) // 50 * 2
    expect(vars.R).toBe(50)
    expect(vars.RAKE).toBe(60) // 30 * 2
    expect(vars.SKYLIGHT_COUNT).toBe(1)
    expect(vars.CHIMNEY_COUNT).toBe(1)

    // 3. Create engine and apply line items
    const engine = new DetailedPricingEngine(replacementLineItems)

    const lineItemInputs: LineItemInput[] = [
      { lineItemId: tearOffLineItem.id, lineItem: tearOffLineItem },
      { lineItemId: underlaymentLineItem.id, lineItem: underlaymentLineItem },
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      { lineItemId: dripEdgeLineItem.id, lineItem: dripEdgeLineItem },
      { lineItemId: ridgeVentLineItem.id, lineItem: ridgeVentLineItem },
    ]

    // 4. Calculate estimate
    const estimate = engine.calculateEstimate(lineItemInputs, vars, {
      overheadPercent: 10,
      profitPercent: 15,
      taxPercent: 6,
    })

    // 5. Verify structure
    expect(estimate.lineItems).toHaveLength(5)
    expect(estimate.subtotal).toBeGreaterThan(0)
    expect(estimate.overheadAmount).toBeCloseTo(estimate.subtotal * 0.10, 0)
    expect(estimate.priceLow).toBeLessThan(estimate.priceLikely)
    expect(estimate.priceHigh).toBeGreaterThan(estimate.priceLikely)

    // 6. Verify individual line items
    const tearOffCalc = estimate.lineItems.find(li => li.itemCode === 'RFG100')
    expect(tearOffCalc).toBeDefined()
    expect(tearOffCalc!.quantity).toBeCloseTo(vars.SQ, 1)

    const shingleCalc = estimate.lineItems.find(li => li.itemCode === 'RFG420')
    expect(shingleCalc).toBeDefined()
    // SQ * 1.10 = 16.25 * 1.10 = 17.875
    expect(shingleCalc!.quantity).toBeCloseTo(17.88, 1)
  })

  it('handles complex roof with multiple features', () => {
    // Complex hip roof
    const vars = calculateVariablesFromDimensions({
      lengthFt: 60,
      widthFt: 40,
      pitch: 8, // Steeper pitch
      skylights: 3,
      chimneys: 2,
      pipeBoots: 6,
      vents: 4,
    })

    // Verify steep pitch increases area
    // Base: 2400 sqft, pitch 8/12 multiplier = 1.202 = 2884.8 sqft = 28.85 SQ
    expect(vars.SQ).toBeCloseTo(28.85, 1)

    const engine = new DetailedPricingEngine(replacementLineItems)
    const lineItemInputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]

    const estimate = engine.calculateEstimate(lineItemInputs, vars)
    expect(estimate.subtotal).toBeGreaterThan(0)
  })

  it('applies geographic pricing correctly', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })

    // Calculate with default pricing
    const defaultEngine = new DetailedPricingEngine(replacementLineItems, null)
    const lineItemInputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]
    const defaultEstimate = defaultEngine.calculateEstimate(lineItemInputs, vars)

    // Calculate with high-cost region
    const highCostEngine = new DetailedPricingEngine(replacementLineItems, highCostGeoPricing)
    const highCostEstimate = highCostEngine.calculateEstimate(lineItemInputs, vars)

    // High cost region should have higher totals
    expect(highCostEstimate.subtotal).toBeGreaterThan(defaultEstimate.subtotal)
    expect(highCostEstimate.priceLikely).toBeGreaterThan(defaultEstimate.priceLikely)

    // Verify the geographic multipliers were applied
    // Material: 1.15x, Labor: 1.45x, Equipment: 1.10x
    const defaultItem = defaultEstimate.lineItems[0]
    const highCostItem = highCostEstimate.lineItems[0]

    expect(highCostItem.materialUnitCost).toBeCloseTo(defaultItem.materialUnitCost * 1.15, 0)
    expect(highCostItem.laborUnitCost).toBeCloseTo(defaultItem.laborUnitCost * 1.45, 0)
  })

  it('formula-based quantities match manual calculations', () => {
    const vars: RoofVariables = {
      SQ: 25,
      SF: 2500,
      P: 200,
      EAVE: 100,
      R: 50,
      VAL: 20,
      HIP: 0,
      RAKE: 80,
      SKYLIGHT_COUNT: 2,
      CHIMNEY_COUNT: 1,
      PIPE_COUNT: 4,
      VENT_COUNT: 3,
      GUTTER_LF: 100,
      DS_COUNT: 4,
      slopes: {},
    }

    // Test each formula
    expect(evaluateFormula('SQ', vars)).toBe(25)
    expect(evaluateFormula('SQ*1.10', vars)).toBeCloseTo(27.5, 5)
    expect(evaluateFormula('EAVE+RAKE', vars)).toBe(180)
    expect(evaluateFormula('VAL*1.05', vars)).toBeCloseTo(21, 5)
    expect(evaluateFormula('CHIMNEY_COUNT', vars)).toBe(1)
    expect(evaluateFormula('R', vars)).toBe(50)
    expect(evaluateFormula('SKYLIGHT_COUNT', vars)).toBe(2)
  })

  it('produces realistic price ranges for typical jobs', () => {
    // 25 SQ typical replacement job
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 40,
      pitch: 6,
      skylights: 1,
      chimneys: 1,
      pipeBoots: 4,
    })

    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs: LineItemInput[] = replacementLineItems.map(li => ({
      lineItemId: li.id,
      lineItem: li,
    }))

    const estimate = engine.calculateEstimate(inputs, vars, {
      overheadPercent: 10,
      profitPercent: 20,
      taxPercent: 7,
    })

    // Typical roof replacement: $200-$600 per square
    const costPerSquare = estimate.priceLikely / vars.SQ
    expect(costPerSquare).toBeGreaterThan(200)
    expect(costPerSquare).toBeLessThan(800)

    // Price range should be reasonable
    expect(estimate.priceHigh - estimate.priceLow).toBeGreaterThan(1000)
  })

  it('handles optional items correctly', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })

    const engine = new DetailedPricingEngine(replacementLineItems)

    // One included, one optional (not included)
    const inputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem, isIncluded: true },
      { lineItemId: tearOffLineItem.id, lineItem: tearOffLineItem, isIncluded: false, isOptional: true },
    ]

    const estimate = engine.calculateEstimate(inputs, vars)

    // Both line items should be in the list
    expect(estimate.lineItems).toHaveLength(2)

    // But only the included one should count toward totals
    const includedOnly = estimate.lineItems.filter(li => li.isIncluded)
    expect(includedOnly).toHaveLength(1)

    // Subtotal should only include the shingles
    const shingleCalc = engine.calculateLineItem(
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
      vars
    )
    expect(estimate.subtotal).toBeCloseTo(shingleCalc.lineTotal, 0)
  })

  it('handles empty line items gracefully', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })

    const engine = new DetailedPricingEngine([])
    const estimate = engine.calculateEstimate([], vars)

    expect(estimate.lineItems).toHaveLength(0)
    expect(estimate.subtotal).toBe(0)
    expect(estimate.priceLikely).toBe(0)
  })

  it('correctly calculates tax on taxable items only', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
    })

    const engine = new DetailedPricingEngine(replacementLineItems)

    // tearOffLineItem.is_taxable = false
    // sampleLineItem.is_taxable = true
    const inputs: LineItemInput[] = [
      { lineItemId: tearOffLineItem.id, lineItem: tearOffLineItem },
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]

    const estimate = engine.calculateEstimate(inputs, vars, {
      taxPercent: 8,
    })

    // Only shingle total should be taxable
    const shingleCalc = estimate.lineItems.find(li => li.itemCode === 'RFG420')
    expect(estimate.taxableAmount).toBeCloseTo(shingleCalc!.lineTotal, 0)
    expect(estimate.taxAmount).toBeCloseTo(shingleCalc!.lineTotal * 0.08, 0)
  })
})

describe('Edge Cases', () => {
  it('handles very small roofs', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 10,
      widthFt: 10,
      pitch: 4,
    })

    expect(vars.SQ).toBeGreaterThan(0)
    expect(vars.SQ).toBeLessThan(5)

    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]
    const estimate = engine.calculateEstimate(inputs, vars)
    expect(estimate.subtotal).toBeGreaterThan(0)
  })

  it('handles very large roofs', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 200,
      widthFt: 150,
      pitch: 6,
    })

    expect(vars.SQ).toBeGreaterThan(300)

    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs: LineItemInput[] = [
      { lineItemId: sampleLineItem.id, lineItem: sampleLineItem },
    ]
    const estimate = engine.calculateEstimate(inputs, vars)
    expect(estimate.subtotal).toBeGreaterThan(50000)
  })

  it('handles steep pitch multipliers', () => {
    const flatVars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 0,
    })

    const steepVars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 12,
    })

    // 12/12 pitch should have ~41% more area
    const ratio = steepVars.SQ / flatVars.SQ
    expect(ratio).toBeCloseTo(1.414, 2)
  })

  it('handles zero counts for features', () => {
    const vars = calculateVariablesFromDimensions({
      lengthFt: 50,
      widthFt: 30,
      pitch: 5,
      skylights: 0,
      chimneys: 0,
      pipeBoots: 0,
      vents: 0,
    })

    expect(vars.SKYLIGHT_COUNT).toBe(0)
    expect(vars.CHIMNEY_COUNT).toBe(0)

    // Formulas using these should evaluate to 0
    expect(evaluateFormula('SKYLIGHT_COUNT', vars)).toBe(0)
    expect(evaluateFormula('CHIMNEY_COUNT', vars)).toBe(0)
  })
})

describe('Real-World Scenarios', () => {
  it('typical single-story ranch replacement', () => {
    // 1800 sqft footprint, 4/12 pitch
    const vars = calculateVariablesFromDimensions({
      lengthFt: 60,
      widthFt: 30,
      pitch: 4,
      skylights: 0,
      chimneys: 1,
      pipeBoots: 3,
    })

    // 1800 * 1.054 = 1897 sqft = 18.97 SQ
    expect(vars.SQ).toBeCloseTo(18.97, 1)

    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs = replacementLineItems.map(li => ({
      lineItemId: li.id,
      lineItem: li,
    }))
    const estimate = engine.calculateEstimate(inputs, vars)

    // Should produce reasonable estimate
    expect(estimate.priceLikely).toBeGreaterThan(8000)
    expect(estimate.priceLikely).toBeLessThan(30000)
  })

  it('two-story colonial with steep pitch', () => {
    // 1200 sqft footprint (two-story), 8/12 pitch
    const vars = calculateVariablesFromDimensions({
      lengthFt: 40,
      widthFt: 30,
      pitch: 8,
      skylights: 2,
      chimneys: 1,
      pipeBoots: 5,
    })

    // 1200 * 1.202 = 1442 sqft = 14.42 SQ
    expect(vars.SQ).toBeCloseTo(14.42, 1)
    expect(vars.SKYLIGHT_COUNT).toBe(2)

    const engine = new DetailedPricingEngine(replacementLineItems)
    const inputs = replacementLineItems.map(li => ({
      lineItemId: li.id,
      lineItem: li,
    }))
    const estimate = engine.calculateEstimate(inputs, vars)
    expect(estimate.priceLikely).toBeGreaterThan(6000)
  })

  it('large commercial flat roof', () => {
    // 10,000 sqft flat roof
    const vars = calculateVariablesFromDimensions({
      lengthFt: 100,
      widthFt: 100,
      pitch: 0, // Flat
      skylights: 0,
      chimneys: 0,
      pipeBoots: 8,
    })

    // 10000 * 1.0 = 10000 sqft = 100 SQ
    expect(vars.SQ).toBe(100)
    expect(vars.P).toBe(400)
  })
})
