/**
 * Unread Notification Count API
 * GET - Get count of unread notifications for badge display
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
      .is('dismissed_at', null)

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Unread count GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
