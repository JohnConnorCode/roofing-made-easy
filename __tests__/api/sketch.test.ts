/**
 * Tests for Sketch API Routes
 * Tests sketch CRUD operations, slope management, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST, PATCH } from '@/app/api/leads/[leadId]/sketch/route'
import {
  GET as GET_SLOPES,
  POST as CREATE_SLOPE,
  PATCH as UPDATE_SLOPE,
  DELETE as DELETE_SLOPE,
} from '@/app/api/leads/[leadId]/sketch/slopes/route'
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

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
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
    order: () => builder,
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeQuery(
        table,
        filters,
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
  insertData: unknown,
  updateData: unknown,
  isDelete: boolean,
  isSingle: boolean
): { data: unknown; error: unknown } {
  switch (table) {
    case 'leads': {
      const idFilter = filters.find((f) => f.column === 'id')
      if (idFilter) {
        const lead = apiTestDb.getLead(idFilter.value as string)
        return { data: lead || null, error: null }
      }
      return { data: null, error: null }
    }

    case 'roof_sketches': {
      // Handle insert
      if (insertData) {
        const data = insertData as { lead_id: string }
        // Check for existing sketch for this lead
        const existing = apiTestDb.getRoofSketchByLeadId(data.lead_id)
        if (existing) {
          return { data: null, error: { code: '23505', message: 'Sketch already exists' } }
        }
        const sketch = apiTestDb.createRoofSketch(data)
        return { data: sketch, error: null }
      }

      // Handle update
      if (updateData) {
        const leadIdFilter = filters.find((f) => f.column === 'lead_id')
        if (leadIdFilter) {
          const sketch = apiTestDb.getRoofSketchByLeadId(leadIdFilter.value as string)
          if (!sketch) return { data: null, error: { code: 'PGRST116' } }
          const updated = {
            ...sketch,
            ...(updateData as Record<string, unknown>),
            updated_at: new Date().toISOString(),
          }
          apiTestDb.roofSketches.set(sketch.id, updated)
          const slopes = Array.from(apiTestDb.roofSlopes.values()).filter(
            (s) => s.sketch_id === sketch.id
          )
          return { data: { ...updated, slopes }, error: null }
        }
        return { data: null, error: { code: 'PGRST116' } }
      }

      // Handle select
      const leadIdFilter = filters.find((f) => f.column === 'lead_id')
      if (leadIdFilter) {
        const sketch = apiTestDb.getRoofSketchByLeadId(leadIdFilter.value as string)
        if (!sketch && isSingle) {
          return { data: null, error: { code: 'PGRST116' } }
        }
        if (sketch) {
          const slopes = Array.from(apiTestDb.roofSlopes.values()).filter(
            (s) => s.sketch_id === sketch.id
          )
          return { data: { ...sketch, slopes }, error: null }
        }
      }
      return { data: null, error: isSingle ? { code: 'PGRST116' } : null }
    }

    case 'roof_slopes': {
      // Handle insert
      if (insertData) {
        const data = insertData as { sketch_id: string; slope_number: number }
        // Check for duplicate slope number
        const existing = Array.from(apiTestDb.roofSlopes.values()).find(
          (s) => s.sketch_id === data.sketch_id && s.slope_number === data.slope_number
        )
        if (existing) {
          return { data: null, error: { code: '23505', message: 'Duplicate slope number' } }
        }
        const slope = apiTestDb.createRoofSlope(data)
        return { data: slope, error: null }
      }

      // Handle update
      if (updateData) {
        const idFilter = filters.find((f) => f.column === 'id')
        if (idFilter) {
          const slope = apiTestDb.roofSlopes.get(idFilter.value as string)
          if (!slope) return { data: null, error: { code: 'PGRST116' } }
          const updated = {
            ...slope,
            ...(updateData as Record<string, unknown>),
            updated_at: new Date().toISOString(),
          }
          apiTestDb.roofSlopes.set(slope.id, updated)
          return { data: updated, error: null }
        }
        return { data: null, error: { code: 'PGRST116' } }
      }

      // Handle delete
      if (isDelete) {
        const idFilter = filters.find((f) => f.column === 'id')
        if (idFilter) {
          apiTestDb.roofSlopes.delete(idFilter.value as string)
        }
        return { data: null, error: null }
      }

      // Handle select
      const sketchIdFilter = filters.find((f) => f.column === 'sketch_id')
      if (sketchIdFilter) {
        const slopes = Array.from(apiTestDb.roofSlopes.values()).filter(
          (s) => s.sketch_id === sketchIdFilter.value
        )
        return { data: slopes, error: null }
      }
      return { data: [], error: null }
    }

    default:
      return { data: isSingle ? null : [], error: null }
  }
}

describe('Sketch API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/leads/[leadId]/sketch', () => {
    it('should return null when no sketch exists for lead', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{ sketch: unknown; message?: string }>(response)

      expect(response.status).toBe(200)
      expect(data.sketch).toBeNull()
      expect(data.message).toBeDefined()
    })

    it('should return sketch with slopes', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const sketch = apiTestDb.createRoofSketch({
        lead_id: lead.id,
        total_squares: 25,
        total_sqft: 2500,
      })
      apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        name: 'Front',
        slope_number: 1,
        squares: 12.5,
        pitch: 5,
      })
      apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        name: 'Back',
        slope_number: 2,
        squares: 12.5,
        pitch: 5,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET(request, context)
      const data = await parseResponse<{
        sketch: { id: string; total_squares: number; slopes: unknown[] }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.sketch.id).toBe(sketch.id)
      expect(data.sketch.total_squares).toBe(25)
      expect(data.sketch.slopes.length).toBe(2)
    })
  })

  describe('POST /api/leads/[leadId]/sketch', () => {
    it('should create a new sketch with valid data', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'POST',
          body: {
            total_squares: 30,
            total_sqft: 3000,
            total_eave_lf: 100,
            total_ridge_lf: 50,
            measurement_source: 'manual',
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)
      const data = await parseResponse<{
        sketch: { id: string; lead_id: string; total_squares: number }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.sketch.id).toBeDefined()
      expect(data.sketch.lead_id).toBe(lead.id)
      expect(data.sketch.total_squares).toBe(30)
    })

    it('should return 404 for non-existent lead', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/leads/non-existent-id/sketch',
        {
          method: 'POST',
          body: {
            total_squares: 25,
          },
        }
      )
      const context = createRouteContext({ leadId: 'non-existent-id' })
      const response = await POST(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 409 when sketch already exists', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'POST',
          body: {
            total_squares: 25,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(409)
    })

    it('should return 400 for invalid measurement_source', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'POST',
          body: {
            total_squares: 25,
            measurement_source: 'invalid_source',
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 400 for negative values', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'POST',
          body: {
            total_squares: -5, // Should be >= 0
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await POST(request, context)

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/leads/[leadId]/sketch', () => {
    it('should update an existing sketch', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({
        lead_id: lead.id,
        total_squares: 25,
        total_sqft: 2500,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'PATCH',
          body: {
            total_squares: 30,
            total_sqft: 3000,
            chimney_count: 2,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<{
        sketch: { total_squares: number; total_sqft: number; chimney_count: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.sketch.total_squares).toBe(30)
      expect(data.sketch.total_sqft).toBe(3000)
      expect(data.sketch.chimney_count).toBe(2)
    })

    it('should return 404 for updating non-existent sketch', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch`,
        {
          method: 'PATCH',
          body: {
            total_squares: 30,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })
  })
})

describe('Sketch Slopes API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/leads/[leadId]/sketch/slopes', () => {
    it('should return empty list when no sketch exists', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET_SLOPES(request, context)
      const data = await parseResponse<{ slopes: unknown[]; message?: string }>(response)

      expect(response.status).toBe(200)
      expect(data.slopes).toEqual([])
    })

    it('should return slopes for a sketch', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const sketch = apiTestDb.createRoofSketch({ lead_id: lead.id })
      apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        name: 'Front',
        slope_number: 1,
        pitch: 5,
      })
      apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        name: 'Back',
        slope_number: 2,
        pitch: 6,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await GET_SLOPES(request, context)
      const data = await parseResponse<{ slopes: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.slopes.length).toBe(2)
    })
  })

  describe('POST /api/leads/[leadId]/sketch/slopes', () => {
    it('should create a new slope', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'POST',
          body: {
            name: 'Main Slope',
            slope_number: 1,
            squares: 15,
            sqft: 1500,
            pitch: 6,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await CREATE_SLOPE(request, context)
      const data = await parseResponse<{
        slope: { id: string; name: string; pitch: number; pitch_multiplier: number }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.slope.id).toBeDefined()
      expect(data.slope.name).toBe('Main Slope')
      expect(data.slope.pitch).toBe(6)
      // Pitch multiplier should be auto-calculated
      expect(data.slope.pitch_multiplier).toBeGreaterThan(1)
    })

    it('should create sketch if it does not exist', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'POST',
          body: {
            name: 'First Slope',
            slope_number: 1,
            pitch: 4,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await CREATE_SLOPE(request, context)

      expect(response.status).toBe(201)
    })

    it('should return 409 for duplicate slope number', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const sketch = apiTestDb.createRoofSketch({ lead_id: lead.id })
      apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        slope_number: 1,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'POST',
          body: {
            name: 'Duplicate Slope',
            slope_number: 1, // Already exists
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await CREATE_SLOPE(request, context)

      expect(response.status).toBe(409)
    })

    it('should return 400 for invalid pitch', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'POST',
          body: {
            name: 'Invalid Pitch Slope',
            slope_number: 1,
            pitch: 30, // Max is 24
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await CREATE_SLOPE(request, context)

      expect(response.status).toBe(400)
    })

    it('should auto-calculate steep charge for pitch >= 7', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'POST',
          body: {
            name: 'Steep Slope',
            slope_number: 1,
            pitch: 8,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await CREATE_SLOPE(request, context)
      const data = await parseResponse<{ slope: { has_steep_charge: boolean } }>(response)

      expect(response.status).toBe(201)
      expect(data.slope.has_steep_charge).toBe(true)
    })
  })

  describe('PATCH /api/leads/[leadId]/sketch/slopes', () => {
    it('should update an existing slope', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const sketch = apiTestDb.createRoofSketch({ lead_id: lead.id })
      const slope = apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        name: 'Original Name',
        slope_number: 1,
        pitch: 4,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'PATCH',
          body: {
            id: slope.id,
            name: 'Updated Name',
            pitch: 8,
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await UPDATE_SLOPE(request, context)
      const data = await parseResponse<{
        slope: { name: string; pitch: number; pitch_multiplier: number; has_steep_charge: boolean }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.slope.name).toBe('Updated Name')
      expect(data.slope.pitch).toBe(8)
      // Should recalculate pitch multiplier and steep charge
      expect(data.slope.pitch_multiplier).toBeGreaterThan(1)
      expect(data.slope.has_steep_charge).toBe(true)
    })

    it('should return 404 for non-existent slope', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      // Note: The route uses zod schema that requires a valid UUID for id
      // A non-UUID id will return 400 (validation error) not 404
      // Using a valid UUID format that doesn't exist in the database
      const fakeUuid = '00000000-0000-0000-0000-000000000000'

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'PATCH',
          body: {
            id: fakeUuid,
            name: 'Update Attempt',
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await UPDATE_SLOPE(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 400 for missing slope id', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        {
          method: 'PATCH',
          body: {
            name: 'Missing ID',
          },
        }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await UPDATE_SLOPE(request, context)

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/leads/[leadId]/sketch/slopes', () => {
    it('should delete a slope', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      const sketch = apiTestDb.createRoofSketch({ lead_id: lead.id })
      const slope = apiTestDb.createRoofSlope({
        sketch_id: sketch.id,
        slope_number: 1,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes?id=${slope.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await DELETE_SLOPE(request, context)
      const data = await parseResponse<{ success: boolean }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify the slope is deleted
      const deletedSlope = apiTestDb.roofSlopes.get(slope.id)
      expect(deletedSlope).toBeUndefined()
    })

    it('should return 400 for missing slope id', async () => {
      const lead = apiTestDb.createLead({ source: 'web_funnel' })
      apiTestDb.createRoofSketch({ lead_id: lead.id })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}/sketch/slopes`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ leadId: lead.id })
      const response = await DELETE_SLOPE(request, context)

      expect(response.status).toBe(400)
    })
  })
})
