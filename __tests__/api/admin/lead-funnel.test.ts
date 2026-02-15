/**
 * Tests for lead funnel report computation
 */

import { describe, it, expect } from 'vitest'

// --- Extracted from lead-funnel/route.ts ---

const FUNNEL_ORDER = [
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'estimate_sent',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived',
]

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  intake_started: 'Intake Started',
  intake_complete: 'Intake Complete',
  estimate_generated: 'Estimate Generated',
  estimate_sent: 'Estimate Sent',
  consultation_scheduled: 'Consultation Scheduled',
  quote_sent: 'Quote Sent',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
}

function buildFunnel(leads: Array<{ status: string }>) {
  const counts: Record<string, number> = {}
  for (const row of leads) {
    counts[row.status] = (counts[row.status] || 0) + 1
  }

  const funnel = FUNNEL_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status] || status,
    count: counts[status] || 0,
  }))

  const totalLeads = leads.length
  const wonCount = counts['won'] || 0
  const conversionRate =
    totalLeads > 0 ? Math.round(((wonCount / totalLeads) * 100) * 10) / 10 : 0

  return {
    funnel,
    summary: { totalLeads, wonCount, conversionRate },
  }
}

// --- Tests ---

describe('Lead Funnel Report', () => {
  it('should count leads by status in funnel order', () => {
    const leads = [
      { status: 'new' },
      { status: 'new' },
      { status: 'estimate_sent' },
      { status: 'won' },
    ]
    const result = buildFunnel(leads)

    expect(result.funnel[0]).toEqual({ status: 'new', label: 'New', count: 2 })
    expect(result.funnel[4]).toEqual({ status: 'estimate_sent', label: 'Estimate Sent', count: 1 })
    expect(result.funnel[7]).toEqual({ status: 'won', label: 'Won', count: 1 })
  })

  it('should show zero for statuses with no leads', () => {
    const leads = [{ status: 'new' }]
    const result = buildFunnel(leads)

    expect(result.funnel[1].count).toBe(0) // intake_started
    expect(result.funnel[7].count).toBe(0) // won
  })

  it('should calculate conversion rate', () => {
    const leads = [
      { status: 'won' },
      { status: 'won' },
      { status: 'lost' },
      { status: 'new' },
      { status: 'new' },
      { status: 'new' },
      { status: 'new' },
      { status: 'new' },
      { status: 'new' },
      { status: 'new' },
    ]
    const result = buildFunnel(leads)

    expect(result.summary.totalLeads).toBe(10)
    expect(result.summary.wonCount).toBe(2)
    expect(result.summary.conversionRate).toBe(20)
  })

  it('should handle zero leads', () => {
    const result = buildFunnel([])

    expect(result.summary.totalLeads).toBe(0)
    expect(result.summary.wonCount).toBe(0)
    expect(result.summary.conversionRate).toBe(0)
    // All funnel items should be zero
    for (const item of result.funnel) {
      expect(item.count).toBe(0)
    }
  })

  it('should handle unknown statuses gracefully', () => {
    const leads = [
      { status: 'new' },
      { status: 'some_unknown_status' },
    ]
    const result = buildFunnel(leads)

    // Unknown status counted in total but not in any funnel bucket
    expect(result.summary.totalLeads).toBe(2)
    expect(result.funnel[0].count).toBe(1) // new
  })

  it('should maintain correct funnel ordering', () => {
    const result = buildFunnel([])
    const statuses = result.funnel.map((f) => f.status)

    expect(statuses).toEqual(FUNNEL_ORDER)
  })

  it('should have labels for all funnel statuses', () => {
    const result = buildFunnel([])

    for (const item of result.funnel) {
      expect(item.label).toBeDefined()
      expect(item.label.length).toBeGreaterThan(0)
    }
  })

  it('should round conversion rate to 1 decimal', () => {
    // 1 won out of 3 = 33.333...%
    const leads = [
      { status: 'won' },
      { status: 'lost' },
      { status: 'new' },
    ]
    const result = buildFunnel(leads)
    expect(result.summary.conversionRate).toBe(33.3)
  })

  it('should calculate 100% conversion when all leads won', () => {
    const leads = [
      { status: 'won' },
      { status: 'won' },
    ]
    const result = buildFunnel(leads)
    expect(result.summary.conversionRate).toBe(100)
  })
})
