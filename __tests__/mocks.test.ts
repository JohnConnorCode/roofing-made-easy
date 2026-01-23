/**
 * Tests for the mock system
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mockDb } from '@/lib/mocks/database'
import { mockAiProvider } from '@/lib/mocks/ai'

describe('Mock Database', () => {
  beforeEach(() => {
    mockDb.reset()
  })

  describe('Leads', () => {
    it('should create a lead with default values', () => {
      const lead = mockDb.createLead({ source: 'web_funnel' })

      expect(lead.id).toBeDefined()
      expect(lead.source).toBe('web_funnel')
      expect(lead.status).toBe('new')
      expect(lead.current_step).toBe(1)
    })

    it('should create related records when creating a lead', () => {
      const lead = mockDb.createLead({ source: 'web_funnel' })

      const data = mockDb.getLeadWithRelations(lead.id)
      expect(data).not.toBeNull()
      expect(data!.contacts.length).toBe(1)
      expect(data!.properties.length).toBe(1)
      expect(data!.intakes.length).toBe(1)
    })

    it('should update lead status', () => {
      const lead = mockDb.createLead({})
      const updated = mockDb.updateLead(lead.id, { status: 'contacted' })

      expect(updated?.status).toBe('contacted')
    })

    it('should list leads with pagination', () => {
      // Create 5 leads
      for (let i = 0; i < 5; i++) {
        mockDb.createLead({ source: `test_${i}` })
      }

      const result = mockDb.listLeads({ limit: 2, offset: 0 })
      expect(result.leads.length).toBe(2)
      expect(result.total).toBe(5)
    })
  })

  describe('Contacts', () => {
    it('should update contact information', () => {
      const lead = mockDb.createLead({})
      const updated = mockDb.updateContact(lead.id, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      })

      expect(updated?.first_name).toBe('John')
      expect(updated?.last_name).toBe('Doe')
      expect(updated?.email).toBe('john@example.com')
    })
  })

  describe('Intakes', () => {
    it('should update intake data', () => {
      const lead = mockDb.createLead({})
      const updated = mockDb.updateIntake(lead.id, {
        job_type: 'full_replacement',
        roof_material: 'asphalt_shingle',
        roof_size_sqft: 2000,
      })

      expect(updated?.job_type).toBe('full_replacement')
      expect(updated?.roof_material).toBe('asphalt_shingle')
      expect(updated?.roof_size_sqft).toBe(2000)
    })
  })

  describe('Pricing Rules', () => {
    it('should have seeded pricing rules', () => {
      const rules = mockDb.getPricingRules()
      expect(rules.length).toBeGreaterThan(0)
    })

    it('should filter by category', () => {
      const materialRules = mockDb.getPricingRules({ category: 'material' })
      expect(materialRules.every((r) => r.rule_category === 'material')).toBe(true)
    })

    it('should filter by active status', () => {
      const activeRules = mockDb.getPricingRules({ active: true })
      expect(activeRules.every((r) => r.is_active === true)).toBe(true)
    })

    it('should update pricing rules', () => {
      const rules = mockDb.getPricingRules()
      const firstRule = rules[0]

      const updated = mockDb.updatePricingRule(firstRule.id, { base_rate: 5.0 })
      expect(updated?.base_rate).toBe(5.0)
    })
  })

  describe('Estimates', () => {
    it('should create an estimate', () => {
      const lead = mockDb.createLead({})
      const estimate = mockDb.createEstimate({
        lead_id: lead.id,
        price_low: 8000,
        price_likely: 10000,
        price_high: 12500,
      })

      expect(estimate.id).toBeDefined()
      expect(estimate.price_likely).toBe(10000)
    })

    it('should retrieve estimate by lead', () => {
      const lead = mockDb.createLead({})
      mockDb.createEstimate({
        lead_id: lead.id,
        price_low: 8000,
        price_likely: 10000,
        price_high: 12500,
      })

      const retrieved = mockDb.getEstimate(lead.id)
      expect(retrieved?.price_likely).toBe(10000)
    })
  })
})

describe('Mock AI Provider', () => {
  describe('analyzePhoto', () => {
    it('should return a valid photo analysis', async () => {
      const result = await mockAiProvider.analyzePhoto({
        imageUrl: 'https://example.com/roof.jpg',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.isRoofPhoto).toBe(true)
      expect(result.data!.confidence).toBeGreaterThan(0)
      expect(result.provider).toBe('mock')
    })
  })

  describe('generateExplanation', () => {
    it('should generate a reasonable explanation', async () => {
      const result = await mockAiProvider.generateExplanation({
        estimate: {
          priceLow: 8000,
          priceLikely: 10000,
          priceHigh: 12500,
        },
        intake: {
          jobType: 'full_replacement',
          roofMaterial: 'asphalt_shingle',
          roofSizeSqft: 2000,
        },
        adjustments: [
          { name: 'Material', impact: 500, description: 'Standard asphalt' },
        ],
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBeGreaterThan(50)
    })
  })

  describe('analyzeIntake', () => {
    it('should analyze intake and return lead quality', async () => {
      const result = await mockAiProvider.analyzeIntake({
        jobType: 'full_replacement',
        timelineUrgency: 'emergency',
        issues: ['leaks', 'damaged_shingles'],
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.leadQuality).toBe('hot')
      expect(result.data!.urgencyScore).toBeGreaterThanOrEqual(8)
    })

    it('should identify cold leads with flexible timeline', async () => {
      const result = await mockAiProvider.analyzeIntake({
        jobType: 'inspection',
        timelineUrgency: 'flexible',
      })

      expect(result.success).toBe(true)
      expect(result.data!.leadQuality).toBe('cold')
      expect(result.data!.urgencyScore).toBeLessThanOrEqual(5)
    })
  })

  describe('generateInternalNotes', () => {
    it('should generate internal notes for sales team', async () => {
      const result = await mockAiProvider.generateInternalNotes({
        intake: {
          jobType: 'full_replacement',
          roofSizeSqft: 2500,
          hasInsuranceClaim: true,
        },
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
        },
        intakeAnalysis: {
          leadQuality: 'hot',
          urgencyScore: 9,
          complexity: 'moderate',
          suggestedFollowUp: 'Call immediately',
          redFlags: [],
          opportunities: ['Insurance claim'],
        },
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toContain('HOT')
    })
  })
})
