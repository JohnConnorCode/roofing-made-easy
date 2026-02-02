/**
 * AI Line Item Suggestions Tests
 *
 * Tests the rule-based suggestion engine (no AI calls mocked).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkForMissingItems,
  type LineItemSuggestionInput,
} from '@/lib/ai/line-item-suggestions'
import type { EstimateLineItem } from '@/lib/supabase/types'
import {
  sampleVariables,
  simpleVariables,
  complexVariables,
  sampleEstimateLineItem,
} from '../fixtures/estimation'

// Mock the OpenAI module so tests don't make API calls
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{}' } }],
        }),
      },
    },
  })),
}))

// We need to dynamically import after mocking
const loadSuggestLineItems = async () => {
  const module = await import('@/lib/ai/line-item-suggestions')
  return module
}

describe('generateRuleBasedSuggestions', () => {
  // Access the internal function through the exported suggestLineItems
  // when no API key is set (falls back to rule-based)
  let suggestLineItems: typeof import('@/lib/ai/line-item-suggestions').suggestLineItems

  beforeEach(async () => {
    // Clear environment to ensure rule-based fallback
    delete process.env.OPENAI_API_KEY
    const module = await loadSuggestLineItems()
    suggestLineItems = module.suggestLineItems
  })

  describe('replacement job recommendations', () => {
    it('recommends tear-off for replacement jobs', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'full_replacement',
        roofType: 'asphalt_shingle',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      expect(result.success).toBe(true)

      const tearOffRec = result.data?.recommendations.find(
        r => r.line_item_code === 'RFG100'
      )
      expect(tearOffRec).toBeDefined()
      expect(tearOffRec?.priority).toBe('required')
      expect(tearOffRec?.reason).toContain('Tear-off')
    })

    it('recommends underlayment for all jobs', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'full_replacement',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const underlaymentRec = result.data?.recommendations.find(
        r => r.line_item_code === 'RFG220'
      )
      expect(underlaymentRec).toBeDefined()
      expect(underlaymentRec?.priority).toBe('required')
    })

    it('recommends drip edge', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const dripEdgeRec = result.data?.recommendations.find(
        r => r.line_item_code === 'FLS100'
      )
      expect(dripEdgeRec).toBeDefined()
      expect(dripEdgeRec?.quantityFormula).toBe('EAVE+RAKE')
    })

    it('skips tear-off when already included', async () => {
      const existingTearOff: EstimateLineItem = {
        ...sampleEstimateLineItem,
        item_code: 'RFG100',
        name: 'Tear-off',
        category: 'tear_off',
      }

      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'full_replacement',
        currentLineItems: [existingTearOff],
      }

      const result = await suggestLineItems(input)
      const tearOffRec = result.data?.recommendations.find(
        r => r.line_item_code === 'RFG100'
      )
      expect(tearOffRec).toBeUndefined()
    })
  })

  describe('conditional recommendations', () => {
    it('recommends valley flashing when VAL > 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, VAL: 20 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const valleyRec = result.data?.recommendations.find(
        r => r.line_item_code === 'FLS120'
      )
      expect(valleyRec).toBeDefined()
      expect(valleyRec?.estimatedQuantity).toBe(21) // 20 * 1.05
    })

    it('does not recommend valley flashing when VAL = 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, VAL: 0 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const valleyRec = result.data?.recommendations.find(
        r => r.line_item_code === 'FLS120'
      )
      expect(valleyRec).toBeUndefined()
    })

    it('recommends chimney flashing when chimneys > 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, CHIMNEY_COUNT: 2 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const chimneyRec = result.data?.recommendations.find(
        r => r.line_item_code === 'FLS130'
      )
      expect(chimneyRec).toBeDefined()
      expect(chimneyRec?.estimatedQuantity).toBe(2)
    })

    it('recommends skylight flashing when skylights > 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, SKYLIGHT_COUNT: 1 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const skylightRec = result.data?.recommendations.find(
        r => r.line_item_code === 'SKY100'
      )
      expect(skylightRec).toBeDefined()
    })

    it('recommends pipe boots when PIPE_COUNT > 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, PIPE_COUNT: 4 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const pipeRec = result.data?.recommendations.find(
        r => r.line_item_code === 'VNT110'
      )
      expect(pipeRec).toBeDefined()
      expect(pipeRec?.estimatedQuantity).toBe(4)
    })

    it('recommends ridge vent when R > 0', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, R: 50 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const ridgeRec = result.data?.recommendations.find(
        r => r.line_item_code === 'VNT100'
      )
      expect(ridgeRec).toBeDefined()
    })
  })

  describe('climate-based recommendations', () => {
    it('flags ice shield for cold climates', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        currentLineItems: [],
        region: {
          state: 'MN',
          climate: 'cold',
        },
      }

      const result = await suggestLineItems(input)
      const iceMissing = result.data?.missingItems.find(
        m => m.line_item_code === 'RFG250'
      )
      expect(iceMissing).toBeDefined()
      expect(iceMissing?.title).toContain('Ice')
    })

    it('does not flag ice shield for warm climates', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        currentLineItems: [],
        region: {
          state: 'FL',
          climate: 'hot',
        },
      }

      const result = await suggestLineItems(input)
      const iceMissing = result.data?.missingItems.find(
        m => m.line_item_code === 'RFG250'
      )
      expect(iceMissing).toBeUndefined()
    })
  })

  describe('complex roof warnings', () => {
    it('warns about complex roof with many valleys', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, VAL: 60 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const complexWarning = result.data?.warnings.find(
        w => w.title?.includes('Complex')
      )
      expect(complexWarning).toBeDefined()
    })

    it('warns about complex roof with many hips', async () => {
      const input: LineItemSuggestionInput = {
        variables: { ...sampleVariables, HIP: 80 },
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const complexWarning = result.data?.warnings.find(
        w => w.title?.includes('Complex')
      )
      expect(complexWarning).toBeDefined()
    })
  })

  describe('macro recommendations', () => {
    it('suggests full replacement macro for shingle replacement', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'full_replacement',
        roofType: 'asphalt_shingle',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const macroRec = result.data?.macroRecommendations.find(
        m => m.jobType === 'full_replacement'
      )
      expect(macroRec).toBeDefined()
      expect(macroRec?.matchScore).toBeGreaterThan(0.9)
    })

    it('suggests storm damage macro for insurance claims', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'storm_damage',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const macroRec = result.data?.macroRecommendations.find(
        m => m.jobType === 'storm_damage'
      )
      expect(macroRec).toBeDefined()
    })

    it('suggests repair macro for repair jobs', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'repair',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      const macroRec = result.data?.macroRecommendations.find(
        m => m.jobType === 'repair'
      )
      expect(macroRec).toBeDefined()
    })
  })

  describe('upgrade and cost saving suggestions', () => {
    it('suggests synthetic underlayment upgrade', async () => {
      const existingFelt: EstimateLineItem = {
        ...sampleEstimateLineItem,
        item_code: 'RFG220',
        name: 'Felt Underlayment',
        category: 'underlayment',
      }

      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        currentLineItems: [existingFelt],
      }

      const result = await suggestLineItems(input)
      const upgradeRec = result.data?.upgrades.find(
        u => u.line_item_code === 'RFG240'
      )
      expect(upgradeRec).toBeDefined()
      expect(upgradeRec?.impact).toBeGreaterThan(0)
    })

    it('suggests 3-tab cost saving when using architectural', async () => {
      const existingArch: EstimateLineItem = {
        ...sampleEstimateLineItem,
        item_code: 'RFG420',
        name: 'Architectural Shingles',
        category: 'shingles',
      }

      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        currentLineItems: [existingArch],
      }

      const result = await suggestLineItems(input)
      const costSaving = result.data?.costSavings.find(
        c => c.line_item_code === 'RFG410'
      )
      expect(costSaving).toBeDefined()
      expect(costSaving?.impact).toBeLessThan(0) // Negative = savings
    })
  })

  describe('summary generation', () => {
    it('generates summary with counts', async () => {
      const input: LineItemSuggestionInput = {
        variables: sampleVariables,
        jobType: 'full_replacement',
        currentLineItems: [],
      }

      const result = await suggestLineItems(input)
      expect(result.data?.summary).toBeDefined()
      expect(result.data?.summary).toContain('recommendations')
    })
  })
})

describe('checkForMissingItems', () => {
  it('flags missing tear-off', () => {
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(sampleVariables, currentItems)

    const tearOffMissing = missing.find(m => m.line_item_code === 'RFG100')
    expect(tearOffMissing).toBeDefined()
    expect(tearOffMissing?.title).toContain('Tear-Off')
  })

  it('flags missing drip edge', () => {
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(sampleVariables, currentItems)

    const dripMissing = missing.find(m => m.line_item_code === 'FLS100')
    expect(dripMissing).toBeDefined()
    expect(dripMissing?.title).toContain('Drip Edge')
  })

  it('flags missing valley when needed', () => {
    const varsWithValley = { ...sampleVariables, VAL: 30 }
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(varsWithValley, currentItems)

    const valleyMissing = missing.find(m => m.line_item_code === 'FLS120')
    expect(valleyMissing).toBeDefined()
    expect(valleyMissing?.description).toContain('30 LF')
  })

  it('does not flag valley when VAL = 0', () => {
    const varsNoValley = { ...sampleVariables, VAL: 0 }
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(varsNoValley, currentItems)

    const valleyMissing = missing.find(m => m.line_item_code === 'FLS120')
    expect(valleyMissing).toBeUndefined()
  })

  it('flags missing chimney flashing when chimneys present', () => {
    const varsWithChimney = { ...sampleVariables, CHIMNEY_COUNT: 2 }
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(varsWithChimney, currentItems)

    const chimneyMissing = missing.find(m => m.line_item_code === 'FLS130')
    expect(chimneyMissing).toBeDefined()
    expect(chimneyMissing?.description).toContain('2 chimney')
  })

  it('flags missing skylight flashing when skylights present', () => {
    const varsWithSkylight = { ...sampleVariables, SKYLIGHT_COUNT: 1 }
    const currentItems: EstimateLineItem[] = []
    const missing = checkForMissingItems(varsWithSkylight, currentItems)

    const skylightMissing = missing.find(m => m.line_item_code === 'SKY100')
    expect(skylightMissing).toBeDefined()
  })

  it('does not flag items that are already included', () => {
    const currentItems: EstimateLineItem[] = [
      { ...sampleEstimateLineItem, item_code: 'RFG100' },
      { ...sampleEstimateLineItem, item_code: 'FLS100' },
    ]
    const missing = checkForMissingItems(sampleVariables, currentItems)

    expect(missing.find(m => m.line_item_code === 'RFG100')).toBeUndefined()
    expect(missing.find(m => m.line_item_code === 'FLS100')).toBeUndefined()
  })

  it('includes confidence scores', () => {
    const missing = checkForMissingItems(sampleVariables, [])
    missing.forEach(item => {
      expect(item.confidence).toBeGreaterThan(0)
      expect(item.confidence).toBeLessThanOrEqual(1)
    })
  })
})
