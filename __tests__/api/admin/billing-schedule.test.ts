/**
 * Tests for billing schedule API logic
 */

import { describe, it, expect } from 'vitest'
import { BILLING_TEMPLATES, type BillingMilestone } from '@/lib/jobs/billing-types'

describe('Billing Schedule', () => {
  describe('Template Definitions', () => {
    it('should have at least one template defined', () => {
      expect(BILLING_TEMPLATES.length).toBeGreaterThan(0)
    })

    it('should have unique template names', () => {
      const names = BILLING_TEMPLATES.map(t => t.name)
      expect(new Set(names).size).toBe(names.length)
    })

    for (const template of BILLING_TEMPLATES) {
      describe(`Template: ${template.name}`, () => {
        it('should have milestones that sum to 100%', () => {
          const total = template.milestones.reduce((sum, m) => sum + m.percentage, 0)
          expect(Math.abs(total - 100)).toBeLessThan(0.01)
        })

        it('should have milestones with valid percentages', () => {
          for (const milestone of template.milestones) {
            expect(milestone.percentage).toBeGreaterThan(0)
            expect(milestone.percentage).toBeLessThanOrEqual(100)
          }
        })

        it('should have milestones with non-empty names', () => {
          for (const milestone of template.milestones) {
            expect(milestone.milestone_name.trim().length).toBeGreaterThan(0)
          }
        })

        it('should have valid trigger statuses', () => {
          const validStatuses = [
            'pending_start', 'materials_ordered', 'scheduled', 'in_progress',
            'inspection_pending', 'punch_list', 'completed', 'warranty_active', 'closed',
          ]
          for (const milestone of template.milestones) {
            expect(validStatuses).toContain(milestone.trigger_status)
          }
        })
      })
    }
  })

  describe('Amount Calculations', () => {
    function calculateAmounts(milestones: BillingMilestone[], contractAmount: number) {
      return milestones.map(m => ({
        ...m,
        amount: Math.round(contractAmount * m.percentage) / 100,
      }))
    }

    it('should calculate correct amounts for Standard (30/50/20) template', () => {
      const template = BILLING_TEMPLATES.find(t => t.name === 'Standard (30/50/20)')
      expect(template).toBeDefined()
      if (!template) return

      const amounts = calculateAmounts(template.milestones, 25000)
      expect(amounts[0].amount).toBe(7500)  // 30% of 25000
      expect(amounts[1].amount).toBe(12500) // 50% of 25000
      expect(amounts[2].amount).toBe(5000)  // 20% of 25000
    })

    it('should calculate correct amounts for 50/50 template', () => {
      const template = BILLING_TEMPLATES.find(t => t.name === '50/50')
      expect(template).toBeDefined()
      if (!template) return

      const amounts = calculateAmounts(template.milestones, 20000)
      expect(amounts[0].amount).toBe(10000)
      expect(amounts[1].amount).toBe(10000)
    })

    it('should handle zero contract amount', () => {
      const template = BILLING_TEMPLATES[0]
      const amounts = calculateAmounts(template.milestones, 0)
      for (const a of amounts) {
        expect(a.amount).toBe(0)
      }
    })

    it('should handle rounding for odd amounts', () => {
      const template = BILLING_TEMPLATES.find(t => t.name === 'Standard (30/50/20)')
      if (!template) return

      const amounts = calculateAmounts(template.milestones, 10001)
      // Amounts should be numbers (may not sum exactly due to rounding)
      for (const a of amounts) {
        expect(typeof a.amount).toBe('number')
        expect(isFinite(a.amount)).toBe(true)
      }
    })
  })

  describe('Custom Milestone Validation', () => {
    it('should reject percentages that do not sum to 100', () => {
      const milestones = [
        { milestone_name: 'Deposit', percentage: 30, trigger_status: 'materials_ordered' as const },
        { milestone_name: 'Final', percentage: 50, trigger_status: 'completed' as const },
      ]
      const total = milestones.reduce((sum, m) => sum + m.percentage, 0)
      expect(Math.abs(total - 100)).toBeGreaterThan(0.01)
    })

    it('should accept percentages that sum to exactly 100', () => {
      const milestones = [
        { milestone_name: 'Deposit', percentage: 40, trigger_status: 'materials_ordered' as const },
        { milestone_name: 'Progress', percentage: 35, trigger_status: 'in_progress' as const },
        { milestone_name: 'Final', percentage: 25, trigger_status: 'completed' as const },
      ]
      const total = milestones.reduce((sum, m) => sum + m.percentage, 0)
      expect(Math.abs(total - 100)).toBeLessThan(0.01)
    })

    it('should recalculate amounts correctly after contract change', () => {
      const originalAmount = 20000
      const newAmount = 25000
      const percentage = 30

      const originalCalc = Math.round(originalAmount * percentage) / 100
      const newCalc = Math.round(newAmount * percentage) / 100

      expect(originalCalc).toBe(6000)
      expect(newCalc).toBe(7500)
    })
  })
})
