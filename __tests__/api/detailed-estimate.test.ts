/**
 * Tests for Detailed Estimate API Routes
 * Tests estimate creation, retrieval, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/leads/[leadId]/detailed-estimate/route'
import {
  createMockRequest,
  createRouteContext,
  parseResponse,
  apiTestDb,
} from './test-utils'
import { sampleVariables } from '@/__tests__/fixtures/estimation'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
  })),
}))

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let insertData: unknown = null
  let isSingle = false
  let countEnabled = false

  const builder = {
    select: (_query?: string, opts?: { count?: string; head?: boolean }) => {
      if (opts?.count) countEnabled = true
      return builder
    },
    insert: (data: unknown) => {
      insertData = data
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    order: () => builder,
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeQuery(table, filters, insertData, isSingle, countEnabled)
      return resolve(result)
    },
  }
  return builder
}

function executeQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  insertData: unknown,
  isSingle: boolean,
  countEnabled: boolean
): { data: unknown; error: unknown; count?: number } {
  switch (table) {
    case 'leads': {
      const idFilter = filters.find((f) => f.column === 'id')
      if (idFilter) {
        const lead = apiTestDb.getLead(idFilter.value as string)
        if (!lead) return { data: null, error: { code: 'PGRST116' } }
        return { data: lead, error: null }
      }
      return { data: null, error: null }
    }

    case 'geographic_pricing': {
      const idFilter = filters.find((f) => f.column === 'id')
      if (idFilter) {
        const pricing = apiTestDb.getGeographicPricing(idFilter.value as string)
        return { data: pricing || null, error: null }
      }
      return { data: null, error: null }
    }

    case 'detailed_estimates': {
      // Handle insert
      if (insertData) {
        const estimate = apiTestDb.createDetailedEstimate(
          insertData as Record<string, unknown>
        )
        return { data: estimate, error: null }
      }

      // Handle select with count
      if (countEnabled) {
        const leadIdFilter = filters.find((f) => f.column === 'lead_id')
        const estimates = leadIdFilter
          ? Array.from(apiTestDb.detailedEstimates.values()).filter(
              (e) => e.lead_id === leadIdFilter.value
            )
          : []
        return { data: null, error: null, count: estimates.length }
      }

      // Handle select
      let data = Array.from(apiTestDb.detailedEstimates.values())

      for (const filter of filters) {
        if (filter.operator === 'eq') {
          data = data.filter(
            (item) => (item as Record<string, unknown>)[filter.column] === filter.value
          )
        }
      }

      if (isSingle) {
        return { data: data[0] || null, error: data.length === 0 ? { code: 'PGRST116' } : null }
      }

      return { data, error: null }
    }

    default:
      return { data: isSingle ? null : [], error: null }
  }
}

describe('Detailed Estimate API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/leads/[leadId]/detailed-estimate', () => {
    it('should return empty list when no estimates exist for lead', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{ estimates: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates).toEqual([])
    })

    it('should return estimates for a lead', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createDetailedEstimate({
        lead_id: lead.id,
        name: 'Estimate 1',
        version: 1,
        variables: sampleVariables,
        price_likely: 10000,
        is_superseded: false,
      })
      apiTestDb.createDetailedEstimate({
        lead_id: lead.id,
        name: 'Estimate 2',
        version: 2,
        variables: sampleVariables,
        price_likely: 12000,
        is_superseded: false,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{ estimates: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates.length).toBe(2)
    })

    it('should filter by status', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createDetailedEstimate({
        lead_id: lead.id,
        name: 'Draft Estimate',
        status: 'draft',
        is_superseded: false,
      })
      apiTestDb.createDetailedEstimate({
        lead_id: lead.id,
        name: 'Approved Estimate',
        status: 'approved',
        is_superseded: false,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate?status=draft`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{ estimates: Array<{ status: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates.every((e) => e.status === 'draft')).toBe(true)
    })
  })

  describe('POST /api/leads/[leadId]/detailed-estimate', () => {
    it('should create a new estimate with valid data', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'New Estimate',
            variables: sampleVariables,
            overhead_percent: 10,
            profit_percent: 15,
            tax_percent: 7,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        estimate: { id: string; name: string; lead_id: string }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.estimate.id).toBeDefined()
      expect(data.estimate.name).toBe('New Estimate')
      expect(data.estimate.lead_id).toBe(lead.id)
    })

    it('should return 404 for non-existent lead', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/leads/non-existent-id/detailed-estimate',
        {
          method: 'POST',
          body: {
            name: 'Estimate for Missing Lead',
            variables: sampleVariables,
          },
        }
      )
      const context = createRouteContext({ leadId: 'non-existent-id' })
      const response = await POST(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 400 for missing variables', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Missing Variables Estimate',
            // Missing required variables
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid variables structure', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Invalid Variables Estimate',
            variables: {
              SQ: 'not a number', // Should be number
              SF: 2500,
            },
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid overhead_percent', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Invalid Overhead Estimate',
            variables: sampleVariables,
            overhead_percent: 75, // Max is 50
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid profit_percent', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Invalid Profit Estimate',
            variables: sampleVariables,
            profit_percent: -5, // Min is 0
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })

    it('should apply geographic pricing when specified', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const geoPricing = apiTestDb.createGeographicPricing({
        state: 'CA',
        name: 'High Cost Area',
        material_multiplier: 1.15,
        labor_multiplier: 1.45,
        equipment_multiplier: 1.10,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Geo Pricing Estimate',
            variables: sampleVariables,
            geographic_pricing_id: geoPricing.id,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        estimate: { geographic_pricing_id: string; geographic_adjustment: number }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.estimate.geographic_pricing_id).toBe(geoPricing.id)
      // Geographic adjustment should be average of multipliers
      expect(data.estimate.geographic_adjustment).toBeGreaterThan(1)
    })

    it('should auto-increment version number', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      // Create first estimate
      apiTestDb.createDetailedEstimate({
        lead_id: lead.id,
        name: 'Version 1',
        version: 1,
        variables: sampleVariables,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Version 2',
            variables: sampleVariables,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{ estimate: { version: number } }>(response)

      expect(response.status).toBe(201)
      expect(data.estimate.version).toBe(2)
    })

    it('should set initial status to draft', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/detailed-estimate`,
        {
          method: 'POST',
          body: {
            name: 'Draft Status Estimate',
            variables: sampleVariables,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{ estimate: { status: string } }>(response)

      expect(response.status).toBe(201)
      expect(data.estimate.status).toBe('draft')
    })
  })
})
