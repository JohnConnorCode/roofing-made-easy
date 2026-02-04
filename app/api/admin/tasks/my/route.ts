/**
 * My Tasks API
 * GET - Get tasks assigned to the current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { parsePagination } from '@/lib/api/auth'
import type { TaskStatus, TaskPriority, TaskType } from '@/lib/team/types'

// GET /api/admin/tasks/my - Get current user's tasks
export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'tasks', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const type = searchParams.get('type') as TaskType | null
    const includeCreated = searchParams.get('include_created') === 'true'
    const { limit, offset } = parsePagination(searchParams)

    // Build query for tasks assigned to current user
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

    // Filter by user - either assigned to them or created by them
    if (includeCreated) {
      query = query.or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
    } else {
      query = query.eq('assigned_to', user.id)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: show pending and in_progress
      query = query.in('status', ['pending', 'in_progress'])
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: tasks, error, count } = await query

    if (error) {
      console.error('Error fetching my tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Get summary counts for current user's tasks
    const { data: allMyTasks } = await supabase
      .from('tasks')
      .select('status, due_at')
      .eq('assigned_to', user.id)

    const now = new Date()
    const summary = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      due_today: 0,
      due_this_week: 0,
    }

    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    const endOfWeek = new Date(now)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    endOfWeek.setHours(23, 59, 59, 999)

    for (const task of allMyTasks || []) {
      const t = task as { status: string; due_at: string | null }
      summary[t.status as keyof typeof summary]++

      if (t.due_at && (t.status === 'pending' || t.status === 'in_progress')) {
        const dueDate = new Date(t.due_at)

        if (dueDate < now) {
          summary.overdue++
        } else if (dueDate <= endOfToday) {
          summary.due_today++
        } else if (dueDate <= endOfWeek) {
          summary.due_this_week++
        }
      }
    }

    return NextResponse.json({
      tasks,
      total: count,
      limit,
      offset,
      summary,
    })
  } catch (error) {
    console.error('My tasks GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
