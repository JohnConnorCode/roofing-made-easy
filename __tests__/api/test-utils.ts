/**
 * Test utilities for API route testing
 * Provides helpers to invoke Next.js API route handlers directly
 */

import { NextRequest } from 'next/server'
import { vi } from 'vitest'

// Type for route handler context with dynamic params
type RouteContext<T extends Record<string, string> = Record<string, string>> = {
  params: Promise<T>
}

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {} } = options

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(new URL(url, 'http://localhost:3000'), requestInit as any)
}

/**
 * Create route context with params
 */
export function createRouteContext<T extends Record<string, string>>(
  params: T
): RouteContext<T> {
  return {
    params: Promise.resolve(params),
  }
}

/**
 * Parse JSON response from route handler
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

/**
 * In-memory mock database for API route tests
 * Extends the basic mockDb with additional tables for advanced estimation
 */
import { v4 as uuidv4 } from 'uuid'

export interface MockLineItem {
  id: string
  item_code: string
  name: string
  description: string | null
  category: string
  unit_type: string
  base_material_cost: number
  base_labor_cost: number
  base_equipment_cost: number
  quantity_formula: string | null
  default_waste_factor: number
  is_active: boolean
  is_taxable: boolean
  sort_order: number
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface MockMacro {
  id: string
  name: string
  description: string | null
  roof_type: string
  job_type: string
  is_default: boolean
  is_active: boolean
  is_system: boolean
  usage_count: number
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface MockMacroLineItem {
  id: string
  macro_id: string
  line_item_id: string
  quantity_formula: string | null
  waste_factor: number | null
  is_optional: boolean
  is_selected_by_default: boolean
  material_cost_override: number | null
  labor_cost_override: number | null
  equipment_cost_override: number | null
  sort_order: number
  group_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MockGeographicPricing {
  id: string
  state: string
  name: string
  county: string | null
  zip_codes: string[]
  material_multiplier: number
  labor_multiplier: number
  equipment_multiplier: number
  is_active: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface MockRoofSketch {
  id: string
  lead_id: string
  total_squares: number
  total_sqft: number
  total_perimeter_lf: number
  total_eave_lf: number
  total_ridge_lf: number
  total_valley_lf: number
  total_hip_lf: number
  total_rake_lf: number
  skylight_count: number
  chimney_count: number
  pipe_boot_count: number
  vent_count: number
  total_drip_edge_lf: number
  total_fascia_lf: number
  gutter_lf: number
  downspout_count: number
  existing_layers: number
  sketch_data: Record<string, unknown>
  measurement_source: string
  measurement_date: string | null
  created_at: string
  updated_at: string
}

export interface MockRoofSlope {
  id: string
  sketch_id: string
  name: string
  slope_number: number
  squares: number
  sqft: number
  pitch: number
  pitch_multiplier: number
  eave_lf: number
  ridge_lf: number
  valley_lf: number
  hip_lf: number
  rake_lf: number
  length_ft: number | null
  width_ft: number | null
  is_walkable: boolean
  has_steep_charge: boolean
  has_limited_access: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MockDetailedEstimate {
  id: string
  lead_id: string
  sketch_id: string | null
  name: string
  version: number
  variables: Record<string, unknown>
  total_material: number
  total_labor: number
  total_equipment: number
  subtotal: number
  overhead_percent: number
  overhead_amount: number
  profit_percent: number
  profit_amount: number
  taxable_amount: number
  tax_percent: number
  tax_amount: number
  price_low: number
  price_likely: number
  price_high: number
  geographic_pricing_id: string | null
  geographic_adjustment: number
  source_macro_id: string | null
  status: string
  is_superseded: boolean
  internal_notes: string | null
  customer_notes: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface MockLead {
  id: string
  source: string
  status: string
  created_at: string
  updated_at: string
}

class ApiTestDatabase {
  lineItems: Map<string, MockLineItem> = new Map()
  macros: Map<string, MockMacro> = new Map()
  macroLineItems: Map<string, MockMacroLineItem> = new Map()
  geographicPricing: Map<string, MockGeographicPricing> = new Map()
  roofSketches: Map<string, MockRoofSketch> = new Map()
  roofSlopes: Map<string, MockRoofSlope> = new Map()
  detailedEstimates: Map<string, MockDetailedEstimate> = new Map()
  leads: Map<string, MockLead> = new Map()

  private now(): string {
    return new Date().toISOString()
  }

  // Line Items
  createLineItem(data: Partial<MockLineItem>): MockLineItem {
    const id = data.id || uuidv4()
    const lineItem: MockLineItem = {
      id,
      item_code: data.item_code || `CODE-${id.slice(0, 6)}`,
      name: data.name || 'Test Line Item',
      description: data.description || null,
      category: data.category || 'miscellaneous',
      unit_type: data.unit_type || 'SQ',
      base_material_cost: data.base_material_cost || 0,
      base_labor_cost: data.base_labor_cost || 0,
      base_equipment_cost: data.base_equipment_cost || 0,
      quantity_formula: data.quantity_formula || null,
      default_waste_factor: data.default_waste_factor || 1,
      is_active: data.is_active ?? true,
      is_taxable: data.is_taxable ?? true,
      sort_order: data.sort_order || 0,
      tags: data.tags || [],
      notes: data.notes || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.lineItems.set(id, lineItem)
    return lineItem
  }

  getLineItem(id: string): MockLineItem | undefined {
    return this.lineItems.get(id)
  }

  getLineItemByCode(code: string): MockLineItem | undefined {
    return Array.from(this.lineItems.values()).find((li) => li.item_code === code)
  }

  updateLineItem(id: string, data: Partial<MockLineItem>): MockLineItem | null {
    const existing = this.lineItems.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: this.now() }
    this.lineItems.set(id, updated)
    return updated
  }

  // Macros
  createMacro(data: Partial<MockMacro>): MockMacro {
    const id = data.id || uuidv4()
    const macro: MockMacro = {
      id,
      name: data.name || 'Test Macro',
      description: data.description || null,
      roof_type: data.roof_type || 'any',
      job_type: data.job_type || 'any',
      is_default: data.is_default || false,
      is_active: data.is_active ?? true,
      is_system: data.is_system || false,
      usage_count: data.usage_count || 0,
      tags: data.tags || [],
      notes: data.notes || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.macros.set(id, macro)
    return macro
  }

  getMacro(id: string): MockMacro | undefined {
    return this.macros.get(id)
  }

  updateMacro(id: string, data: Partial<MockMacro>): MockMacro | null {
    const existing = this.macros.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: this.now() }
    this.macros.set(id, updated)
    return updated
  }

  // Macro Line Items
  addMacroLineItem(data: Partial<MockMacroLineItem>): MockMacroLineItem {
    const id = data.id || uuidv4()
    const macroLineItem: MockMacroLineItem = {
      id,
      macro_id: data.macro_id || '',
      line_item_id: data.line_item_id || '',
      quantity_formula: data.quantity_formula || null,
      waste_factor: data.waste_factor || null,
      is_optional: data.is_optional || false,
      is_selected_by_default: data.is_selected_by_default ?? true,
      material_cost_override: data.material_cost_override || null,
      labor_cost_override: data.labor_cost_override || null,
      equipment_cost_override: data.equipment_cost_override || null,
      sort_order: data.sort_order || 0,
      group_name: data.group_name || null,
      notes: data.notes || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.macroLineItems.set(id, macroLineItem)
    return macroLineItem
  }

  // Geographic Pricing
  createGeographicPricing(data: Partial<MockGeographicPricing>): MockGeographicPricing {
    const id = data.id || uuidv4()
    const pricing: MockGeographicPricing = {
      id,
      state: data.state || 'MS',
      name: data.name || 'Test Region',
      county: data.county || null,
      zip_codes: data.zip_codes || [],
      material_multiplier: data.material_multiplier ?? 1.0,
      labor_multiplier: data.labor_multiplier ?? 1.0,
      equipment_multiplier: data.equipment_multiplier ?? 1.0,
      is_active: data.is_active ?? true,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.geographicPricing.set(id, pricing)
    return pricing
  }

  getGeographicPricing(id: string): MockGeographicPricing | undefined {
    return this.geographicPricing.get(id)
  }

  updateGeographicPricing(id: string, data: Partial<MockGeographicPricing>): MockGeographicPricing | null {
    const existing = this.geographicPricing.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: this.now() }
    this.geographicPricing.set(id, updated)
    return updated
  }

  // Roof Sketches
  createRoofSketch(data: Partial<MockRoofSketch>): MockRoofSketch {
    const id = data.id || uuidv4()
    const sketch: MockRoofSketch = {
      id,
      lead_id: data.lead_id || '',
      total_squares: data.total_squares || 0,
      total_sqft: data.total_sqft || 0,
      total_perimeter_lf: data.total_perimeter_lf || 0,
      total_eave_lf: data.total_eave_lf || 0,
      total_ridge_lf: data.total_ridge_lf || 0,
      total_valley_lf: data.total_valley_lf || 0,
      total_hip_lf: data.total_hip_lf || 0,
      total_rake_lf: data.total_rake_lf || 0,
      skylight_count: data.skylight_count || 0,
      chimney_count: data.chimney_count || 0,
      pipe_boot_count: data.pipe_boot_count || 0,
      vent_count: data.vent_count || 0,
      total_drip_edge_lf: data.total_drip_edge_lf || 0,
      total_fascia_lf: data.total_fascia_lf || 0,
      gutter_lf: data.gutter_lf || 0,
      downspout_count: data.downspout_count || 0,
      existing_layers: data.existing_layers || 1,
      sketch_data: data.sketch_data || {},
      measurement_source: data.measurement_source || 'manual',
      measurement_date: data.measurement_date || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.roofSketches.set(id, sketch)
    return sketch
  }

  getRoofSketchByLeadId(leadId: string): MockRoofSketch | undefined {
    return Array.from(this.roofSketches.values()).find((s) => s.lead_id === leadId)
  }

  // Roof Slopes
  createRoofSlope(data: Partial<MockRoofSlope>): MockRoofSlope {
    const id = data.id || uuidv4()
    const slope: MockRoofSlope = {
      id,
      sketch_id: data.sketch_id || '',
      name: data.name || 'Main',
      slope_number: data.slope_number || 1,
      squares: data.squares || 0,
      sqft: data.sqft || 0,
      pitch: data.pitch || 4,
      pitch_multiplier: data.pitch_multiplier || 1,
      eave_lf: data.eave_lf || 0,
      ridge_lf: data.ridge_lf || 0,
      valley_lf: data.valley_lf || 0,
      hip_lf: data.hip_lf || 0,
      rake_lf: data.rake_lf || 0,
      length_ft: data.length_ft || null,
      width_ft: data.width_ft || null,
      is_walkable: data.is_walkable ?? true,
      has_steep_charge: data.has_steep_charge || false,
      has_limited_access: data.has_limited_access || false,
      notes: data.notes || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.roofSlopes.set(id, slope)
    return slope
  }

  // Detailed Estimates
  createDetailedEstimate(data: Partial<MockDetailedEstimate>): MockDetailedEstimate {
    const id = data.id || uuidv4()
    const estimate: MockDetailedEstimate = {
      id,
      lead_id: data.lead_id || '',
      sketch_id: data.sketch_id || null,
      name: data.name || 'Estimate',
      version: data.version || 1,
      variables: data.variables || {},
      total_material: data.total_material || 0,
      total_labor: data.total_labor || 0,
      total_equipment: data.total_equipment || 0,
      subtotal: data.subtotal || 0,
      overhead_percent: data.overhead_percent || 10,
      overhead_amount: data.overhead_amount || 0,
      profit_percent: data.profit_percent || 15,
      profit_amount: data.profit_amount || 0,
      taxable_amount: data.taxable_amount || 0,
      tax_percent: data.tax_percent || 0,
      tax_amount: data.tax_amount || 0,
      price_low: data.price_low || 0,
      price_likely: data.price_likely || 0,
      price_high: data.price_high || 0,
      geographic_pricing_id: data.geographic_pricing_id || null,
      geographic_adjustment: data.geographic_adjustment || 1,
      source_macro_id: data.source_macro_id || null,
      status: data.status || 'draft',
      is_superseded: data.is_superseded || false,
      internal_notes: data.internal_notes || null,
      customer_notes: data.customer_notes || null,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.detailedEstimates.set(id, estimate)
    return estimate
  }

  // Leads
  createLead(data: Partial<MockLead>): MockLead {
    const id = data.id || uuidv4()
    const lead: MockLead = {
      id,
      source: data.source || 'web_funnel',
      status: data.status || 'new',
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.leads.set(id, lead)
    return lead
  }

  getLead(id: string): MockLead | undefined {
    return this.leads.get(id)
  }

  reset(): void {
    this.lineItems.clear()
    this.macros.clear()
    this.macroLineItems.clear()
    this.geographicPricing.clear()
    this.roofSketches.clear()
    this.roofSlopes.clear()
    this.detailedEstimates.clear()
    this.leads.clear()
  }
}

export const apiTestDb = new ApiTestDatabase()

/**
 * Setup Supabase mock for API tests
 * This configures the mock client to use our test database
 */
export function setupSupabaseMock() {
  // The mock Supabase client in lib/mocks/supabase.ts will be used
  // We need to extend it for the new tables
  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => createMockSupabaseClientForApiTests()),
  }))
}

/**
 * Create a mock Supabase client that uses our API test database
 */
export function createMockSupabaseClientForApiTests() {
  return {
    from: (table: string) => createMockQueryBuilder(table),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}

function createMockQueryBuilder(table: string) {
  let filters: Array<{ column: string; value: unknown; operator: string }> = []
  let selectQuery = '*'
  let orderBy: Array<{ column: string; ascending: boolean }> = []
  let insertData: unknown = null
  let updateData: unknown = null
  let isDelete = false
  let isSingle = false
  let containsFilter: { column: string; value: unknown[] } | null = null

  const builder = {
    select: (query?: string) => {
      selectQuery = query || '*'
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
    delete: () => {
      isDelete = true
      return builder
    },
    eq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'eq' })
      return builder
    },
    neq: (column: string, value: unknown) => {
      filters.push({ column, value, operator: 'neq' })
      return builder
    },
    or: (query: string) => {
      // Simple or parsing for testing
      return builder
    },
    contains: (column: string, value: unknown[]) => {
      containsFilter = { column, value }
      return builder
    },
    order: (column: string, opts?: { ascending?: boolean }) => {
      orderBy.push({ column, ascending: opts?.ascending ?? true })
      return builder
    },
    single: () => {
      isSingle = true
      return builder
    },
    then: async (resolve: (value: unknown) => void) => {
      const result = await executeQuery(
        table,
        filters,
        insertData,
        updateData,
        isDelete,
        isSingle,
        containsFilter
      )
      return resolve(result)
    },
  }

  return builder
}

async function executeQuery(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  insertData: unknown,
  updateData: unknown,
  isDelete: boolean,
  isSingle: boolean,
  containsFilter: { column: string; value: unknown[] } | null
): Promise<{ data: unknown; error: unknown; count?: number }> {
  // Handle insert
  if (insertData) {
    return handleInsert(table, insertData)
  }

  // Handle update
  if (updateData) {
    return handleUpdate(table, filters, updateData, isSingle)
  }

  // Handle delete
  if (isDelete) {
    return handleDelete(table, filters)
  }

  // Handle select
  return handleSelect(table, filters, isSingle, containsFilter)
}

function handleInsert(table: string, data: unknown): { data: unknown; error: unknown } {
  switch (table) {
    case 'line_items': {
      const existing = apiTestDb.getLineItemByCode((data as MockLineItem).item_code)
      if (existing) {
        return { data: null, error: { code: '23505', message: 'Duplicate' } }
      }
      const item = apiTestDb.createLineItem(data as Partial<MockLineItem>)
      return { data: item, error: null }
    }
    case 'estimate_macros': {
      const macro = apiTestDb.createMacro(data as Partial<MockMacro>)
      return { data: macro, error: null }
    }
    case 'macro_line_items': {
      const existing = Array.from(apiTestDb.macroLineItems.values()).find(
        (mli) =>
          mli.macro_id === (data as MockMacroLineItem).macro_id &&
          mli.line_item_id === (data as MockMacroLineItem).line_item_id
      )
      if (existing) {
        return { data: null, error: { code: '23505', message: 'Duplicate' } }
      }
      const mli = apiTestDb.addMacroLineItem(data as Partial<MockMacroLineItem>)
      return { data: { ...mli, line_item: apiTestDb.getLineItem(mli.line_item_id) }, error: null }
    }
    case 'geographic_pricing': {
      const region = apiTestDb.createGeographicPricing(data as Partial<MockGeographicPricing>)
      return { data: region, error: null }
    }
    case 'roof_sketches': {
      const sketch = apiTestDb.createRoofSketch(data as Partial<MockRoofSketch>)
      return { data: sketch, error: null }
    }
    case 'roof_slopes': {
      const existingSlope = Array.from(apiTestDb.roofSlopes.values()).find(
        (s) =>
          s.sketch_id === (data as MockRoofSlope).sketch_id &&
          s.slope_number === (data as MockRoofSlope).slope_number
      )
      if (existingSlope) {
        return { data: null, error: { code: '23505', message: 'Duplicate slope number' } }
      }
      const slope = apiTestDb.createRoofSlope(data as Partial<MockRoofSlope>)
      return { data: slope, error: null }
    }
    case 'detailed_estimates': {
      const estimate = apiTestDb.createDetailedEstimate(data as Partial<MockDetailedEstimate>)
      return { data: estimate, error: null }
    }
    default:
      return { data: null, error: { message: `Unknown table: ${table}` } }
  }
}

function handleUpdate(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  data: unknown,
  isSingle: boolean
): { data: unknown; error: unknown } {
  const idFilter = filters.find((f) => f.column === 'id')
  const id = idFilter?.value as string

  switch (table) {
    case 'line_items': {
      if (!id) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const existing = apiTestDb.getLineItem(id)
      if (!existing) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      // Check for duplicate item_code
      if ((data as Partial<MockLineItem>).item_code) {
        const codeMatch = apiTestDb.getLineItemByCode((data as Partial<MockLineItem>).item_code!)
        if (codeMatch && codeMatch.id !== id) {
          return { data: null, error: { code: '23505', message: 'Duplicate' } }
        }
      }
      const updated = apiTestDb.updateLineItem(id, data as Partial<MockLineItem>)
      return { data: updated, error: null }
    }
    case 'estimate_macros': {
      if (!id) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const existing = apiTestDb.getMacro(id)
      if (!existing) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const updated = apiTestDb.updateMacro(id, data as Partial<MockMacro>)
      return { data: updated, error: null }
    }
    case 'geographic_pricing': {
      const regionIdFilter = filters.find((f) => f.column === 'id')
      const regionId = regionIdFilter?.value as string
      if (!regionId) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const existing = apiTestDb.getGeographicPricing(regionId)
      if (!existing) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const updated = apiTestDb.updateGeographicPricing(regionId, data as Partial<MockGeographicPricing>)
      return { data: updated, error: null }
    }
    case 'roof_sketches': {
      const leadIdFilter = filters.find((f) => f.column === 'lead_id')
      const leadId = leadIdFilter?.value as string
      const sketch = leadId ? apiTestDb.getRoofSketchByLeadId(leadId) : null
      if (!sketch) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const updated = { ...sketch, ...(data as Partial<MockRoofSketch>), updated_at: new Date().toISOString() }
      apiTestDb.roofSketches.set(sketch.id, updated)
      const slopes = Array.from(apiTestDb.roofSlopes.values()).filter((s) => s.sketch_id === sketch.id)
      return { data: { ...updated, slopes }, error: null }
    }
    case 'roof_slopes': {
      const slopeIdFilter = filters.find((f) => f.column === 'id')
      const slopeId = slopeIdFilter?.value as string
      const slope = slopeId ? apiTestDb.roofSlopes.get(slopeId) : null
      if (!slope) return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
      const updated = { ...slope, ...(data as Partial<MockRoofSlope>), updated_at: new Date().toISOString() }
      apiTestDb.roofSlopes.set(slope.id, updated)
      return { data: updated, error: null }
    }
    default:
      return { data: null, error: { message: `Unknown table: ${table}` } }
  }
}

function handleDelete(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>
): { data: unknown; error: unknown } {
  const idFilter = filters.find((f) => f.column === 'id')
  const id = idFilter?.value as string

  switch (table) {
    case 'line_items': {
      if (!id) return { data: null, error: null }
      apiTestDb.lineItems.delete(id)
      return { data: null, error: null }
    }
    case 'estimate_macros': {
      if (!id) return { data: null, error: null }
      apiTestDb.macros.delete(id)
      return { data: null, error: null }
    }
    case 'geographic_pricing': {
      if (!id) return { data: null, error: null }
      apiTestDb.geographicPricing.delete(id)
      return { data: null, error: null }
    }
    case 'roof_slopes': {
      if (!id) return { data: null, error: null }
      apiTestDb.roofSlopes.delete(id)
      return { data: null, error: null }
    }
    default:
      return { data: null, error: null }
  }
}

function handleSelect(
  table: string,
  filters: Array<{ column: string; value: unknown; operator: string }>,
  isSingle: boolean,
  containsFilter: { column: string; value: unknown[] } | null
): { data: unknown; error: unknown; count?: number } {
  let data: unknown[] = []

  switch (table) {
    case 'line_items':
      data = Array.from(apiTestDb.lineItems.values())
      break
    case 'estimate_macros':
      data = Array.from(apiTestDb.macros.values())
      break
    case 'macro_line_items': {
      const items = Array.from(apiTestDb.macroLineItems.values())
      data = items.map((mli) => ({
        ...mli,
        line_item: apiTestDb.getLineItem(mli.line_item_id),
      }))
      break
    }
    case 'geographic_pricing':
      data = Array.from(apiTestDb.geographicPricing.values())
      break
    case 'roof_sketches': {
      const sketches = Array.from(apiTestDb.roofSketches.values())
      data = sketches.map((sketch) => ({
        ...sketch,
        slopes: Array.from(apiTestDb.roofSlopes.values()).filter((s) => s.sketch_id === sketch.id),
      }))
      break
    }
    case 'roof_slopes':
      data = Array.from(apiTestDb.roofSlopes.values())
      break
    case 'detailed_estimates':
      data = Array.from(apiTestDb.detailedEstimates.values())
      break
    case 'leads':
      data = Array.from(apiTestDb.leads.values())
      break
    default:
      return { data: isSingle ? null : [], error: null }
  }

  // Apply filters
  for (const filter of filters) {
    data = data.filter((item) => {
      const val = (item as Record<string, unknown>)[filter.column]
      if (filter.operator === 'eq') return val === filter.value
      if (filter.operator === 'neq') return val !== filter.value
      return true
    })
  }

  // Apply contains filter
  if (containsFilter) {
    data = data.filter((item) => {
      const arr = (item as Record<string, unknown>)[containsFilter.column] as unknown[]
      if (!Array.isArray(arr)) return false
      return containsFilter.value.some((v) => arr.includes(v))
    })
  }

  if (isSingle) {
    if (data.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
    }
    return { data: data[0], error: null }
  }

  return { data, error: null, count: data.length }
}
