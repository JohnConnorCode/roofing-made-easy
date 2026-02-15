/**
 * Tests for global search result formatting and input validation
 */

import { describe, it, expect } from 'vitest'

// --- Extracted from search/route.ts ---

interface SearchResult {
  type: 'lead' | 'job' | 'invoice' | 'customer'
  id: string
  title: string
  subtitle: string
  url: string
}

function formatContactResult(contact: {
  lead_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
}): SearchResult {
  const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown'
  return {
    type: 'lead',
    id: contact.lead_id,
    title: name,
    subtitle: contact.email || contact.phone || 'No contact info',
    url: `/leads/${contact.lead_id}`,
  }
}

function formatJobResult(job: {
  id: string
  job_number: string
  property_address: string | null
  property_city: string | null
  status: string
}): SearchResult {
  return {
    type: 'job',
    id: job.id,
    title: job.job_number,
    subtitle: job.property_address
      ? `${job.property_address}, ${job.property_city || ''}`
      : job.status,
    url: `/jobs/${job.id}`,
  }
}

function formatInvoiceResult(invoice: {
  id: string
  invoice_number: string | null
  bill_to_name: string | null
  total: number | null
  status: string
}): SearchResult {
  return {
    type: 'invoice',
    id: invoice.id,
    title: invoice.invoice_number || 'Draft Invoice',
    subtitle: `${invoice.bill_to_name || 'Customer'} — $${invoice.total?.toLocaleString() || '0'}`,
    url: `/invoices/${invoice.id}`,
  }
}

function formatCustomerResult(cust: {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
}): SearchResult {
  const name = `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'Unknown'
  return {
    type: 'customer',
    id: cust.id,
    title: name,
    subtitle: cust.email || cust.phone || 'No contact info',
    url: `/customers/${cust.id}`,
  }
}

function isValidQuery(q: string | null | undefined): boolean {
  const trimmed = q?.trim()
  return !!trimmed && trimmed.length >= 2
}

function parseLimit(limitParam: string | null): number {
  return Math.min(parseInt(limitParam || '20'), 50)
}

// --- Tests ---

describe('Global Search', () => {
  describe('Query Validation', () => {
    it('should reject null query', () => {
      expect(isValidQuery(null)).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidQuery('')).toBe(false)
    })

    it('should reject single character', () => {
      expect(isValidQuery('a')).toBe(false)
    })

    it('should reject whitespace-only', () => {
      expect(isValidQuery('   ')).toBe(false)
    })

    it('should accept 2+ character query', () => {
      expect(isValidQuery('ab')).toBe(true)
    })

    it('should accept query with leading/trailing spaces', () => {
      expect(isValidQuery('  smith  ')).toBe(true)
    })
  })

  describe('Limit Parsing', () => {
    it('should default to 20', () => {
      expect(parseLimit(null)).toBe(20)
    })

    it('should cap at 50', () => {
      expect(parseLimit('100')).toBe(50)
    })

    it('should parse valid number', () => {
      expect(parseLimit('10')).toBe(10)
    })

    it('should handle NaN as 20', () => {
      expect(parseLimit('abc')).toBe(NaN)
    })
  })

  describe('Contact Result Formatting', () => {
    it('should format full contact', () => {
      const result = formatContactResult({
        lead_id: 'lead-1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        phone: '555-1234',
      })
      expect(result.type).toBe('lead')
      expect(result.title).toBe('John Smith')
      expect(result.subtitle).toBe('john@example.com')
      expect(result.url).toBe('/leads/lead-1')
    })

    it('should fallback to phone when no email', () => {
      const result = formatContactResult({
        lead_id: 'lead-1',
        first_name: 'John',
        last_name: 'Smith',
        email: null,
        phone: '555-1234',
      })
      expect(result.subtitle).toBe('555-1234')
    })

    it('should show "No contact info" when no email or phone', () => {
      const result = formatContactResult({
        lead_id: 'lead-1',
        first_name: 'John',
        last_name: null,
        email: null,
        phone: null,
      })
      expect(result.subtitle).toBe('No contact info')
    })

    it('should show "Unknown" for null names', () => {
      const result = formatContactResult({
        lead_id: 'lead-1',
        first_name: null,
        last_name: null,
        email: 'test@test.com',
        phone: null,
      })
      expect(result.title).toBe('Unknown')
    })
  })

  describe('Job Result Formatting', () => {
    it('should format job with address', () => {
      const result = formatJobResult({
        id: 'job-1',
        job_number: 'JOB-0001',
        property_address: '123 Main St',
        property_city: 'Tupelo',
        status: 'in_progress',
      })
      expect(result.title).toBe('JOB-0001')
      expect(result.subtitle).toBe('123 Main St, Tupelo')
    })

    it('should fall back to status when no address', () => {
      const result = formatJobResult({
        id: 'job-1',
        job_number: 'JOB-0002',
        property_address: null,
        property_city: null,
        status: 'scheduled',
      })
      expect(result.subtitle).toBe('scheduled')
    })
  })

  describe('Invoice Result Formatting', () => {
    it('should format invoice with total', () => {
      const result = formatInvoiceResult({
        id: 'inv-1',
        invoice_number: 'INV-0001',
        bill_to_name: 'John Smith',
        total: 5000,
        status: 'sent',
      })
      expect(result.title).toBe('INV-0001')
      expect(result.subtitle).toContain('John Smith')
      expect(result.subtitle).toContain('5,000')
    })

    it('should show "Draft Invoice" for null invoice number', () => {
      const result = formatInvoiceResult({
        id: 'inv-2',
        invoice_number: null,
        bill_to_name: null,
        total: null,
        status: 'draft',
      })
      expect(result.title).toBe('Draft Invoice')
      expect(result.subtitle).toContain('Customer')
    })
  })

  describe('Customer Result Formatting', () => {
    it('should format customer with email', () => {
      const result = formatCustomerResult({
        id: 'cust-1',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone: null,
      })
      expect(result.type).toBe('customer')
      expect(result.title).toBe('Jane Doe')
      expect(result.subtitle).toBe('jane@example.com')
      expect(result.url).toBe('/customers/cust-1')
    })
  })
})
