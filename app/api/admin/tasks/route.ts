/**
 * Task Management API
 * GET - List tasks with filters
 * POST - Create a new task
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { parsePagination } from '@/lib/api/auth'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { TaskType, TaskPriority, TaskStatus, CreateTaskRequest } from '@/lib/team/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['call', 'email', 'site_visit', 'follow_up', 'internal', 'meeting', 'inspection']),
  assigned_to: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  due_at: z.string().datetime().optional(),
  reminder_at: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

// GET /api/admin/tasks - List tasks with filters
export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view tasks
    if (!hasPermission(profile, 'tasks', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const type = searchParams.get('type') as TaskType | null
    const assignedTo = searchParams.get('assigned_to')
    const leadId = searchParams.get('lead_id')
    const customerId = searchParams.get('customer_id')
    const overdue = searchParams.get('overdue')
    const search = searchParams.get('search')
    const { limit, offset } = parsePagination(searchParams)

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        assigner:assigned_by(
          id,
          first_name,
          last_name
        ),
        lead:lead_id(
          id,
          contacts(first_name, last_name)
        )
      `, { count: 'exact' })
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: exclude completed and cancelled
      query = query.in('status', ['pending', 'in_progress'])
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (overdue === 'true') {
      query = query.lt('due_at', new Date().toISOString())
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error, count } = await query

    if (error) {
      logger.error('Error fetching tasks', { error: String(error) })
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Get counts by status for summary
    const { data: statusCounts } = await supabase
      .from('tasks')
      .select('status')

    const counts = (statusCounts || []).reduce((acc, task) => {
      const s = (task as { status: string }).status
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count overdue
    const { count: overdueCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress'])
      .lt('due_at', new Date().toISOString())

    return NextResponse.json({
      tasks,
      total: count,
      limit,
      offset,
      summary: {
        ...counts,
        overdue: overdueCount || 0,
      },
    })
  } catch (error) {
    logger.error('Tasks GET error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to edit tasks
    if (!hasPermission(profile, 'tasks', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const taskData = parsed.data as CreateTaskRequest

    const supabase = await createClient()

    // Create task
    const { data: task, error: createError } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        type: taskData.type,
        assigned_to: taskData.assigned_to || null,
        assigned_by: user.id,
        lead_id: taskData.lead_id || null,
        customer_id: taskData.customer_id || null,
        due_at: taskData.due_at || null,
        reminder_at: taskData.reminder_at || null,
        priority: taskData.priority || 'medium',
        status: 'pending',
      } as never)
      .select(`
        *,
        assignee:assigned_to(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        assigner:assigned_by(
          id,
          first_name,
          last_name
        ),
        lead:lead_id(
          id,
          contacts(first_name, last_name)
        )
      `)
      .single()

    if (createError || !task) {
      logger.error('Error creating task', { error: String(createError) })
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    // Log activity
    await ActivityLogger.taskCreated(
      user,
      (task as { id: string }).id,
      taskData.title,
      taskData.assigned_to
    )

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    logger.error('Tasks POST error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
