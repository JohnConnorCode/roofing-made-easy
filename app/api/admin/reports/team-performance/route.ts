/**
 * Team Performance Report API
 * GET - Revenue/jobs per team and salesperson
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

    // Get team performance
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id, status, contract_amount, material_cost, labor_cost, total_paid,
        assigned_team_id,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name)
      `)
      .limit(1000)

    // Aggregate by team
    const teamStats: Record<string, {
      id: string; name: string; color: string
      totalJobs: number; activeJobs: number; completedJobs: number
      revenue: number; costs: number; collected: number
    }> = {}

    // Aggregate by PM
    const pmStats: Record<string, {
      id: string; name: string
      totalJobs: number; revenue: number; completedJobs: number
    }> = {}

    for (const row of (jobs || [])) {
      const j = row as {
        id: string; status: string; contract_amount: number; material_cost: number; labor_cost: number; total_paid: number
        assigned_team_id: string | null
        team: { id: string; name: string; color: string } | null
        project_manager: { id: string; first_name: string; last_name: string } | null
      }

      // Team aggregation
      if (j.team) {
        if (!teamStats[j.team.id]) {
          teamStats[j.team.id] = {
            id: j.team.id,
            name: j.team.name,
            color: j.team.color,
            totalJobs: 0,
            activeJobs: 0,
            completedJobs: 0,
            revenue: 0,
            costs: 0,
            collected: 0,
          }
        }
        const t = teamStats[j.team.id]
        t.totalJobs += 1
        t.revenue += j.contract_amount || 0
        t.costs += (j.material_cost || 0) + (j.labor_cost || 0)
        t.collected += j.total_paid || 0
        if (['in_progress', 'scheduled', 'inspection_pending', 'punch_list'].includes(j.status)) {
          t.activeJobs += 1
        }
        if (['completed', 'warranty_active', 'closed'].includes(j.status)) {
          t.completedJobs += 1
        }
      }

      // PM aggregation
      if (j.project_manager) {
        const pmId = j.project_manager.id
        if (!pmStats[pmId]) {
          pmStats[pmId] = {
            id: pmId,
            name: `${j.project_manager.first_name || ''} ${j.project_manager.last_name || ''}`.trim(),
            totalJobs: 0,
            revenue: 0,
            completedJobs: 0,
          }
        }
        pmStats[pmId].totalJobs += 1
        pmStats[pmId].revenue += j.contract_amount || 0
        if (['completed', 'warranty_active', 'closed'].includes(j.status)) {
          pmStats[pmId].completedJobs += 1
        }
      }
    }

    return NextResponse.json({
      teams: Object.values(teamStats).sort((a, b) => b.revenue - a.revenue),
      projectManagers: Object.values(pmStats).sort((a, b) => b.revenue - a.revenue),
    })
  } catch (error) {
    console.error('Team performance report GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
