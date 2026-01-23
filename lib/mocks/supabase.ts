/**
 * Mock Supabase client for testing and development without real credentials
 * Implements the same interface as the real Supabase client
 */

import { mockDb } from './database'
import { simulateDelay } from './config'
import { v4 as uuidv4 } from 'uuid'

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in'

interface QueryFilter {
  column: string
  operator: FilterOperator
  value: unknown
}

interface QueryOptions {
  table: string
  filters: QueryFilter[]
  orderBy?: { column: string; ascending: boolean }[]
  range?: { from: number; to: number }
  selectColumns?: string
  single?: boolean
  count?: 'exact' | 'planned' | 'estimated'
}

// Mock query builder that mimics Supabase's chainable API
class MockQueryBuilder<T = unknown> {
  private options: QueryOptions

  constructor(table: string) {
    this.options = {
      table,
      filters: [],
    }
  }

  select(columns?: string, opts?: { count?: 'exact' | 'planned' | 'estimated' }) {
    this.options.selectColumns = columns
    if (opts?.count) {
      this.options.count = opts.count
    }
    return this
  }

  insert(data: Partial<T> | Partial<T>[]) {
    return new MockInsertBuilder<T>(this.options.table, data)
  }

  update(data: Partial<T>) {
    return new MockUpdateBuilder<T>(this.options.table, data, this.options.filters)
  }

  upsert(data: Partial<T> | Partial<T>[]) {
    return new MockUpsertBuilder<T>(this.options.table, data, this.options.filters)
  }

  delete() {
    return new MockDeleteBuilder(this.options.table, this.options.filters)
  }

  eq(column: string, value: unknown) {
    this.options.filters.push({ column, operator: 'eq', value })
    return this
  }

  neq(column: string, value: unknown) {
    this.options.filters.push({ column, operator: 'neq', value })
    return this
  }

  order(column: string, opts?: { ascending?: boolean }) {
    if (!this.options.orderBy) this.options.orderBy = []
    this.options.orderBy.push({ column, ascending: opts?.ascending ?? true })
    return this
  }

  range(from: number, to: number) {
    this.options.range = { from, to }
    return this
  }

  single() {
    this.options.single = true
    return this
  }

  async then<TResult>(
    resolve: (value: { data: T | T[] | null; error: null; count?: number }) => TResult
  ): Promise<TResult> {
    await simulateDelay()

    const result = this.executeQuery()
    return resolve(result)
  }

  private executeQuery(): { data: T | T[] | null; error: null; count?: number } {
    const { table, filters, orderBy, range, single, count } = this.options

    let data = this.getTableData(table)

    // Apply filters
    for (const filter of filters) {
      data = data.filter((row) => {
        const val = (row as Record<string, unknown>)[filter.column]
        switch (filter.operator) {
          case 'eq':
            return val === filter.value
          case 'neq':
            return val !== filter.value
          default:
            return true
        }
      })
    }

    const total = data.length

    // Apply ordering
    if (orderBy) {
      data.sort((a, b) => {
        for (const order of orderBy) {
          const aVal = (a as Record<string, unknown>)[order.column] as string | number | Date
          const bVal = (b as Record<string, unknown>)[order.column] as string | number | Date
          if (aVal < bVal) return order.ascending ? -1 : 1
          if (aVal > bVal) return order.ascending ? 1 : -1
        }
        return 0
      })
    }

    // Apply range
    if (range) {
      data = data.slice(range.from, range.to + 1)
    }

    // Return single or array
    if (single) {
      return {
        data: (data[0] as T) || null,
        error: null,
        ...(count ? { count: total } : {}),
      }
    }

    return {
      data: data as T[],
      error: null,
      ...(count ? { count: total } : {}),
    }
  }

  private getTableData(table: string): unknown[] {
    switch (table) {
      case 'leads':
        return Array.from(mockDb.leads.values())
      case 'contacts':
        return Array.from(mockDb.contacts.values())
      case 'properties':
        return Array.from(mockDb.properties.values())
      case 'intakes':
        return Array.from(mockDb.intakes.values())
      case 'uploads':
        return Array.from(mockDb.uploads.values())
      case 'estimates':
        return Array.from(mockDb.estimates.values())
      case 'pricing_rules':
        return Array.from(mockDb.pricing_rules.values())
      case 'ai_outputs':
        return Array.from(mockDb.ai_outputs.values())
      default:
        return []
    }
  }
}

