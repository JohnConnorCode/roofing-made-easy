/**
 * Task Management API - Individual Task
 * GET - Get task by ID
 * PATCH - Update task
 * DELETE - Delete task
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission, isUserManagerOrAbove } from '@/lib/team/permissions'
import { ActivityLogger } from '@/lib/team/activity-logger'
import type { UpdateTaskRequest, Task } from '@/lib/team/types'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(['call', 'email', 'site_visit', 'follow_up', 'internal', 'meeting', 'inspection']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  lead_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  due_at: z.string().datetime().nullable().optional(),
  reminder_at: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  completion_notes: z.string().max(2000).optional(),
})

interface RouteParams {
  params: Promise<{ taskId: string }>
}

// GET /api/admin/tasks/[taskId] - Get task by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'tasks', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(
          id,
          first_name,
          last_name,
          avatar_url,
          role
        ),
        assigner:assigned_by(
          id,
          first_name,
          last_name
        ),
        completer:completed_by(
          id,
          first_name,
          last_name
        ),
        lead:lead_id(
          id,
          status,
          contacts(first_name, last_name, email, phone),
          properties(street, city, state)
        ),
        customer:customer_id(
          id,
          email
        )
      `)
      .eq('id', taskId)
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/tasks/[taskId] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'tasks', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data as UpdateTaskRequest
    const supabase = await createClient()

    // Get current task
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user can edit this task (assigned to them, created by them, or manager+)
    const task = currentTask as Task
    const canEdit =
      task.assigned_to === user.id ||
      task.assigned_by === user.id ||
      isUserManagerOrAbove(profile, user)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You can only edit tasks assigned to you or created by you' },
        { status: 403 }
      )
    }

    // Build update object
    const taskUpdate: Record<string, unknown> = {}

    if (updates.title !== undefined) taskUpdate.title = updates.title
    if (updates.description !== undefined) taskUpdate.description = updates.description
    if (updates.type !== undefined) taskUpdate.type = updates.type
    if (updates.assigned_to !== undefined) taskUpdate.assigned_to = updates.assigned_to
    if (updates.lead_id !== undefined) taskUpdate.lead_id = updates.lead_id
    if (updates.customer_id !== undefined) taskUpdate.customer_id = updates.customer_id
    if (updates.due_at !== undefined) taskUpdate.due_at = updates.due_at
    if (updates.reminder_at !== undefined) taskUpdate.reminder_at = updates.reminder_at
    if (updates.priority !== undefined) taskUpdate.priority = updates.priority
    if (updates.completion_notes !== undefined) taskUpdate.completion_notes = updates.completion_notes

    // Handle status change
    if (updates.status !== undefined) {
      taskUpdate.status = updates.status

      // If completing, set completed_at and completed_by
      if (updates.status === 'completed' && task.status !== 'completed') {
        taskUpdate.completed_at = new Date().toISOString()
        taskUpdate.completed_by = user.id
      }

      // If un-completing, clear completion fields
      if (updates.status !== 'completed' && task.status === 'completed') {
        taskUpdate.completed_at = null
        taskUpdate.completed_by = null
      }
    }

    // Update task
    const { error: updateError } = await supabase
      .from('tasks')
      .update(taskUpdate as never)
      .eq('id', taskId)

    if (updateError) {
      console.error('Error updating task:', updateError)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Log activity
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}

    for (const key of Object.keys(taskUpdate)) {
      oldValues[key] = (currentTask as Record<string, unknown>)[key]
      newValues[key] = taskUpdate[key]
    }

    if (updates.status === 'completed' && task.status !== 'completed') {
      await ActivityLogger.taskCompleted(user, taskId, task.title)
    } else {
      await ActivityLogger.taskUpdated(user, taskId, oldValues, newValues)
    }

    // Get updated task
    const { data: updatedTask } = await supabase
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
      `)
      .eq('id', taskId)
      .single()

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Task PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { taskId } = await params
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deleting requires delete permission
    if (!hasPermission(profile, 'tasks', 'delete', user)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Delete permission required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get task for logging
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single()

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (deleteError) {
      console.error('Error deleting task:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    // Log activity
    await ActivityLogger.taskDeleted(user, taskId, (task as { title: string }).title)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
