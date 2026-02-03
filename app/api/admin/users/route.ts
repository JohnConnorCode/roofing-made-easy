/**
 * User Management API
 * GET - List all users
 * POST - Create a new user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, getDefaultPermissions } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { UserRole, CreateUserRequest } from '@/lib/team/types'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'manager', 'sales', 'crew_lead', 'crew']),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  job_title: z.string().max(100).optional(),
  team_id: z.string().uuid().optional(),
})

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('team', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get('role') as UserRole | null
    const isActive = searchParams.get('is_active')
    const teamId = searchParams.get('team_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query joining user_profiles with auth.users (via view)
    let query = supabase
      .from('user_with_teams')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role) {
      query = query.eq('role', role)
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (teamId) {
      query = query.contains('team_ids', [teamId])
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('team', 'invite')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, role, first_name, last_name, phone, job_title, team_id } = parsed.data as CreateUserRequest

    const supabase = await createClient()

    // Create auth user (this will trigger the database trigger to create profile)
    // Note: In production, you might want to use the Admin API to create users
    // For now, we'll create a user with a temp password they must reset
    const tempPassword = password || crypto.randomUUID().slice(0, 16)

    const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role,
        first_name,
        last_name,
        phone,
      },
    })

    if (authCreateError || !authData.user) {
      console.error('Error creating auth user:', authCreateError)
      return NextResponse.json(
        { error: authCreateError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    const newUserId = authData.user.id

    // Update the user profile with additional fields
    // (the trigger creates basic profile, we add more details)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        role,
        permissions: getDefaultPermissions(role as UserRole),
        first_name,
        last_name,
        phone,
        job_title,
      } as never)
      .eq('id', newUserId)

    if (profileError) {
      console.error('Error updating user profile:', profileError)
      // Non-critical - profile trigger should have created basic profile
    }

    // Add to team if specified
    if (team_id) {
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          team_id,
          user_id: newUserId,
          is_team_lead: false,
        } as never)

      if (teamError) {
        console.error('Error adding user to team:', teamError)
        // Non-critical
      }
    }

    // Log activity
    await ActivityLogger.userCreated(user, newUserId, email, role as UserRole)

    // Fetch the complete user data
    const { data: newUser } = await supabase
      .from('user_with_teams')
      .select('*')
      .eq('id', newUserId)
      .single()

    return NextResponse.json(
      { user: newUser, tempPassword: password ? undefined : tempPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Users POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
