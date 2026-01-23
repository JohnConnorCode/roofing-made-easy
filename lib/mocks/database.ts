/**
 * In-memory database for mock mode
 * Provides realistic data storage that persists during a session
 */

import { v4 as uuidv4 } from 'uuid'

// Type definitions matching the database schema
export interface MockLead {
  id: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost'
  current_step: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referrer_url?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
}

export interface MockContact {
  id: string
  lead_id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  preferred_contact_method?: 'phone' | 'email' | 'text'
  consent_marketing: boolean
  consent_sms: boolean
  consent_terms: boolean
  created_at: string
  updated_at: string
}

export interface MockProperty {
  id: string
  lead_id: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  county?: string
  formatted_address?: string
  place_id?: string
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface MockIntake {
  id: string
  lead_id: string
  job_type?: string
  job_description?: string
  roof_material?: string
  roof_age_years?: number
  roof_size_sqft?: number
  stories?: number
  roof_pitch?: string
  has_skylights: boolean
  has_chimneys: boolean
  has_solar_panels: boolean
  visible_issues?: string[]
  issues_description?: string
  timeline_urgency?: string
  has_insurance_claim: boolean
  insurance_company?: string
  claim_number?: string
  created_at: string
  updated_at: string
}

export interface MockUpload {
  id: string
  lead_id: string
  storage_path: string
  original_filename: string
  content_type: string
  file_size?: number
  status: 'pending' | 'uploaded' | 'analyzed' | 'failed'
  ai_analysis?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MockEstimate {
  id: string
  lead_id: string
  price_low: number
  price_likely: number
  price_high: number
  pricing_snapshot?: Record<string, unknown>
  ai_explanation?: string
  adjustments?: Array<{ name: string; impact: number; description: string }>
  created_at: string
  updated_at: string
}

export interface MockPricingRule {
  id: string
  rule_key: string
  rule_category: string
  display_name: string
  description?: string
  base_rate?: number
  unit?: string
  multiplier?: number
  flat_fee?: number
  min_charge?: number
  max_charge?: number
  conditions?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MockAiOutput {
  id: string
  lead_id?: string
  upload_id?: string
  provider: string
  operation: string
  input_data: Record<string, unknown>
  output_data?: Record<string, unknown>
  latency_ms: number
  success: boolean
  error_message?: string
  model?: string
  created_at: string
}

// In-memory storage
class MockDatabase {
  leads: Map<string, MockLead> = new Map()
  contacts: Map<string, MockContact> = new Map()
  properties: Map<string, MockProperty> = new Map()
  intakes: Map<string, MockIntake> = new Map()
  uploads: Map<string, MockUpload> = new Map()
  estimates: Map<string, MockEstimate> = new Map()
  pricing_rules: Map<string, MockPricingRule> = new Map()
  ai_outputs: Map<string, MockAiOutput> = new Map()

  constructor() {
    this.seedPricingRules()
  }

  private now(): string {
    return new Date().toISOString()
  }

