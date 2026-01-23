/**
 * Tests for the pricing engine
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PricingEngine, DEFAULT_PRICING_RULES, type PricingInput } from '@/lib/pricing/engine'
import type { PricingRule } from '@/lib/supabase/types'

describe('Pricing Engine', () => {
  let engine: PricingEngine

  beforeEach(() => {
    // Create engine with default rules
    engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])
  })

  describe('calculateEstimate', () => {
    it('should calculate a basic estimate', () => {
      const input: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_material: 'asphalt_shingle',
          stories: 1,
          roof_pitch: 'moderate',
          timeline_urgency: 'within_month',
          has_skylights: false,
          has_chimneys: false,
          has_solar_panels: false,
        },
      }

      const result = engine.calculateEstimate(input)

      expect(result.priceLow).toBeLessThan(result.priceLikely)
      expect(result.priceLikely).toBeLessThan(result.priceHigh)
      expect(result.priceLow).toBeGreaterThan(0)
    })

    it('should increase price for premium materials', () => {
      const baseInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_material: 'asphalt_shingle',
          job_type: 'full_replacement',
        },
      }

      const premiumInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_material: 'metal',
          job_type: 'full_replacement',
        },
      }

      const baseResult = engine.calculateEstimate(baseInput)
      const premiumResult = engine.calculateEstimate(premiumInput)

      expect(premiumResult.priceLikely).toBeGreaterThan(baseResult.priceLikely)
    })

    it('should increase price for steep pitch', () => {
      const flatInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_pitch: 'flat',
          job_type: 'full_replacement',
        },
      }

      const steepInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_pitch: 'steep',
          job_type: 'full_replacement',
        },
      }

      const flatResult = engine.calculateEstimate(flatInput)
      const steepResult = engine.calculateEstimate(steepInput)

      expect(steepResult.priceLikely).toBeGreaterThan(flatResult.priceLikely)
    })

    it('should increase price for multi-story buildings', () => {
      const singleInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          stories: 1,
          job_type: 'full_replacement',
        },
      }

      const multiInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          stories: 3,
          job_type: 'full_replacement',
        },
      }

      const singleResult = engine.calculateEstimate(singleInput)
      const multiResult = engine.calculateEstimate(multiInput)

      expect(multiResult.priceLikely).toBeGreaterThan(singleResult.priceLikely)
    })

    it('should add urgency premium for emergency', () => {
      // Use full_replacement with larger size to avoid minimum charge affecting results
      const normalInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          job_type: 'full_replacement',
        },
      }

      const emergencyInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          timeline_urgency: 'emergency',
          job_type: 'full_replacement',
        },
      }

      const normalResult = engine.calculateEstimate(normalInput)
      const emergencyResult = engine.calculateEstimate(emergencyInput)

      expect(emergencyResult.priceLikely).toBeGreaterThan(normalResult.priceLikely)
    })

    it('should add flat fees for features', () => {
      const baseInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          has_skylights: false,
          has_chimneys: false,
          has_solar_panels: false,
          job_type: 'full_replacement',
        },
      }

      const withFeaturesInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          has_skylights: true,
          has_chimneys: true,
          has_solar_panels: true,
          job_type: 'full_replacement',
        },
      }

      const baseResult = engine.calculateEstimate(baseInput)
      const withFeaturesResult = engine.calculateEstimate(withFeaturesInput)

      expect(withFeaturesResult.priceLikely).toBeGreaterThan(baseResult.priceLikely)

      // Check that adjustments include feature fees
      const featureAdjustments = withFeaturesResult.adjustments.filter(
        (a) => a.category === 'feature'
      )
      expect(featureAdjustments.length).toBeGreaterThan(0)
    })

    it('should add fees for issues', () => {
      const noIssuesInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          job_type: 'repair',
        },
      }

      const withIssuesInput: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          issues: ['leaks', 'missing_shingles'],
          job_type: 'repair',
        },
      }

      const noIssuesResult = engine.calculateEstimate(noIssuesInput)
      const withIssuesResult = engine.calculateEstimate(withIssuesInput)

      expect(withIssuesResult.priceLikely).toBeGreaterThan(noIssuesResult.priceLikely)
    })

    it('should return adjustments breakdown', () => {
      const input: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          roof_material: 'metal',
          stories: 2,
          roof_pitch: 'steep',
          timeline_urgency: 'emergency',
          issues: ['leaks'],
          has_skylights: true,
          job_type: 'full_replacement',
        },
      }

      const result = engine.calculateEstimate(input)

      expect(result.adjustments).toBeDefined()
      expect(result.adjustments.length).toBeGreaterThan(0)

      // Each adjustment should have required fields
      result.adjustments.forEach((adj) => {
        expect(adj.name).toBeDefined()
        expect(typeof adj.impact).toBe('number')
        expect(adj.description).toBeDefined()
      })
    })

    it('should calculate correct low/likely/high range', () => {
      const input: PricingInput = {
        intake: {
          roof_size_sqft: 2000,
          job_type: 'full_replacement',
        },
      }

      const result = engine.calculateEstimate(input)

      // Low should be ~85% of likely
      expect(result.priceLow / result.priceLikely).toBeCloseTo(0.85, 1)

      // High should be ~125% of likely
      expect(result.priceHigh / result.priceLikely).toBeCloseTo(1.25, 1)
    })

    it('should respect minimum charge', () => {
      const tinyInput: PricingInput = {
        intake: {
          roof_size_sqft: 10, // Very small
          job_type: 'repair',
        },
      }

      const result = engine.calculateEstimate(tinyInput)

      // Should be at least the minimum repair charge (350)
      expect(result.priceLikely).toBeGreaterThanOrEqual(350)
    })
  })

  describe('getRule', () => {
    it('should return rule by key', () => {
      const rule = engine.getRule('base_replacement')
      expect(rule).toBeDefined()
      expect(rule?.rule_key).toBe('base_replacement')
    })

    it('should return undefined for non-existent key', () => {
      const rule = engine.getRule('non_existent_rule')
      expect(rule).toBeUndefined()
    })
  })

  describe('getRulesByCategory', () => {
    it('should return rules by category', () => {
      const materialRules = engine.getRulesByCategory('material')
      expect(materialRules.length).toBeGreaterThan(0)
      expect(materialRules.every((r) => r.rule_category === 'material')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const rules = engine.getRulesByCategory('non_existent')
      expect(rules).toEqual([])
    })
  })
})
