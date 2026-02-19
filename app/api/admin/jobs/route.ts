/**
 * Jobs API
 * GET - List jobs with filters
 * POST - Create a new job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { parsePagination } from '@/lib/api/auth'
import { logActivity } from '@/lib/team/activity-logger'
import type { JobStatus } from '@/lib/jobs/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createJobSchema = z.object({
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  scheduled_start: z.string().optional(),
  scheduled_end: z.string().optional(),
  assigned_team_id: z.string().uuid().optional(),
  project_manager_id: z.string().uuid().optional(),
  contract_amount: z.number().min(0).optional(),
  property_address: z.string().max(500).optional(),
  property_city: z.string().max(100).optional(),
  property_state: z.string().max(2).optional(),
  property_zip: z.string().max(10).optional(),
  warranty_type: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as JobStatus | null
    const teamId = searchParams.get('team_id')
    const pmId = searchParams.get('project_manager_id')
    const startAfter = searchParams.get('start_after')
    const startBefore = searchParams.get('start_before')
    const search = searchParams.get('search')
    const { limit, offset } = parsePagination(searchParams)

    let query = supabase
      .from('jobs')
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name),
        lead:lead_id(id, contacts(first_name, last_name)),
        customer:customer_id(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (teamId) {
      query = query.eq('assigned_team_id', teamId)
    }

    if (pmId) {
      query = query.eq('project_manager_id', pmId)
    }

    if (startAfter) {
      query = query.gte('scheduled_start', startAfter)
    }

    if (startBefore) {
      query = query.lte('scheduled_start', startBefore)
    }

    if (search) {
      query = query.or(`job_number.ilike.%${search}%,property_address.ilike.%${search}%,notes.ilike.%${search}%`)
    }

    const { data: jobs, error, count } = await query

    if (error) {
      logger.error('Error fetching jobs', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    // Get status counts
    const { data: statusCounts } = await supabase
      .from('jobs')
      .select('status')

    const counts = (statusCounts || []).reduce((acc, job) => {
      const s = (job as { status: string }).status
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      jobs,
      total: count,
      limit,
      offset,
      summary: counts,
    })
  } catch (error) {
    logger.error('Jobs GET error', { error: String(error) })
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

    if (!hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createJobSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    const { data: job, error: createError } = await supabase
      .from('jobs')
      .insert({
        lead_id: data.lead_id || null,
        customer_id: data.customer_id || null,
        estimate_id: data.estimate_id || null,
        scheduled_start: data.scheduled_start || null,
        scheduled_end: data.scheduled_end || null,
        assigned_team_id: data.assigned_team_id || null,
        project_manager_id: data.project_manager_id || null,
        contract_amount: data.contract_amount || 0,
        property_address: data.property_address || null,
        property_city: data.property_city || null,
        property_state: data.property_state || null,
        property_zip: data.property_zip || null,
        warranty_type: data.warranty_type || null,
        notes: data.notes || null,
        status: 'pending_start',
        created_by: user.id,
      } as never)
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name)
      `)
      .single()

    if (createError || !job) {
      logger.error('Error creating job', { error: String(createError) })
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    await logActivity({
      user,
      action: 'job_created',
      category: 'job',
      entityType: 'job',
      entityId: (job as { id: string }).id,
      entityName: (job as { job_number: string }).job_number,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    logger.error('Jobs POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