class MockInsertBuilder<T> {
  constructor(
    private table: string,
    private data: Partial<T> | Partial<T>[]
  ) {}

  select() {
    return this
  }

  single() {
    return this
  }

  async then<TResult>(
    resolve: (value: { data: T | null; error: null }) => TResult
  ): Promise<TResult> {
    await simulateDelay()

    const items = Array.isArray(this.data) ? this.data : [this.data]
    const results: unknown[] = []

    for (const item of items) {
      const result = this.insertRow(item)
      if (result) results.push(result)
    }

    return resolve({
      data: (results.length === 1 ? results[0] : results) as T,
      error: null,
    })
  }

  private insertRow(data: Partial<T>): unknown {
    const now = new Date().toISOString()
    const id = uuidv4()

    switch (this.table) {
      case 'leads':
        return mockDb.createLead(data as Record<string, unknown>)
      case 'contacts': {
        const contact = { ...data, id, created_at: now, updated_at: now }
        mockDb.contacts.set(id, contact as never)
        return contact
      }
      case 'properties': {
        const property = { ...data, id, created_at: now, updated_at: now }
        mockDb.properties.set(id, property as never)
        return property
      }
      case 'intakes': {
        const intake = {
          ...data,
          id,
          has_skylights: false,
          has_chimneys: false,
          has_solar_panels: false,
          has_insurance_claim: false,
          created_at: now,
          updated_at: now,
        }
        mockDb.intakes.set(id, intake as never)
        return intake
      }
      case 'uploads':
        return mockDb.createUpload({
          ...(data as Record<string, unknown>),
          status: 'pending',
        } as never)
      case 'estimates':
        return mockDb.createEstimate(data as never)
      case 'pricing_rules':
        return mockDb.createPricingRule(data as never)
      default:
        return null
    }
  }
}

class MockUpdateBuilder<T> {
  constructor(
    private table: string,
    private data: Partial<T>,
    private filters: QueryFilter[]
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  select() {
    return this
  }

  single() {
    return this
  }

  async then<TResult>(
    resolve: (value: { data: T | null; error: null }) => TResult
  ): Promise<TResult> {
    await simulateDelay()

    const result = this.executeUpdate()
    return resolve({ data: result as T, error: null })
  }

  private executeUpdate(): unknown {
    const idFilter = this.filters.find((f) => f.column === 'id')
    const leadIdFilter = this.filters.find((f) => f.column === 'lead_id')

    switch (this.table) {
      case 'leads':
        if (idFilter) {
          return mockDb.updateLead(idFilter.value as string, this.data as never)
        }
        break
      case 'contacts':
        if (leadIdFilter) {
          return mockDb.updateContact(leadIdFilter.value as string, this.data as never)
        }
        break
      case 'properties':
        if (leadIdFilter) {
          return mockDb.updateProperty(leadIdFilter.value as string, this.data as never)
        }
        break
      case 'intakes':
        if (leadIdFilter) {
          return mockDb.updateIntake(leadIdFilter.value as string, this.data as never)
        }
        break
      case 'uploads':
        if (idFilter) {
          return mockDb.updateUpload(idFilter.value as string, this.data as never)
        }
        break
      case 'pricing_rules':
        if (idFilter) {
          return mockDb.updatePricingRule(idFilter.value as string, this.data as never)
        }
        break
    }
    return null
  }
}

class MockUpsertBuilder<T> {
  constructor(
    private table: string,
    private data: Partial<T> | Partial<T>[],
    private filters: QueryFilter[]
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  select() {
    return this
  }

  single() {
    return this
  }

  async then<TResult>(
    resolve: (value: { data: T | null; error: null }) => TResult
  ): Promise<TResult> {
    await simulateDelay()

    // For upsert, try update first, then insert if not found
    const items = Array.isArray(this.data) ? this.data : [this.data]
    const results: unknown[] = []

    for (const item of items) {
      // Simplified: just do an update based on filters or insert
      const leadIdFilter = this.filters.find((f) => f.column === 'lead_id')

      if (leadIdFilter && this.table === 'intakes') {
        const existing = mockDb.getIntake(leadIdFilter.value as string)
        if (existing) {
          results.push(mockDb.updateIntake(leadIdFilter.value as string, item as never))
        }
      }
    }

    return resolve({
      data: (results.length === 1 ? results[0] : results) as T,
      error: null,
    })
  }
}

class MockDeleteBuilder {
  constructor(
    private table: string,
    private filters: QueryFilter[]
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  async then<TResult>(resolve: (value: { data: null; error: null }) => TResult): Promise<TResult> {
    await simulateDelay()
    // Implement delete logic if needed
    return resolve({ data: null, error: null })
  }
}

// Mock storage bucket
class MockStorageBucket {
  private files: Map<string, { data: Buffer; contentType: string }> = new Map()

