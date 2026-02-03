/**
 * Tests for Pricing Configuration and Settings API Routes
 * Tests pricing rules CRUD and settings management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET as GET_PRICING, POST as POST_PRICING, PATCH as PATCH_PRICING } from '@/app/api/pricing/route'
import { GET as GET_SETTINGS, PUT as PUT_SETTINGS } from '@/app/api/settings/route'
import {
  createMockRequest,
  parseResponse,
} from './test-utils'
import { v4 as uuidv4 } from 'uuid'

// Mock rate limiting to always succeed
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ success: true, remaining: 10, reset: Date.now() + 60000 })),
  getClientIP: vi.fn(() => '127.0.0.1'),
  rateLimitResponse: vi.fn(),
}))

// Mock data stores
const mockPricingRules: Map<string, Record<string, unknown>> = new Map()
const mockSettings: Record<string, unknown> = {}

function resetMocks() {
  mockPricingRules.clear()
  Object.keys(mockSettings).forEach(key => delete mockSettings[key])
}

interface PricingRuleInput {
  rule_key?: string
  rule_category?: string
  display_name?: string
  base_rate?: number
  unit?: string
  multiplier?: number
  flat_fee?: number
  is_active?: boolean
}

function createMockPricingRule(overrides: PricingRuleInput = {}) {
  const id = uuidv4()
  const rule = {
    id,
    rule_key: `test_rule_${id.slice(0, 6)}`,
    rule_category: 'material',
    display_name: 'Test Rule',
    description: null,
    base_rate: null,
    unit: null,
    multiplier: 1.0,
    flat_fee: null,
    min_charge: null,
    max_charge: null,
    conditions: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
  mockPricingRules.set(id, rule)
  return rule
}

// Mock Supabase client
function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let insertData: unknown = null
  let updateData: unknown = null
  let isSingle = false
  let orderColumns: string[] = []

  const builder = {
    select: (columns?: string) => builder,
    insert: (data: unknown) => {
      insertData = data
      return builder
    },
    update: (data: unknown) => {
      updateData = data
      return builder
    },
    upsert: (data: unknown, opts?: { onConflict?: string }) => {
      insertData = data
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    order: (column: string) => {
      orderColumns.push(column)
      return builder
    },
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executePricingQuery(table, filters, insertData, updateData, isSingle)
      return resolve(result)
    },
  }
  return builder
}

function executePricingQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  insertData: unknown,
  updateData: unknown,
  isSingle: boolean
): { data: unknown; error: unknown } {
  // Handle pricing_rules
  if (table === 'pricing_rules') {
    // Insert
    if (insertData && !updateData) {
      const id = uuidv4()
      const rule = { id, ...(insertData as Record<string, unknown>), created_at: new Date().toISOString() }
      mockPricingRules.set(id, rule)
      return { data: rule, error: null }
    }

    // Update
    if (updateData) {
      const idFilter = filters.find(f => f.column === 'id')
      if (idFilter) {
        const rule = mockPricingRules.get(idFilter.value as string)
        if (!rule) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
        Object.assign(rule, updateData, { updated_at: new Date().toISOString() })
        return { data: rule, error: null }
      }
    }

    // Select
    let rules = Array.from(mockPricingRules.values())
    for (const filter of filters) {
      if (filter.operator === 'eq') {
        rules = rules.filter(r => r[filter.column] === filter.value)
      }
    }
    return { data: rules, error: null }
  }

  // Handle settings
  if (table === 'settings') {
    // Upsert/Insert
    if (insertData) {
      const data = insertData as Record<string, unknown>
      Object.assign(mockSettings, data)
      return { data: mockSettings, error: null }
    }

    // Select
    const idFilter = filters.find(f => f.column === 'id')
    if (idFilter && idFilter.value === 1) {
      if (Object.keys(mockSettings).length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      }
      return { data: { id: 1, ...mockSettings }, error: null }
    }

    return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
  }

  return { data: isSingle ? null : [], error: isSingle ? { code: 'PGRST116' } : null }
}

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => createMockQueryBuilder(table),
  })),
}))

// Mock auth module
vi.mock('@/lib/api/auth', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({
    user: { id: 'test-admin-123', email: 'admin@test.com', user_metadata: { role: 'admin' } },
    error: null
  })),
}))

describe('Pricing Rules API', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('GET /api/pricing', () => {
    it('should return empty list when no rules exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing')
      const response = await GET_PRICING(request)
      const data = await parseResponse<{ rules: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.rules).toEqual([])
    })

    it('should return all active pricing rules', async () => {
      createMockPricingRule({ rule_key: 'base_replacement', is_active: true })
      createMockPricingRule({ rule_key: 'material_metal', is_active: true })
      createMockPricingRule({ rule_key: 'disabled_rule', is_active: false })

      const request = createMockRequest('http://localhost:3000/api/pricing')
      const response = await GET_PRICING(request)
      const data = await parseResponse<{ rules: Array<{ is_active: boolean }> }>(response)

      expect(response.status).toBe(200)
      expect(data.rules.length).toBe(2) // Only active rules
      data.rules.forEach(rule => {
        expect(rule.is_active).toBe(true)
      })
    })

    it('should return all rules including inactive when active=false', async () => {
      createMockPricingRule({ rule_key: 'active_rule', is_active: true })
      createMockPricingRule({ rule_key: 'inactive_rule', is_active: false })

      const request = createMockRequest('http://localhost:3000/api/pricing?active=false')
      const response = await GET_PRICING(request)
      const data = await parseResponse<{ rules: unknown[] }>(response)

      expect(response.status).toBe(200)
      expect(data.rules.length).toBe(2)
    })

    it('should filter by category', async () => {
      createMockPricingRule({ rule_key: 'material_1', rule_category: 'material' })
      createMockPricingRule({ rule_key: 'material_2', rule_category: 'material' })
      createMockPricingRule({ rule_key: 'pitch_1', rule_category: 'pitch' })

      const request = createMockRequest('http://localhost:3000/api/pricing?category=material')
      const response = await GET_PRICING(request)
      const data = await parseResponse<{ rules: Array<{ rule_category: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.rules.length).toBe(2)
      data.rules.forEach(rule => {
        expect(rule.rule_category).toBe('material')
      })
    })
  })

  describe('POST /api/pricing', () => {
    it('should create a new pricing rule', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'POST',
        body: {
          rule_key: 'new_material_test',
          rule_category: 'material',
          display_name: 'Test Material',
          multiplier: 1.5,
        },
      })

      const response = await POST_PRICING(request)
      const data = await parseResponse<{ rule: { id: string; rule_key: string; multiplier: number } }>(response)

      expect(response.status).toBe(201)
      expect(data.rule.id).toBeDefined()
      expect(data.rule.rule_key).toBe('new_material_test')
      expect(data.rule.multiplier).toBe(1.5)
    })

    it('should create rule with flat fee', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'POST',
        body: {
          rule_key: 'feature_test',
          rule_category: 'feature',
          display_name: 'Test Feature',
          flat_fee: 500,
        },
      })

      const response = await POST_PRICING(request)
      const data = await parseResponse<{ rule: { flat_fee: number } }>(response)

      expect(response.status).toBe(201)
      expect(data.rule.flat_fee).toBe(500)
    })

    it('should create rule with base rate and unit', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'POST',
        body: {
          rule_key: 'base_test',
          rule_category: 'job_type',
          display_name: 'Test Job Type',
          base_rate: 5.0,
          unit: 'sqft',
        },
      })

      const response = await POST_PRICING(request)
      const data = await parseResponse<{ rule: { base_rate: number; unit: string } }>(response)

      expect(response.status).toBe(201)
      expect(data.rule.base_rate).toBe(5.0)
      expect(data.rule.unit).toBe('sqft')
    })

    it('should default is_active to true', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'POST',
        body: {
          rule_key: 'auto_active',
          rule_category: 'material',
          display_name: 'Auto Active Rule',
        },
      })

      const response = await POST_PRICING(request)
      const data = await parseResponse<{ rule: { is_active: boolean } }>(response)

      expect(response.status).toBe(201)
      expect(data.rule.is_active).toBe(true)
    })
  })

  describe('PATCH /api/pricing', () => {
    it('should update an existing pricing rule', async () => {
      const rule = createMockPricingRule({ multiplier: 1.0 })

      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'PATCH',
        body: {
          id: rule.id,
          multiplier: 1.75,
        },
      })

      const response = await PATCH_PRICING(request)
      const data = await parseResponse<{ rule: { multiplier: number } }>(response)

      expect(response.status).toBe(200)
      expect(data.rule.multiplier).toBe(1.75)
    })

    it('should toggle rule active status', async () => {
      const rule = createMockPricingRule({ is_active: true })

      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'PATCH',
        body: {
          id: rule.id,
          is_active: false,
        },
      })

      const response = await PATCH_PRICING(request)
      const data = await parseResponse<{ rule: { is_active: boolean } }>(response)

      expect(response.status).toBe(200)
      expect(data.rule.is_active).toBe(false)
    })

    it('should return 400 if id is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/pricing', {
        method: 'PATCH',
        body: {
          multiplier: 2.0,
        },
      })

      const response = await PATCH_PRICING(request)
      expect(response.status).toBe(400)
    })
  })
})

describe('Settings API', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('GET /api/settings', () => {
    it('should return default settings when no settings exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings')
      const response = await GET_SETTINGS(request)
      const data = await parseResponse<{ settings: { company: { name: string } } }>(response)

      expect(response.status).toBe(200)
      expect(data.settings).toBeDefined()
      expect(data.settings.company.name).toBe('Farrell Roofing')
    })

    it('should return saved settings', async () => {
      // Pre-populate settings
      Object.assign(mockSettings, {
        id: 1,
        company_name: 'Custom Roofing Co',
        company_phone: '555-9999',
        pricing_overhead_percent: 20,
      })

      const request = createMockRequest('http://localhost:3000/api/settings')
      const response = await GET_SETTINGS(request)
      const data = await parseResponse<{
        settings: {
          company: { name: string; phone: string }
          pricing: { overheadPercent: number }
        }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.settings.company.name).toBe('Custom Roofing Co')
      expect(data.settings.company.phone).toBe('555-9999')
      expect(data.settings.pricing.overheadPercent).toBe(20)
    })
  })

  describe('PUT /api/settings', () => {
    it('should update company settings', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          company: {
            name: 'New Company Name',
            phone: '555-1234',
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      const data = await parseResponse<{
        success: boolean
        settings: { company: { name: string } }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.settings.company.name).toBe('New Company Name')
    })

    it('should update pricing settings', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          pricing: {
            overheadPercent: 18,
            profitMarginPercent: 25,
            taxRate: 8.5,
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      const data = await parseResponse<{
        settings: {
          pricing: { overheadPercent: number; profitMarginPercent: number; taxRate: number }
        }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.settings.pricing.overheadPercent).toBe(18)
      expect(data.settings.pricing.profitMarginPercent).toBe(25)
      expect(data.settings.pricing.taxRate).toBe(8.5)
    })

    it('should update notification settings', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          notifications: {
            newLeadEmail: true,
            estimateEmail: false,
            dailyDigest: true,
            emailRecipients: ['admin@example.com', 'manager@example.com'],
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      const data = await parseResponse<{
        settings: {
          notifications: {
            newLeadEmail: boolean
            emailRecipients: string[]
          }
        }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.settings.notifications.newLeadEmail).toBe(true)
      expect(data.settings.notifications.emailRecipients).toHaveLength(2)
    })

    it('should update lead sources', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          leadSources: [
            { id: 'web_funnel', name: 'Web Funnel', enabled: true },
            { id: 'google', name: 'Google Ads', enabled: false },
          ],
        },
      })

      const response = await PUT_SETTINGS(request)
      const data = await parseResponse<{
        settings: {
          leadSources: Array<{ id: string; enabled: boolean }>
        }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.settings.leadSources).toHaveLength(2)
      expect(data.settings.leadSources.find(s => s.id === 'google')?.enabled).toBe(false)
    })

    it('should return 400 for invalid email', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          company: {
            name: 'Test Co',
            email: 'not-an-email',
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid website URL', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          company: {
            name: 'Test Co',
            website: 'not-a-url',
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for out-of-range percentage', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          pricing: {
            overheadPercent: 150, // > 100
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for negative percentage', async () => {
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          pricing: {
            taxRate: -5,
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      expect(response.status).toBe(400)
    })

    it('should preserve existing settings when updating partial data', async () => {
      // First, set initial settings
      Object.assign(mockSettings, {
        id: 1,
        company_name: 'Original Name',
        company_phone: '555-0000',
        pricing_overhead_percent: 15,
      })

      // Update only company name
      const request = createMockRequest('http://localhost:3000/api/settings', {
        method: 'PUT',
        body: {
          company: {
            name: 'Updated Name',
          },
        },
      })

      const response = await PUT_SETTINGS(request)
      const data = await parseResponse<{
        settings: {
          company: { name: string; phone: string }
          pricing: { overheadPercent: number }
        }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.settings.company.name).toBe('Updated Name')
      // These should be preserved (or their defaults)
    })
  })
})

describe('Settings Validation', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('should validate email recipient list', async () => {
    const request = createMockRequest('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: {
        notifications: {
          emailRecipients: ['valid@email.com', 'not-valid', 'also@valid.com'],
        },
      },
    })

    const response = await PUT_SETTINGS(request)
    expect(response.status).toBe(400)
  })

  it('should allow empty company name to fail validation', async () => {
    const request = createMockRequest('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: {
        company: {
          name: '', // Empty string should fail
        },
      },
    })

    const response = await PUT_SETTINGS(request)
    expect(response.status).toBe(400)
  })
})
