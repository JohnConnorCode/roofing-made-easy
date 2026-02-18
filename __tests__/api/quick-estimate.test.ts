/**
 * Tests for Quick Estimate API Route
 * Tests estimate creation, pricing calculation accuracy, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/leads/[leadId]/estimate/route'
import {
  createMockRequest,
  createRouteContext,
  parseResponse,
} from './test-utils'
import { v4 as uuidv4 } from 'uuid'
import { PricingEngine, DEFAULT_PRICING_RULES } from '@/lib/pricing/engine'
import type { PricingRule } from '@/lib/supabase/types'

// Mock rate limiting to always succeed
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ success: true, remaining: 10, reset: Date.now() + 60000 })),
  getClientIP: vi.fn(() => '127.0.0.1'),
  rateLimitResponse: vi.fn(),
  createRateLimitHeaders: vi.fn(() => ({})),
}))

// Mock AI explanation
vi.mock('@/lib/ai', () => ({
  generateExplanation: vi.fn(() => Promise.resolve({
    success: true,
    data: 'This is a test explanation for the estimate.',
    provider: 'openai',
    model: 'gpt-4o-mini',
    latencyMs: 100,
  })),
}))

// Mock email/SMS notifications
vi.mock('@/lib/email', () => ({
  notifyEstimateGenerated: vi.fn(() => Promise.resolve()),
  sendCustomerEstimateEmail: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/sms', () => ({
  sendEstimateReadySms: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/customer/auto-create', () => ({
  autoCreateCustomerAccount: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/communication/workflow-engine', () => ({
  triggerWorkflows: vi.fn(() => Promise.resolve()),
}))

// Shared mock data
const mockLeads: Map<string, Record<string, unknown>> = new Map()
const mockIntakes: Map<string, Record<string, unknown>> = new Map()
const mockProperties: Map<string, Record<string, unknown>> = new Map()
const mockContacts: Map<string, Record<string, unknown>> = new Map()
const mockEstimates: Map<string, Record<string, unknown>> = new Map()
const mockPricingRules: Map<string, Record<string, unknown>> = new Map()

function resetMocks() {
  mockLeads.clear()
  mockIntakes.clear()
  mockProperties.clear()
  mockContacts.clear()
  mockEstimates.clear()
  mockPricingRules.clear()

  // Add default pricing rules
  for (const rule of DEFAULT_PRICING_RULES) {
    if (rule.rule_key) {
      mockPricingRules.set(rule.rule_key, { ...rule, id: uuidv4() })
    }
  }
}

interface LeadOptions {
  intake?: Partial<Record<string, unknown>>
  property?: Partial<Record<string, unknown>>
  contact?: Partial<Record<string, unknown>>
}

function createMockLead(options: LeadOptions = {}) {
  const id = uuidv4()
  const shareToken = uuidv4()

  const lead = {
    id,
    share_token: shareToken,
    status: 'intake_complete',
    source: 'web_funnel',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockLeads.set(id, lead)

  const intake = {
    lead_id: id,
    job_type: 'full_replacement',
    roof_material: 'asphalt_shingle',
    roof_size_sqft: 2500,
    roof_pitch: 'medium',
    stories: 1,
    has_skylights: false,
    has_chimneys: false,
    has_solar_panels: false,
    issues: [],
    timeline_urgency: 'within_month',
    ...options.intake,
  }
  mockIntakes.set(id, intake)

  const property = {
    lead_id: id,
    street_address: '123 Main St',
    city: 'Tupelo',
    state: 'MS',
    zip_code: '38801',
    ...options.property,
  }
  mockProperties.set(id, property)

  const contact = {
    lead_id: id,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    phone: '555-1234',
    consent_sms: false,
    ...options.contact,
  }
  mockContacts.set(id, contact)

  return { lead, intake, property, contact }
}

// Mock Supabase client
function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let insertData: unknown = null
  let updateData: unknown = null
  let isSingle = false
  let limitCount = 100

  const builder = {
    select: (columns?: string) => builder,
    insert: (data: unknown) => {
      insertData = data
      return builder
    },
    update: (data: unknown) => {
      updateData = data
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    gte: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'gte' })
      return builder
    },
    order: (column: string, opts?: { ascending?: boolean }) => builder,
    limit: (n: number) => {
      limitCount = n
      return builder
    },
    single: () => {
      isSingle = true
      return builder
    },
    maybeSingle: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeEstimateQuery(table, filters, insertData, updateData, isSingle, limitCount)
      return resolve(result)
    },
  }
  return builder
}

function executeEstimateQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  insertData: unknown,
  updateData: unknown,
  isSingle: boolean,
  limitCount: number
): { data: unknown; error: unknown } {
  // Handle insert
  if (insertData) {
    if (table === 'estimates') {
      const id = uuidv4()
      const estimate = { id, ...(insertData as Record<string, unknown>), created_at: new Date().toISOString() }
      mockEstimates.set(id, estimate)
      return { data: estimate, error: null }
    }
    if (table === 'ai_outputs') {
      return { data: insertData, error: null }
    }
    return { data: insertData, error: null }
  }

  // Handle update
  if (updateData) {
    if (table === 'estimates') {
      // Mark existing estimates as superseded
      for (const [id, estimate] of mockEstimates.entries()) {
        const leadIdFilter = filters.find(f => f.column === 'lead_id')
        if (leadIdFilter && estimate.lead_id === leadIdFilter.value) {
          estimate.is_superseded = true
        }
      }
      return { data: null, error: null }
    }
    if (table === 'leads') {
      const idFilter = filters.find(f => f.column === 'id')
      if (idFilter) {
        const lead = mockLeads.get(idFilter.value as string)
        if (lead) {
          Object.assign(lead, updateData)
          return { data: lead, error: null }
        }
      }
    }
    return { data: null, error: null }
  }

  // Handle select
  if (table === 'leads') {
    const idFilter = filters.find(f => f.column === 'id')
    if (idFilter) {
      const lead = mockLeads.get(idFilter.value as string)
      if (!lead) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }

      // Join related data
      const leadId = idFilter.value as string
      return {
        data: {
          ...lead,
          intakes: mockIntakes.get(leadId) ? [mockIntakes.get(leadId)] : [],
          properties: mockProperties.get(leadId) ? [mockProperties.get(leadId)] : [],
          contacts: mockContacts.get(leadId) ? [mockContacts.get(leadId)] : [],
        },
        error: null,
      }
    }
  }

  if (table === 'pricing_rules') {
    const activeFilter = filters.find(f => f.column === 'is_active')
    let rules = Array.from(mockPricingRules.values())
    if (activeFilter) {
      rules = rules.filter(r => r.is_active === activeFilter.value)
    }
    return { data: rules, error: null }
  }

  if (table === 'estimates') {
    const leadIdFilter = filters.find(f => f.column === 'lead_id')
    const supersededFilter = filters.find(f => f.column === 'is_superseded')
    let estimates = Array.from(mockEstimates.values())

    if (leadIdFilter) {
      estimates = estimates.filter(e => e.lead_id === leadIdFilter.value)
    }
    if (supersededFilter !== undefined) {
      estimates = estimates.filter(e => e.is_superseded === supersededFilter.value)
    }

    // Apply limit
    estimates = estimates.slice(0, limitCount)

    if (isSingle) {
      if (estimates.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      }
      return { data: estimates[0], error: null }
    }

    return { data: estimates, error: null }
  }

  return { data: isSingle ? null : [], error: isSingle ? { code: 'PGRST116' } : null }
}

// Mock Supabase admin client
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
  })),
  createClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
  })),
}))

describe('Quick Estimate API', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('POST /api/leads/[leadId]/estimate', () => {
    it('should create an estimate for a valid lead', async () => {
      const { lead } = createMockLead()

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate`,
        { method: 'POST' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        id: string
        lead_id: string
        price_low: number
        price_likely: number
        price_high: number
      }>(response)

      expect(response.status).toBe(201)
      expect(data.id).toBeDefined()
      expect(data.lead_id).toBe(lead.id)
      expect(data.price_low).toBeDefined()
      expect(data.price_likely).toBeDefined()
      expect(data.price_high).toBeDefined()
      expect(data.price_low).toBeLessThan(data.price_likely)
      expect(data.price_likely).toBeLessThan(data.price_high)
    })

    it('should return 404 for non-existent lead', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/leads/non-existent/estimate',
        { method: 'POST' }
      )
      const context = createRouteContext({ leadId: 'non-existent' })
      const response = await POST(request, context)

      expect(response.status).toBe(404)
    })

    it('should include AI explanation in estimate', async () => {
      const { lead } = createMockLead()

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate`,
        { method: 'POST' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        ai_explanation: string | null
        ai_explanation_provider: string | null
      }>(response)

      expect(response.status).toBe(201)
      expect(data.ai_explanation).toBeDefined()
      expect(data.ai_explanation_provider).toBe('openai')
    })

    it('should include price breakdown and adjustments', async () => {
      const { lead } = createMockLead({
        intake: {
          has_skylights: true,
          has_chimneys: true,
          issues: ['leaks'],
        },
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate`,
        { method: 'POST' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        base_cost: number
        material_cost: number
        labor_cost: number
        adjustments: Array<{ name: string; impact: number }>
      }>(response)

      expect(response.status).toBe(201)
      expect(data.base_cost).toBeGreaterThan(0)
      expect(data.material_cost).toBeGreaterThan(0)
      expect(data.labor_cost).toBeGreaterThan(0)
      expect(data.adjustments).toBeDefined()
      expect(data.adjustments.length).toBeGreaterThan(0)
    })

    it('should save input snapshot', async () => {
      const { lead } = createMockLead({
        intake: { roof_size_sqft: 3000 },
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate`,
        { method: 'POST' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        input_snapshot: { intake: { roof_size_sqft: number } }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.input_snapshot).toBeDefined()
      expect(data.input_snapshot.intake.roof_size_sqft).toBe(3000)
    })
  })

  describe('GET /api/leads/[leadId]/estimate', () => {
    it('should return the latest non-superseded estimate', async () => {
      const { lead } = createMockLead()

      // Create initial estimate
      const estimate1 = {
        lead_id: lead.id,
        price_low: 8000,
        price_likely: 10000,
        price_high: 12000,
        is_superseded: true,
        created_at: new Date(Date.now() - 1000).toISOString(),
      }
      mockEstimates.set(uuidv4(), estimate1)

      // Create new estimate (not superseded)
      const estimate2 = {
        lead_id: lead.id,
        price_low: 9000,
        price_likely: 11000,
        price_high: 13000,
        is_superseded: false,
        created_at: new Date().toISOString(),
      }
      const estimate2Id = uuidv4()
      mockEstimates.set(estimate2Id, { id: estimate2Id, ...estimate2 })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate?token=${lead.share_token}`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{ price_likely: number }>(response)

      expect(response.status).toBe(200)
      expect(data.price_likely).toBe(11000) // Should return the non-superseded one
    })

    it('should return 404 when no estimate exists', async () => {
      const { lead } = createMockLead()

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/estimate?token=${lead.share_token}`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)

      expect(response.status).toBe(404)
    })
  })
})

describe('Pricing Calculation Accuracy', () => {
  it('should calculate correct base cost for full replacement', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000, // 2000 sqft
        roof_material: 'asphalt_shingle',
      },
    })

    // Base rate is $4.50/sqft, so 2000 * 4.5 = $9000
    expect(result.baseCost).toBe(9000)
  })

  it('should apply material multiplier for metal roofing', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const asphaltResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_material: 'asphalt_shingle',
      },
    })

    const metalResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_material: 'metal',
      },
    })

    // Metal is 2.2x multiplier
    expect(metalResult.priceLikely).toBeGreaterThan(asphaltResult.priceLikely * 2)
  })

  it('should apply steep pitch multiplier', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const flatResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_pitch: 'flat',
      },
    })

    const steepResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_pitch: 'steep',
      },
    })

    // Flat is 0.9x, steep is 1.25x
    expect(steepResult.priceLikely).toBeGreaterThan(flatResult.priceLikely)
  })

  it('should apply story multiplier for multi-story', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const oneStoryResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        stories: 1,
      },
    })

    const twoStoryResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        stories: 2,
      },
    })

    // 2 stories is 1.15x multiplier
    expect(twoStoryResult.priceLikely).toBeGreaterThan(oneStoryResult.priceLikely)
    expect(twoStoryResult.priceLikely).toBeCloseTo(oneStoryResult.priceLikely * 1.15, -2)
  })

  it('should add flat fees for features', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const baseResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        has_skylights: false,
        has_chimneys: false,
      },
    })

    const withFeaturesResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        has_skylights: true, // +$350
        has_chimneys: true, // +$450
      },
    })

    // Should be $800 more ($350 + $450)
    expect(withFeaturesResult.priceLikely - baseResult.priceLikely).toBe(800)
  })

  it('should add flat fees for issues', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const baseResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        issues: [],
      },
    })

    const withIssuesResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        issues: ['leaks', 'storm_damage'], // +$500 + $750
      },
    })

    // Should be $1250 more ($500 + $750)
    expect(withIssuesResult.priceLikely - baseResult.priceLikely).toBe(1250)
  })

  it('should apply urgency multiplier', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const normalResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        timeline_urgency: 'within_month',
      },
    })

    const emergencyResult = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        timeline_urgency: 'emergency', // 1.5x
      },
    })

    // Emergency is 1.5x multiplier
    expect(emergencyResult.priceLikely).toBeGreaterThan(normalResult.priceLikely * 1.4)
  })

  it('should respect minimum charge', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    // Small repair that would be less than minimum
    const result = engine.calculateEstimate({
      intake: {
        job_type: 'repair',
        roof_size_sqft: 100,
      },
    })

    // Minimum repair is $350
    expect(result.priceLikely).toBeGreaterThanOrEqual(350)
  })

  it('should calculate three-tier pricing correctly', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
      },
    })

    // Low is 85% of likely, high is 125%
    expect(result.priceLow).toBe(Math.round(result.priceLikely * 0.85))
    expect(result.priceHigh).toBe(Math.round(result.priceLikely * 1.25))
  })

  it('should stack multiple multipliers correctly', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_material: 'metal', // 2.2x
        roof_pitch: 'steep', // 1.25x
        stories: 2, // 1.15x
        timeline_urgency: 'emergency', // 1.5x
      },
    })

    // Base: 2000 * 4.5 = 9000
    // Metal: 9000 * 2.2 = 19800
    // Steep: 19800 * 1.25 = 24750
    // 2 stories: 24750 * 1.15 = 28462.5
    // Emergency: 28462.5 * 1.5 = 42693.75
    const expectedBase = 9000
    const expectedMultiplied = expectedBase * 2.2 * 1.25 * 1.15 * 1.5

    expect(result.priceLikely).toBeCloseTo(expectedMultiplied, -2)
  })

  it('should record adjustments with correct impacts', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        roof_material: 'metal',
        has_skylights: true,
      },
    })

    // Find the base adjustment
    const baseAdj = result.adjustments.find(a => a.category === 'base')
    expect(baseAdj).toBeDefined()
    expect(baseAdj!.impact).toBe(9000)

    // Find the skylight adjustment
    const skylightAdj = result.adjustments.find(a => a.ruleKey === 'feature_skylights')
    expect(skylightAdj).toBeDefined()
    expect(skylightAdj!.impact).toBe(350)
  })
})

describe('Estimate Edge Cases', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('should handle missing intake data with defaults', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {}, // Empty intake
    })

    // Should use default 2000 sqft and repair job type
    expect(result.baseCost).toBeGreaterThan(0)
    expect(result.priceLikely).toBeGreaterThan(0)
  })

  it('should use fallback rules when DB rules are empty', async () => {
    // Clear all pricing rules
    mockPricingRules.clear()

    const { lead } = createMockLead()

    const request = createMockRequest(
      `http://localhost:3000/api/leads/${lead.id}/estimate`,
      { method: 'POST' }
    )
    const context = createRouteContext({ leadId: lead.id })
    const response = await POST(request, context)

    // Should still work with default rules
    expect(response.status).toBe(201)
  })

  it('should handle large roof sizes', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 50000, // Very large commercial roof
      },
    })

    // Should calculate without overflow
    expect(result.priceLikely).toBeGreaterThan(0)
    expect(result.priceLikely).toBe(Math.round(50000 * 4.5))
    expect(Number.isFinite(result.priceLikely)).toBe(true)
  })

  it('should handle all issues at once', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        issues: ['leaks', 'missing_shingles', 'storm_damage'],
      },
    })

    // Should add all issue fees
    const issueAdjs = result.adjustments.filter(a => a.category === 'issue')
    expect(issueAdjs.length).toBe(3)
  })

  it('should handle all features at once', () => {
    const engine = new PricingEngine(DEFAULT_PRICING_RULES as PricingRule[])

    const result = engine.calculateEstimate({
      intake: {
        job_type: 'full_replacement',
        roof_size_sqft: 2000,
        has_skylights: true,
        has_chimneys: true,
        has_solar_panels: true,
      },
    })

    // Should add all feature fees
    const featureAdjs = result.adjustments.filter(a => a.category === 'feature')
    expect(featureAdjs.length).toBe(3)

    // Total features: $350 + $450 + $1500 = $2300
    const totalFeatureCost = featureAdjs.reduce((sum, a) => sum + a.impact, 0)
    expect(totalFeatureCost).toBe(2300)
  })
})
