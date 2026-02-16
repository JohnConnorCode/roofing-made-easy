import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const updateSchema = z.object({
  read: z.boolean().optional(),
  dismissed: z.boolean().optional(),
}).strict()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { id } = await params

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (validation.data.read) {
      updates.read_at = new Date().toISOString()
    }
    if (validation.data.dismissed) {
      updates.dismissed_at = new Date().toISOString()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // RLS ensures user can only update their own notifications
    const { error: updateError } = await supabase
      .from('notifications' as never)
      .update(updates as never)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
