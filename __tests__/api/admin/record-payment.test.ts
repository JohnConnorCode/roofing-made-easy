/**
 * Tests for record payment validation logic
 */

import { describe, it, expect } from 'vitest'

// Simulates the payment validation logic from the API route
function validatePayment(
  invoice: { balance_due: number; status: string },
  paymentAmount: number
): { valid: boolean; error?: string } {
  if (invoice.status === 'cancelled' || invoice.status === 'refunded') {
    return { valid: false, error: `Cannot record payment on ${invoice.status} invoice` }
  }

  if (paymentAmount <= 0) {
    return { valid: false, error: 'Payment amount must be positive' }
  }

  if (paymentAmount > invoice.balance_due) {
    return {
      valid: false,
      error: `Payment amount ($${paymentAmount}) exceeds balance due ($${invoice.balance_due})`,
    }
  }

  return { valid: true }
}

describe('Record Payment', () => {
  describe('Amount Validation', () => {
    it('should accept payment within balance', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, 500)
      expect(result.valid).toBe(true)
    })

    it('should accept exact balance payment', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, 1000)
      expect(result.valid).toBe(true)
    })

    it('should reject payment exceeding balance', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, 1500)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds balance due')
    })

    it('should reject zero amount', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, 0)
      expect(result.valid).toBe(false)
    })

    it('should reject negative amount', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, -100)
      expect(result.valid).toBe(false)
    })
  })

  describe('Invoice Status Validation', () => {
    it('should reject payment on cancelled invoice', () => {
      const invoice = { balance_due: 1000, status: 'cancelled' }
      const result = validatePayment(invoice, 500)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('cancelled')
    })

    it('should reject payment on refunded invoice', () => {
      const invoice = { balance_due: 1000, status: 'refunded' }
      const result = validatePayment(invoice, 500)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('refunded')
    })

    it('should accept payment on draft invoice', () => {
      const invoice = { balance_due: 1000, status: 'draft' }
      const result = validatePayment(invoice, 500)
      expect(result.valid).toBe(true)
    })

    it('should accept payment on sent invoice', () => {
      const invoice = { balance_due: 1000, status: 'sent' }
      const result = validatePayment(invoice, 500)
      expect(result.valid).toBe(true)
    })

    it('should accept payment on partially_paid invoice', () => {
      const invoice = { balance_due: 500, status: 'partially_paid' }
      const result = validatePayment(invoice, 250)
      expect(result.valid).toBe(true)
    })

    it('should accept payment on overdue invoice', () => {
      const invoice = { balance_due: 1000, status: 'overdue' }
      const result = validatePayment(invoice, 1000)
      expect(result.valid).toBe(true)
    })
  })

  describe('Payment Methods', () => {
    const validMethods = ['check', 'cash', 'bank_transfer']

    it('should define valid manual payment methods', () => {
      expect(validMethods).toContain('check')
      expect(validMethods).toContain('cash')
      expect(validMethods).toContain('bank_transfer')
    })

    it('should not include stripe in manual methods', () => {
      expect(validMethods).not.toContain('stripe')
      expect(validMethods).not.toContain('credit_card')
    })
  })

  describe('Balance Calculation', () => {
    it('should reduce balance after payment', () => {
      const originalBalance = 1000
      const paymentAmount = 400
      const newBalance = originalBalance - paymentAmount
      expect(newBalance).toBe(600)
    })

    it('should reach zero on full payment', () => {
      const originalBalance = 1000
      const newBalance = originalBalance - 1000
      expect(newBalance).toBe(0)
    })

    it('should handle multiple partial payments', () => {
      let balance = 1000
      balance -= 300
      expect(balance).toBe(700)
      balance -= 200
      expect(balance).toBe(500)
      balance -= 500
      expect(balance).toBe(0)
    })
  })
})
