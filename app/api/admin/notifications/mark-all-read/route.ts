/**
 * Mark All Notifications Read API
 * POST - Mark all unread notifications as read for the current user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() } as never)
      .eq('user_id', user!.id)
      .is('read_at', null)

    if (updateError) {
      logger.error('Error marking all read', { error: String(updateError) })
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Mark all read POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
