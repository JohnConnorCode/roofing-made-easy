/**
 * Team Management API
 * GET - List all teams
 * POST - Create a new team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { CreateTeamRequest } from '@/lib/team/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
})

// GET /api/admin/teams - List all teams
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('team', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const isActive = searchParams.get('is_active')
    const managerId = searchParams.get('manager_id')
    const search = searchParams.get('search')

    // Build query — include members with their profile info
    let query = supabase
      .from('teams')
      .select(`
        *,
        manager:manager_id(
          id,
          first_name,
          last_name
        ),
        team_members(
          user:user_id(
            id,
            first_name,
            last_name,
            role
          )
        )
      `, { count: 'exact' })
      .order('name', { ascending: true })

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (managerId) {
      query = query.eq('manager_id', managerId)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: teams, error, count } = await query

    if (error) {
      logger.error('Error fetching teams', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }

    // Get member counts for each team
    const teamIds = (teams || []).map((t: { id: string }) => t.id)

    if (teamIds.length > 0) {
      const { data: memberCounts } = await supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds)

      // Count members per team
      const countMap: Record<string, number> = {}
      for (const member of memberCounts || []) {
        const teamId = (member as { team_id: string }).team_id
        countMap[teamId] = (countMap[teamId] || 0) + 1
      }

      // Add member_count to each team
      for (const team of teams || []) {
        (team as { member_count?: number }).member_count = countMap[(team as { id: string }).id] || 0
      }
    }

    return NextResponse.json({
      teams,
      total: count,
    })
  } catch (error) {
    logger.error('Teams GET error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('team', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createTeamSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, manager_id, color, icon } = parsed.data as CreateTeamRequest

    const supabase = await createClient()

    // Check for duplicate team name
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .ilike('name', name)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 }
      )
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from('teams')
      .insert({
        name,
        description: description || null,
        manager_id: manager_id || null,
        color: color || '#6366f1',
        icon: icon || 'users',
      } as never)
      .select(`
        *,
        manager:manager_id(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (createError || !team) {
      logger.error('Error creating team', { error: String(createError) })
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    // If manager specified, add them as team lead
    if (manager_id) {
      await supabase
        .from('team_members')
        .insert({
          team_id: (team as { id: string }).id,
          user_id: manager_id,
          is_team_lead: true,
        } as never)
    }

    // Log activity
    await ActivityLogger.teamCreated(user, (team as { id: string }).id, name)

    return NextResponse.json(
      { team: { ...(team as Record<string, unknown>), member_count: manager_id ? 1 : 0 } },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Teams POST error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
