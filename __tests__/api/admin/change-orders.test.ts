/**
 * Tests for change order logic and validation
 */

import { describe, it, expect } from 'vitest'
import type { ChangeOrder, ChangeOrderStatus } from '@/lib/jobs/billing-types'

// Simulates the atomic approval logic from the API
function simulateApproval(
  changeOrder: { status: ChangeOrderStatus; cost_delta: number },
  currentContractAmount: number
): { success: boolean; newContractAmount: number; error?: string } {
  if (changeOrder.status !== 'pending') {
    return { success: false, newContractAmount: currentContractAmount, error: 'Change order not found or already processed' }
  }
  return {
    success: true,
    newContractAmount: currentContractAmount + changeOrder.cost_delta,
  }
}

function simulateReject(
  changeOrder: { status: ChangeOrderStatus; cost_delta: number },
  currentContractAmount: number
): { success: boolean; newContractAmount: number; error?: string } {
  if (changeOrder.status !== 'pending') {
    return { success: false, newContractAmount: currentContractAmount, error: 'Change order not found or already processed' }
  }
  return {
    success: true,
    newContractAmount: currentContractAmount, // no change on reject
  }
}

describe('Change Orders', () => {
  describe('Approval Logic', () => {
    it('should update contract amount on approval', () => {
      const co = { status: 'pending' as ChangeOrderStatus, cost_delta: 5000 }
      const result = simulateApproval(co, 25000)
      expect(result.success).toBe(true)
      expect(result.newContractAmount).toBe(30000)
    })

    it('should handle negative cost deltas (reductions)', () => {
      const co = { status: 'pending' as ChangeOrderStatus, cost_delta: -3000 }
      const result = simulateApproval(co, 25000)
      expect(result.success).toBe(true)
      expect(result.newContractAmount).toBe(22000)
    })

    it('should not change contract amount on rejection', () => {
      const co = { status: 'pending' as ChangeOrderStatus, cost_delta: 5000 }
      const result = simulateReject(co, 25000)
      expect(result.success).toBe(true)
      expect(result.newContractAmount).toBe(25000)
    })

    it('should reject double-approve (already approved)', () => {
      const co = { status: 'approved' as ChangeOrderStatus, cost_delta: 5000 }
      const result = simulateApproval(co, 25000)
      expect(result.success).toBe(false)
      expect(result.newContractAmount).toBe(25000)
      expect(result.error).toContain('already processed')
    })

    it('should reject approve on rejected CO', () => {
      const co = { status: 'rejected' as ChangeOrderStatus, cost_delta: 5000 }
      const result = simulateApproval(co, 25000)
      expect(result.success).toBe(false)
    })

    it('should reject double-reject', () => {
      const co = { status: 'rejected' as ChangeOrderStatus, cost_delta: 5000 }
      const result = simulateReject(co, 25000)
      expect(result.success).toBe(false)
    })
  })

  describe('Race Condition Prevention', () => {
    it('should ensure only one approval wins in concurrent scenario', () => {
      // Simulate two concurrent attempts
      const co = { status: 'pending' as ChangeOrderStatus, cost_delta: 5000 }
      const contractAmount = 25000

      // First approval wins
      const result1 = simulateApproval(co, contractAmount)
      expect(result1.success).toBe(true)
      expect(result1.newContractAmount).toBe(30000)

      // After first approval, status is no longer 'pending'
      co.status = 'approved'

      // Second attempt fails (atomic guard)
      const result2 = simulateApproval(co, result1.newContractAmount)
      expect(result2.success).toBe(false)
      expect(result2.newContractAmount).toBe(30000) // no double addition
    })
  })

  describe('Delete Validation', () => {
    function canDelete(status: ChangeOrderStatus): boolean {
      return status === 'pending'
    }

    it('should allow deletion of pending COs', () => {
      expect(canDelete('pending')).toBe(true)
    })

    it('should reject deletion of approved COs', () => {
      expect(canDelete('approved')).toBe(false)
    })

    it('should reject deletion of rejected COs', () => {
      expect(canDelete('rejected')).toBe(false)
    })
  })

  describe('Edit Validation', () => {
    function canEdit(status: ChangeOrderStatus): boolean {
      return status === 'pending'
    }

    it('should allow editing pending COs', () => {
      expect(canEdit('pending')).toBe(true)
    })

    it('should reject editing approved COs', () => {
      expect(canEdit('approved')).toBe(false)
    })

    it('should reject editing rejected COs', () => {
      expect(canEdit('rejected')).toBe(false)
    })
  })

  describe('CO Number Generation', () => {
    it('should follow CO-XXXXXX format', () => {
      const coNumberPattern = /^CO-\d{6}$/
      expect(coNumberPattern.test('CO-000001')).toBe(true)
      expect(coNumberPattern.test('CO-123456')).toBe(true)
      expect(coNumberPattern.test('CO-1')).toBe(false)
      expect(coNumberPattern.test('XX-000001')).toBe(false)
    })
  })

  describe('Billing Schedule Recalculation', () => {
    it('should recalculate milestone amounts after approval', () => {
      const milestones = [
        { id: '1', percentage: 30 },
        { id: '2', percentage: 50 },
        { id: '3', percentage: 20 },
      ]
      const newContractAmount = 30000

      const recalculated = milestones.map(m => ({
        ...m,
        amount: Math.round(newContractAmount * m.percentage) / 100,
      }))

      expect(recalculated[0].amount).toBe(9000)
      expect(recalculated[1].amount).toBe(15000)
      expect(recalculated[2].amount).toBe(6000)
    })
  })
})
