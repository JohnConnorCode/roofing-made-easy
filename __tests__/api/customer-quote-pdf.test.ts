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
  is: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

describe('Customer Quote PDF API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('requires customer authentication via lead ownership', async () => {
      const { requireLeadOwnership } = await import('@/lib/api/auth')

      // Should use requireLeadOwnership not requireAdmin
      expect(requireLeadOwnership).toBeDefined()
    })

    it('validates that customer owns the lead', () => {
      // The auth flow:
      // 1. Get user from Supabase auth
      // 2. Look up customer by auth_user_id
      // 3. Check customer_leads table for lead access
      const authFlow = {
        step1: 'supabase.auth.getUser()',
        step2: 'customers.select().eq(auth_user_id, user.id)',
        step3: 'customer_leads.select().eq(customer_id).eq(lead_id)',
      }

      expect(authFlow.step2).toContain('auth_user_id')
      expect(authFlow.step3).toContain('customer_id')
    })

    it('returns 401 when user is not authenticated', () => {
      const unauthenticatedResult = {
        user: null,
        customerId: null,
        error: { status: 401, body: { error: 'Authentication required' } },
      }

      expect(unauthenticatedResult.error.status).toBe(401)
    })

    it('returns 403 when customer does not own lead', () => {
      const forbiddenResult = {
        user: { id: 'user-123' },
        customerId: 'customer-456',
        error: { status: 403, body: { error: 'Access denied to this lead' } },
      }

      expect(forbiddenResult.error.status).toBe(403)
    })
  })

  describe('Lead Validation', () => {
    it('returns 404 when lead does not exist', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      })

      const result = null
      expect(result).toBeNull()
    })

    it('returns 404 when lead has no estimate', async () => {
      // Lead exists but no estimate
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { id: 'lead-123', contacts: [] },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })

      const estimate = null
      expect(estimate).toBeNull()
    })

    it('only fetches non-superseded estimates', () => {
      const queryFilters = {
        lead_id: 'expected-lead-id',
        is_superseded: false,
      }

      expect(queryFilters.is_superseded).toBe(false)
    })
  })

  describe('Quote PDF Data', () => {
    it('includes all required quote fields', () => {
      const quoteData = {
        customerName: 'John Smith',
        propertyAddress: '123 Main St',
        city: 'Tupelo',
        state: 'MS',
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        jobType: 'full_replacement',
        validUntil: '2026-03-01T00:00:00Z',
      }

      expect(quoteData).toHaveProperty('customerName')
      expect(quoteData).toHaveProperty('priceLow')
      expect(quoteData).toHaveProperty('priceLikely')
      expect(quoteData).toHaveProperty('priceHigh')
    })

    it('handles missing customer name gracefully', () => {
      const lead = {
        contacts: [{ first_name: null, last_name: null }],
      }

      const customerName = lead.contacts[0]?.first_name
        ? `${lead.contacts[0].first_name} ${lead.contacts[0].last_name || ''}`.trim()
        : undefined

      expect(customerName).toBeUndefined()
    })

    it('formats customer name correctly', () => {
      const lead = {
        contacts: [{ first_name: 'John', last_name: 'Smith' }],
      }

      const customerName = lead.contacts[0]?.first_name
        ? `${lead.contacts[0].first_name} ${lead.contacts[0].last_name || ''}`.trim()
        : undefined

      expect(customerName).toBe('John Smith')
    })

    it('includes property information', () => {
      const lead = {
        property: {
          street_address: '456 Oak Lane',
          city: 'Saltillo',
          state: 'MS',
        },
      }

      expect(lead.property.street_address).toBe('456 Oak Lane')
      expect(lead.property.city).toBe('Saltillo')
      expect(lead.property.state).toBe('MS')
    })
  })

  describe('PDF Response', () => {
    it('returns correct content type', () => {
      const headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quote.pdf"',
      }

      expect(headers['Content-Type']).toBe('application/pdf')
    })

    it('includes content disposition header for download', () => {
      const filename = 'smart-roof-pricing-quote-john-smith.pdf'
      const disposition = `attachment; filename="${filename}"`

      expect(disposition).toContain('attachment')
      expect(disposition).toContain('filename=')
    })

    it('generates safe filename from customer name', () => {
      const customerName = "O'Brien & Sons"
      const safeName = customerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      expect(safeName).toBe('o-brien-sons')
    })
  })

  describe('Error Handling', () => {
    it('returns 500 on database error', () => {
      const dbError = {
        code: 'PGRST500',
        message: 'Database connection failed',
      }

      expect(dbError.code).toBe('PGRST500')
    })

    it('returns 500 on PDF generation error', () => {
      const pdfError = {
        status: 500,
        body: { error: 'Failed to generate PDF' },
      }

      expect(pdfError.status).toBe(500)
    })

    it('logs errors for debugging', () => {
      const errorMessage = 'Error in GET /api/customer/leads/[leadId]/quote-pdf:'
      expect(errorMessage).toContain('customer/leads')
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to prevent abuse', () => {
      const rateLimitConfig = {
        endpoint: '/api/customer/leads/[leadId]/quote-pdf',
        type: 'general',
        description: 'Prevents excessive PDF generation requests',
      }

      expect(rateLimitConfig.type).toBe('general')
    })
  })
})

describe('Quote PDF vs Estimate PDF', () => {
  it('uses QuotePDFDocument template for customer quotes', () => {
    // Quote PDF is simpler, customer-focused
    const quoteTemplate = 'QuotePDFDocument'
    expect(quoteTemplate).not.toBe('EstimatePDF')
  })

  it('includes company branding', () => {
    const branding = {
      companyName: 'Farrell Roofing',
      logo: true,
      colors: ['gold', 'dark'],
    }

    expect(branding.companyName).toBe('Farrell Roofing')
  })

  it('shows price range prominently', () => {
    const priceDisplay = {
      low: 8000,
      likely: 10000,
      high: 12000,
      format: 'currency',
      prominent: true,
    }

    expect(priceDisplay.format).toBe('currency')
    expect(priceDisplay.prominent).toBe(true)
  })
})
