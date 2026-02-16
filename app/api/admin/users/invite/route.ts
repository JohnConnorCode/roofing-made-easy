/**
 * User Invitation API
 * POST - Send invitation email to new user
 * GET - List pending invitations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { UserRole, InviteUserRequest } from '@/lib/team/types'
import { z } from 'zod'
import crypto from 'crypto'

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'sales', 'crew_lead', 'crew']),
  team_id: z.string().uuid().optional(),
  message: z.string().max(500).optional(),
})

// GET /api/admin/users/invite - List pending invitations
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('team', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') || 'pending'

    let query = supabase
      .from('user_invitations')
      .select(`
        *,
        inviter:invited_by(
          first_name,
          last_name
        ),
        team:team_id(
          name,
          color
        )
      `)
      .order('created_at', { ascending: false })

    if (status === 'pending') {
      query = query.is('accepted_at', null).gt('expires_at', new Date().toISOString())
    } else if (status === 'expired') {
      query = query.is('accepted_at', null).lt('expires_at', new Date().toISOString())
    } else if (status === 'accepted') {
      query = query.not('accepted_at', 'is', null)
    }

    const { data: invitations, error } = await query

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Invitations GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/invite - Send invitation email
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('team', 'invite')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = inviteUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, role, team_id, message } = parsed.data as InviteUserRequest

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Pending invitation already exists for this email' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        team_id: team_id || null,
        invited_by: user.id,
        token,
        message: message || null,
        expires_at: expiresAt.toISOString(),
      } as never)
      .select()
      .single()

    if (inviteError || !invitation) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email (using Resend if configured)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/invite/${token}`

    // Try to send email via our email service
    try {
      const emailResponse = await fetch(`${appUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `You've been invited to join the team`,
          template: 'invitation',
          data: {
            inviteUrl,
            role,
            message,
            expiresAt: expiresAt.toISOString(),
          },
        }),
      })

      if (!emailResponse.ok) {
        // Email failed but invitation still created
      }
    } catch {
      // Email sending is non-critical - invitation still created
    }

    // Log activity
    await ActivityLogger.userInvited(user, email, role as UserRole)

    return NextResponse.json(
      {
        invitation: {
          ...(invitation as Record<string, unknown>),
          invite_url: inviteUrl,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Invitation POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/invite - Cancel an invitation
export async function DELETE(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('team', 'delete')
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('user_invitations')
      .delete()
      .eq('id', invitationId)
      .is('accepted_at', null)

    if (deleteError) {
      console.error('Error deleting invitation:', deleteError)
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invitation DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