  constructor(private bucketName: string) {}

  async upload(
    path: string,
    data: Buffer | Blob | ArrayBuffer,
    options?: { contentType?: string; upsert?: boolean }
  ) {
    await simulateDelay()

    let buffer: Buffer
    if (data instanceof Buffer) {
      buffer = data
    } else if (data instanceof Blob) {
      const ab = await data.arrayBuffer()
      buffer = Buffer.from(new Uint8Array(ab))
    } else {
      // ArrayBuffer
      buffer = Buffer.from(new Uint8Array(data as ArrayBuffer))
    }

    this.files.set(path, {
      data: buffer,
      contentType: options?.contentType || 'application/octet-stream',
    })

    return { data: { path }, error: null }
  }

  async download(path: string) {
    await simulateDelay()

    const file = this.files.get(path)
    if (!file) {
      return { data: null, error: { message: 'File not found' } }
    }

    return { data: new Blob([new Uint8Array(file.data)]), error: null }
  }

  async createSignedUploadUrl(path: string) {
    await simulateDelay()

    return {
      data: {
        signedUrl: `https://mock-storage.local/${this.bucketName}/${path}?token=${uuidv4()}`,
        token: uuidv4(),
        path,
      },
      error: null,
    }
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `https://mock-storage.local/${this.bucketName}/${path}`,
      },
    }
  }

  async remove(paths: string[]) {
    await simulateDelay()

    for (const path of paths) {
      this.files.delete(path)
    }

    return { data: paths.map((p) => ({ name: p })), error: null }
  }
}

// Mock storage manager
class MockStorage {
  private buckets: Map<string, MockStorageBucket> = new Map()

  from(bucketName: string): MockStorageBucket {
    if (!this.buckets.has(bucketName)) {
      this.buckets.set(bucketName, new MockStorageBucket(bucketName))
    }
    return this.buckets.get(bucketName)!
  }
}

// Mock auth
class MockAuth {
  private currentUser: { id: string; email: string } | null = null

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await simulateDelay()

    // Accept any email/password combo for testing
    // In real tests, you might want specific credentials
    if (email && password) {
      this.currentUser = {
        id: uuidv4(),
        email,
      }
      return {
        data: {
          user: this.currentUser,
          session: { access_token: 'mock-token-' + uuidv4() },
        },
        error: null,
      }
    }

    return {
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    }
  }

  async signOut() {
    await simulateDelay()
    this.currentUser = null
    return { error: null }
  }

  async getUser() {
    await simulateDelay()
    return {
      data: { user: this.currentUser },
      error: null,
    }
  }

  async getSession() {
    await simulateDelay()
    if (this.currentUser) {
      return {
        data: {
          session: {
            user: this.currentUser,
            access_token: 'mock-token',
          },
        },
        error: null,
      }
    }
    return { data: { session: null }, error: null }
  }

  // For testing: manually set user
  setMockUser(user: { id: string; email: string } | null) {
    this.currentUser = user
  }
}

// Main mock client
export class MockSupabaseClient {
  storage = new MockStorage()
  auth = new MockAuth()

  from<T = unknown>(table: string): MockQueryBuilder<T> {
    return new MockQueryBuilder<T>(table)
  }
}

// Export singleton for use in app
export const mockSupabase = new MockSupabaseClient()

// Factory function matching real createClient signature
export function createMockClient() {
  return mockSupabase
}
