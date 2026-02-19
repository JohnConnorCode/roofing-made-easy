import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Track mock state
let mockSupabaseClient: ReturnType<typeof createMockSupabase>

function createMockSupabase(overrides?: {
  leadInsertError?: boolean
  relatedInsertErrors?: boolean
}) {
  const leadId = 'test-lead-id-123'

  const mockSingle = vi.fn().mockResolvedValue({
    data: overrides?.leadInsertError ? null : { id: leadId, status: 'new' },
    error: overrides?.leadInsertError ? { message: 'insert failed' } : null,
  })

  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
  const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

  const relatedInsertResult = overrides?.relatedInsertErrors
    ? Promise.reject(new Error('related insert failed'))
    : Promise.resolve({ data: {}, error: null })

  return {
    from: vi.fn((table: string) => {
      if (table === 'leads') {
        return {
          insert: vi.fn().mockReturnValue({ select: mockSelect }),
          delete: vi.fn().mockReturnValue({ eq: mockEq }),
        }
      }
      // contacts, properties, intakes
      return {
        insert: vi.fn().mockReturnValue(relatedInsertResult),
      }
    }),
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(async () => mockSupabaseClient),
}))

vi.mock('@/lib/communication/workflow-engine', () => ({
  triggerWorkflows: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/notifications', () => ({
  notifyAdmins: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/email/notifications', () => ({
  notifyNewLead: vi.fn(() => Promise.resolve()),
}))

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `192.168.1.${Math.floor(Math.random() * 255)}`,
    },
    body: JSON.stringify(body),
  })
}

function makeRequestFromIP(body: Record<string, unknown>, ip: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient = createMockSupabase()
  })

  it('creates a lead with minimal body', async () => {
    const { POST } = await import('../route')
    const response = await POST(makeRequest({ source: 'web_funnel' }))
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.lead).toBeDefined()
    expect(data.lead.id).toBe('test-lead-id-123')
  })

  it('creates a lead with empty referrerUrl (the bug that was breaking production)', async () => {
    const { POST } = await import('../route')
    const response = await POST(makeRequest({ source: 'web_funnel', referrerUrl: '' }))
    expect(response.status).toBe(201)
  })

  it('creates a lead with undefined referrerUrl', async () => {
    const { POST } = await import('../route')
    const response = await POST(makeRequest({ source: 'web_funnel' }))
    expect(response.status).toBe(201)
  })

  it('creates a lead with valid referrerUrl', async () => {
    const { POST } = await import('../route')
    const response = await POST(
      makeRequest({
        source: 'web_funnel',
        referrerUrl: 'https://google.com/search?q=roofing',
      })
    )
    expect(response.status).toBe(201)
  })

  it('creates a lead with all UTM params', async () => {
    const { POST } = await import('../route')
    const response = await POST(
      makeRequest({
        source: 'google_ads',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'spring_2025',
        referrerUrl: 'https://ads.google.com',
      })
    )
    expect(response.status).toBe(201)
  })

  it('rejects invalid referrerUrl (not a URL)', async () => {
    const { POST } = await import('../route')
    const response = await POST(
      makeRequest({ source: 'web_funnel', referrerUrl: 'not-a-url' })
    )
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Invalid request')
  })

  it('returns 500 when lead insert fails', async () => {
    mockSupabaseClient = createMockSupabase({ leadInsertError: true })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ source: 'web_funnel' }))
    expect(response.status).toBe(500)
  })

  it('returns 500 when ALL related record inserts fail', async () => {
    mockSupabaseClient = createMockSupabase({ relatedInsertErrors: true })

    const { POST } = await import('../route')
    const response = await POST(makeRequest({ source: 'web_funnel' }))
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe('Failed to initialize lead')
  })

  it('rate limits after too many requests from the same IP', async () => {
    const { POST } = await import('../route')
    const testIP = '10.0.0.99'

    // Send 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      const response = await POST(makeRequestFromIP({ source: 'web_funnel' }, testIP))
      expect(response.status).toBe(201)
    }

    // 6th request should be rate limited
    const response = await POST(makeRequestFromIP({ source: 'web_funnel' }, testIP))
    expect(response.status).toBe(429)
  })
})
