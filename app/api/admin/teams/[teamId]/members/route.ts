/**
 * Team Members API
 * POST - Add member to team
 * DELETE - Remove member from team
 * PATCH - Update member role (team lead)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const addMemberSchema = z.object({
  user_id: z.string().uuid(),
  is_team_lead: z.boolean().optional(),
})

const updateMemberSchema = z.object({
  user_id: z.string().uuid(),
  is_team_lead: z.boolean(),
})

interface RouteParams {
  params: Promise<{ teamId: string }>
}

// POST /api/admin/teams/[teamId]/members - Add member to team
export async function POST(
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
    const parsed = addMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { user_id, is_team_lead } = parsed.data

    const supabase = await createClient()

    // Verify team exists
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

    // Verify user exists
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user_id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('user_id', user_id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    // Add member
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id,
        is_team_lead: is_team_lead || false,
      } as never)

    if (insertError) {
      logger.error('Error adding team member', { error: String(insertError) })
      return NextResponse.json(
        { error: 'Failed to add team member' },
        { status: 500 }
      )
    }

    const profile = userProfile as { first_name: string | null; last_name: string | null }
    const memberName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ') || 'Unknown'

    // Log activity
    await ActivityLogger.teamMemberAdded(user, teamId, user_id, memberName)

    return NextResponse.json(
      { success: true, message: `Added ${memberName} to team` },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Team member POST error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/teams/[teamId]/members - Update member (team lead status)
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
    const parsed = updateMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { user_id, is_team_lead } = parsed.data

    const supabase = await createClient()

    // Verify membership exists
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('is_team_lead')
      .eq('team_id', teamId)
      .eq('user_id', user_id)
      .single()

    if (!existingMember) {
      return NextResponse.json(
        { error: 'User is not a member of this team' },
        { status: 404 }
      )
    }

    // Update membership
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ is_team_lead } as never)
      .eq('team_id', teamId)
      .eq('user_id', user_id)

    if (updateError) {
      logger.error('Error updating team member', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to update team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Team member PATCH error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/teams/[teamId]/members - Remove member from team
export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id query parameter required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get member info for logging
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    // Remove member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (deleteError) {
      logger.error('Error removing team member', { error: String(deleteError) })
      return NextResponse.json(
        { error: 'Failed to remove team member' },
        { status: 500 }
      )
    }

    const profile = userProfile as { first_name: string | null; last_name: string | null } | null
    const memberName = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unknown'
      : 'Unknown'

    // Log activity
    await ActivityLogger.teamMemberRemoved(user, teamId, userId, memberName)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Team member DELETE error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
