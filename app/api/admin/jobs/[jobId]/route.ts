/**
 * Job Detail API
 * GET - Get job details
 * PATCH - Update job
 * DELETE - Archive/delete job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logActivity } from '@/lib/team/activity-logger'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateJobSchema = z.object({
  status: z.enum([
    'pending_start', 'materials_ordered', 'scheduled', 'in_progress',
    'inspection_pending', 'punch_list', 'completed', 'warranty_active', 'closed',
  ]).optional(),
  scheduled_start: z.string().nullable().optional(),
  scheduled_end: z.string().nullable().optional(),
  actual_start: z.string().nullable().optional(),
  actual_end: z.string().nullable().optional(),
  assigned_team_id: z.string().uuid().nullable().optional(),
  project_manager_id: z.string().uuid().nullable().optional(),
  contract_amount: z.number().min(0).optional(),
  warranty_start_date: z.string().nullable().optional(),
  warranty_end_date: z.string().nullable().optional(),
  warranty_type: z.string().max(100).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
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

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name, avatar_url),
        lead:lead_id(id, status, contacts(first_name, last_name, email, phone)),
        customer:customer_id(id, first_name, last_name, email)
      `)
      .eq('id', jobId)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Fetch status history
    const { data: statusHistory } = await supabase
      .from('job_status_history')
      .select(`
        *,
        changed_by_user:changed_by(first_name, last_name)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ job, statusHistory: statusHistory || [] })
  } catch (error) {
    logger.error('Job GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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
    const parsed = updateJobSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current job for logging
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('status, job_number')
      .eq('id', jobId)
      .single()

    if (!currentJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const data = parsed.data

    if (data.status !== undefined) updateData.status = data.status
    if (data.scheduled_start !== undefined) updateData.scheduled_start = data.scheduled_start
    if (data.scheduled_end !== undefined) updateData.scheduled_end = data.scheduled_end
    if (data.actual_start !== undefined) updateData.actual_start = data.actual_start
    if (data.actual_end !== undefined) updateData.actual_end = data.actual_end
    if (data.assigned_team_id !== undefined) updateData.assigned_team_id = data.assigned_team_id
    if (data.project_manager_id !== undefined) updateData.project_manager_id = data.project_manager_id
    if (data.contract_amount !== undefined) updateData.contract_amount = data.contract_amount
    if (data.warranty_start_date !== undefined) updateData.warranty_start_date = data.warranty_start_date
    if (data.warranty_end_date !== undefined) updateData.warranty_end_date = data.warranty_end_date
    if (data.warranty_type !== undefined) updateData.warranty_type = data.warranty_type
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.internal_notes !== undefined) updateData.internal_notes = data.internal_notes

    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update(updateData as never)
      .eq('id', jobId)
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name)
      `)
      .single()

    if (updateError || !job) {
      logger.error('Error updating job', { error: String(updateError) })
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }

    await logActivity({
      user,
      action: data.status ? 'job_status_changed' : 'job_updated',
      category: 'job',
      entityType: 'job',
      entityId: jobId,
      entityName: (currentJob as { job_number: string }).job_number,
      oldValues: data.status ? { status: (currentJob as { status: string }).status } : undefined,
      newValues: data.status ? { status: data.status } : updateData,
    })

    return NextResponse.json({ job })
  } catch (error) {
    logger.error('Job PATCH error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'delete', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()

    // Get job for logging before deleting
    const { data: job } = await supabase
      .from('jobs')
      .select('job_number')
      .eq('id', jobId)
      .single()

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      logger.error('Error deleting job', { error: String(deleteError) })
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }

    if (job) {
      await logActivity({
        user,
        action: 'job_deleted',
        category: 'job',
        entityType: 'job',
        entityId: jobId,
        entityName: (job as { job_number: string }).job_number,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Job DELETE error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
