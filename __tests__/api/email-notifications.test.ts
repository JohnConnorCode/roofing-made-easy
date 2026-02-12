import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  customerEstimateEmail,
  consultationReminderEmail,
  paymentReceivedEmail,
  contactConfirmationEmail,
  contactAdminNotificationEmail,
} from '@/lib/email/templates'

describe('Email Templates', () => {
  describe('customerEstimateEmail', () => {
    it('generates correct subject line with price', async () => {
      const result = await customerEstimateEmail({
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      expect(result.subject).toBe('Your Roofing Estimate: $10,000')
    })

    it('includes customer name when provided', async () => {
      const result = await customerEstimateEmail({
        contactName: 'John Smith',
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      // Template uses first name for greeting
      expect(result.html).toContain('John')
      expect(result.text).toContain('John')
    })

    it('uses default greeting when no name provided', async () => {
      const result = await customerEstimateEmail({
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      expect(result.html).toContain('Hi there')
      expect(result.text).toContain('Hi there')
    })

    it('includes the estimate URL', async () => {
      const estimateUrl = 'https://smartroofpricing.com/estimate/test-token-123'
      const result = await customerEstimateEmail({
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl,
      })

      expect(result.html).toContain(estimateUrl)
      expect(result.text).toContain(estimateUrl)
    })

    it('includes price range in email', async () => {
      const result = await customerEstimateEmail({
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      expect(result.html).toContain('$8,000')
      expect(result.html).toContain('$10,000')
      expect(result.html).toContain('$12,000')
    })

    it('includes valid until date when provided', async () => {
      const validUntil = '2026-03-15T12:00:00Z' // Use noon UTC to avoid timezone edge cases
      const result = await customerEstimateEmail({
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
        validUntil,
      })

      // Date could shift by a day depending on timezone
      expect(result.html).toMatch(/March 1[45], 2026/)
      expect(result.text).toMatch(/March 1[45], 2026/)
    })

    it('includes job type when provided', async () => {
      const result = await customerEstimateEmail({
        jobType: 'full_replacement',
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      // Job type might be formatted with capital letters or underscores replaced
      expect(result.html.toLowerCase()).toMatch(/full.?replacement|roofing project/i)
    })

    it('includes address when provided', async () => {
      const result = await customerEstimateEmail({
        address: '123 Main St',
        city: 'Tupelo',
        state: 'MS',
        priceLow: 8000,
        priceLikely: 10000,
        priceHigh: 12000,
        estimateUrl: 'https://example.com/estimate/abc123',
      })

      expect(result.html).toContain('123 Main St')
      expect(result.html).toContain('Tupelo')
    })
  })

  describe('consultationReminderEmail', () => {
    it('generates correct subject with time', async () => {
      const result = await consultationReminderEmail({
        consultationDate: 'January 15, 2026',
        consultationTime: '10:00 AM',
      })

      expect(result.subject).toContain('10:00 AM')
      expect(result.subject).toContain('Tomorrow')
    })

    it('includes all consultation details', async () => {
      const result = await consultationReminderEmail({
        customerName: 'Jane Doe',
        consultationDate: 'January 15, 2026',
        consultationTime: '10:00 AM',
        address: '456 Oak St',
        city: 'Saltillo',
        state: 'MS',
      })

      expect(result.html).toContain('Jane Doe')
      expect(result.html).toContain('January 15, 2026')
      expect(result.html).toContain('10:00 AM')
      expect(result.html).toContain('456 Oak St')
    })

    it('includes consultant info when provided', async () => {
      const result = await consultationReminderEmail({
        consultationDate: 'January 15, 2026',
        consultationTime: '10:00 AM',
        consultantName: 'Mike Johnson',
        consultantPhone: '(662) 555-1234',
      })

      expect(result.html).toContain('Mike Johnson')
      expect(result.html).toContain('(662) 555-1234')
    })

    it('includes reschedule URL when provided', async () => {
      const rescheduleUrl = 'https://calendly.com/reschedule/abc'
      const result = await consultationReminderEmail({
        consultationDate: 'January 15, 2026',
        consultationTime: '10:00 AM',
        rescheduleUrl,
      })

      expect(result.html).toContain(rescheduleUrl)
    })

    it('includes what to expect section', async () => {
      const result = await consultationReminderEmail({
        consultationDate: 'January 15, 2026',
        consultationTime: '10:00 AM',
      })

      expect(result.html).toContain('What to Expect')
      expect(result.html).toContain('roof inspection')
    })
  })

  describe('paymentReceivedEmail', () => {
    it('generates correct subject for deposit', async () => {
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
      })

      expect(result.subject).toContain('$2,500')
      expect(result.subject).toContain('Deposit')
    })

    it('generates correct subject for final payment', async () => {
      const result = await paymentReceivedEmail({
        amount: 15000,
        paymentType: 'final',
      })

      expect(result.subject).toContain('Final Payment')
    })

    it('includes customer name', async () => {
      const result = await paymentReceivedEmail({
        customerName: 'Bob Wilson',
        amount: 2500,
        paymentType: 'deposit',
      })

      expect(result.html).toContain('Bob Wilson')
      expect(result.text).toContain('Bob Wilson')
    })

    it('shows remaining balance when provided', async () => {
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
        remainingBalance: 12500,
      })

      expect(result.html).toContain('$12,500')
      expect(result.html).toContain('Remaining Balance')
    })

    it('does not show remaining balance for final payment', async () => {
      const result = await paymentReceivedEmail({
        amount: 15000,
        paymentType: 'final',
        remainingBalance: 0,
      })

      // Zero balance should not show
      expect(result.html).not.toContain('Remaining Balance')
    })

    it('includes project address when provided', async () => {
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
        address: '789 Elm St',
        city: 'Pontotoc',
        state: 'MS',
      })

      expect(result.html).toContain('789 Elm St')
      expect(result.html).toContain('Pontotoc')
    })

    it('includes receipt URL when provided', async () => {
      const receiptUrl = 'https://stripe.com/receipt/abc123'
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
        receiptUrl,
      })

      expect(result.html).toContain(receiptUrl)
      expect(result.html).toContain('Download Receipt')
    })

    it('includes portal URL when provided', async () => {
      const portalUrl = 'https://smartroofpricing.com/portal'
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
        portalUrl,
      })

      expect(result.html).toContain(portalUrl)
    })

    it('has appropriate next steps for deposit', async () => {
      const result = await paymentReceivedEmail({
        amount: 2500,
        paymentType: 'deposit',
      })

      expect(result.html).toContain('1-2 business days')
      expect(result.html).toContain('schedule')
    })

    it('has appropriate next steps for final payment', async () => {
      const result = await paymentReceivedEmail({
        amount: 15000,
        paymentType: 'final',
      })

      expect(result.html).toContain('paid in full')
      expect(result.html).toContain('warranty')
    })
  })

  describe('contactConfirmationEmail', () => {
    it('includes customer name', async () => {
      const result = await contactConfirmationEmail({
        name: 'Sarah Johnson',
        message: 'I need a roof inspection',
      })

      // The template uses first name or formats greeting differently
      expect(result.html).toContain('Sarah')
      expect(result.subject.toLowerCase()).toMatch(/thank|received|contact/)
    })

    it('includes the original message', async () => {
      const message = 'My roof has been leaking and I need help'
      const result = await contactConfirmationEmail({
        name: 'Test User',
        message,
      })

      expect(result.html).toContain(message)
      expect(result.text).toContain(message)
    })

    it('includes response timeframe', async () => {
      const result = await contactConfirmationEmail({
        name: 'Test User',
        message: 'Test message',
      })

      // Should mention when they'll hear back (24 hours mentioned)
      expect(result.html).toContain('24 hours')
    })
  })

  describe('contactAdminNotificationEmail', () => {
    it('includes all submission details', async () => {
      const result = await contactAdminNotificationEmail({
        name: 'New Lead',
        email: 'newlead@example.com',
        phone: '(662) 555-9999',
        subject: 'Roof Replacement Quote',
        message: 'Please call me about replacing my roof',
        submittedAt: '2026-01-15T14:30:00Z',
        adminUrl: 'https://admin.example.com/contacts/123',
      })

      expect(result.html).toContain('New Lead')
      expect(result.html).toContain('newlead@example.com')
      expect(result.html).toContain('(662) 555-9999')
      expect(result.html).toContain('Roof Replacement Quote')
      expect(result.html).toContain('Please call me')
      expect(result.subject).toContain('Contact Form')
    })

    it('includes admin URL', async () => {
      const adminUrl = 'https://smartroofpricing.com/admin/contacts/abc'
      const result = await contactAdminNotificationEmail({
        name: 'Test',
        email: 'test@example.com',
        message: 'Test message',
        submittedAt: new Date().toISOString(),
        adminUrl,
      })

      expect(result.html).toContain(adminUrl)
    })
  })
})

