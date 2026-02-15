/**
 * Tests for report aggregation logic
 *
 * Tests the pure computation/aggregation helpers that the report
 * API routes depend on: AR aging bucket classification and
 * revenue aggregation by team.
 */

import { describe, it, expect } from 'vitest'

// --- AR Aging bucket logic (extracted from the API route pattern) ---

type AgingBucket = 'current' | '1_30' | '31_60' | '61_90' | '90_plus'

function classifyAgingBucket(daysOutstanding: number): AgingBucket {
  if (daysOutstanding <= 0) return 'current'
  if (daysOutstanding <= 30) return '1_30'
  if (daysOutstanding <= 60) return '31_60'
  if (daysOutstanding <= 90) return '61_90'
  return '90_plus'
}

function aggregateArBuckets(
  invoices: Array<{ amount_due: number; due_date: string }>
): Record<AgingBucket, number> {
  const now = new Date()
  const buckets: Record<AgingBucket, number> = {
    current: 0,
    '1_30': 0,
    '31_60': 0,
    '61_90': 0,
    '90_plus': 0,
  }

  for (const inv of invoices) {
    const due = new Date(inv.due_date)
    const daysOutstanding = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    const bucket = classifyAgingBucket(daysOutstanding)
    buckets[bucket] += inv.amount_due
  }

  return buckets
}

// --- Revenue aggregation logic ---

