/**
 * Calendar Event Detail API
 * GET - Get event details
 * PATCH - Update event
 * DELETE - Cancel/delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logActivity } from '@/lib/team/activity-logger'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  event_type: z.enum(['appointment', 'job_work', 'inspection', 'material_delivery', 'crew_meeting', 'other']).optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  all_day: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_team_id: z.string().uuid().nullable().optional(),
  color: z.string().max(20).nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { eventId } = await params
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name),
        team:assigned_team_id(id, name, color),
        job:job_id(id, job_number, status)
      `)
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    logger.error('Calendar event GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { eventId } = await params
    const body = await request.json()
    const parsed = updateEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const updateData: Record<string, unknown> = {}
    const data = parsed.data

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.event_type !== undefined) updateData.event_type = data.event_type
    if (data.status !== undefined) updateData.status = data.status
    if (data.start_at !== undefined) updateData.start_at = data.start_at
    if (data.end_at !== undefined) updateData.end_at = data.end_at
    if (data.all_day !== undefined) updateData.all_day = data.all_day
    if (data.location !== undefined) updateData.location = data.location
    if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to
    if (data.assigned_team_id !== undefined) updateData.assigned_team_id = data.assigned_team_id
    if (data.color !== undefined) updateData.color = data.color

    const { data: event, error: updateError } = await supabase
      .from('calendar_events')
      .update(updateData as never)
      .eq('id', eventId)
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name),
        team:assigned_team_id(id, name, color)
      `)
      .single()

    if (updateError || !event) {
      logger.error('Error updating calendar event', { error: String(updateError) })
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    await logActivity({
      user,
      action: 'calendar_event_updated',
      category: 'calendar',
      entityType: 'calendar_event',
      entityId: eventId,
    })

    return NextResponse.json({ event })
  } catch (error) {
    logger.error('Calendar event PATCH error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'delete', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { eventId } = await params
    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (deleteError) {
      logger.error('Error deleting calendar event', { error: String(deleteError) })
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    await logActivity({
      user,
      action: 'calendar_event_deleted',
      category: 'calendar',
      entityType: 'calendar_event',
      entityId: eventId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Calendar event DELETE error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
