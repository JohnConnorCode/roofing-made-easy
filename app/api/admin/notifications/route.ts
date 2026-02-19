/**
 * Notifications API
 * GET - Get user's notifications (unread first, paginated)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, parsePagination } from '@/lib/api/auth'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const { limit, offset } = parsePagination(searchParams)
    const unreadOnly = searchParams.get('unread') === 'true'

    let query = supabase
      .from('notifications')
      .select('id, type, title, message, priority, action_url, action_label, read_at, created_at', { count: 'exact' })
      .eq('user_id', user!.id)
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      logger.error('Error fetching notifications', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({
      notifications,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    logger.error('Notifications GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
