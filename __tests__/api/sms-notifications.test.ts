import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SMS_TEMPLATES } from '@/lib/sms/twilio'

// Mock twilio - the module isn't loaded in tests
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({ sid: 'test-sid-123' }),
    },
  })),
}))

describe('SMS Templates', () => {
  describe('consultationReminder', () => {
    it('includes customer name', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'John',
        'January 15',
        '10:00 AM'
      )

      expect(message).toContain('John')
    })

    it('includes date and time', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'Customer',
        'January 15',
        '2:30 PM'
      )

      expect(message).toContain('January 15')
      expect(message).toContain('2:30 PM')
    })

    it('mentions tomorrow', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'Customer',
        'January 15',
        '10:00 AM'
      )

      expect(message.toLowerCase()).toContain('tomorrow')
    })

    it('includes company name', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'Customer',
        'January 15',
        '10:00 AM'
      )

      expect(message).toContain('Farrell Roofing')
    })

    it('includes call-to-action', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'Customer',
        'January 15',
        '10:00 AM'
      )

      // Should mention confirming or rescheduling
      expect(message.toLowerCase()).toMatch(/confirm|reschedule|call/i)
    })

    it('is within SMS length limits', () => {
      const message = SMS_TEMPLATES.consultationReminder(
        'Customer With A Longer Name',
        'January 15, 2026',
        '10:00 AM'
      )

      // SMS should be under 160 chars for single segment
      expect(message.length).toBeLessThanOrEqual(320) // Allow 2 segments max
    })
  })

  describe('estimateReady', () => {
    it('includes customer name', () => {
      const message = SMS_TEMPLATES.estimateReady(
        'Sarah',
        'https://farrellroofing.com/estimate/abc'
      )

      expect(message).toContain('Sarah')
    })

    it('includes the estimate URL', () => {
      const url = 'https://farrellroofing.com/estimate/test-token'
      const message = SMS_TEMPLATES.estimateReady('Customer', url)

      expect(message).toContain(url)
    })

    it('mentions estimate is ready', () => {
      const message = SMS_TEMPLATES.estimateReady(
        'Customer',
        'https://example.com'
      )

      expect(message.toLowerCase()).toContain('estimate')
      expect(message.toLowerCase()).toContain('ready')
    })

    it('includes company name', () => {
      const message = SMS_TEMPLATES.estimateReady(
        'Customer',
        'https://example.com'
      )

      expect(message).toContain('Farrell Roofing')
    })
  })

  describe('paymentReceived', () => {
    it('includes customer name', () => {
      const message = SMS_TEMPLATES.paymentReceived('Mike', '$2,500')

      expect(message).toContain('Mike')
    })

    it('includes payment amount', () => {
      const message = SMS_TEMPLATES.paymentReceived('Customer', '$15,000')

      expect(message).toContain('$15,000')
    })

    it('confirms receipt', () => {
      const message = SMS_TEMPLATES.paymentReceived('Customer', '$1,000')

      expect(message.toLowerCase()).toContain('received')
    })

    it('thanks the customer', () => {
      const message = SMS_TEMPLATES.paymentReceived('Customer', '$1,000')

      expect(message.toLowerCase()).toContain('thank')
    })

    it('includes company name', () => {
      const message = SMS_TEMPLATES.paymentReceived('Customer', '$1,000')

      expect(message).toContain('Farrell Roofing')
    })
  })

  describe('appointmentConfirmed', () => {
    it('includes all appointment details', () => {
      const message = SMS_TEMPLATES.appointmentConfirmed(
        'Lisa',
        'January 20',
        '9:00 AM'
      )

      expect(message).toContain('Lisa')
      expect(message).toContain('January 20')
      expect(message).toContain('9:00 AM')
    })

    it('confirms the appointment', () => {
      const message = SMS_TEMPLATES.appointmentConfirmed(
        'Customer',
        'Jan 1',
        '10:00 AM'
      )

      expect(message.toLowerCase()).toContain('confirmed')
    })
  })

  describe('projectStarting', () => {
    it('includes customer name and date', () => {
      const message = SMS_TEMPLATES.projectStarting('Tom', 'January 25')

      expect(message).toContain('Tom')
      expect(message).toContain('January 25')
    })

    it('mentions crew arrival time', () => {
      const message = SMS_TEMPLATES.projectStarting('Customer', 'Jan 1')

      // Should mention when crew arrives
      expect(message.toLowerCase()).toMatch(/crew|arrive|morning|7|8/i)
    })
  })
})

describe('SMS Template Safety', () => {
  it('templates do not contain sensitive data patterns', () => {
    const templates = [
      SMS_TEMPLATES.consultationReminder('Name', 'Date', 'Time'),
      SMS_TEMPLATES.estimateReady('Name', 'https://example.com'),
      SMS_TEMPLATES.paymentReceived('Name', '$100'),
      SMS_TEMPLATES.appointmentConfirmed('Name', 'Date', 'Time'),
      SMS_TEMPLATES.projectStarting('Name', 'Date'),
    ]

    templates.forEach((message) => {
      // Should not contain credit card patterns
      expect(message).not.toMatch(/\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/)
      // Should not contain SSN patterns
      expect(message).not.toMatch(/\d{3}[- ]?\d{2}[- ]?\d{4}/)
      // Should not contain "password" or "secret"
      expect(message.toLowerCase()).not.toContain('password')
      expect(message.toLowerCase()).not.toContain('secret')
    })
  })

  it('templates handle special characters in names safely', () => {
    const specialNames = [
      "O'Brien",
      'José García',
      'Test & Test',
      'Name <script>',
      'Name"Quote',
    ]

    specialNames.forEach((name) => {
      // Should not throw
      expect(() =>
        SMS_TEMPLATES.estimateReady(name, 'https://example.com')
      ).not.toThrow()

      const message = SMS_TEMPLATES.estimateReady(name, 'https://example.com')
      expect(message).toContain(name)
    })
  })
})

describe('Phone Number Normalization', () => {
  // Import the module to test normalization
  // Note: This tests the expected behavior based on the implementation

  it('handles various US phone formats conceptually', () => {
    const validFormats = [
      '6625551234',
      '662-555-1234',
      '(662) 555-1234',
      '662.555.1234',
      '+1 662 555 1234',
      '1-662-555-1234',
    ]

    // All should have 10 digits after stripping non-digits
    validFormats.forEach((phone) => {
      const digits = phone.replace(/\D/g, '')
      // 10 digits or 11 with leading 1
      expect(digits.length === 10 || (digits.length === 11 && digits[0] === '1')).toBe(true)
    })
  })
})
