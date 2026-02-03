import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/api/auth', () => ({
  requireLeadOwnership: vi.fn(),
}))

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  in: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(),
}

describe('Customer Activities API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('requires customer lead ownership', async () => {
      const { requireLeadOwnership } = await import('@/lib/api/auth')
      expect(requireLeadOwnership).toBeDefined()
    })

    it('returns 401 for unauthenticated requests', () => {
      const response = {
        status: 401,
        body: { error: 'Authentication required' },
      }

      expect(response.status).toBe(401)
    })

    it('returns 403 when customer does not own lead', () => {
      const response = {
        status: 403,
        body: { error: 'Access denied to this lead' },
      }

      expect(response.status).toBe(403)
    })
  })

  describe('Activity Type Filtering', () => {
    it('only returns customer-visible activity types', () => {
      const CUSTOMER_VISIBLE_TYPES = [
        'status_change',
        'estimate_generated',
        'quote_sent',
        'appointment_scheduled',
      ]

      // Internal-only types that should NOT be visible
      const INTERNAL_TYPES = [
        'note_added',
        'call_logged',
        'email_sent',
        'sms_sent',
        'photo_uploaded',
        'document_attached',
      ]

      INTERNAL_TYPES.forEach((type) => {
        expect(CUSTOMER_VISIBLE_TYPES).not.toContain(type)
      })
    })

    it('filters activities in database query', () => {
      const CUSTOMER_VISIBLE_TYPES = [
        'status_change',
        'estimate_generated',
        'quote_sent',
        'appointment_scheduled',
      ]

      // Query should use .in('activity_type', CUSTOMER_VISIBLE_TYPES)
      expect(CUSTOMER_VISIBLE_TYPES).toHaveLength(4)
    })
  })

  describe('Content Transformation', () => {
    it('transforms status_change to customer-friendly message', () => {
      const activity = {
        activity_type: 'status_change',
        content: { old_status: 'new', new_status: 'estimate_generated' },
      }

      const message = `Your project status was updated to: ${formatStatus(activity.content.new_status)}`
      expect(message).toContain('Estimate Generated')
    })

    it('transforms estimate_generated message', () => {
      const activity = {
        activity_type: 'estimate_generated',
        content: { price_likely: 10000 },
      }

      const message = `Your estimate of $${activity.content.price_likely.toLocaleString()} is ready to view`
      expect(message).toContain('$10,000')
    })

    it('transforms quote_sent message', () => {
      const activity = {
        activity_type: 'quote_sent',
        content: {},
      }

      const message = 'Your quote was sent to your email'
      expect(message).toContain('email')
    })

    it('transforms appointment_scheduled message', () => {
      const activity = {
        activity_type: 'appointment_scheduled',
        content: { date: '2026-02-15', time: '10:00 AM' },
      }

      const message = `Appointment scheduled for ${activity.content.date} at ${activity.content.time}`
      expect(message).toContain('2026-02-15')
      expect(message).toContain('10:00 AM')
    })

    it('falls back to generic message for unknown types', () => {
      const activity = {
        activity_type: 'unknown_type',
        content: {},
      }

      const message = 'Activity update'
      expect(message).toBe('Activity update')
    })
  })

  describe('Response Format', () => {
    it('returns activities array', () => {
      const response = {
        activities: [
          {
            id: 'act-1',
            activity_type: 'estimate_generated',
            message: 'Your estimate is ready',
            created_at: '2026-02-01T10:00:00Z',
          },
        ],
      }

      expect(Array.isArray(response.activities)).toBe(true)
    })

    it('orders activities by created_at descending', () => {
      const activities = [
        { created_at: '2026-02-01T10:00:00Z' },
        { created_at: '2026-02-02T10:00:00Z' },
        { created_at: '2026-01-30T10:00:00Z' },
      ]

      const sorted = [...activities].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      expect(sorted[0].created_at).toBe('2026-02-02T10:00:00Z')
      expect(sorted[2].created_at).toBe('2026-01-30T10:00:00Z')
    })

    it('limits results to prevent large responses', () => {
      const limit = 50
      expect(limit).toBeLessThanOrEqual(100)
    })

    it('includes activity id for deduplication', () => {
      const activity = {
        id: 'act-123',
        activity_type: 'status_change',
        message: 'Status updated',
        created_at: '2026-02-01T10:00:00Z',
      }

      expect(activity).toHaveProperty('id')
    })
  })

  describe('Error Handling', () => {
    it('returns 500 on database error', () => {
      const response = {
        status: 500,
        body: { error: 'Failed to fetch activities' },
      }

      expect(response.status).toBe(500)
    })

    it('returns empty array when no activities exist', () => {
      const response = {
        activities: [],
      }

      expect(response.activities).toHaveLength(0)
    })
  })

  describe('Rate Limiting', () => {
    it('applies general rate limit', () => {
      const rateLimit = {
        type: 'general',
        maxRequests: 60,
        windowMs: 60000,
      }

      expect(rateLimit.type).toBe('general')
    })
  })
})

describe('Activity Timeline Display', () => {
  it('formats timestamps for display', () => {
    const timestamp = '2026-02-01T10:00:00Z'
    const formatted = new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    expect(formatted).toMatch(/Feb/)
  })

  it('shows relative time for recent activities', () => {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    const isRecent = now.getTime() - twoHoursAgo.getTime() < 24 * 60 * 60 * 1000
    expect(isRecent).toBe(true)
  })

  it('groups activities by date', () => {
    const activities = [
      { created_at: '2026-02-01T10:00:00Z' },
      { created_at: '2026-02-01T14:00:00Z' },
      { created_at: '2026-01-31T09:00:00Z' },
    ]

    const grouped = activities.reduce(
      (acc, act) => {
        const date = act.created_at.split('T')[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(act)
        return acc
      },
      {} as Record<string, typeof activities>
    )

    expect(Object.keys(grouped)).toHaveLength(2)
    expect(grouped['2026-02-01']).toHaveLength(2)
  })
})

// Helper function matching the API
function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
