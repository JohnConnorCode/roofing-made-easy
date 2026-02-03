/**
 * Tests for Macros API Routes
 * Tests CRUD operations, line item management, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/macros/route'
import {
  GET as GET_MACRO,
  PATCH,
  DELETE,
  POST as ADD_LINE_ITEM,
} from '@/app/api/macros/[macroId]/route'
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
  let insertData: unknown = null
  let updateData: unknown = null
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
    delete: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    or: () => builder,
    order: () => builder,
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeQuery(table, filters, insertData, updateData, isSingle)
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
  isSingle: boolean
): { data: unknown; error: unknown } {
  if (table === 'estimate_macros') {
    // Handle insert
    if (insertData) {
      const macro = apiTestDb.createMacro(insertData as Record<string, unknown>)
      return { data: macro, error: null }
    }

    // Handle update
    if (updateData) {
      const idFilter = filters.find((f) => f.column === 'id')
      const id = idFilter?.value as string
      if (!id) return { data: null, error: { code: 'PGRST116' } }

      const existing = apiTestDb.getMacro(id)
      if (!existing) return { data: null, error: { code: 'PGRST116' } }

      const updated = apiTestDb.updateMacro(id, updateData as Record<string, unknown>)
      return { data: updated, error: null }
    }

    // Handle select
    let data = Array.from(apiTestDb.macros.values())

    for (const filter of filters) {
      if (filter.operator === 'eq') {
        data = data.filter(
          (item) => (item as Record<string, unknown>)[filter.column] === filter.value
        )
      }
    }

    if (isSingle) {
      if (data.length === 0) {
        return { data: null, error: { code: 'PGRST116' } }
      }
      // Include line_items for single macro fetch
      const macro = data[0]
      const macroLineItems = Array.from(apiTestDb.macroLineItems.values())
        .filter((mli) => mli.macro_id === macro.id)
        .map((mli) => ({
          ...mli,
          line_item: apiTestDb.getLineItem(mli.line_item_id),
        }))
      return { data: { ...macro, line_items: macroLineItems }, error: null }
    }

    return { data, error: null }
  }

  if (table === 'macro_line_items') {
    if (insertData) {
      // Check for duplicate
      const existing = Array.from(apiTestDb.macroLineItems.values()).find(
        (mli) =>
          mli.macro_id === (insertData as { macro_id: string }).macro_id &&
          mli.line_item_id === (insertData as { line_item_id: string }).line_item_id
      )
      if (existing) {
        return { data: null, error: { code: '23505', message: 'Duplicate' } }
      }
      const mli = apiTestDb.addMacroLineItem(insertData as Record<string, unknown>)
      const lineItem = apiTestDb.getLineItem(mli.line_item_id)
      return { data: { ...mli, line_item: lineItem }, error: null }
    }

    return { data: [], error: null }
  }

  return { data: isSingle ? null : [], error: null }
}

describe('Macros API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/macros', () => {
    it('should return empty list when no macros exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/macros')
      const response = await GET(request)
      const data = await parseResponse<{ macros: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.macros).toEqual([])
    })

    it('should return all active macros', async () => {
      apiTestDb.createMacro({
        name: 'Shingle Replacement',
        roof_type: 'asphalt_shingle',
        job_type: 'full_replacement',
        is_active: true,
      })
      apiTestDb.createMacro({
        name: 'Metal Roof',
        roof_type: 'metal_standing_seam',
        job_type: 'full_replacement',
        is_active: true,
      })

      const request = createMockRequest('http://localhost:3000/api/macros')
      const response = await GET(request)
      const data = await parseResponse<{ macros: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.macros.length).toBe(2)
    })

    it('should filter by roof_type', async () => {
      apiTestDb.createMacro({
        name: 'Shingle',
        roof_type: 'asphalt_shingle',
        job_type: 'any',
      })
      apiTestDb.createMacro({
        name: 'Metal',
        roof_type: 'metal_standing_seam',
        job_type: 'any',
      })

      const request = createMockRequest(
        'http://localhost:3000/api/macros?roof_type=asphalt_shingle'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should filter by job_type', async () => {
      apiTestDb.createMacro({
        name: 'Replacement',
        roof_type: 'any',
        job_type: 'full_replacement',
      })
      apiTestDb.createMacro({
        name: 'Repair',
        roof_type: 'any',
        job_type: 'repair',
      })

      const request = createMockRequest(
        'http://localhost:3000/api/macros?job_type=repair'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/macros', () => {
    it('should create a new macro with valid data', async () => {
      const request = createMockRequest('http://localhost:3000/api/macros', {
        method: 'POST',
        body: {
          name: 'Standard Shingle Replacement',
          description: 'Complete shingle replacement package',
          roof_type: 'asphalt_shingle',
          job_type: 'full_replacement',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ macro: { id: string; name: string } }>(response)

      expect(response.status).toBe(201)
      expect(data.macro.id).toBeDefined()
      expect(data.macro.name).toBe('Standard Shingle Replacement')
    })

    it('should return 400 for missing name', async () => {
      const request = createMockRequest('http://localhost:3000/api/macros', {
        method: 'POST',
        body: {
          roof_type: 'asphalt_shingle',
          job_type: 'full_replacement',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid roof_type', async () => {
      const request = createMockRequest('http://localhost:3000/api/macros', {
        method: 'POST',
        body: {
          name: 'Invalid Macro',
          roof_type: 'invalid_roof_type',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid job_type', async () => {
      const request = createMockRequest('http://localhost:3000/api/macros', {
        method: 'POST',
        body: {
          name: 'Invalid Macro',
          job_type: 'invalid_job_type',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/macros/[macroId]', () => {
    it('should return a specific macro with line items', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Test Macro',
        roof_type: 'asphalt_shingle',
        job_type: 'full_replacement',
      })
      const lineItem = apiTestDb.createLineItem({
        item_code: 'RFG100',
        name: 'Test Line Item',
        category: 'shingles',
      })
      apiTestDb.addMacroLineItem({
        macro_id: macro.id,
        line_item_id: lineItem.id,
        sort_order: 1,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await GET_MACRO(request, context)
      const data = await parseResponse<{
        macro: { id: string; name: string; line_items: unknown[] }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.macro.id).toBe(macro.id)
      expect(data.macro.name).toBe('Test Macro')
      expect(data.macro.line_items).toBeDefined()
    })

    it('should return 404 for non-existent macro', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/macros/non-existent-id'
      )
      const context = createRouteContext({ macroId: 'non-existent-id' })
      const response = await GET_MACRO(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/macros/[macroId]', () => {
    it('should update an existing macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Original Name',
        roof_type: 'asphalt_shingle',
        job_type: 'full_replacement',
        is_system: false,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'PATCH',
          body: {
            name: 'Updated Name',
            description: 'Updated description',
          },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<{
        macro: { name: string; description: string }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.macro.name).toBe('Updated Name')
      expect(data.macro.description).toBe('Updated description')
    })

    it('should return 404 for updating non-existent macro', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/macros/non-existent-id',
        {
          method: 'PATCH',
          body: { name: 'New Name' },
        }
      )
      const context = createRouteContext({ macroId: 'non-existent-id' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 403 for updating system macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'System Macro',
        is_system: true,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'PATCH',
          body: { name: 'Try to Update' },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await PATCH(request, context)

      expect(response.status).toBe(403)
    })

    it('should return 400 for invalid update data', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Validation Test',
        is_system: false,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'PATCH',
          body: {
            roof_type: 'invalid_type',
          },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await PATCH(request, context)

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/macros/[macroId]', () => {
    it('should soft delete a macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Macro to Delete',
        is_active: true,
        is_system: false,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await DELETE(request, context)
      const data = await parseResponse<{ success: boolean }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify the macro is now inactive
      const updated = apiTestDb.getMacro(macro.id)
      expect(updated?.is_active).toBe(false)
    })

    it('should return 403 for deleting system macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'System Macro',
        is_system: true,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await DELETE(request, context)

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/macros/[macroId] (add line item)', () => {
    it('should add a line item to a macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Test Macro',
      })
      const lineItem = apiTestDb.createLineItem({
        item_code: 'ADD001',
        name: 'Line Item to Add',
        category: 'shingles',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'POST',
          body: {
            line_item_id: lineItem.id,
            sort_order: 1,
            is_optional: false,
          },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await ADD_LINE_ITEM(request, context)
      const data = await parseResponse<{
        macroLineItem: { id: string; line_item: { name: string } }
      }>(response)

      expect(response.status).toBe(201)
      expect(data.macroLineItem.id).toBeDefined()
      expect(data.macroLineItem.line_item.name).toBe('Line Item to Add')
    })

    it('should return 400 for missing line_item_id', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Test Macro',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'POST',
          body: {
            sort_order: 1,
          },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await ADD_LINE_ITEM(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 409 for duplicate line item in macro', async () => {
      const macro = apiTestDb.createMacro({
        name: 'Test Macro',
      })
      const lineItem = apiTestDb.createLineItem({
        item_code: 'DUP001',
        name: 'Duplicate Line Item',
        category: 'shingles',
      })

      // Add the line item first
      apiTestDb.addMacroLineItem({
        macro_id: macro.id,
        line_item_id: lineItem.id,
      })

      // Try to add it again
      const request = createMockRequest(
        `http://localhost:3000/api/macros/${macro.id}`,
        {
          method: 'POST',
          body: {
            line_item_id: lineItem.id,
            sort_order: 2,
          },
        }
      )
      const context = createRouteContext({ macroId: macro.id })
      const response = await ADD_LINE_ITEM(request, context)

      expect(response.status).toBe(409)
    })
  })
})
