/**
 * Notification Detail API
 * PATCH - Mark notification as read or dismissed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const updateSchema = z.object({
  read: z.boolean().optional(),
  dismissed: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()

    const { id } = await params
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.read !== undefined) {
      updateData.read_at = parsed.data.read ? new Date().toISOString() : null
    }
    if (parsed.data.dismissed !== undefined) {
      updateData.dismissed_at = parsed.data.dismissed ? new Date().toISOString() : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: notification, error: updateError } = await supabase
      .from('notifications')
      .update(updateData as never)
      .eq('id', id)
      .eq('user_id', user!.id)
      .select()
      .single()

    if (updateError || !notification) {
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Notification PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
