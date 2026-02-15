/**
 * Time Entry Detail API
 * PATCH - Clock out, edit break/notes
 * DELETE - Void an entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'

const updateSchema = z.object({
  clock_out: z.boolean().optional(), // true = clock out now
  break_minutes: z.number().min(0).max(480).optional(),
  notes: z.string().max(2000).optional(),
})

type Params = { params: Promise<{ jobId: string; entryId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, entryId } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const updates: Record<string, unknown> = {}

    if (parsed.data.clock_out) {
      updates.clock_out = new Date().toISOString()
      updates.status = 'completed'
    }

    if (parsed.data.break_minutes !== undefined) {
      updates.break_minutes = parsed.data.break_minutes
    }

    if (parsed.data.notes !== undefined) {
      updates.notes = parsed.data.notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: entry, error: updateError } = await supabase
      .from('time_entries')
      .update(updates as never)
      .eq('id', entryId)
      .eq('job_id', jobId)
      .select('*')
      .single()

    if (updateError || !entry) {
      console.error('Error updating time entry:', updateError)
      return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 })
    }

    // Enrich with user profile
    const userId = (entry as { user_id: string }).user_id
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    return NextResponse.json({ entry: { ...(entry as Record<string, unknown>), user: profileData || null } })
  } catch (error) {
    console.error('Time entry PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, entryId } = await params
    const supabase = await createClient()

    // Void instead of hard delete
    const { error: updateError } = await supabase
      .from('time_entries')
      .update({ status: 'voided' } as never)
      .eq('id', entryId)
      .eq('job_id', jobId)

    if (updateError) {
      console.error('Error voiding time entry:', updateError)
      return NextResponse.json({ error: 'Failed to void time entry' }, { status: 500 })
    }

    return NextResponse.json({ voided: true })
  } catch (error) {
    console.error('Time entry DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
