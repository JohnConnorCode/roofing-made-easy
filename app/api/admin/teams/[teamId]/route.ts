/**
 * Team Management API - Individual Team
 * GET - Get team by ID
 * PATCH - Update team
 * DELETE - Deactivate team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { UpdateTeamRequest, Team } from '@/lib/team/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ teamId: string }>
}

// GET /api/admin/teams/[teamId] - Get team by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { teamId } = await params
    const { error: authError } = await requirePermission('team', 'view')
    if (authError) return authError

    const supabase = await createClient()

    // Get team with manager
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        manager:manager_id(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', teamId)
      .single()

    if (error || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Get team members with profile details
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        is_team_lead,
        joined_at,
        user:user_id(
          id,
          first_name,
          last_name,
          role,
          avatar_url,
          job_title,
          phone,
          is_active
        )
      `)
      .eq('team_id', teamId)
      .order('is_team_lead', { ascending: false })

    // Define type for team member response
    type TeamMemberResponse = {
      is_team_lead: boolean
      joined_at: string
      user: {
        id: string
        first_name: string | null
        last_name: string | null
        role: string
        avatar_url: string | null
        job_title: string | null
        phone: string | null
        is_active: boolean
      } | null
    }

    // Get member emails from user_with_teams view
    const memberIds = ((members || []) as TeamMemberResponse[])
      .map(m => m.user?.id)
      .filter((id): id is string => Boolean(id))

    let memberEmails: Record<string, string> = {}

    if (memberIds.length > 0) {
      const { data: emailData } = await supabase
        .from('user_with_teams')
        .select('id, email')
        .in('id', memberIds)

      memberEmails = (emailData || []).reduce((acc, u) => {
        const user = u as { id: string; email: string }
        acc[user.id] = user.email
        return acc
      }, {} as Record<string, string>)
    }

    // Format members with email
    const formattedMembers = ((members || []) as TeamMemberResponse[]).map(m => ({
      ...m.user,
      email: m.user?.id ? memberEmails[m.user.id] || null : null,
      is_team_lead: m.is_team_lead,
      joined_at: m.joined_at,
    }))

    return NextResponse.json({
      team: {
        ...(team as Record<string, unknown>),
        member_count: formattedMembers.length,
      },
      members: formattedMembers,
    })
  } catch (error) {
    logger.error('Team GET error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/teams/[teamId] - Update team
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { teamId } = await params
    const { user, error: authError } = await requirePermission('team', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateTeamSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data as UpdateTeamRequest
    const supabase = await createClient()

    // Get current team data for activity log
    const { data: currentTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!currentTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name if being changed
    if (updates.name && updates.name !== (currentTeam as Team).name) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .ilike('name', updates.name)
        .neq('id', teamId)
        .single()

      if (existingTeam) {
        return NextResponse.json(
          { error: 'A team with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const teamUpdate: Record<string, unknown> = {}
    if (updates.name !== undefined) teamUpdate.name = updates.name
    if (updates.description !== undefined) teamUpdate.description = updates.description
    if (updates.manager_id !== undefined) teamUpdate.manager_id = updates.manager_id
    if (updates.color !== undefined) teamUpdate.color = updates.color
    if (updates.icon !== undefined) teamUpdate.icon = updates.icon
    if (updates.is_active !== undefined) teamUpdate.is_active = updates.is_active

    // Update team
    const { error: updateError } = await supabase
      .from('teams')
      .update(teamUpdate as never)
      .eq('id', teamId)

    if (updateError) {
      logger.error('Error updating team', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      )
    }

    // If manager changed, ensure they're in the team
    if (updates.manager_id && updates.manager_id !== (currentTeam as Team).manager_id) {
      // Check if new manager is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('user_id', updates.manager_id)
        .single()

      if (!existingMember) {
        // Add new manager as team lead
        await supabase
          .from('team_members')
          .insert({
            team_id: teamId,
            user_id: updates.manager_id,
            is_team_lead: true,
          } as never)
      } else {
        // Update existing member to team lead
        await supabase
          .from('team_members')
          .update({ is_team_lead: true } as never)
          .eq('team_id', teamId)
          .eq('user_id', updates.manager_id)
      }

      // Remove team lead from old manager (if they exist)
      const oldManagerId = (currentTeam as Team).manager_id
      if (oldManagerId) {
        await supabase
          .from('team_members')
          .update({ is_team_lead: false } as never)
          .eq('team_id', teamId)
          .eq('user_id', oldManagerId)
      }
    }

    // Log activity
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}

    for (const key of Object.keys(teamUpdate)) {
      oldValues[key] = (currentTeam as Record<string, unknown>)[key]
      newValues[key] = teamUpdate[key]
    }

    await ActivityLogger.teamUpdated(user, teamId, oldValues, newValues)

    // Get updated team
    const { data: updatedTeam } = await supabase
      .from('teams')
      .select(`
        *,
        manager:manager_id(
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', teamId)
      .single()

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    logger.error('Team PATCH error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/teams/[teamId] - Deactivate team
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { teamId } = await params
    const { user, error: authError } = await requirePermission('team', 'delete')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get team data for logging
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Soft delete - deactivate the team
    const { error: updateError } = await supabase
      .from('teams')
      .update({ is_active: false } as never)
      .eq('id', teamId)

    if (updateError) {
      logger.error('Error deactivating team', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to deactivate team' },
        { status: 500 }
      )
    }

    // Log activity
    await ActivityLogger.teamUpdated(
      user,
      teamId,
      { is_active: true },
      { is_active: false }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Team DELETE error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
