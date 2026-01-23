/**
 * Tests for mock Supabase client
 * These test the mock database operations that power the API
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mockDb } from '@/lib/mocks/database'
import { mockSupabase } from '@/lib/mocks/supabase'

describe('Mock Supabase Client', () => {
  beforeEach(() => {
    mockDb.reset()
  })

  describe('Leads Table', () => {
    it('should insert a lead', async () => {
      const { data, error } = await mockSupabase
        .from('leads')
        .insert({ source: 'web_funnel' })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBeDefined()
      expect(data.source).toBe('web_funnel')
      expect(data.status).toBe('new')
    })

    it('should select leads with filters', async () => {
      mockDb.createLead({ source: 'test1' })
      const lead2 = mockDb.createLead({ source: 'test2' })
      mockDb.updateLead(lead2.id, { status: 'contacted' })

      const { data, error } = await mockSupabase
        .from('leads')
        .select('*')
        .eq('status', 'contacted')

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data[0].status).toBe('contacted')
    })

    it('should update a lead', async () => {
      const lead = mockDb.createLead({ source: 'test' })

      const { data, error } = await mockSupabase
        .from('leads')
        .update({ status: 'qualified' })
        .eq('id', lead.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('qualified')
    })

    it('should order results', async () => {
      mockDb.createLead({ source: 'first' })
      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 10))
      mockDb.createLead({ source: 'second' })

      const { data } = await mockSupabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      expect(data[0].source).toBe('second')
    })

    it('should handle range/pagination', async () => {
      for (let i = 0; i < 5; i++) {
        mockDb.createLead({ source: `test_${i}` })
      }

      const { data, count } = await mockSupabase
        .from('leads')
        .select('*', { count: 'exact' })
        .range(0, 1) // First 2 items

      expect(data).toHaveLength(2)
      expect(count).toBe(5)
    })
  })

  describe('Contacts Table', () => {
    it('should update contact info', async () => {
      const lead = mockDb.createLead({ source: 'test' })

      const { data, error } = await mockSupabase
        .from('contacts')
        .update({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        })
        .eq('lead_id', lead.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.first_name).toBe('John')
    })
  })

  describe('Pricing Rules Table', () => {
    it('should have seeded pricing rules', async () => {
      const { data, error } = await mockSupabase.from('pricing_rules').select('*')

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThan(0)
    })

    it('should filter by category', async () => {
      const { data } = await mockSupabase
        .from('pricing_rules')
        .select('*')
        .eq('rule_category', 'material')

      expect(data.every((r: { rule_category: string }) => r.rule_category === 'material')).toBe(true)
    })

    it('should create a new rule', async () => {
      const { data, error } = await mockSupabase
        .from('pricing_rules')
        .insert({
          rule_key: 'custom_test',
          rule_category: 'custom',
          display_name: 'Custom Test Rule',
          base_rate: 100,
          is_active: true,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.rule_key).toBe('custom_test')
    })
  })

  describe('Storage Operations', () => {
    it('should upload a file', async () => {
      const content = Buffer.from('test file content')
      const { data, error } = await mockSupabase.storage
        .from('photos')
        .upload('test/file.txt', content, { contentType: 'text/plain' })

      expect(error).toBeNull()
      expect(data?.path).toBe('test/file.txt')
    })

    it('should create signed upload URL', async () => {
      const { data, error } = await mockSupabase.storage
        .from('photos')
        .createSignedUploadUrl('test/upload.jpg')

      expect(error).toBeNull()
      expect(data?.signedUrl).toContain('mock-storage.local')
      expect(data?.token).toBeDefined()
    })

    it('should get public URL', () => {
      const { data } = mockSupabase.storage.from('photos').getPublicUrl('test/image.jpg')

      expect(data.publicUrl).toContain('mock-storage.local/photos/test/image.jpg')
    })

    it('should download uploaded file', async () => {
      const content = Buffer.from('download test')
      await mockSupabase.storage.from('photos').upload('download/test.txt', content)

      const { data, error } = await mockSupabase.storage.from('photos').download('download/test.txt')

      expect(error).toBeNull()
      expect(data).toBeInstanceOf(Blob)
    })
  })

  describe('Auth Operations', () => {
    it('should sign in with email/password', async () => {
      const { data, error } = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe('test@example.com')
      expect(data.session?.access_token).toBeDefined()
    })

    it('should get current user after sign in', async () => {
      await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      const { data } = await mockSupabase.auth.getUser()
      expect(data.user?.email).toBe('test@example.com')
    })

    it('should sign out', async () => {
      await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      await mockSupabase.auth.signOut()

      const { data } = await mockSupabase.auth.getUser()
      expect(data.user).toBeNull()
    })
  })
})

describe('Database Operations', () => {
  beforeEach(() => {
    mockDb.reset()
  })

  describe('Lead with Relations', () => {
    it('should get lead with all relations', () => {
      const lead = mockDb.createLead({ source: 'web_funnel' })

      // Update contact and intake
      const updatedContact = mockDb.updateContact(lead.id, { first_name: 'Jane', email: 'jane@test.com' })
      const updatedIntake = mockDb.updateIntake(lead.id, { job_type: 'full_replacement', roof_size_sqft: 3000 })

      // Verify updates worked
      expect(updatedContact?.first_name).toBe('Jane')
      expect(updatedIntake?.job_type).toBe('full_replacement')

      const result = mockDb.getLeadWithRelations(lead.id)

      expect(result).not.toBeNull()
      expect(result?.lead.source).toBe('web_funnel')
      expect(result?.contacts.length).toBeGreaterThan(0)
      expect(result?.intakes.length).toBeGreaterThan(0)
      // Check the actual data - contact fields should be updated
      const contact = result?.contacts[0]
      const intake = result?.intakes[0]
      expect(contact?.first_name).toBe('Jane')
      expect(intake?.job_type).toBe('full_replacement')
    })
  })

  describe('Uploads', () => {
    it('should create upload record', () => {
      const lead = mockDb.createLead({ source: 'test' })

      const upload = mockDb.createUpload({
        lead_id: lead.id,
        storage_path: 'leads/test/photo.jpg',
        original_filename: 'photo.jpg',
        content_type: 'image/jpeg',
        file_size: 1024000,
        status: 'uploaded',
      })

      expect(upload.id).toBeDefined()
      expect(upload.storage_path).toBe('leads/test/photo.jpg')
    })

    it('should get uploads by lead', () => {
      const lead = mockDb.createLead({ source: 'test' })

      mockDb.createUpload({
        lead_id: lead.id,
        storage_path: 'photo1.jpg',
        original_filename: 'photo1.jpg',
        content_type: 'image/jpeg',
        status: 'uploaded',
      })

      mockDb.createUpload({
        lead_id: lead.id,
        storage_path: 'photo2.jpg',
        original_filename: 'photo2.jpg',
        content_type: 'image/jpeg',
        status: 'uploaded',
      })

      const uploads = mockDb.getUploadsByLead(lead.id)
      expect(uploads).toHaveLength(2)
    })
  })

  describe('Estimates', () => {
    it('should create and retrieve estimate', () => {
      const lead = mockDb.createLead({ source: 'test' })

      mockDb.createEstimate({
        lead_id: lead.id,
        price_low: 5000,
        price_likely: 7500,
        price_high: 10000,
        ai_explanation: 'Test explanation',
      })

      const estimate = mockDb.getEstimate(lead.id)

      expect(estimate).toBeDefined()
      expect(estimate?.price_likely).toBe(7500)
      expect(estimate?.ai_explanation).toBe('Test explanation')
    })
  })
})
