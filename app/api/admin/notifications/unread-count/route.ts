/**
 * Unread Notification Count API
 * GET - Get count of unread notifications for badge display
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .is('read_at', null)
      .is('dismissed_at', null)

    if (error) {
      logger.error('Error fetching unread count', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    logger.error('Unread count GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
