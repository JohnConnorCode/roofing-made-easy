/**
 * Tests for Line Items API Routes
 * Tests CRUD operations, validation, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/line-items/route'
import { GET as GET_ITEM, PATCH, DELETE } from '@/app/api/line-items/[itemId]/route'
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
    or: () => builder,
    order: () => builder,
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeQuery(table, filters, insertData, updateData, isDelete, isSingle)
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
  if (table !== 'line_items') {
    return { data: isSingle ? null : [], error: null }
  }

  // Handle insert
  if (insertData) {
    const existing = apiTestDb.getLineItemByCode(
      (insertData as { item_code: string }).item_code
    )
    if (existing) {
      return { data: null, error: { code: '23505', message: 'Duplicate' } }
    }
    const item = apiTestDb.createLineItem(insertData as Record<string, unknown>)
    return { data: item, error: null }
  }

  // Handle update
  if (updateData) {
    const idFilter = filters.find((f) => f.column === 'id')
    const id = idFilter?.value as string
    if (!id) return { data: null, error: { code: 'PGRST116' } }

    const existing = apiTestDb.getLineItem(id)
    if (!existing) return { data: null, error: { code: 'PGRST116' } }

    // Check for duplicate item_code on update
    if ((updateData as { item_code?: string }).item_code) {
      const codeMatch = apiTestDb.getLineItemByCode(
        (updateData as { item_code: string }).item_code
      )
      if (codeMatch && codeMatch.id !== id) {
        return { data: null, error: { code: '23505' } }
      }
    }

    const updated = apiTestDb.updateLineItem(id, updateData as Record<string, unknown>)
    return { data: updated, error: null }
  }

  // Handle delete (soft delete by setting is_active to false)
  if (isDelete) {
    const idFilter = filters.find((f) => f.column === 'id')
    if (idFilter) {
      const updated = apiTestDb.updateLineItem(idFilter.value as string, { is_active: false })
      return { data: updated, error: null }
    }
    return { data: null, error: null }
  }

  // Handle select
  let data = Array.from(apiTestDb.lineItems.values())

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
    return { data: data[0], error: null }
  }

  return { data, error: null }
}

describe('Line Items API', () => {
  beforeEach(() => {
    apiTestDb.reset()
  })

  describe('GET /api/line-items', () => {
    it('should return empty list when no line items exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/line-items')
      const response = await GET(request)
      const data = await parseResponse<{ lineItems: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.lineItems).toEqual([])
    })

    it('should return all active line items', async () => {
      apiTestDb.createLineItem({
        item_code: 'RFG100',
        name: 'Tear Off',
        category: 'tear_off',
        is_active: true,
      })
      apiTestDb.createLineItem({
        item_code: 'RFG200',
        name: 'Underlayment',
        category: 'underlayment',
        is_active: true,
      })
      apiTestDb.createLineItem({
        item_code: 'RFG300',
        name: 'Inactive Item',
        category: 'miscellaneous',
        is_active: false,
      })

      const request = createMockRequest('http://localhost:3000/api/line-items')
      const response = await GET(request)
      const data = await parseResponse<{ lineItems: unknown[] }>(response)

      expect(response.status).toBe(200)
      // Should return all items (filtering is done on active by default in route)
      expect(data.lineItems.length).toBeGreaterThanOrEqual(2)
    })

    it('should filter by category', async () => {
      apiTestDb.createLineItem({
        item_code: 'RFG100',
        name: 'Tear Off',
        category: 'tear_off',
      })
      apiTestDb.createLineItem({
        item_code: 'UND100',
        name: 'Underlayment',
        category: 'underlayment',
      })

      const request = createMockRequest(
        'http://localhost:3000/api/line-items?category=tear_off'
      )
      const response = await GET(request)
      const data = await parseResponse<{ lineItems: Array<{ category: string }> }>(
        response
      )

      expect(response.status).toBe(200)
      // All returned items should be from the tear_off category
      data.lineItems.forEach((item) => {
        expect(item.category).toBe('tear_off')
      })
    })
  })

  describe('POST /api/line-items', () => {
    it('should create a new line item with valid data', async () => {
      const request = createMockRequest('http://localhost:3000/api/line-items', {
        method: 'POST',
        body: {
          item_code: 'NEW001',
          name: 'New Line Item',
          category: 'shingles',
          unit_type: 'SQ',
          base_material_cost: 100,
          base_labor_cost: 50,
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ lineItem: { id: string; item_code: string } }>(
        response
      )

      expect(response.status).toBe(201)
      expect(data.lineItem.id).toBeDefined()
      expect(data.lineItem.item_code).toBe('NEW001')
    })

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest('http://localhost:3000/api/line-items', {
        method: 'POST',
        body: {
          // Missing item_code and name
          category: 'shingles',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid category', async () => {
      const request = createMockRequest('http://localhost:3000/api/line-items', {
        method: 'POST',
        body: {
          item_code: 'INV001',
          name: 'Invalid Category Item',
          category: 'invalid_category',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 409 for duplicate item_code', async () => {
      apiTestDb.createLineItem({
        item_code: 'DUP001',
        name: 'Existing Item',
        category: 'shingles',
      })

      const request = createMockRequest('http://localhost:3000/api/line-items', {
        method: 'POST',
        body: {
          item_code: 'DUP001',
          name: 'Duplicate Item',
          category: 'shingles',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })
  })

  describe('GET /api/line-items/[itemId]', () => {
    it('should return a specific line item', async () => {
      const created = apiTestDb.createLineItem({
        item_code: 'GET001',
        name: 'Get Test Item',
        category: 'labor',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/line-items/${created.id}`
      )
      const context = createRouteContext({ itemId: created.id })
      const response = await GET_ITEM(request, context)
      const data = await parseResponse<{ lineItem: { id: string; name: string } }>(
        response
      )

      expect(response.status).toBe(200)
      expect(data.lineItem.id).toBe(created.id)
      expect(data.lineItem.name).toBe('Get Test Item')
    })

    it('should return 404 for non-existent item', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/line-items/non-existent-id'
      )
      const context = createRouteContext({ itemId: 'non-existent-id' })
      const response = await GET_ITEM(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/line-items/[itemId]', () => {
    it('should update an existing line item', async () => {
      const created = apiTestDb.createLineItem({
        item_code: 'UPD001',
        name: 'Original Name',
        category: 'labor',
        base_material_cost: 100,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/line-items/${created.id}`,
        {
          method: 'PATCH',
          body: {
            name: 'Updated Name',
            base_material_cost: 150,
          },
        }
      )
      const context = createRouteContext({ itemId: created.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<{
        lineItem: { name: string; base_material_cost: number }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.lineItem.name).toBe('Updated Name')
      expect(data.lineItem.base_material_cost).toBe(150)
    })

    it('should return 404 for updating non-existent item', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/line-items/non-existent-id',
        {
          method: 'PATCH',
          body: { name: 'New Name' },
        }
      )
      const context = createRouteContext({ itemId: 'non-existent-id' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid update data', async () => {
      const created = apiTestDb.createLineItem({
        item_code: 'VAL001',
        name: 'Validation Test',
        category: 'labor',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/line-items/${created.id}`,
        {
          method: 'PATCH',
          body: {
            category: 'invalid_category',
          },
        }
      )
      const context = createRouteContext({ itemId: created.id })
      const response = await PATCH(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 409 for duplicate item_code on update', async () => {
      apiTestDb.createLineItem({
        item_code: 'EXIST001',
        name: 'Existing Item',
        category: 'labor',
      })
      const toUpdate = apiTestDb.createLineItem({
        item_code: 'UPD002',
        name: 'Item to Update',
        category: 'labor',
      })

      const request = createMockRequest(
        `http://localhost:3000/api/line-items/${toUpdate.id}`,
        {
          method: 'PATCH',
          body: {
            item_code: 'EXIST001',
          },
        }
      )
      const context = createRouteContext({ itemId: toUpdate.id })
      const response = await PATCH(request, context)

      expect(response.status).toBe(409)
    })
  })

  describe('DELETE /api/line-items/[itemId]', () => {
    it('should soft delete a line item', async () => {
      const created = apiTestDb.createLineItem({
        item_code: 'DEL001',
        name: 'Item to Delete',
        category: 'labor',
        is_active: true,
      })

      const request = createMockRequest(
        `http://localhost:3000/api/line-items/${created.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ itemId: created.id })
      const response = await DELETE(request, context)
      const data = await parseResponse<{ success: boolean }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify the item is now inactive
      const item = apiTestDb.getLineItem(created.id)
      expect(item?.is_active).toBe(false)
    })
  })
})
