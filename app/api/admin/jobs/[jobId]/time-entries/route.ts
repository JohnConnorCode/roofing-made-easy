/**
 * Time Entries API
 * GET - List time entries for a job with summary
 * POST - Clock in (create new time entry)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'

const clockInSchema = z.object({
  notes: z.string().max(2000).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()

    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('job_id', jobId)
      .neq('status', 'voided')
      .order('clock_in', { ascending: false })

    if (error) {
      console.error('Error fetching time entries:', error)
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
    }

    // Enrich with user names from user_profiles
    const userIds = [...new Set((entries || []).map(e => (e as { user_id: string }).user_id))]
    let userMap: Record<string, { first_name: string; last_name: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', userIds)
      userMap = (profiles || []).reduce((acc, p) => {
        const u = p as { id: string; first_name: string; last_name: string }
        acc[u.id] = { first_name: u.first_name, last_name: u.last_name }
        return acc
      }, {} as Record<string, { first_name: string; last_name: string }>)
    }

    interface TimeEntry extends Record<string, unknown> {
      id: string
      user_id: string
      status?: string
      total_hours?: number | null
    }

    const enriched = (entries || []).map(e => {
      const entry = e as TimeEntry
      return { ...entry, user: userMap[entry.user_id] || null }
    })

    // Calculate summary
    const completed = enriched.filter(e => e.status === 'completed')
    const totalHours = completed.reduce(
      (sum, e) => sum + (e.total_hours || 0), 0
    )
    const activeEntry = enriched.find(e => e.status === 'active')

    return NextResponse.json({
      entries: enriched,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        entryCount: completed.length,
        hasActiveEntry: !!activeEntry,
        activeEntryId: activeEntry ? activeEntry.id : null,
      },
    })
  } catch (error) {
    console.error('Time entries GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = clockInSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check for existing active entry for this user on this job
    const { data: existing } = await supabase
      .from('time_entries')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Already clocked in to this job. Clock out first.' },
        { status: 409 }
      )
    }

    const { data: entry, error: insertError } = await supabase
      .from('time_entries')
      .insert({
        job_id: jobId,
        user_id: user.id,
        notes: parsed.data.notes || null,
      } as never)
      .select('*')
      .single()

    if (insertError || !entry) {
      console.error('Error creating time entry:', insertError)
      return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 })
    }

    // Enrich with current user's profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      entry: { ...(entry as Record<string, unknown>), user: profileData || null },
    }, { status: 201 })
  } catch (error) {
    console.error('Time entries POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
