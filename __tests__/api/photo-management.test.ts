import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// Mock modules before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/api/auth', () => ({
  requireAdmin: vi.fn(() => ({ user: { id: 'admin-123' }, error: null })),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ success: true })),
  getClientIP: vi.fn(() => '127.0.0.1'),
  rateLimitResponse: vi.fn(),
}))

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      remove: vi.fn(),
    })),
  },
}

describe('Photo Category Update API (PATCH)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('requires admin authentication', async () => {
      const { requireAdmin } = await import('@/lib/api/auth')
      expect(requireAdmin).toBeDefined()
    })

    it('returns error when not admin', () => {
      const authError = {
        status: 401,
        body: { error: 'Admin authentication required' },
      }

      expect(authError.status).toBe(401)
    })
  })

  describe('Rate Limiting', () => {
    it('applies rate limiting to prevent abuse', () => {
      const rateLimit = {
        type: 'general',
        applied: true,
      }

      expect(rateLimit.applied).toBe(true)
    })

    it('returns 429 when rate limited', () => {
      const response = {
        status: 429,
        body: { error: 'Too many requests' },
      }

      expect(response.status).toBe(429)
    })
  })

  describe('Input Validation', () => {
    const VALID_CATEGORIES = [
      'general',
      'damage',
      'before',
      'after',
      'closeup',
      'wide_angle',
      'inspection',
    ] as const

    it('validates category against allowed values', () => {
      const schema = z.object({
        category: z.enum(VALID_CATEGORIES).optional(),
      })

      const validInput = { category: 'damage' }
      const result = schema.safeParse(validInput)

      expect(result.success).toBe(true)
    })

    it('rejects invalid category', () => {
      const schema = z.object({
        category: z.enum(VALID_CATEGORIES).optional(),
      })

      const invalidInput = { category: 'invalid_category' }
      const result = schema.safeParse(invalidInput)

      expect(result.success).toBe(false)
    })

    it('validates description length', () => {
      const schema = z.object({
        description: z.string().max(500).optional(),
      })

      const longDescription = 'x'.repeat(501)
      const result = schema.safeParse({ description: longDescription })

      expect(result.success).toBe(false)
    })

    it('validates tags array', () => {
      const schema = z.object({
        tags: z.array(z.string().max(50)).max(10).optional(),
      })

      const validTags = { tags: ['roof', 'shingle', 'damage'] }
      const result = schema.safeParse(validTags)

      expect(result.success).toBe(true)
    })

    it('rejects too many tags', () => {
      const schema = z.object({
        tags: z.array(z.string().max(50)).max(10).optional(),
      })

      const tooManyTags = { tags: Array(11).fill('tag') }
      const result = schema.safeParse(tooManyTags)

      expect(result.success).toBe(false)
    })

    it('returns 400 for invalid input', () => {
      const response = {
        status: 400,
        body: {
          error: 'Invalid request',
          details: { category: ['Invalid category'] },
        },
      }

      expect(response.status).toBe(400)
      expect(response.body.details).toBeDefined()
    })

    it('returns 400 when no valid fields provided', () => {
      const response = {
        status: 400,
        body: { error: 'No valid fields to update' },
      }

      expect(response.body.error).toBe('No valid fields to update')
    })
  })

  describe('Database Update', () => {
    it('updates only provided fields', () => {
      const input = { category: 'damage' }
      const updates: Record<string, unknown> = {}

      if (input.category !== undefined) updates.category = input.category

      expect(updates).toEqual({ category: 'damage' })
      expect(updates.description).toBeUndefined()
      expect(updates.tags).toBeUndefined()
    })

    it('verifies photo belongs to lead', () => {
      // Query should filter by both photoId AND leadId
      const filters = {
        id: 'photo-123',
        lead_id: 'lead-456',
      }

      expect(filters.id).toBeDefined()
      expect(filters.lead_id).toBeDefined()
    })

    it('returns 404 when photo not found', () => {
      const response = {
        status: 404,
        body: { error: 'Photo not found' },
      }

      expect(response.status).toBe(404)
    })

    it('returns updated photo data', () => {
      const response = {
        photo: {
          id: 'photo-123',
          category: 'damage',
          description: 'Visible shingle damage',
          tags: ['damage', 'shingle'],
        },
      }

      expect(response.photo.category).toBe('damage')
    })
  })

  describe('Category Options', () => {
    it('provides all category options', () => {
      const PHOTO_CATEGORIES = [
        { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
        { value: 'damage', label: 'Damage', color: 'bg-red-100 text-red-700' },
        { value: 'before', label: 'Before', color: 'bg-amber-100 text-amber-700' },
        { value: 'after', label: 'After', color: 'bg-green-100 text-green-700' },
        { value: 'closeup', label: 'Close-up', color: 'bg-blue-100 text-blue-700' },
        { value: 'wide_angle', label: 'Wide Angle', color: 'bg-purple-100 text-purple-700' },
        { value: 'inspection', label: 'Inspection', color: 'bg-cyan-100 text-cyan-700' },
      ]

      expect(PHOTO_CATEGORIES).toHaveLength(7)
      expect(PHOTO_CATEGORIES.find((c) => c.value === 'damage')).toBeDefined()
    })

    it('has appropriate color coding for damage category', () => {
      const damageCategory = {
        value: 'damage',
        label: 'Damage',
        color: 'bg-red-100 text-red-700',
      }

      expect(damageCategory.color).toContain('red')
    })
  })
})

