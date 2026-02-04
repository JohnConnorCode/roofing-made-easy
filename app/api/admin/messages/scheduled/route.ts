/**
 * Scheduled Messages API
 * GET - List scheduled messages
 * DELETE - Cancel a scheduled message
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { parsePagination } from '@/lib/api/auth'
import type { MessageStatus, MessageChannel } from '@/lib/communication/types'

// GET /api/admin/messages/scheduled - List scheduled messages
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as MessageStatus | null
    const channel = searchParams.get('channel') as MessageChannel | null
    const leadId = searchParams.get('lead_id')
    const workflowId = searchParams.get('workflow_id')
    const { limit, offset } = parsePagination(searchParams)

    let query = supabase
      .from('scheduled_messages')
      .select(`
        *,
        workflow:workflow_id(
          id,
          name
        ),
        template:template_id(
          id,
          name
        )
      `, { count: 'exact' })
      .order('scheduled_for', { ascending: true })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: show pending/scheduled messages
      query = query.in('status', ['pending', 'scheduled'])
    }

    if (channel) {
      query = query.eq('channel', channel)
    }

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    if (workflowId) {
      query = query.eq('workflow_id', workflowId)
    }

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Error fetching scheduled messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled messages' },
        { status: 500 }
      )
    }

    // Get status counts
    const { data: statusCounts } = await supabase
      .from('scheduled_messages')
      .select('status')

    const counts = (statusCounts as { status: string }[] || []).reduce((acc, msg) => {
      const s = msg.status
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      messages,
      total: count,
      limit,
      offset,
      counts,
    })
  } catch (error) {
    console.error('Scheduled messages GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/messages/scheduled - Cancel a scheduled message
export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check message exists and is cancellable
    const { data: message } = await supabase
      .from('scheduled_messages')
      .select('status')
      .eq('id', messageId)
      .single()

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (!['pending', 'scheduled'].includes((message as { status: string }).status)) {
      return NextResponse.json(
        { error: 'Only pending or scheduled messages can be cancelled' },
        { status: 400 }
      )
    }

    // Cancel the message
    const { error: updateError } = await supabase
      .from('scheduled_messages')
      .update({
        status: 'cancelled',
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
      } as never)
      .eq('id', messageId)

    if (updateError) {
      console.error('Error cancelling message:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Scheduled messages DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