  // Seed default pricing rules
  private seedPricingRules(): void {
    const defaultRules: Omit<MockPricingRule, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        rule_key: 'base_sqft',
        rule_category: 'base',
        display_name: 'Base Rate per Sq Ft',
        description: 'Standard rate per square foot for roofing work',
        base_rate: 4.5,
        unit: 'sqft',
        is_active: true,
      },
      {
        rule_key: 'material_asphalt',
        rule_category: 'material',
        display_name: 'Asphalt Shingles',
        multiplier: 1.0,
        is_active: true,
      },
      {
        rule_key: 'material_metal',
        rule_category: 'material',
        display_name: 'Metal Roofing',
        multiplier: 2.5,
        is_active: true,
      },
      {
        rule_key: 'material_tile',
        rule_category: 'material',
        display_name: 'Tile Roofing',
        multiplier: 3.0,
        is_active: true,
      },
      {
        rule_key: 'material_slate',
        rule_category: 'material',
        display_name: 'Slate Roofing',
        multiplier: 4.0,
        is_active: true,
      },
      {
        rule_key: 'pitch_flat',
        rule_category: 'pitch',
        display_name: 'Flat Roof',
        multiplier: 0.9,
        is_active: true,
      },
      {
        rule_key: 'pitch_low',
        rule_category: 'pitch',
        display_name: 'Low Pitch',
        multiplier: 1.0,
        is_active: true,
      },
      {
        rule_key: 'pitch_moderate',
        rule_category: 'pitch',
        display_name: 'Moderate Pitch',
        multiplier: 1.1,
        is_active: true,
      },
      {
        rule_key: 'pitch_steep',
        rule_category: 'pitch',
        display_name: 'Steep Pitch',
        multiplier: 1.3,
        is_active: true,
      },
      {
        rule_key: 'pitch_very_steep',
        rule_category: 'pitch',
        display_name: 'Very Steep Pitch',
        multiplier: 1.5,
        is_active: true,
      },
      {
        rule_key: 'stories_1',
        rule_category: 'stories',
        display_name: '1 Story',
        multiplier: 1.0,
        is_active: true,
      },
      {
        rule_key: 'stories_2',
        rule_category: 'stories',
        display_name: '2 Stories',
        multiplier: 1.15,
        is_active: true,
      },
      {
        rule_key: 'stories_3',
        rule_category: 'stories',
        display_name: '3+ Stories',
        multiplier: 1.35,
        is_active: true,
      },
      {
        rule_key: 'urgency_emergency',
        rule_category: 'urgency',
        display_name: 'Emergency',
        multiplier: 1.5,
        is_active: true,
      },
      {
        rule_key: 'urgency_within_week',
        rule_category: 'urgency',
        display_name: 'Within a Week',
        multiplier: 1.2,
        is_active: true,
      },
      {
        rule_key: 'urgency_within_month',
        rule_category: 'urgency',
        display_name: 'Within a Month',
        multiplier: 1.0,
        is_active: true,
      },
      {
        rule_key: 'urgency_flexible',
        rule_category: 'urgency',
        display_name: 'Flexible Timeline',
        multiplier: 0.95,
        is_active: true,
      },
      {
        rule_key: 'feature_skylight',
        rule_category: 'feature',
        display_name: 'Skylight',
        flat_fee: 250,
        is_active: true,
      },
      {
        rule_key: 'feature_chimney',
        rule_category: 'feature',
        display_name: 'Chimney',
        flat_fee: 350,
        is_active: true,
      },
      {
        rule_key: 'feature_solar',
        rule_category: 'feature',
        display_name: 'Solar Panel Removal/Reinstall',
        flat_fee: 1500,
        is_active: true,
      },
      {
        rule_key: 'issue_leaks',
        rule_category: 'issue',
        display_name: 'Active Leaks',
        flat_fee: 500,
        is_active: true,
      },
      {
        rule_key: 'issue_structural',
        rule_category: 'issue',
        display_name: 'Structural Damage',
        flat_fee: 2000,
        is_active: true,
      },
    ]

    defaultRules.forEach((rule) => {
      const id = uuidv4()
      this.pricing_rules.set(id, {
        ...rule,
        id,
        created_at: this.now(),
        updated_at: this.now(),
      })
    })
  }

