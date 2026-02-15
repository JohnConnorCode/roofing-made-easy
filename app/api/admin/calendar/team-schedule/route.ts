/**
 * Team Schedule API
 * GET - Weekly team view showing who is where
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'

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

    const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('end') || (() => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + 7)
      return d.toISOString().split('T')[0]
    })()

    const teamId = searchParams.get('team_id')

    // Get team members
    let membersQuery = supabase
      .from('user_profiles')
      .select('id, first_name, last_name, role, avatar_url')
      .eq('is_active', true)

    if (teamId) {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      if (teamMembers && teamMembers.length > 0) {
        const memberIds = teamMembers.map((m) => (m as { user_id: string }).user_id)
        membersQuery = membersQuery.in('id', memberIds)
      }
    }

    const { data: members } = await membersQuery

    // Get events for date range
    const { data: events } = await supabase
      .from('calendar_events')
      .select(`
        id, title, event_type, start_at, end_at, all_day, status, color,
        assigned_to, assigned_team_id,
        job:job_id(id, job_number)
      `)
      .gte('start_at', `${startDate}T00:00:00Z`)
      .lte('start_at', `${endDate}T23:59:59Z`)
      .neq('status', 'cancelled')
      .order('start_at', { ascending: true })

    // Get availability
    const { data: availability } = await supabase
      .from('crew_availability')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)

    // Build schedule per member
    const schedule = (members || []).map((member) => {
      const m = member as { id: string; first_name: string | null; last_name: string | null; role: string }
      const memberEvents = (events || []).filter((e) => (e as { assigned_to: string }).assigned_to === m.id)
      const memberAvailability = (availability || []).filter((a) => (a as { user_id: string }).user_id === m.id)

      return {
        member: {
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          role: m.role,
        },
        events: memberEvents,
        availability: memberAvailability,
      }
    })

    return NextResponse.json({
      schedule,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error('Team schedule GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
