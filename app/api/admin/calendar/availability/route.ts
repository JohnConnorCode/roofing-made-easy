/**
 * Crew Availability API
 * GET - Get crew availability for a date range
 * POST - Set availability for a user/date
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const setAvailabilitySchema = z.object({
  user_id: z.string().uuid(),
  date: z.string(),
  available: z.boolean(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  reason: z.string().max(255).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const userId = searchParams.get('user_id')
    const teamId = searchParams.get('team_id')

    let query = supabase
      .from('crew_availability')
      .select('*')
      .order('date', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (userId) query = query.eq('user_id', userId)

    if (teamId) {
      // Get team members first
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      if (members && members.length > 0) {
        const memberIds = members.map((m) => (m as { user_id: string }).user_id)
        query = query.in('user_id', memberIds)
      }
    }

    const { data: availability, error } = await query

    if (error) {
      logger.error('Error fetching crew availability', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }

    return NextResponse.json({ availability })
  } catch (error) {
    logger.error('Availability GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'calendar', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = setAvailabilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    // Upsert - update if exists, insert if not
    const { data: availability, error: upsertError } = await supabase
      .from('crew_availability')
      .upsert({
        user_id: data.user_id,
        date: data.date,
        available: data.available,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        reason: data.reason || null,
      } as never, {
        onConflict: 'user_id,date',
      })
      .select()
      .single()

    if (upsertError || !availability) {
      logger.error('Error setting availability', { error: String(upsertError) })
      return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 })
    }

    return NextResponse.json({ availability })
  } catch (error) {
    logger.error('Availability POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
