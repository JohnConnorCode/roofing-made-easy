/**
 * User Management API - Individual User
 * GET - Get user by ID
 * PATCH - Update user
 * DELETE - Deactivate user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, getDefaultPermissions } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { UserRole, UpdateUserRequest, UserProfile } from '@/lib/team/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateUserSchema = z.object({
  role: z.enum(['admin', 'manager', 'sales', 'crew_lead', 'crew']).optional(),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())).optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  job_title: z.string().max(100).optional(),
  avatar_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  notification_preferences: z.object({
    email: z.object({
      tasks: z.boolean(),
      leads: z.boolean(),
      system: z.boolean(),
    }),
    sms: z.object({
      tasks: z.boolean(),
      leads: z.boolean(),
      system: z.boolean(),
    }),
    push: z.object({
      tasks: z.boolean(),
      leads: z.boolean(),
      system: z.boolean(),
    }),
  }).optional(),
})

interface RouteParams {
  params: Promise<{ userId: string }>
}

// GET /api/admin/users/[userId] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params
    const { error: authError } = await requirePermission('team', 'view')
    if (authError) return authError

    const supabase = await createClient()

    // Get user with teams
    const { data: user, error } = await supabase
      .from('user_with_teams')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's teams with full details
    const { data: teamMemberships } = await supabase
      .from('team_members')
      .select(`
        is_team_lead,
        joined_at,
        teams (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)

    return NextResponse.json({
      user,
      teams: teamMemberships?.map(tm => ({
        ...((tm as { teams: Record<string, unknown> }).teams),
        is_team_lead: (tm as { is_team_lead: boolean }).is_team_lead,
        joined_at: (tm as { joined_at: string }).joined_at,
      })) || [],
    })
  } catch (error) {
    logger.error('User GET error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[userId] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params
    const { user, error: authError } = await requirePermission('team', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data as UpdateUserRequest
    const supabase = await createClient()

    // Get current user data for activity log
    const { data: currentUser } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build update object
    const profileUpdate: Record<string, unknown> = {}

    if (updates.role !== undefined) {
      profileUpdate.role = updates.role
      // Update permissions to role defaults unless custom permissions provided
      if (!updates.permissions) {
        profileUpdate.permissions = getDefaultPermissions(updates.role as UserRole)
      }
    }

    if (updates.permissions !== undefined) {
      profileUpdate.permissions = updates.permissions
    }

    if (updates.first_name !== undefined) profileUpdate.first_name = updates.first_name
    if (updates.last_name !== undefined) profileUpdate.last_name = updates.last_name
    if (updates.phone !== undefined) profileUpdate.phone = updates.phone
    if (updates.job_title !== undefined) profileUpdate.job_title = updates.job_title
    if (updates.avatar_url !== undefined) profileUpdate.avatar_url = updates.avatar_url
    if (updates.is_active !== undefined) profileUpdate.is_active = updates.is_active
    if (updates.notification_preferences !== undefined) {
      profileUpdate.notification_preferences = updates.notification_preferences
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(profileUpdate as never)
      .eq('id', userId)

    if (updateError) {
      logger.error('Error updating user', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Also update auth user metadata if role changed
    if (updates.role !== undefined) {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: updates.role,
        },
      })
    }

    // Log activity
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}

    for (const key of Object.keys(profileUpdate)) {
      oldValues[key] = (currentUser as Record<string, unknown>)[key]
      newValues[key] = profileUpdate[key]
    }

    await ActivityLogger.userUpdated(user, userId, oldValues, newValues)

    // If deactivated, log that specifically
    if (updates.is_active === false && (currentUser as UserProfile).is_active) {
      const { data: userData } = await supabase
        .from('user_with_teams')
        .select('email')
        .eq('id', userId)
        .single()
      const userEmail = (userData as { email: string } | null)?.email || ''
      await ActivityLogger.userDeactivated(
        user,
        userId,
        userEmail
      )
    }

    // Get updated user
    const { data: updatedUser } = await supabase
      .from('user_with_teams')
      .select('*')
      .eq('id', userId)
      .single()

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    logger.error('User PATCH error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[userId] - Deactivate user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await params
    const { user, error: authError } = await requirePermission('team', 'delete')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-deletion
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user data for logging
    const { data: userData } = await supabase
      .from('user_with_teams')
      .select('email')
      .eq('id', userId)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Soft delete - deactivate the user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_active: false,
        terminated_at: new Date().toISOString(),
      } as never)
      .eq('id', userId)

    if (updateError) {
      logger.error('Error deactivating user', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      )
    }

    // Log activity
    await ActivityLogger.userDeactivated(user, userId, (userData as { email: string }).email)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('User DELETE error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
