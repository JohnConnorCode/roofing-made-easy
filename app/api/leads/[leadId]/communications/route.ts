/**
 * Lead Communications API
 * GET - List communication history for a lead
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'

interface RouteParams {
  params: Promise<{ leadId: string }>
}

// GET /api/leads/[leadId]/communications
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { leadId } = await params
    const { error: authError } = await requirePermission('leads', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch communication logs for this lead
    const { data: logs, error, count } = await supabase
      .from('communication_logs')
      .select(`
        id,
        channel,
        direction,
        status,
        recipient_email,
        recipient_phone,
        subject,
        body,
        external_status,
        workflow:workflow_id(
          id,
          name
        ),
        template:template_id(
          id,
          name
        ),
        created_at
      `, { count: 'exact' })
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching lead communications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch communications' },
        { status: 500 }
      )
    }

    // Also fetch scheduled messages for this lead
    const { data: scheduled } = await supabase
      .from('scheduled_messages')
      .select(`
        id,
        channel,
        scheduled_for,
        status,
        workflow:workflow_id(
          id,
          name
        ),
        template:template_id(
          id,
          name
        )
      `)
      .eq('lead_id', leadId)
      .in('status', ['pending', 'scheduled'])
      .order('scheduled_for', { ascending: true })

    return NextResponse.json({
      logs: logs || [],
      scheduled: scheduled || [],
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Lead communications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
