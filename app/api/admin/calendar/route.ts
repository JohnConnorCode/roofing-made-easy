/**
 * Calendar Events API
 * GET - List events by date range/type/team
 * POST - Create a calendar event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logActivity } from '@/lib/team/activity-logger'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  event_type: z.enum(['appointment', 'job_work', 'inspection', 'material_delivery', 'crew_meeting', 'other']),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  all_day: z.boolean().optional(),
  location: z.string().max(500).optional(),
  job_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  assigned_team_id: z.string().uuid().optional(),
  color: z.string().max(20).optional(),
  reminder_minutes: z.array(z.number()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const eventType = searchParams.get('type')
    const teamId = searchParams.get('team_id')
    const assignedTo = searchParams.get('assigned_to')
    const jobId = searchParams.get('job_id')

    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name),
        team:assigned_team_id(id, name, color),
        job:job_id(id, job_number)
      `)
      .neq('status', 'cancelled')
      .order('start_at', { ascending: true })

    if (startDate) {
      query = query.gte('start_at', startDate)
    }

    if (endDate) {
      query = query.lte('start_at', endDate)
    }

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    if (teamId) {
      query = query.eq('assigned_team_id', teamId)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data: events, error } = await query

    if (error) {
      logger.error('Error fetching calendar events', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error) {
    logger.error('Calendar GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    const { data: event, error: createError } = await supabase
      .from('calendar_events')
      .insert({
        title: data.title,
        description: data.description || null,
        event_type: data.event_type,
        start_at: data.start_at,
        end_at: data.end_at,
        all_day: data.all_day || false,
        location: data.location || null,
        job_id: data.job_id || null,
        lead_id: data.lead_id || null,
        customer_id: data.customer_id || null,
        task_id: data.task_id || null,
        assigned_to: data.assigned_to || null,
        assigned_team_id: data.assigned_team_id || null,
        color: data.color || null,
        reminder_minutes: data.reminder_minutes || [],
        status: 'scheduled',
        created_by: user.id,
      } as never)
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name),
        team:assigned_team_id(id, name, color)
      `)
      .single()

    if (createError || !event) {
      logger.error('Error creating calendar event', { error: String(createError) })
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    await logActivity({
      user,
      action: 'calendar_event_created',
      category: 'calendar',
      entityType: 'calendar_event',
      entityId: (event as { id: string }).id,
      entityName: data.title,
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    logger.error('Calendar POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
