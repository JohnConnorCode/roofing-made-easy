/**
 * Tests for Pipeline Stages API Routes
 * Tests CRUD operations, ordering, and system stage protection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST, PUT } from '@/app/api/admin/pipeline-stages/route'
import { PATCH, DELETE } from '@/app/api/admin/pipeline-stages/[stageId]/route'
import {
  createMockRequest,
  createRouteContext,
  parseResponse,
} from './test-utils'

// In-memory stages store for testing
interface MockPipelineStage {
  id: string
  name: string
  slug: string
  color: string
  position: number
  is_system: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
}

const stagesStore: Map<string, MockPipelineStage> = new Map()

function createMockStage(data: Partial<MockPipelineStage>): MockPipelineStage {
  const id = data.id || `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const stage: MockPipelineStage = {
    id,
    name: data.name || 'Test Stage',
    slug: data.slug || 'test_stage',
    color: data.color || '#6B7280',
    position: data.position ?? stagesStore.size,
    is_system: data.is_system ?? false,
    is_visible: data.is_visible ?? true,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  }
  stagesStore.set(id, stage)
  return stage
}

function resetStagesStore() {
  stagesStore.clear()
}

function seedSystemStages() {
  createMockStage({ name: 'New', slug: 'new', color: '#D4A853', position: 0, is_system: true })
  createMockStage({ name: 'Intake Started', slug: 'intake_started', color: '#94A3B8', position: 1, is_system: true })
  createMockStage({ name: 'Estimate Generated', slug: 'estimate_generated', color: '#22C55E', position: 2, is_system: true })
  createMockStage({ name: 'Won', slug: 'won', color: '#10B981', position: 3, is_system: true })
}

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
}))

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let selectQuery = '*'
  let orderBy: { column: string; ascending: boolean } | null = null
  let insertData: Partial<MockPipelineStage> | null = null
  let updateData: Partial<MockPipelineStage> | null = null
  let isDelete = false
  let isSingle = false
  let limitNum = Infinity

  const builder = {
    select: (query?: string) => {
      selectQuery = query || '*'
      return builder
    },
    insert: (data: Partial<MockPipelineStage>) => {
      insertData = data
      return builder
    },
    update: (data: Partial<MockPipelineStage>) => {
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
    order: (column: string, opts?: { ascending?: boolean }) => {
      orderBy = { column, ascending: opts?.ascending ?? true }
      return builder
    },
    limit: (num: number) => {
      limitNum = num
      return builder
    },
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      if (table !== 'custom_pipeline_stages') {
        return resolve({ data: isSingle ? null : [], error: null })
      }

      // Handle insert
      if (insertData) {
        // Check for duplicate slug
        const existing = Array.from(stagesStore.values()).find(s => s.slug === insertData!.slug)
        if (existing) {
          return resolve({ data: null, error: { code: '23505', message: 'Duplicate slug' } })
        }
        const stage = createMockStage(insertData)
        return resolve({ data: stage, error: null })
      }

      // Handle update
      if (updateData) {
        const idFilter = filters.find(f => f.column === 'id')
        if (!idFilter) {
          return resolve({ data: null, error: { message: 'No ID filter' } })
        }
        const stage = stagesStore.get(idFilter.value as string)
        if (!stage) {
          return resolve({ data: null, error: null })
        }
        const updated = { ...stage, ...updateData }
        stagesStore.set(stage.id, updated)
        return resolve({ data: updated, error: null })
      }

      // Handle delete
      if (isDelete) {
        const idFilter = filters.find(f => f.column === 'id')
        if (idFilter) {
          stagesStore.delete(idFilter.value as string)
        }
        return resolve({ data: null, error: null })
      }

      // Handle select
      let data = Array.from(stagesStore.values())

      // Apply filters
      for (const filter of filters) {
        data = data.filter((item) => {
          const val = (item as unknown as Record<string, unknown>)[filter.column]
          if (filter.operator === 'eq') return val === filter.value
          return true
        })
      }

      // Apply sorting
      if (orderBy) {
        data.sort((a, b) => {
          const aVal = (a as unknown as Record<string, unknown>)[orderBy!.column] as string | number
          const bVal = (b as unknown as Record<string, unknown>)[orderBy!.column] as string | number
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return orderBy!.ascending ? cmp : -cmp
        })
      }

      // Apply limit
      data = data.slice(0, limitNum)

      if (isSingle) {
        if (data.length === 0) {
          return resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
        }
        return resolve({ data: data[0], error: null })
      }

      return resolve({ data, error: null })
    },
  }
  return builder
}

describe('Pipeline Stages API', () => {
  beforeEach(() => {
    resetStagesStore()
  })

  describe('GET /api/admin/pipeline-stages', () => {
    it('should return empty list when no stages exist', async () => {
      const response = await GET()
      const data = await parseResponse<MockPipelineStage[]>(response)

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should return stages ordered by position', async () => {
      createMockStage({ name: 'Third', slug: 'third', position: 2 })
      createMockStage({ name: 'First', slug: 'first', position: 0 })
      createMockStage({ name: 'Second', slug: 'second', position: 1 })

      const response = await GET()
      const data = await parseResponse<MockPipelineStage[]>(response)

      expect(response.status).toBe(200)
      expect(data.length).toBe(3)
      expect(data[0].name).toBe('First')
      expect(data[1].name).toBe('Second')
      expect(data[2].name).toBe('Third')
    })

    it('should include both system and custom stages', async () => {
      seedSystemStages()
      createMockStage({ name: 'Custom Stage', slug: 'custom', position: 4, is_system: false })

      const response = await GET()
      const data = await parseResponse<MockPipelineStage[]>(response)

      expect(response.status).toBe(200)
      expect(data.length).toBe(5)

      const systemStages = data.filter(s => s.is_system)
      const customStages = data.filter(s => !s.is_system)

      expect(systemStages.length).toBe(4)
      expect(customStages.length).toBe(1)
    })
  })

  describe('POST /api/admin/pipeline-stages', () => {
    it('should create a new custom stage', async () => {
      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'POST',
        body: {
          name: 'Review Pending',
          slug: 'review_pending',
          color: '#F97316'
        }
      })

      const response = await POST(request)
      const data = await parseResponse<MockPipelineStage>(response)

      expect(response.status).toBe(201)
      expect(data.name).toBe('Review Pending')
      expect(data.slug).toBe('review_pending')
      expect(data.color).toBe('#F97316')
      expect(data.is_system).toBe(false)
      expect(data.is_visible).toBe(true)
    })

    it('should return 400 for missing name', async () => {
      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'POST',
        body: {
          slug: 'test_slug'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for missing slug', async () => {
      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'POST',
        body: {
          name: 'Test Stage'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 409 for duplicate slug', async () => {
      createMockStage({ name: 'Existing', slug: 'existing_stage' })

      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'POST',
        body: {
          name: 'New Stage',
          slug: 'existing_stage'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })
  })

  describe('PUT /api/admin/pipeline-stages', () => {
    it('should reorder stages', async () => {
      const stage1 = createMockStage({ name: 'First', slug: 'first', position: 0 })
      const stage2 = createMockStage({ name: 'Second', slug: 'second', position: 1 })
      const stage3 = createMockStage({ name: 'Third', slug: 'third', position: 2 })

      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'PUT',
        body: {
          stages: [
            { id: stage3.id, position: 0 },
            { id: stage1.id, position: 1 },
            { id: stage2.id, position: 2 }
          ]
        }
      })

      const response = await PUT(request)
      const data = await parseResponse<MockPipelineStage[]>(response)

      expect(response.status).toBe(200)
      expect(data.length).toBe(3)
      // Verify positions were updated
      expect(data[0].name).toBe('Third')
      expect(data[1].name).toBe('First')
      expect(data[2].name).toBe('Second')
    })

    it('should return 400 for invalid stages array', async () => {
      const request = createMockRequest('http://localhost:3000/api/admin/pipeline-stages', {
        method: 'PUT',
        body: {
          stages: 'not-an-array'
        }
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/admin/pipeline-stages/[stageId]', () => {
    it('should update stage visibility', async () => {
      const stage = createMockStage({ name: 'Test', slug: 'test', is_visible: true })

      const request = createMockRequest(
        `http://localhost:3000/api/admin/pipeline-stages/${stage.id}`,
        {
          method: 'PATCH',
          body: { is_visible: false }
        }
      )
      const context = createRouteContext({ stageId: stage.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<MockPipelineStage>(response)

      expect(response.status).toBe(200)
      expect(data.is_visible).toBe(false)
    })

    it('should update stage name', async () => {
      const stage = createMockStage({ name: 'Original', slug: 'original' })

      const request = createMockRequest(
        `http://localhost:3000/api/admin/pipeline-stages/${stage.id}`,
        {
          method: 'PATCH',
          body: { name: 'Updated Name' }
        }
      )
      const context = createRouteContext({ stageId: stage.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<MockPipelineStage>(response)

      expect(response.status).toBe(200)
      expect(data.name).toBe('Updated Name')
    })

    it('should update stage color', async () => {
      const stage = createMockStage({ name: 'Test', slug: 'test', color: '#6B7280' })

      const request = createMockRequest(
        `http://localhost:3000/api/admin/pipeline-stages/${stage.id}`,
        {
          method: 'PATCH',
          body: { color: '#EF4444' }
        }
      )
      const context = createRouteContext({ stageId: stage.id })
      const response = await PATCH(request, context)
      const data = await parseResponse<MockPipelineStage>(response)

      expect(response.status).toBe(200)
      expect(data.color).toBe('#EF4444')
    })
  })

  describe('DELETE /api/admin/pipeline-stages/[stageId]', () => {
    it('should delete a custom stage', async () => {
      const stage = createMockStage({ name: 'Custom', slug: 'custom', is_system: false })

      const request = createMockRequest(
        `http://localhost:3000/api/admin/pipeline-stages/${stage.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ stageId: stage.id })
      const response = await DELETE(request, context)
      const data = await parseResponse<{ success: boolean }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(stagesStore.has(stage.id)).toBe(false)
    })

    it('should return 403 when trying to delete system stage', async () => {
      const stage = createMockStage({ name: 'System Stage', slug: 'system', is_system: true })

      const request = createMockRequest(
        `http://localhost:3000/api/admin/pipeline-stages/${stage.id}`,
        { method: 'DELETE' }
      )
      const context = createRouteContext({ stageId: stage.id })
      const response = await DELETE(request, context)
      const data = await parseResponse<{ error: string }>(response)

      expect(response.status).toBe(403)
      expect(data.error).toBe('Cannot delete system stages')
      // Verify stage still exists
      expect(stagesStore.has(stage.id)).toBe(true)
    })

    it('should return 404 for non-existent stage', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/admin/pipeline-stages/non-existent-id',
        { method: 'DELETE' }
      )
      const context = createRouteContext({ stageId: 'non-existent-id' })
      const response = await DELETE(request, context)

      expect(response.status).toBe(404)
    })
  })
})
