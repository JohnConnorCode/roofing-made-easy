import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema
const createActivitySchema = z.object({
  type: z.enum(['note', 'call', 'email', 'sms', 'status_change', 'quote_sent', 'appointment_scheduled']),
  content: z.string().min(1).max(5000),
  metadata: z.record(z.string(), z.any()).optional(),
  pinned: z.boolean().optional(),
})

interface ActivityRow {
  id: string
  lead_id: string
  type: string
  content: string
  metadata: Record<string, unknown>
  author_name: string | null
  author_email: string | null
  is_system_generated: boolean
  pinned: boolean
  created_at: string
  updated_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const supabase = await createClient()

    // Fetch activities for this lead
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ activities: [] })
      }
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    const activities = (data || []) as ActivityRow[]

    return NextResponse.json({ activities })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError, user } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const body = await request.json()
    const parsed = createActivitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create the activity
    const { data, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        type: parsed.data.type,
        content: parsed.data.content,
        metadata: parsed.data.metadata || {},
        author_name: user?.email?.split('@')[0] || 'Admin',
        author_email: user?.email || null,
        is_system_generated: false,
        pinned: parsed.data.pinned || false,
      } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ activity: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('id')

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only allow deleting non-system activities
    const { error } = await supabase
      .from('lead_activities')
      .delete()
      .eq('id', activityId)
      .eq('is_system_generated', false)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete activity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