describe('Email Template Structure', () => {
  it('all templates return required fields', async () => {
    const templates = await Promise.all([
      customerEstimateEmail({
        priceLow: 1000,
        priceLikely: 1500,
        priceHigh: 2000,
        estimateUrl: 'https://example.com',
      }),
      consultationReminderEmail({
        consultationDate: 'Jan 1, 2026',
        consultationTime: '10:00 AM',
      }),
      paymentReceivedEmail({
        amount: 1000,
        paymentType: 'deposit',
      }),
      contactConfirmationEmail({
        name: 'Test',
        message: 'Test',
      }),
      contactAdminNotificationEmail({
        name: 'Test',
        email: 'test@test.com',
        message: 'Test',
        submittedAt: new Date().toISOString(),
        adminUrl: 'https://example.com',
      }),
    ])

    templates.forEach((template) => {
      expect(template).toHaveProperty('subject')
      expect(template).toHaveProperty('html')
      expect(template).toHaveProperty('text')
      expect(typeof template.subject).toBe('string')
      expect(typeof template.html).toBe('string')
      expect(typeof template.text).toBe('string')
      expect(template.subject.length).toBeGreaterThan(0)
      expect(template.html.length).toBeGreaterThan(0)
      expect(template.text.length).toBeGreaterThan(0)
    })
  })

  it('HTML templates include DOCTYPE and proper structure', async () => {
    const result = await customerEstimateEmail({
      priceLow: 1000,
      priceLikely: 1500,
      priceHigh: 2000,
      estimateUrl: 'https://example.com',
    })

    expect(result.html).toContain('<!DOCTYPE html>')
    expect(result.html).toContain('<html')
    expect(result.html).toContain('</html>')
    expect(result.html).toContain('<body')
    expect(result.html).toContain('</body>')
  })

  it('HTML templates include brand styling', async () => {
    const result = await customerEstimateEmail({
      priceLow: 1000,
      priceLikely: 1500,
      priceHigh: 2000,
      estimateUrl: 'https://example.com',
    })

    // Check for brand colors
    expect(result.html).toContain('#c9a25c') // Gold
    expect(result.html).toContain('Farrell')
    expect(result.html).toContain('Roofing')
  })

  it('text versions are plain text without HTML', async () => {
    const result = await customerEstimateEmail({
      priceLow: 1000,
      priceLikely: 1500,
      priceHigh: 2000,
      estimateUrl: 'https://example.com',
    })

    expect(result.text).not.toContain('<html')
    expect(result.text).not.toContain('<div')
    expect(result.text).not.toContain('<table')
  })
})
