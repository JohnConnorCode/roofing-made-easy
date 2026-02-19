/**
 * Profitability Report API
 * GET - Profit margins per job, expense breakdown
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'reports', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    // Get all jobs with their financials
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id, job_number, status, contract_amount, material_cost, labor_cost, total_paid,
        property_city, property_state, created_at,
        team:assigned_team_id(name)
      `)
      .not('status', 'in', '(cancelled)')
      .order('created_at', { ascending: false })
      .limit(100)

    // Calculate profitability per job
    const jobProfitability = (jobs || []).map((j) => {
      const job = j as {
        id: string; job_number: string; status: string
        contract_amount: number; material_cost: number; labor_cost: number; total_paid: number
        property_city: string; property_state: string; created_at: string
        team: { name: string } | null
      }
      const totalCost = (job.material_cost || 0) + (job.labor_cost || 0)
      const profit = (job.contract_amount || 0) - totalCost
      const margin = job.contract_amount > 0 ? (profit / job.contract_amount) * 100 : 0

      return {
        id: job.id,
        job_number: job.job_number,
        status: job.status,
        contract_amount: job.contract_amount,
        total_cost: totalCost,
        material_cost: job.material_cost,
        labor_cost: job.labor_cost,
        profit,
        margin: Math.round(margin * 10) / 10,
        team: job.team?.name || null,
        location: job.property_city ? `${job.property_city}, ${job.property_state}` : null,
        created_at: job.created_at,
      }
    })

    // Get expense breakdown by category
    const { data: expenses } = await supabase
      .from('job_expenses')
      .select('category, amount')

    const expenseBreakdown: Record<string, number> = {}
    for (const exp of (expenses || [])) {
      const e = exp as { category: string; amount: number }
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount
    }

    // Summary stats
    const totalRevenue = jobProfitability.reduce((s, j) => s + j.contract_amount, 0)
    const totalCosts = jobProfitability.reduce((s, j) => s + j.total_cost, 0)
    const totalProfit = totalRevenue - totalCosts
    const avgMargin = jobProfitability.length > 0
      ? jobProfitability.reduce((s, j) => s + j.margin, 0) / jobProfitability.length
      : 0

    return NextResponse.json({
      jobs: jobProfitability,
      expenseBreakdown,
      summary: {
        totalRevenue,
        totalCosts,
        totalProfit,
        avgMargin: Math.round(avgMargin * 10) / 10,
        jobCount: jobProfitability.length,
      },
    })
  } catch (error) {
    logger.error('Profitability report GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
