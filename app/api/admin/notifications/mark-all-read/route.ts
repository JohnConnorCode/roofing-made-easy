/**
 * Mark All Notifications Read API
 * POST - Mark all unread notifications as read for the current user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() } as never)
      .eq('user_id', user.id)
      .is('read_at', null)

    if (updateError) {
      console.error('Error marking all read:', updateError)
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all read POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
