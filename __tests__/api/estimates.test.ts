/**
 * Tests for Estimates API Route
 * Tests pagination, filtering, validation, and aggregates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/estimates/route'
import {
  createMockRequest,
  parseResponse,
  apiTestDb,
} from './test-utils'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
    rpc: vi.fn((name: string) => {
      if (name === 'get_estimate_status_counts') {
        const estimates = Array.from(estimatesStore.values())
        return Promise.resolve({
          data: {
            total: estimates.length,
            draft: estimates.filter(e => e.status === 'draft').length,
            sent: estimates.filter(e => e.status === 'sent').length,
            accepted: estimates.filter(e => e.status === 'accepted').length,
            expired: estimates.filter(e => e.status === 'expired').length,
            total_value: estimates.reduce((sum, e) => sum + (e.price_likely || 0), 0),
          },
          error: null,
        })
      }
      return Promise.resolve({ data: null, error: null })
    }),
  })),
}))

// Mock the auth module to simulate admin user
vi.mock('@/lib/api/auth', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({
    user: {
      id: 'test-admin-123',
      email: 'admin@test.com',
      user_metadata: { role: 'admin' }
    },
    error: null
  })),
}))

// In-memory estimates store for testing
interface MockEstimate {
  id: string
  lead_id: string
  price_low: number
  price_likely: number
  price_high: number
  status: string
  created_at: string
  updated_at: string
  valid_until: string | null
  lead?: {
    id: string
    status: string
    created_at: string
    contact: { first_name: string; last_name: string; email: string; phone: string } | null
    property: { street_address: string; city: string; state: string; zip_code: string } | null
    intake: { job_type: string; timeline_urgency: string; has_insurance_claim: boolean } | null
  }
}

const estimatesStore: Map<string, MockEstimate> = new Map()

function createMockEstimate(data: Partial<MockEstimate>): MockEstimate {
  const id = data.id || `est-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const estimate: MockEstimate = {
    id,
    lead_id: data.lead_id || 'lead-123',
    price_low: data.price_low || 5000,
    price_likely: data.price_likely || 7500,
    price_high: data.price_high || 10000,
    status: data.status || 'draft',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    valid_until: data.valid_until || null,
    lead: data.lead || {
      id: data.lead_id || 'lead-123',
      status: 'new',
      created_at: new Date().toISOString(),
      contact: { first_name: 'John', last_name: 'Doe', email: 'john@test.com', phone: '555-1234' },
      property: { street_address: '123 Main St', city: 'Jackson', state: 'MS', zip_code: '39201' },
      intake: { job_type: 'full_replacement', timeline_urgency: 'within_month', has_insurance_claim: false }
    }
  }
  estimatesStore.set(id, estimate)
  return estimate
}

function resetEstimatesStore() {
  estimatesStore.clear()
}

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let selectQuery = '*'
  let orderBy: { column: string; ascending: boolean } | null = null
  let rangeStart = 0
  let rangeEnd = 19
  let countOption = false
  let headOnly = false

  const builder = {
    select: (query?: string, options?: { count?: 'exact'; head?: boolean }) => {
      selectQuery = query || '*'
      if (options?.count === 'exact') countOption = true
      if (options?.head) headOnly = true
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
    lte: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'lte' })
      return builder
    },
    order: (column: string, opts?: { ascending?: boolean }) => {
      orderBy = { column, ascending: opts?.ascending ?? true }
      return builder
    },
    range: (start: number, end: number) => {
      rangeStart = start
      rangeEnd = end
      return builder
    },
    single: () => builder,
    then: async (resolve: (value: unknown) => void) => {
      if (table !== 'estimates') {
        return resolve({ data: [], error: null, count: 0 })
      }

      let data = Array.from(estimatesStore.values())

      // Apply filters
      for (const filter of filters) {
        data = data.filter((item) => {
          const val = (item as unknown as Record<string, unknown>)[filter.column]
          if (filter.operator === 'eq') return val === filter.value
          if (filter.operator === 'gte') return (val as number) >= (filter.value as number)
          if (filter.operator === 'lte') return (val as number) <= (filter.value as number)
          return true
        })
      }

      const totalCount = data.length

      // Apply sorting
      if (orderBy) {
        data.sort((a, b) => {
          const aVal = (a as unknown as Record<string, unknown>)[orderBy!.column] as string | number
          const bVal = (b as unknown as Record<string, unknown>)[orderBy!.column] as string | number
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return orderBy!.ascending ? cmp : -cmp
        })
      }

      // If head only, return just count
      if (headOnly) {
        return resolve({ data: null, error: null, count: totalCount })
      }

      // Apply pagination
      data = data.slice(rangeStart, rangeEnd + 1)

      return resolve({
        data: countOption ? data : data,
        error: null,
        count: countOption ? totalCount : undefined
      })
    },
  }
  return builder
}

describe('Estimates API', () => {
  beforeEach(() => {
    resetEstimatesStore()
    apiTestDb.reset()
  })

  describe('GET /api/estimates', () => {
    it('should return empty list when no estimates exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/estimates')
      const response = await GET(request)
      const data = await parseResponse<{
        estimates: unknown[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
        aggregates: { total: number; byStatus: Record<string, number> }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('should return paginated estimates with joins', async () => {
      // Create test estimates
      createMockEstimate({ status: 'draft', price_likely: 5000 })
      createMockEstimate({ status: 'sent', price_likely: 7500 })
      createMockEstimate({ status: 'accepted', price_likely: 10000 })

      const request = createMockRequest('http://localhost:3000/api/estimates')
      const response = await GET(request)
      const data = await parseResponse<{
        estimates: MockEstimate[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates.length).toBe(3)
      expect(data.pagination.total).toBe(3)
      expect(data.pagination.page).toBe(1)

      // Verify joins are included
      const firstEstimate = data.estimates[0]
      expect(firstEstimate.lead).toBeDefined()
      expect(firstEstimate.lead?.contact).toBeDefined()
      expect(firstEstimate.lead?.property).toBeDefined()
    })

    it('should filter by status', async () => {
      createMockEstimate({ status: 'draft' })
      createMockEstimate({ status: 'draft' })
      createMockEstimate({ status: 'sent' })
      createMockEstimate({ status: 'accepted' })

      const request = createMockRequest('http://localhost:3000/api/estimates?status=draft')
      const response = await GET(request)
      const data = await parseResponse<{ estimates: MockEstimate[] }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates.length).toBe(2)
      data.estimates.forEach((estimate) => {
        expect(estimate.status).toBe('draft')
      })
    })

    it('should filter by price range', async () => {
      createMockEstimate({ price_likely: 3000 })
      createMockEstimate({ price_likely: 5000 })
      createMockEstimate({ price_likely: 8000 })
      createMockEstimate({ price_likely: 12000 })

      const request = createMockRequest('http://localhost:3000/api/estimates?priceMin=4000&priceMax=9000')
      const response = await GET(request)
      const data = await parseResponse<{ estimates: MockEstimate[] }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates.length).toBe(2)
      data.estimates.forEach((estimate) => {
        expect(estimate.price_likely).toBeGreaterThanOrEqual(4000)
        expect(estimate.price_likely).toBeLessThanOrEqual(9000)
      })
    })

    it('should return aggregates by status', async () => {
      createMockEstimate({ status: 'draft' })
      createMockEstimate({ status: 'draft' })
      createMockEstimate({ status: 'sent' })
      createMockEstimate({ status: 'accepted' })

      const request = createMockRequest('http://localhost:3000/api/estimates')
      const response = await GET(request)
      const data = await parseResponse<{
        aggregates: { total: number; byStatus: { draft: number; sent: number; accepted: number; expired: number } }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.aggregates.total).toBe(4)
      expect(data.aggregates.byStatus.draft).toBe(2)
      expect(data.aggregates.byStatus.sent).toBe(1)
      expect(data.aggregates.byStatus.accepted).toBe(1)
      expect(data.aggregates.byStatus.expired).toBe(0)
    })

    it('should validate query parameters - reject invalid status', async () => {
      const request = createMockRequest('http://localhost:3000/api/estimates?status=invalid_status')
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await parseResponse<{ error: string }>(response)
      expect(data.error).toBe('Invalid query parameters')
    })

    it('should validate query parameters - reject negative page', async () => {
      const request = createMockRequest('http://localhost:3000/api/estimates?page=-1')
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('should validate query parameters - reject invalid priceMin', async () => {
      const request = createMockRequest('http://localhost:3000/api/estimates?priceMin=invalid')
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('should validate query parameters - reject invalid UUID for leadId', async () => {
      const request = createMockRequest('http://localhost:3000/api/estimates?leadId=not-a-uuid')
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('should handle pagination correctly', async () => {
      // Create 25 estimates
      for (let i = 0; i < 25; i++) {
        createMockEstimate({ price_likely: 1000 * (i + 1) })
      }

      // Request page 2 with limit 10
      const request = createMockRequest('http://localhost:3000/api/estimates?page=2&limit=10')
      const response = await GET(request)
      const data = await parseResponse<{
        estimates: MockEstimate[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(25)
      expect(data.pagination.totalPages).toBe(3)
      expect(data.estimates.length).toBe(10)
    })

    it('should sort by specified column', async () => {
      createMockEstimate({ price_likely: 8000 })
      createMockEstimate({ price_likely: 3000 })
      createMockEstimate({ price_likely: 12000 })

      const request = createMockRequest('http://localhost:3000/api/estimates?sortBy=price_likely&sortOrder=asc')
      const response = await GET(request)
      const data = await parseResponse<{ estimates: MockEstimate[] }>(response)

      expect(response.status).toBe(200)
      expect(data.estimates[0].price_likely).toBe(3000)
      expect(data.estimates[1].price_likely).toBe(8000)
      expect(data.estimates[2].price_likely).toBe(12000)
    })
  })
})
