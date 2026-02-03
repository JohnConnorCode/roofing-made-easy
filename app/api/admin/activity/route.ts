/**
 * Activity Log API
 * GET - Get activity logs with filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireManagerOrAbove } from '@/lib/team/permissions'
import type { ActivityCategory } from '@/lib/team/types'

// GET /api/admin/activity - Get activity logs
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireManagerOrAbove()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('user_id')
    const category = searchParams.get('category') as ActivityCategory | null
    const action = searchParams.get('action')
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('user_activity_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: activities, error, count } = await query

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      )
    }

    // Get user info for activities
    const userIds = [...new Set((activities || []).map(a => (a as { user_id: string | null }).user_id).filter(Boolean))]

    let userMap: Record<string, { first_name: string; last_name: string; avatar_url: string }> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds as string[])

      userMap = (users || []).reduce((acc, u) => {
        const user = u as { id: string; first_name: string; last_name: string; avatar_url: string }
        acc[user.id] = {
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url,
        }
        return acc
      }, {} as Record<string, { first_name: string; last_name: string; avatar_url: string }>)
    }

    // Enrich activities with user info
    const enrichedActivities = (activities || []).map(activity => {
      const a = activity as Record<string, unknown> & { user_id: string | null }
      return {
        ...a,
        user_info: a.user_id ? userMap[a.user_id] || null : null,
      }
    })

    return NextResponse.json({
      activities: enrichedActivities,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Activity GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