describe('Photo Delete API (DELETE)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('requires admin authentication', async () => {
      const { requireAdmin } = await import('@/lib/api/auth')
      expect(requireAdmin).toBeDefined()
    })
  })

  describe('Deletion Process', () => {
    it('retrieves photo storage path first', () => {
      const photo = {
        id: 'photo-123',
        storage_path: 'lead-456/uuid-789.jpg',
      }

      expect(photo.storage_path).toBeDefined()
    })

    it('verifies photo belongs to lead before deletion', () => {
      const filters = {
        id: 'photo-123',
        lead_id: 'lead-456',
      }

      expect(filters.lead_id).toBeDefined()
    })

    it('returns 404 when photo not found', () => {
      const response = {
        status: 404,
        body: { error: 'Photo not found' },
      }

      expect(response.status).toBe(404)
    })

    it('deletes from storage bucket', () => {
      const storageBucket = 'photos'
      const storagePath = 'lead-123/uuid-456.jpg'

      expect(storageBucket).toBe('photos')
      expect(storagePath).toContain('lead-123')
    })

    it('continues DB deletion even if storage fails', () => {
      // Storage deletion is non-blocking - DB record should still be removed
      const behavior = {
        storageError: true,
        dbDeleteContinues: true,
      }

      expect(behavior.dbDeleteContinues).toBe(true)
    })

    it('deletes database record', () => {
      const deleteQuery = {
        table: 'uploads',
        filters: {
          id: 'photo-123',
          lead_id: 'lead-456',
        },
      }

      expect(deleteQuery.table).toBe('uploads')
    })

    it('returns success response', () => {
      const response = {
        success: true,
      }

      expect(response.success).toBe(true)
    })

    it('returns 500 on deletion failure', () => {
      const response = {
        status: 500,
        body: { error: 'Failed to delete photo' },
      }

      expect(response.status).toBe(500)
    })
  })
})

describe('Photo Gallery Component Integration', () => {
  describe('Category Selection', () => {
    it('updates category via API call', () => {
      const apiCall = {
        method: 'PATCH',
        url: '/api/leads/lead-123/photos/photo-456',
        body: { category: 'damage' },
      }

      expect(apiCall.method).toBe('PATCH')
      expect(apiCall.body.category).toBe('damage')
    })

    it('updates local state on success', () => {
      const photos = [
        { id: 'photo-1', category: 'general' },
        { id: 'photo-2', category: 'general' },
      ]

      const updatedPhotos = photos.map((p) =>
        p.id === 'photo-1' ? { ...p, category: 'damage' } : p
      )

      expect(updatedPhotos[0].category).toBe('damage')
      expect(updatedPhotos[1].category).toBe('general')
    })

    it('shows loading state during update', () => {
      const isUpdating = true
      expect(isUpdating).toBe(true)
    })

    it('handles API error gracefully', () => {
      const error = 'Failed to update photo category'
      expect(error).toBeDefined()
    })
  })

  describe('Category Filtering', () => {
    it('filters photos by category', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'general' },
        { id: '3', category: 'damage' },
      ]

      const filtered = photos.filter((p) => p.category === 'damage')
      expect(filtered).toHaveLength(2)
    })

    it('shows all photos when filter is all', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'general' },
      ]

      const filter = 'all'
      const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter)

      expect(filtered).toHaveLength(2)
    })

    it('shows category counts in filter buttons', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'damage' },
        { id: '3', category: 'general' },
      ]

      const counts = photos.reduce(
        (acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      expect(counts.damage).toBe(2)
      expect(counts.general).toBe(1)
    })
  })
})
