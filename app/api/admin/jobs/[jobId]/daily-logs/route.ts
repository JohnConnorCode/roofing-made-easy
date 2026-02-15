/**
 * Job Daily Logs API
 * GET - List daily logs for a job
 * POST - Create a daily log entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'

const createDailyLogSchema = z.object({
  log_date: z.string().optional(),
  crew_members: z.array(z.string()).optional(),
  work_performed: z.string().max(5000).optional(),
  hours_worked: z.number().min(0).max(24).optional(),
  weather_conditions: z.string().max(100).optional(),
  work_delayed: z.boolean().optional(),
  delay_reason: z.string().max(2000).optional(),
  materials_used: z.string().max(2000).optional(),
  safety_incidents: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('job_daily_logs')
      .select(`
        *,
        logged_by_user:logged_by(first_name, last_name)
      `)
      .eq('job_id', jobId)
      .order('log_date', { ascending: false })

    if (error) {
      console.error('Error fetching daily logs:', error)
      return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 })
    }

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Job daily logs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = createDailyLogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    const { data: log, error: createError } = await supabase
      .from('job_daily_logs')
      .insert({
        job_id: jobId,
        log_date: data.log_date || new Date().toISOString().split('T')[0],
        crew_members: data.crew_members || [],
        work_performed: data.work_performed || null,
        hours_worked: data.hours_worked || null,
        weather_conditions: data.weather_conditions || null,
        work_delayed: data.work_delayed || false,
        delay_reason: data.delay_reason || null,
        materials_used: data.materials_used || null,
        safety_incidents: data.safety_incidents || null,
        notes: data.notes || null,
        logged_by: user.id,
      } as never)
      .select(`
        *,
        logged_by_user:logged_by(first_name, last_name)
      `)
      .single()

    if (createError || !log) {
      console.error('Error creating daily log:', createError)
      return NextResponse.json({ error: 'Failed to create daily log' }, { status: 500 })
    }

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('Job daily logs POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
