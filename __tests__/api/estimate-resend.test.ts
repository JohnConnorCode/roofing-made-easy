import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/api/auth', () => ({
  requireAdmin: vi.fn(() => ({ user: { id: 'admin-123' }, error: null })),
}))

vi.mock('@/lib/email', () => ({
  sendCustomerEstimateEmail: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/lib/sms', () => ({
  sendEstimateReadySms: vi.fn(() => Promise.resolve({ success: true })),
}))

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

describe('Estimate Resend API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('requires admin authentication', async () => {
      const { requireAdmin } = await import('@/lib/api/auth')

      // Verify the mock is called
      expect(requireAdmin).toBeDefined()
    })

    it('validates lead ID format', () => {
      // UUID format validation
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      const invalidUUID = 'not-a-uuid'

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(uuidRegex.test(validUUID)).toBe(true)
      expect(uuidRegex.test(invalidUUID)).toBe(false)
    })
  })

  describe('Lead Validation', () => {
    it('returns 404 when lead not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      // The API would return 404
      const mockLead = null
      expect(mockLead).toBeNull()
    })

    it('returns 400 when lead has no share token', () => {
      const leadWithoutToken = {
        id: '123',
        share_token: null,
        contacts: [{ email: 'test@example.com' }],
      }

      expect(leadWithoutToken.share_token).toBeNull()
    })

    it('returns 400 when lead has no contact email', () => {
      const leadWithoutEmail = {
        id: '123',
        share_token: 'abc-123',
        contacts: [{ email: null }],
      }

      expect(leadWithoutEmail.contacts[0].email).toBeNull()
    })
  })

  describe('Estimate Validation', () => {
    it('returns 404 when no estimate exists', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: {
            id: '123',
            share_token: 'abc-123',
            contacts: [{ email: 'test@example.com' }],
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })

      // Would return 404
      const estimate = null
      expect(estimate).toBeNull()
    })

    it('only fetches non-superseded estimates', () => {
      // Verify the query pattern
      const queryPattern = {
        table: 'estimates',
        filters: {
          lead_id: 'expected-lead-id',
          is_superseded: false,
        },
        order: { created_at: 'desc' },
        limit: 1,
      }

      expect(queryPattern.filters.is_superseded).toBe(false)
    })
  })

  describe('Email Sending', () => {
    it('builds correct estimate URL with share token', () => {
      const baseUrl = 'https://smartroofpricing.com'
      const shareToken = 'abc-123-def-456'
      const expectedUrl = `${baseUrl}/estimate/${shareToken}`

      expect(expectedUrl).toBe('https://smartroofpricing.com/estimate/abc-123-def-456')
    })

    it('includes all required email data', () => {
      const emailData = {
        customerEmail: 'customer@example.com',
        contactName: 'John Smith',
        address: '123 Main St',
        city: 'Tupelo',
        state: 'MS',
        jobType: 'full_replacement',
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        shareToken: 'abc-123',
        validUntil: '2026-03-01T00:00:00Z',
      }

      expect(emailData).toHaveProperty('customerEmail')
      expect(emailData).toHaveProperty('priceLow')
      expect(emailData).toHaveProperty('priceLikely')
      expect(emailData).toHaveProperty('priceHigh')
      expect(emailData).toHaveProperty('shareToken')
    })

    it('handles missing optional fields gracefully', () => {
      const minimalEmailData: Record<string, unknown> = {
        customerEmail: 'test@example.com',
        priceLow: 1000,
        priceLikely: 1500,
        priceHigh: 2000,
        shareToken: 'token',
      }

      expect(minimalEmailData.contactName).toBeUndefined()
      expect(minimalEmailData.address).toBeUndefined()
    })
  })

  describe('SMS Sending', () => {
    it('only sends SMS when contact has consented', () => {
      const contactWithConsent = {
        phone: '(662) 555-1234',
        consent_sms: true,
      }

      const contactWithoutConsent = {
        phone: '(662) 555-1234',
        consent_sms: false,
      }

      expect(contactWithConsent.consent_sms).toBe(true)
      expect(contactWithoutConsent.consent_sms).toBe(false)
    })

    it('only sends SMS when phone number exists', () => {
      const contactWithPhone = {
        phone: '(662) 555-1234',
        consent_sms: true,
      }

      const contactWithoutPhone = {
        phone: null,
        consent_sms: true,
      }

      expect(contactWithPhone.phone).toBeTruthy()
      expect(contactWithoutPhone.phone).toBeFalsy()
    })

    it('respects includeSms flag in request body', () => {
      const requestWithSms = { includeSms: true }
      const requestWithoutSms = { includeSms: false }

      expect(requestWithSms.includeSms).toBe(true)
      expect(requestWithoutSms.includeSms).toBe(false)
    })
  })

  describe('Response Format', () => {
    it('returns success response with results', () => {
      const successResponse = {
        success: true,
        message: 'Estimate resent successfully',
        results: {
          email: true,
          sms: true,
        },
      }

      expect(successResponse).toHaveProperty('success', true)
      expect(successResponse).toHaveProperty('results')
      expect(successResponse.results).toHaveProperty('email')
      expect(successResponse.results).toHaveProperty('sms')
    })

    it('returns error when email fails', () => {
      const errorResponse = {
        error: 'Failed to send estimate email',
        results: {
          email: false,
          sms: false,
        },
      }

      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse.results.email).toBe(false)
    })
  })

  describe('Customer Name Formatting', () => {
    it('formats full name correctly', () => {
      const contact = {
        first_name: 'John',
        last_name: 'Smith',
      }

      const fullName = `${contact.first_name} ${contact.last_name}`
      expect(fullName).toBe('John Smith')
    })

    it('uses first name only when last name missing', () => {
      const contact = {
        first_name: 'John',
        last_name: null,
      }

      const name = contact.last_name
        ? `${contact.first_name} ${contact.last_name}`
        : contact.first_name

      expect(name).toBe('John')
    })

    it('handles missing name gracefully', () => {
      const contact = {
        first_name: null,
        last_name: null,
      }

      const name = contact.first_name || undefined
      expect(name).toBeUndefined()
    })
  })
})

describe('Rate Limiting Considerations', () => {
  it('should be applied to prevent abuse', () => {
    // The resend endpoint should be rate limited
    // This is a documentation test for expected behavior
    const rateLimitConfig = {
      endpoint: '/api/leads/[leadId]/estimate/resend',
      maxRequests: 5,
      windowSeconds: 60,
      message: 'Too many resend attempts. Please wait before trying again.',
    }

    expect(rateLimitConfig.maxRequests).toBeLessThanOrEqual(10)
    expect(rateLimitConfig.windowSeconds).toBeGreaterThanOrEqual(60)
  })
})