  // Lead operations
  createLead(data: Partial<MockLead>): MockLead {
    const id = uuidv4()
    const lead: MockLead = {
      id,
      source: data.source || 'web_funnel',
      status: 'new',
      current_step: 1,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      referrer_url: data.referrer_url,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.leads.set(id, lead)

    // Create related records - use same ID for map key and object id
    const contactId = uuidv4()
    this.contacts.set(contactId, {
      id: contactId,
      lead_id: id,
      consent_marketing: false,
      consent_sms: false,
      consent_terms: false,
      created_at: this.now(),
      updated_at: this.now(),
    })

    const propertyId = uuidv4()
    this.properties.set(propertyId, {
      id: propertyId,
      lead_id: id,
      created_at: this.now(),
      updated_at: this.now(),
    })

    const intakeId = uuidv4()
    this.intakes.set(intakeId, {
      id: intakeId,
      lead_id: id,
      has_skylights: false,
      has_chimneys: false,
      has_solar_panels: false,
      has_insurance_claim: false,
      created_at: this.now(),
      updated_at: this.now(),
    })

    return lead
  }

  getLead(id: string): MockLead | undefined {
    return this.leads.get(id)
  }

  getLeadWithRelations(id: string): {
    lead: MockLead
    contacts: MockContact[]
    properties: MockProperty[]
    intakes: MockIntake[]
    uploads: MockUpload[]
    estimates: MockEstimate[]
  } | null {
    const lead = this.leads.get(id)
    if (!lead) return null

    return {
      lead,
      contacts: Array.from(this.contacts.values()).filter((c) => c.lead_id === id),
      properties: Array.from(this.properties.values()).filter((p) => p.lead_id === id),
      intakes: Array.from(this.intakes.values()).filter((i) => i.lead_id === id),
      uploads: Array.from(this.uploads.values()).filter((u) => u.lead_id === id),
      estimates: Array.from(this.estimates.values()).filter((e) => e.lead_id === id),
    }
  }

  updateLead(id: string, data: Partial<MockLead>): MockLead | null {
    const lead = this.leads.get(id)
    if (!lead) return null

    const updated = { ...lead, ...data, updated_at: this.now() }
    this.leads.set(id, updated)
    return updated
  }

  listLeads(filters?: { status?: string; limit?: number; offset?: number }): {
    leads: Array<MockLead & { contacts: MockContact[]; properties: MockProperty[] }>
    total: number
  } {
    let leads = Array.from(this.leads.values())

    if (filters?.status) {
      leads = leads.filter((l) => l.status === filters.status)
    }

    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = leads.length
    const offset = filters?.offset || 0
    const limit = filters?.limit || 50

    leads = leads.slice(offset, offset + limit)

    return {
      leads: leads.map((lead) => ({
        ...lead,
        contacts: Array.from(this.contacts.values()).filter((c) => c.lead_id === lead.id),
        properties: Array.from(this.properties.values()).filter((p) => p.lead_id === lead.id),
      })),
      total,
    }
  }

  // Contact operations
  updateContact(leadId: string, data: Partial<MockContact>): MockContact | null {
    const contact = Array.from(this.contacts.values()).find((c) => c.lead_id === leadId)
    if (!contact) return null

    const updated = { ...contact, ...data, updated_at: this.now() }
    this.contacts.set(contact.id, updated)
    return updated
  }

  // Property operations
  updateProperty(leadId: string, data: Partial<MockProperty>): MockProperty | null {
    const property = Array.from(this.properties.values()).find((p) => p.lead_id === leadId)
    if (!property) return null

    const updated = { ...property, ...data, updated_at: this.now() }
    this.properties.set(property.id, updated)
    return updated
  }

  // Intake operations
  updateIntake(leadId: string, data: Partial<MockIntake>): MockIntake | null {
    const intake = Array.from(this.intakes.values()).find((i) => i.lead_id === leadId)
    if (!intake) return null

    const updated = { ...intake, ...data, updated_at: this.now() }
    this.intakes.set(intake.id, updated)
    return updated
  }

  getIntake(leadId: string): MockIntake | undefined {
    return Array.from(this.intakes.values()).find((i) => i.lead_id === leadId)
  }

  // Upload operations
  createUpload(data: Omit<MockUpload, 'id' | 'created_at' | 'updated_at'>): MockUpload {
    const id = uuidv4()
    const upload: MockUpload = {
      ...data,
      id,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.uploads.set(id, upload)
    return upload
  }

  updateUpload(id: string, data: Partial<MockUpload>): MockUpload | null {
    const upload = this.uploads.get(id)
    if (!upload) return null

    const updated = { ...upload, ...data, updated_at: this.now() }
    this.uploads.set(id, updated)
    return updated
  }

  getUploadsByLead(leadId: string): MockUpload[] {
    return Array.from(this.uploads.values()).filter((u) => u.lead_id === leadId)
  }

  // Estimate operations
  createEstimate(data: Omit<MockEstimate, 'id' | 'created_at' | 'updated_at'>): MockEstimate {
    const id = uuidv4()
    const estimate: MockEstimate = {
      ...data,
      id,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.estimates.set(id, estimate)
    return estimate
  }

  getEstimate(leadId: string): MockEstimate | undefined {
    return Array.from(this.estimates.values()).find((e) => e.lead_id === leadId)
  }

  // Pricing rules operations
  getPricingRules(filters?: { category?: string; active?: boolean }): MockPricingRule[] {
    let rules = Array.from(this.pricing_rules.values())

    if (filters?.category) {
      rules = rules.filter((r) => r.rule_category === filters.category)
    }
    if (filters?.active !== undefined) {
      rules = rules.filter((r) => r.is_active === filters.active)
    }

    return rules.sort((a, b) => {
      if (a.rule_category !== b.rule_category) {
        return a.rule_category.localeCompare(b.rule_category)
      }
      return a.rule_key.localeCompare(b.rule_key)
    })
  }

  createPricingRule(
    data: Omit<MockPricingRule, 'id' | 'created_at' | 'updated_at'>
  ): MockPricingRule {
    const id = uuidv4()
    const rule: MockPricingRule = {
      ...data,
      id,
      created_at: this.now(),
      updated_at: this.now(),
    }
    this.pricing_rules.set(id, rule)
    return rule
  }

  updatePricingRule(id: string, data: Partial<MockPricingRule>): MockPricingRule | null {
    const rule = this.pricing_rules.get(id)
    if (!rule) return null

    const updated = { ...rule, ...data, updated_at: this.now() }
    this.pricing_rules.set(id, updated)
    return updated
  }

  // AI output logging
  logAiOutput(data: Omit<MockAiOutput, 'id' | 'created_at'>): MockAiOutput {
    const id = uuidv4()
    const output: MockAiOutput = {
      ...data,
      id,
      created_at: this.now(),
    }
    this.ai_outputs.set(id, output)
    return output
  }

  // Reset for testing
  reset(): void {
    this.leads.clear()
    this.contacts.clear()
    this.properties.clear()
    this.intakes.clear()
    this.uploads.clear()
    this.estimates.clear()
    this.pricing_rules.clear()
    this.ai_outputs.clear()
    this.seedPricingRules()
  }
}

// Singleton instance
export const mockDb = new MockDatabase()
