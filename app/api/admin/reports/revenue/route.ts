/**
 * Revenue Report API
 * GET - Monthly revenue, by job type, by team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'

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
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '12', 10)

    // Get monthly financial summary
    const { data: monthlySummary } = await supabase
      .from('financial_summary')
      .select('*')
      .order('month', { ascending: false })
      .limit(months)

    // Get revenue by team
    const { data: teamRevenue } = await supabase
      .from('jobs')
      .select(`
        assigned_team_id,
        contract_amount,
        material_cost,
        labor_cost,
        team:assigned_team_id(name, color)
      `)
      .not('assigned_team_id', 'is', null)
      .limit(1000)

    // Aggregate by team
    const teamAggregates: Record<string, { name: string; color: string; revenue: number; cost: number; jobs: number }> = {}
    for (const row of (teamRevenue || [])) {
      const r = row as { assigned_team_id: string; contract_amount: number; material_cost: number; labor_cost: number; team: { name: string; color: string } }
      if (!r.assigned_team_id) continue
      if (!teamAggregates[r.assigned_team_id]) {
        teamAggregates[r.assigned_team_id] = {
          name: r.team?.name || 'Unknown',
          color: r.team?.color || '#94a3b8',
          revenue: 0,
          cost: 0,
          jobs: 0,
        }
      }
      teamAggregates[r.assigned_team_id].revenue += r.contract_amount || 0
      teamAggregates[r.assigned_team_id].cost += (r.material_cost || 0) + (r.labor_cost || 0)
      teamAggregates[r.assigned_team_id].jobs += 1
    }

    // Current month totals
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: currentMonthJobs } = await supabase
      .from('jobs')
      .select('contract_amount, material_cost, labor_cost, total_paid')
      .gte('created_at', currentMonthStart)

    const mtdRevenue = (currentMonthJobs || []).reduce((sum, j) => sum + ((j as { contract_amount: number }).contract_amount || 0), 0)
    const mtdCosts = (currentMonthJobs || []).reduce((sum, j) => {
      const job = j as { material_cost: number; labor_cost: number }
      return sum + (job.material_cost || 0) + (job.labor_cost || 0)
    }, 0)
    const mtdCollected = (currentMonthJobs || []).reduce((sum, j) => sum + ((j as { total_paid: number }).total_paid || 0), 0)

    return NextResponse.json({
      monthlySummary: monthlySummary || [],
      teamRevenue: Object.values(teamAggregates),
      currentMonth: {
        revenue: mtdRevenue,
        costs: mtdCosts,
        profit: mtdRevenue - mtdCosts,
        margin: mtdRevenue > 0 ? ((mtdRevenue - mtdCosts) / mtdRevenue * 100) : 0,
        collected: mtdCollected,
      },
    })
  } catch (error) {
    console.error('Revenue report GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
