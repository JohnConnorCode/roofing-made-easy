/**
 * Type definitions for progress billing, change orders, and lien waivers
 */

import type { JobStatus } from './types'

// ============================================
// Billing Schedule
// ============================================

export interface BillingSchedule {
  id: string
  job_id: string
  milestone_name: string
  percentage: number
  amount: number
  trigger_status: JobStatus
  invoice_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  invoice?: {
    id: string
    invoice_number: string
    status: string
    total: number
    balance_due: number
  }
}

export interface BillingMilestone {
  milestone_name: string
  percentage: number
  trigger_status: JobStatus
}

export interface BillingTemplate {
  name: string
  milestones: BillingMilestone[]
}

export const BILLING_TEMPLATES: BillingTemplate[] = [
  {
    name: 'Standard (30/50/20)',
    milestones: [
      { milestone_name: 'Deposit', percentage: 30, trigger_status: 'materials_ordered' },
      { milestone_name: 'Progress', percentage: 50, trigger_status: 'in_progress' },
      { milestone_name: 'Final', percentage: 20, trigger_status: 'completed' },
    ],
  },
  {
    name: '50/50',
    milestones: [
      { milestone_name: 'Deposit', percentage: 50, trigger_status: 'materials_ordered' },
      { milestone_name: 'Final', percentage: 50, trigger_status: 'completed' },
    ],
  },
]

// ============================================
// Change Orders
// ============================================

export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected'

export interface ChangeOrder {
  id: string
  job_id: string
  change_order_number: string
  description: string
  reason: string | null
  cost_delta: number
  status: ChangeOrderStatus
  approved_by: string | null
  approved_at: string | null
  customer_approved: boolean
  customer_approved_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  approved_by_user?: { first_name: string | null; last_name: string | null }
  created_by_user?: { first_name: string | null; last_name: string | null }
}

// ============================================
// Lien Waivers
// ============================================

export type LienWaiverType = 'conditional' | 'unconditional'
export type LienWaiverStatus = 'draft' | 'sent' | 'signed'

export interface LienWaiver {
  id: string
  job_id: string
  invoice_payment_id: string | null
  invoice_id: string | null
  waiver_type: LienWaiverType
  status: LienWaiverStatus
  through_date: string
  amount: number
  claimant_name: string | null
  owner_name: string | null
  property_description: string | null
  pdf_path: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  invoice?: { id: string; invoice_number: string }
  created_by_user?: { first_name: string | null; last_name: string | null }
}

// ============================================
// Payment Methods
// ============================================

export type PaymentMethod = 'check' | 'cash' | 'bank_transfer' | 'credit_card' | 'stripe'