interface TeamRevenue {
  teamId: string
  teamName: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

function aggregateTeamRevenue(
  jobs: Array<{
    team_id: string
    team_name: string
    contract_amount: number
    total_expenses: number
  }>
): TeamRevenue[] {
  const map = new Map<string, TeamRevenue>()

  for (const job of jobs) {
    const existing = map.get(job.team_id)
    if (existing) {
      existing.revenue += job.contract_amount
      existing.expenses += job.total_expenses
      existing.profit = existing.revenue - existing.expenses
      existing.margin = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0
    } else {
      const profit = job.contract_amount - job.total_expenses
      map.set(job.team_id, {
        teamId: job.team_id,
        teamName: job.team_name,
        revenue: job.contract_amount,
        expenses: job.total_expenses,
        profit,
        margin: job.contract_amount > 0 ? (profit / job.contract_amount) * 100 : 0,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

describe('AR Aging Bucket Classification', () => {
  it('should classify current invoices (not yet due)', () => {
    expect(classifyAgingBucket(-5)).toBe('current')
    expect(classifyAgingBucket(0)).toBe('current')
  })

  it('should classify 1-30 day invoices', () => {
    expect(classifyAgingBucket(1)).toBe('1_30')
    expect(classifyAgingBucket(15)).toBe('1_30')
    expect(classifyAgingBucket(30)).toBe('1_30')
  })

  it('should classify 31-60 day invoices', () => {
    expect(classifyAgingBucket(31)).toBe('31_60')
    expect(classifyAgingBucket(45)).toBe('31_60')
    expect(classifyAgingBucket(60)).toBe('31_60')
  })

  it('should classify 61-90 day invoices', () => {
    expect(classifyAgingBucket(61)).toBe('61_90')
    expect(classifyAgingBucket(75)).toBe('61_90')
    expect(classifyAgingBucket(90)).toBe('61_90')
  })

  it('should classify 90+ day invoices', () => {
    expect(classifyAgingBucket(91)).toBe('90_plus')
    expect(classifyAgingBucket(180)).toBe('90_plus')
    expect(classifyAgingBucket(365)).toBe('90_plus')
  })
})

describe('AR Aging Aggregation', () => {
  it('should aggregate invoices into correct buckets', () => {
    const now = new Date()

    const invoices = [
      { amount_due: 1000, due_date: new Date(now.getTime() + 86400000).toISOString() }, // future = current
      { amount_due: 2000, due_date: new Date(now.getTime() - 15 * 86400000).toISOString() }, // 15 days ago = 1_30
      { amount_due: 3000, due_date: new Date(now.getTime() - 45 * 86400000).toISOString() }, // 45 days ago = 31_60
      { amount_due: 4000, due_date: new Date(now.getTime() - 75 * 86400000).toISOString() }, // 75 days ago = 61_90
      { amount_due: 5000, due_date: new Date(now.getTime() - 120 * 86400000).toISOString() }, // 120 days ago = 90_plus
    ]

    const result = aggregateArBuckets(invoices)

    expect(result.current).toBe(1000)
    expect(result['1_30']).toBe(2000)
    expect(result['31_60']).toBe(3000)
    expect(result['61_90']).toBe(4000)
    expect(result['90_plus']).toBe(5000)
  })

  it('should return zeros for empty invoices', () => {
    const result = aggregateArBuckets([])
    expect(result.current).toBe(0)
    expect(result['1_30']).toBe(0)
    expect(result['31_60']).toBe(0)
    expect(result['61_90']).toBe(0)
    expect(result['90_plus']).toBe(0)
  })

  it('should sum multiple invoices in the same bucket', () => {
    const now = new Date()
    const invoices = [
      { amount_due: 500, due_date: new Date(now.getTime() - 10 * 86400000).toISOString() },
      { amount_due: 750, due_date: new Date(now.getTime() - 20 * 86400000).toISOString() },
    ]

    const result = aggregateArBuckets(invoices)
    expect(result['1_30']).toBe(1250)
  })
})

describe('Team Revenue Aggregation', () => {
  it('should aggregate revenue by team', () => {
    const jobs = [
      { team_id: 'team-1', team_name: 'Alpha', contract_amount: 10000, total_expenses: 6000 },
      { team_id: 'team-1', team_name: 'Alpha', contract_amount: 15000, total_expenses: 9000 },
      { team_id: 'team-2', team_name: 'Beta', contract_amount: 8000, total_expenses: 5000 },
    ]

    const result = aggregateTeamRevenue(jobs)

    expect(result).toHaveLength(2)

    // Sorted by revenue descending, so Alpha first
    expect(result[0].teamId).toBe('team-1')
    expect(result[0].revenue).toBe(25000)
    expect(result[0].expenses).toBe(15000)
    expect(result[0].profit).toBe(10000)
    expect(result[0].margin).toBe(40) // 10000/25000 * 100

    expect(result[1].teamId).toBe('team-2')
    expect(result[1].revenue).toBe(8000)
    expect(result[1].expenses).toBe(5000)
    expect(result[1].profit).toBe(3000)
    expect(result[1].margin).toBe(37.5) // 3000/8000 * 100
  })

  it('should return empty array for no jobs', () => {
    const result = aggregateTeamRevenue([])
    expect(result).toEqual([])
  })

  it('should handle zero revenue gracefully', () => {
    const jobs = [
      { team_id: 'team-1', team_name: 'Alpha', contract_amount: 0, total_expenses: 0 },
    ]

    const result = aggregateTeamRevenue(jobs)
    expect(result[0].margin).toBe(0)
  })

  it('should handle negative profit (over-budget)', () => {
    const jobs = [
      { team_id: 'team-1', team_name: 'Alpha', contract_amount: 10000, total_expenses: 12000 },
    ]

    const result = aggregateTeamRevenue(jobs)
    expect(result[0].profit).toBe(-2000)
    expect(result[0].margin).toBe(-20) // -2000/10000 * 100
  })

  it('should sort teams by revenue descending', () => {
    const jobs = [
      { team_id: 'team-a', team_name: 'Small Team', contract_amount: 5000, total_expenses: 3000 },
      { team_id: 'team-b', team_name: 'Big Team', contract_amount: 50000, total_expenses: 30000 },
      { team_id: 'team-c', team_name: 'Mid Team', contract_amount: 20000, total_expenses: 12000 },
    ]

    const result = aggregateTeamRevenue(jobs)
    expect(result[0].teamName).toBe('Big Team')
    expect(result[1].teamName).toBe('Mid Team')
    expect(result[2].teamName).toBe('Small Team')
  })
})
