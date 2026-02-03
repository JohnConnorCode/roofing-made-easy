/**
 * Tests for Geographic Pricing API Routes
 * Tests CRUD operations, filtering, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/geographic-pricing/route'
import {
  GET as GET_REGION,
  PATCH,
  DELETE,
} from '@/app/api/geographic-pricing/[regionId]/route'
import {
  createMockRequest,
  createRouteContext,
  parseResponse,
  apiTestDb,
} from './test-utils'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
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
  requireAuth: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-123' },
    error: null
  })),
}))

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let containsFilter: { column: string; value: unknown[] } | null = null
  let insertData: unknown = null
  let updateData: unknown = null
  let isDelete = false
  let isSingle = false

  const builder = {
    select: () => builder,
    insert: (data: unknown) => {
      insertData = data
      return builder
    },
    update: (data: unknown) => {
      updateData = data
      return builder
    },
    delete: () => {
      isDelete = true
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    contains: (column: string, value: unknown[]) => {
      containsFilter = { column, value }
      return builder
    },
    order: () => builder,
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeQuery(
        table,
        filters,
        containsFilter,
        insertData,
        updateData,
        isDelete,
        isSingle
      )
      return resolve(result)
    },
  }
  return builder
}

function executeQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  containsFilter: { column: string; value: unknown[] } | null,
  insertData: unknown,
  updateData: unknown,
  isDelete: boolean,
  isSingle: boolean
): { data: unknown; error: unknown } {
  if (table !== 'geographic_pricing') {
    return { data: isSingle ? null : [], error: null }
  }

  // Handle insert
  if (insertData) {
    const region = apiTestDb.createGeographicPricing(
      insertData as Record<string, unknown>
    )
    return { data: region, error: null }
  }

  // Handle update
  if (updateData) {
    const idFilter = filters.find((f) => f.column === 'id')
    const id = idFilter?.value as string
    if (!id) return { data: null, error: { code: 'PGRST116' } }

    const existing = apiTestDb.getGeographicPricing(id)
    if (!existing) return { data: null, error: { code: 'PGRST116' } }

    const updated = apiTestDb.updateGeographicPricing(
      id,
      updateData as Record<string, unknown>
    )
    return { data: updated, error: null }
  }

  // Handle delete
  if (isDelete) {
    const idFilter = filters.find((f) => f.column === 'id')
    if (idFilter) {
      apiTestDb.geographicPricing.delete(idFilter.value as string)
    }
    return { data: null, error: null }
  }

  // Handle select
  let data = Array.from(apiTestDb.geographicPricing.values())

  // Apply eq filters
  for (const filter of filters) {
    if (filter.operator === 'eq') {
      data = data.filter(
        (item) => (item as Record<string, unknown>)[filter.column] === filter.value
      )
    }
  }

  // Apply contains filter (for zip code search)
  if (containsFilter) {
    data = data.filter((item) => {
      const arr = (item as Record<string, unknown>)[containsFilter.column] as string[]
      if (!Array.isArray(arr)) return false
      return containsFilter.value.some((v) => arr.includes(v as string))
    })
  }

  if (isSingle) {
    if (data.length === 0) {
      return { data: null, error: { code: 'PGRST116' } }
    }
    return { data: data[0], error: null }
  }

  return { data, error: null }
}

describe('Geographic Pricing API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/geographic-pricing', () => {
    it('should return empty list when no regions exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/geographic-pricing')
      const response = await GET(request)
      const data = await parseResponse<{ regions: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.regions).toEqual([])
    })

    it('should return all regions', async () => {
      apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Northeast Mississippi',
        material_multiplier: 1.0,
        labor_multiplier: 0.95,
      })
      apiTestDb.createGeographicPricing({
        state: 'TN',
        name: 'West Tennessee',
        material_multiplier: 1.05,
        labor_multiplier: 1.0,
      })

      const request = createMockRequest('http://localhost:3000/api/geographic-pricing')
      const response = await GET(request)
      const data = await parseResponse<{ regions: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.regions.length).toBe(2)
    })

    it('should filter by state', async () => {
      apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Mississippi Region',
      })
      apiTestDb.createGeographicPricing({
        state: 'TN',
        name: 'Tennessee Region',
      })

      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing?state=MS'
      )
      const response = await GET(request)
      const data = await parseResponse<{ regions: Array<{ state: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.regions.length).toBe(1)
      expect(data.regions[0].state).toBe('MS')
    })

    it('should filter by zip code', async () => {
      apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Tupelo Area',
        zip_codes: ['38801', '38802', '38803'],
      })
      apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Oxford Area',
        zip_codes: ['38655', '38656'],
      })

      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing?zip_code=38801'
      )
      const response = await GET(request)
      const data = await parseResponse<{ regions: Array<{ name: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.regions.length).toBe(1)
      expect(data.regions[0].name).toBe('Tupelo Area')
    })
  })

  describe('POST /api/geographic-pricing', () => {
    it('should create a new region with valid data', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing',
        {
          method: 'POST',
          body: {
            state: 'AL',
            name: 'North Alabama',
            material_multiplier: 1.02,
            labor_multiplier: 0.98,
            equipment_multiplier: 1.0,
            zip_codes: ['35601', '35602'],
          },
        }
      )

      const response = await POST(request)
      const data = await parseResponse<{
        region: { id: string; state: string; name: string }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.region.id).toBeDefined()
      expect(data.region.state).toBe('AL')
      expect(data.region.name).toBe('North Alabama')
    })

    it('should return 400 for missing state', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing',
        {
          method: 'POST',
          body: {
            name: 'Missing State Region',
          },
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for missing name', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing',
        {
          method: 'POST',
          body: {
            state: 'MS',
          },
        }
      )

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should use default multipliers when not provided', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing',
        {
          method: 'POST',
          body: {
            state: 'GA',
            name: 'Default Multipliers Region',
          },
        }
      )

      const response = await POST(request)
      const data = await parseResponse<{
        region: {
          material_multiplier: number
          labor_multiplier: number
          equipment_multiplier: number
        }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.region.material_multiplier).toBe(1.0)
      expect(data.region.labor_multiplier).toBe(1.0)
      expect(data.region.equipment_multiplier).toBe(1.0)
    })
  })

  describe('GET /api/geographic-pricing/[regionId]', () => {
    it('should return a specific region', async () => {
      const created = apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Test Region',
        material_multiplier: 1.1,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/geographic-pricing/${created.id}`
      )
      const context = createRouteContext({ regionId: created.id })
      const response = await GET_REGION(request, context)
      const data = await parseResponse<{
        region: { id: string; name: string; material_multiplier: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.region.id).toBe(created.id)
      expect(data.region.name).toBe('Test Region')
      expect(data.region.material_multiplier).toBe(1.1)
    })

    it('should return 404 for non-existent region', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing/non-existent-id'
      )
      const context = createRouteContext({ regionId: 'non-existent-id' })
      const response = await GET_REGION(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/geographic-pricing/[regionId]', () => {
    it('should update an existing region', async () => {
      const created = apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Original Name',
        material_multiplier: 1.0,
        labor_multiplier: 1.0,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/geographic-pricing/${created.id}`,
        {
          method: 'PATCH',
          body: {
            name: 'Updated Name',
            labor_multiplier: 1.15,
          },
        }
      )
      const context = createRouteContext({ regionId: created.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<{
        region: { name: string; labor_multiplier: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.region.name).toBe('Updated Name')
      expect(data.region.labor_multiplier).toBe(1.15)
    })

    it('should update zip codes', async () => {
      const created = apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Zip Test Region',
        zip_codes: ['38801'],
      })

      const request = createMockRequest(
        `http://localhost:3000/api/geographic-pricing/${created.id}`,
        {
          method: 'PATCH',
          body: {
            zip_codes: ['38801', '38802', '38803'],
          },
        }
      )
      const context = createRouteContext({ regionId: created.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<{ region: { zip_codes: string[] } }>(response)

      expect(response.status).toBe(200)
      expect(data.region.zip_codes).toEqual(['38801', '38802', '38803'])
    })

    it('should return 404 for updating non-existent region', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/geographic-pricing/non-existent-id',
        {
          method: 'PATCH',
          body: { name: 'New Name' },
        }
      )
      const context = createRouteContext({ regionId: 'non-existent-id' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/geographic-pricing/[regionId]', () => {
    it('should delete a region', async () => {
      const created = apiTestDb.createGeographicPricing({
        state: 'MS',
        name: 'Region to Delete',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/geographic-pricing/${created.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ regionId: created.id })
      const response = await DELETE(request, context)
      const data = await parseResponse<{ success: boolean }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify the region is deleted
      const region = apiTestDb.getGeographicPricing(created.id)
      expect(region).toBeUndefined()
    })
  })
})
