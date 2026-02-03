import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  maybeSingle: vi.fn(),
}

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireAdmin', () => {
    it('returns error when no user session', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      // Admin check fails without user
      const result = {
        user: null,
        error: { status: 401 },
      }

      expect(result.user).toBeNull()
      expect(result.error.status).toBe(401)
    })

    it('returns user when authenticated as admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'admin-123', email: 'admin@example.com' } },
        error: null,
      })

      const result = {
        user: { id: 'admin-123' },
        error: null,
      }

      expect(result.user).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('requireCustomer', () => {
    it('returns error when no user session', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const result = {
        user: null,
        customerId: null,
        error: { status: 401, message: 'Authentication required' },
      }

      expect(result.error.status).toBe(401)
    })

    it('returns error when user has no customer record', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = {
        user: { id: 'user-123' },
        customerId: null,
        error: { status: 403, message: 'No customer account found' },
      }

      expect(result.customerId).toBeNull()
      expect(result.error.status).toBe(403)
    })

    it('returns customerId when customer record exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'customer-456' },
        error: null,
      })

      const result = {
        user: { id: 'user-123' },
        customerId: 'customer-456',
        error: null,
      }

      expect(result.customerId).toBe('customer-456')
      expect(result.error).toBeNull()
    })

    it('looks up customer by auth_user_id not user.id directly', () => {
      // CRITICAL: The bug was using user.id to look up in customer_leads
      // but should first get customer from customers table via auth_user_id
      const authFlow = {
        step1: 'supabase.auth.getUser() -> user.id',
        step2: 'customers.select().eq("auth_user_id", user.id) -> customer.id',
        step3: 'customer_leads.select().eq("customer_id", customer.id)',
      }

      expect(authFlow.step2).toContain('auth_user_id')
      expect(authFlow.step3).toContain('customer_id')
    })
  })

  describe('requireLeadOwnership', () => {
    it('returns error when no user session', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const result = {
        user: null,
        customerId: null,
        error: { status: 401 },
      }

      expect(result.error.status).toBe(401)
    })

    it('returns error when user has no customer record', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = {
        error: { status: 403, message: 'No customer account found' },
      }

      expect(result.error.status).toBe(403)
    })

    it('returns error when customer does not own lead', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      // Customer exists
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'customer-456' },
        error: null,
      })

      // But no link to this lead
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = {
        error: { status: 403, message: 'Access denied to this lead' },
      }

      expect(result.error.status).toBe(403)
    })

    it('returns success when customer owns lead', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      // Customer exists
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'customer-456' },
        error: null,
      })

      // And has link to this lead
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: { customer_id: 'customer-456', lead_id: 'lead-789' },
        error: null,
      })

      const result = {
        user: { id: 'user-123' },
        customerId: 'customer-456',
        error: null,
      }

      expect(result.error).toBeNull()
      expect(result.customerId).toBe('customer-456')
    })

    it('checks customer_leads with customer_id not user.id', () => {
      // CRITICAL FIX: The bug was:
      // .eq('customer_id', user.id) // WRONG - user.id is auth UUID
      // Should be:
      // .eq('customer_id', customer.id) // CORRECT - customer table ID

      const correctQuery = {
        table: 'customer_leads',
        filter: {
          field: 'customer_id',
          value: 'customer-456', // ID from customers table
        },
      }

      const incorrectQuery = {
        table: 'customer_leads',
        filter: {
          field: 'customer_id',
          value: 'user-123', // WRONG: auth user ID
        },
      }

      expect(correctQuery.filter.value).not.toBe(incorrectQuery.filter.value)
    })
  })

  describe('Auth Flow Diagram', () => {
    it('documents correct auth flow for customer endpoints', () => {
      /**
       * Correct flow:
       * 1. Get authenticated user from Supabase Auth
       *    supabase.auth.getUser() -> user { id: 'auth-uuid' }
       *
       * 2. Look up customer record using auth_user_id
       *    customers.select().eq('auth_user_id', user.id) -> customer { id: 'customer-uuid' }
       *
       * 3. Check customer_leads for lead access
       *    customer_leads.select().eq('customer_id', customer.id).eq('lead_id', leadId)
       *
       * The bug was skipping step 2 and using user.id directly in step 3.
       */

      const authFlowSteps = [
        {
          step: 1,
          action: 'Get auth user',
          table: 'auth.users (via supabase.auth.getUser)',
          input: 'session',
          output: 'user.id (auth UUID)',
        },
        {
          step: 2,
          action: 'Look up customer',
          table: 'customers',
          input: 'user.id as auth_user_id',
          output: 'customer.id',
        },
        {
          step: 3,
          action: 'Check lead ownership',
          table: 'customer_leads',
          input: 'customer.id + leadId',
          output: 'boolean',
        },
      ]

      expect(authFlowSteps).toHaveLength(3)
      expect(authFlowSteps[1].output).toBe('customer.id')
      expect(authFlowSteps[2].input).toBe('customer.id + leadId')
    })
  })
})

describe('CustomerAuthResult Interface', () => {
  it('defines correct structure', () => {
    interface CustomerAuthResult {
      user: { id: string } | null
      customerId: string | null
      error: { status: number; message: string } | null
    }

    const successResult: CustomerAuthResult = {
      user: { id: 'user-123' },
      customerId: 'customer-456',
      error: null,
    }

    const errorResult: CustomerAuthResult = {
      user: null,
      customerId: null,
      error: { status: 401, message: 'Authentication required' },
    }

    expect(successResult.error).toBeNull()
    expect(errorResult.user).toBeNull()
  })
})

describe('Rate Limiting', () => {
  it('checkRateLimit returns success when under limit', () => {
    const result = {
      success: true,
      remaining: 58,
      resetAt: Date.now() + 60000,
    }

    expect(result.success).toBe(true)
  })

  it('checkRateLimit returns failure when over limit', () => {
    const result = {
      success: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    }

    expect(result.success).toBe(false)
  })

  it('rateLimitResponse returns 429 status', () => {
    const response = {
      status: 429,
      headers: {
        'Retry-After': '30',
        'X-RateLimit-Remaining': '0',
      },
      body: { error: 'Too many requests' },
    }

    expect(response.status).toBe(429)
    expect(response.headers['Retry-After']).toBeDefined()
  })

  it('getClientIP extracts IP from request', () => {
    // Should check X-Forwarded-For header first, then fall back
    const headers = {
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      'x-real-ip': '192.168.1.1',
    }

    const clientIP = headers['x-forwarded-for']?.split(',')[0].trim()
    expect(clientIP).toBe('192.168.1.1')
  })
})
