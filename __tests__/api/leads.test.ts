/**
 * Tests for Leads API Routes
 * Tests CRUD operations, validation, bulk operations, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/leads/route'
import { GET as GET_LEAD, PATCH } from '@/app/api/leads/[leadId]/route'
import { GET as GET_BULK, PUT as PUT_BULK } from '@/app/api/leads/bulk/route'
import {
  createMockRequest,
  createRouteContext,
  parseResponse,
  apiTestDb,
} from './test-utils'
import { v4 as uuidv4 } from 'uuid'

// Mock rate limiting to always succeed
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ success: true, remaining: 10, reset: Date.now() + 60000 })),
  getClientIP: vi.fn(() => '127.0.0.1'),
  rateLimitResponse: vi.fn(),
  createRateLimitHeaders: vi.fn(() => ({})),
}))

// Mock workflow triggers
vi.mock('@/lib/communication/workflow-engine', () => ({
  triggerWorkflows: vi.fn(() => Promise.resolve()),
}))

// Shared mock data
const mockLeads: Map<string, Record<string, unknown>> = new Map()
const mockContacts: Map<string, Record<string, unknown>> = new Map()
const mockProperties: Map<string, Record<string, unknown>> = new Map()
const mockIntakes: Map<string, Record<string, unknown>> = new Map()
const mockEstimates: Map<string, Record<string, unknown>> = new Map()

function resetMocks() {
  mockLeads.clear()
  mockContacts.clear()
  mockProperties.clear()
  mockIntakes.clear()
  mockEstimates.clear()
}

// Create a mock lead with related data
function createMockLead(overrides: Partial<Record<string, unknown>> = {}) {
  const id = uuidv4()
  const lead = {
    id,
    source: 'web_funnel',
    status: 'new',
    current_step: 1,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer_url: null,
    ip_address: '127.0.0.1',
    user_agent: 'test-agent',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
  mockLeads.set(id, lead)

  // Create related records
  mockContacts.set(id, { lead_id: id, first_name: 'John', last_name: 'Doe', email: 'john@test.com', phone: '555-1234' })
  mockProperties.set(id, { lead_id: id, street_address: '123 Main St', city: 'Tupelo', state: 'MS', zip_code: '38801' })
  mockIntakes.set(id, { lead_id: id, job_type: 'full_replacement', roof_size_sqft: 2500, timeline_urgency: 'within_month' })

  return lead
}

// Mock Supabase client
function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let insertData: unknown = null
  let updateData: unknown = null
  let selectedColumns = '*'
  let isSingle = false
  let orderColumn: string | null = null
  let rangeStart = 0
  let rangeEnd = 49
  let inFilter: { column: string; values: unknown[] } | null = null

  const builder = {
    select: (columns?: string, opts?: { count?: string }) => {
      selectedColumns = columns || '*'
      return builder
    },
    insert: (data: unknown) => {
      insertData = data
      return builder
    },
    update: (data: unknown) => {
      updateData = data
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    in: (column: string, values: unknown[]) => {
      inFilter = { column, values }
      return builder
    },
    order: (column: string, opts?: { ascending?: boolean }) => {
      orderColumn = column
      return builder
    },
    range: (start: number, end: number) => {
      rangeStart = start
      rangeEnd = end
      return builder
    },
    single: () => {
      isSingle = true
      return builder
    },
    limit: (n: number) => {
      rangeEnd = rangeStart + n - 1
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = executeLeadQuery(table, filters, insertData, updateData, isSingle, inFilter, rangeStart, rangeEnd)
      return resolve(result)
    },
  }
  return builder
}

function executeLeadQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  insertData: unknown,
  updateData: unknown,
  isSingle: boolean,
  inFilter: { column: string; values: unknown[] } | null,
  rangeStart: number,
  rangeEnd: number
): { data: unknown; error: unknown; count?: number } {
  // Handle insert
  if (insertData) {
    if (table === 'leads') {
      const id = uuidv4()
      const lead = { id, ...(insertData as Record<string, unknown>), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockLeads.set(id, lead)
      return { data: lead, error: null }
    }
    if (table === 'contacts') {
      const data = insertData as Record<string, unknown>
      mockContacts.set(data.lead_id as string, data)
      return { data, error: null }
    }
    if (table === 'properties') {
      const data = insertData as Record<string, unknown>
      mockProperties.set(data.lead_id as string, data)
      return { data, error: null }
    }
    if (table === 'intakes') {
      const data = insertData as Record<string, unknown>
      mockIntakes.set(data.lead_id as string, data)
      return { data, error: null }
    }
    return { data: insertData, error: null }
  }

  // Handle update
  if (updateData) {
    if (table === 'leads') {
      // Check for in filter (bulk update)
      if (inFilter && inFilter.column === 'id') {
        const updated: Record<string, unknown>[] = []
        for (const id of inFilter.values) {
          const lead = mockLeads.get(id as string)
          if (lead) {
            Object.assign(lead, updateData, { updated_at: new Date().toISOString() })
            updated.push({ id, status: lead.status })
          }
        }
        return { data: updated, error: null }
      }

      // Single update
      const idFilter = filters.find(f => f.column === 'id')
      if (idFilter) {
        const lead = mockLeads.get(idFilter.value as string)
        if (!lead) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
        Object.assign(lead, updateData, { updated_at: new Date().toISOString() })
        return { data: lead, error: null }
      }
    }
    return { data: null, error: { message: 'Update not implemented for this table' } }
  }

  // Handle select
  if (table === 'leads') {
    let data = Array.from(mockLeads.values())

    // Apply filters
    for (const filter of filters) {
      if (filter.operator === 'eq') {
        data = data.filter(item => item[filter.column] === filter.value)
      }
    }

    // Apply in filter
    if (inFilter) {
      data = data.filter(item => inFilter.values.includes(item[inFilter.column]))
    }

    // Join related data
    data = data.map(lead => ({
      ...lead,
      contacts: mockContacts.get(lead.id as string) ? [mockContacts.get(lead.id as string)] : [],
      properties: mockProperties.get(lead.id as string) ? [mockProperties.get(lead.id as string)] : [],
      intakes: mockIntakes.get(lead.id as string) ? [mockIntakes.get(lead.id as string)] : [],
      uploads: [],
      estimates: mockEstimates.get(lead.id as string) ? [mockEstimates.get(lead.id as string)] : [],
    }))

    // Apply range
    const count = data.length
    data = data.slice(rangeStart, rangeEnd + 1)

    if (isSingle) {
      if (data.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      }
      return { data: data[0], error: null }
    }

    return { data, error: null, count }
  }

  // For customer_leads and other joined tables, return empty
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
  requireAuth: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-123' },
    error: null
  })),
  requireLeadOwnership: vi.fn(() => Promise.resolve({
    user: { id: 'test-admin-123', email: 'admin@test.com', user_metadata: { role: 'admin' } },
    error: null
  })),
  parsePagination: vi.fn((searchParams: URLSearchParams) => {
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    return { limit: Math.min(limit, 100), offset: Math.max(offset, 0) }
  }),
}))

describe('Leads API', () => {
  beforeEach(() => {
    resetMocks()
    apiTestDb.reset()
  })

  describe('POST /api/leads', () => {
    it('should create a new lead with minimal data', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: {},
      })

      const response = await POST(request)
      const data = await parseResponse<{ lead: { id: string; source: string; status: string } }>(response)

      expect(response.status).toBe(201)
      expect(data.lead).toBeDefined()
      expect(data.lead.id).toBeDefined()
      expect(data.lead.source).toBe('web_funnel')
      expect(data.lead.status).toBe('new')
    })

    it('should create a lead with UTM parameters', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: {
          source: 'google',
          utmSource: 'google',
          utmMedium: 'cpc',
          utmCampaign: 'spring_2024',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ lead: { id: string; source: string; utm_source: string } }>(response)

      expect(response.status).toBe(201)
      expect(data.lead.source).toBe('google')
      expect(data.lead.utm_source).toBe('google')
    })

    it('should return 400 for invalid referrer URL', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: {
          referrerUrl: 'not-a-valid-url',
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/leads', () => {
    it('should return empty list when no leads exist', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads')
      const response = await GET(request)
      const data = await parseResponse<{ leads: unknown[]; total: number }>(response)

      expect(response.status).toBe(200)
      expect(data.leads).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should return all leads with related data', async () => {
      createMockLead({ status: 'new' })
      createMockLead({ status: 'estimate_generated' })

      const request = createMockRequest('http://localhost:3000/api/leads')
      const response = await GET(request)
      const data = await parseResponse<{ leads: Array<{ id: string; contacts: unknown[] }>; total: number }>(response)

      expect(response.status).toBe(200)
      expect(data.leads.length).toBe(2)
      expect(data.total).toBe(2)
      expect(data.leads[0].contacts).toBeDefined()
    })

    it('should filter by status', async () => {
      createMockLead({ status: 'new' })
      createMockLead({ status: 'won' })
      createMockLead({ status: 'new' })

      const request = createMockRequest('http://localhost:3000/api/leads?status=new')
      const response = await GET(request)
      const data = await parseResponse<{ leads: Array<{ status: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.leads.length).toBe(2)
      data.leads.forEach(lead => {
        expect(lead.status).toBe('new')
      })
    })

    it('should paginate results', async () => {
      // Create 5 leads
      for (let i = 0; i < 5; i++) {
        createMockLead({ status: 'new' })
      }

      const request = createMockRequest('http://localhost:3000/api/leads?limit=2&offset=0')
      const response = await GET(request)
      const data = await parseResponse<{ leads: unknown[]; total: number }>(response)

      expect(response.status).toBe(200)
      expect(data.leads.length).toBe(2)
      expect(data.total).toBe(5)
    })
  })

  describe('GET /api/leads/[leadId]', () => {
    it('should return a specific lead with all related data', async () => {
      const lead = createMockLead({ status: 'estimate_generated' })

      const request = createMockRequest(`http://localhost:3000/api/leads/${lead.id}`)
      const context = createRouteContext({ leadId: lead.id as string })
      const response = await GET_LEAD(request, context)
      const data = await parseResponse<{ lead: { id: string; status: string; contacts: unknown[] } }>(response)

      expect(response.status).toBe(200)
      expect(data.lead.id).toBe(lead.id)
      expect(data.lead.status).toBe('estimate_generated')
      expect(data.lead.contacts).toBeDefined()
    })

    it('should return 404 for non-existent lead', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads/non-existent-id')
      const context = createRouteContext({ leadId: 'non-existent-id' })
      const response = await GET_LEAD(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/leads/[leadId]', () => {
    it('should update lead status', async () => {
      const lead = createMockLead({ status: 'new' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}`,
        {
          method: 'PATCH',
          body: { status: 'consultation_scheduled' },
        }
      )
      const context = createRouteContext({ leadId: lead.id as string })
      const response = await PATCH(request, context)
      const data = await parseResponse<{ lead: { id: string; status: string } }>(response)

      expect(response.status).toBe(200)
      expect(data.lead.status).toBe('consultation_scheduled')
    })

    it('should update lead currentStep', async () => {
      const lead = createMockLead({ current_step: 1 })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}`,
        {
          method: 'PATCH',
          body: { currentStep: 4 },
        }
      )
      const context = createRouteContext({ leadId: lead.id as string })
      const response = await PATCH(request, context)
      const data = await parseResponse<{ lead: { current_step: number } }>(response)

      expect(response.status).toBe(200)
      expect(data.lead.current_step).toBe(4)
    })

    it('should return 400 for invalid status', async () => {
      const lead = createMockLead({ status: 'new' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/${lead.id}`,
        {
          method: 'PATCH',
          body: { status: 'invalid_status' },
        }
      )
      const context = createRouteContext({ leadId: lead.id as string })
      const response = await PATCH(request, context)

      expect(response.status).toBe(400)
    })

    it('should return 404 for updating non-existent lead', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/leads/non-existent-id',
        {
          method: 'PATCH',
          body: { status: 'won' },
        }
      )
      const context = createRouteContext({ leadId: 'non-existent-id' })
      const response = await PATCH(request, context)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/leads/bulk (bulk status update)', () => {
    it('should update multiple leads at once', async () => {
      const lead1 = createMockLead({ status: 'new' })
      const lead2 = createMockLead({ status: 'new' })
      const lead3 = createMockLead({ status: 'new' })

      const request = createMockRequest('http://localhost:3000/api/leads/bulk', {
        method: 'PUT',
        body: {
          leadIds: [lead1.id, lead2.id],
          status: 'archived',
        },
      })

      const response = await PUT_BULK(request)
      const data = await parseResponse<{ success: boolean; updated: number; leads: Array<{ id: string; status: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.updated).toBe(2)
      expect(data.leads).toHaveLength(2)
      data.leads.forEach(lead => {
        expect(lead.status).toBe('archived')
      })

      // Verify lead3 was not updated
      expect(mockLeads.get(lead3.id as string)?.status).toBe('new')
    })

    it('should return 400 for empty lead IDs array', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads/bulk', {
        method: 'PUT',
        body: {
          leadIds: [],
          status: 'archived',
        },
      })

      const response = await PUT_BULK(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid status', async () => {
      const lead = createMockLead({ status: 'new' })

      const request = createMockRequest('http://localhost:3000/api/leads/bulk', {
        method: 'PUT',
        body: {
          leadIds: [lead.id],
          status: 'invalid_status',
        },
      })

      const response = await PUT_BULK(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for too many lead IDs', async () => {
      // Create 101 UUIDs
      const leadIds = Array.from({ length: 101 }, () => uuidv4())

      const request = createMockRequest('http://localhost:3000/api/leads/bulk', {
        method: 'PUT',
        body: {
          leadIds,
          status: 'archived',
        },
      })

      const response = await PUT_BULK(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/leads/bulk (bulk export)', () => {
    it('should export leads in flat format', async () => {
      const lead1 = createMockLead({ status: 'new', source: 'web_funnel' })
      const lead2 = createMockLead({ status: 'won', source: 'google' })

      const request = createMockRequest(
        `http://localhost:3000/api/leads/bulk?ids=${lead1.id},${lead2.id}`
      )

      const response = await GET_BULK(request)
      const data = await parseResponse<{ leads: Array<{ id: string; first_name: string; street_address: string }> }>(response)

      expect(response.status).toBe(200)
      expect(data.leads).toHaveLength(2)
      // Check that data is flattened
      expect(data.leads[0].first_name).toBeDefined()
      expect(data.leads[0].street_address).toBeDefined()
    })

    it('should return 400 for missing IDs parameter', async () => {
      const request = createMockRequest('http://localhost:3000/api/leads/bulk')
      const response = await GET_BULK(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid UUIDs', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/leads/bulk?ids=invalid-id,another-invalid'
      )
      const response = await GET_BULK(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for too many IDs', async () => {
      const ids = Array.from({ length: 101 }, () => uuidv4()).join(',')
      const request = createMockRequest(
        `http://localhost:3000/api/leads/bulk?ids=${ids}`
      )
      const response = await GET_BULK(request)

      expect(response.status).toBe(400)
    })
  })
})

describe('Lead Status Transitions', () => {
  beforeEach(() => {
    resetMocks()
  })

  it.each([
    ['new', 'intake_started'],
    ['intake_started', 'intake_complete'],
    ['intake_complete', 'estimate_generated'],
    ['estimate_generated', 'consultation_scheduled'],
    ['consultation_scheduled', 'quote_sent'],
    ['quote_sent', 'won'],
    ['new', 'lost'],
    ['new', 'archived'],
  ])('should allow transition from %s to %s', async (fromStatus, toStatus) => {
    const lead = createMockLead({ status: fromStatus })

    const request = createMockRequest(
      `http://localhost:3000/api/leads/${lead.id}`,
      {
        method: 'PATCH',
        body: { status: toStatus },
      }
    )
    const context = createRouteContext({ leadId: lead.id as string })
    const response = await PATCH(request, context)

    expect(response.status).toBe(200)
  })
})
