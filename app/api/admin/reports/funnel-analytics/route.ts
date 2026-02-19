import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 1), 90)

  const supabase = await createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    // Fetch all relevant events in the date range
    const { data: events, error: fetchError } = await supabase
      .from('analytics_events')
      .select('*' as never)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(10000)

    if (fetchError) {
      logger.error('[Funnel Analytics] Query error', { error: String(fetchError.message) })
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    const rows = (events || []) as Array<{
      session_id: string
      event_type: string
      event_name: string
      funnel_step: number | null
      time_on_page_ms: number | null
      utm_source: string | null
      utm_medium: string | null
      device_type: string | null
      created_at: string
      page_path: string
    }>

    // Unique sessions
    const uniqueSessions = new Set(rows.map(r => r.session_id)).size

    // Funnel step counts
    const funnelSteps = [
      { step: 1, name: 'Property', entered: 'property_entered', completed: 'property_completed' },
      { step: 2, name: 'Details', entered: 'details_entered', completed: 'details_completed' },
      { step: 3, name: 'Contact', entered: 'contact_entered', completed: 'estimate_generated' },
      { step: 4, name: 'Estimate', entered: 'estimate_viewed', completed: null },
    ]

    const funnelData = funnelSteps.map(step => {
      const enteredSessions = new Set(
        rows.filter(r => r.event_name === step.entered).map(r => r.session_id)
      )
      const completedSessions = step.completed
        ? new Set(rows.filter(r => r.event_name === step.completed).map(r => r.session_id))
        : enteredSessions

      return {
        step: step.step,
        name: step.name,
        entered: enteredSessions.size,
        completed: completedSessions.size,
        dropOff: enteredSessions.size > 0
          ? Math.round(((enteredSessions.size - completedSessions.size) / enteredSessions.size) * 100)
          : 0,
      }
    })

    // Conversion counts
    const leadCreated = rows.filter(r => r.event_name === 'lead_created').length
    const estimateGenerated = new Set(
      rows.filter(r => r.event_name === 'estimate_generated').map(r => r.session_id)
    ).size
    const registrationCompleted = rows.filter(r => r.event_name === 'registration_completed').length

    // Time per step (average ms for sessions that have page_exit events)
    const timeEvents = rows.filter(r => r.event_name === 'page_exit' && r.time_on_page_ms)
    const timeByPath: Record<string, number[]> = {}
    for (const ev of timeEvents) {
      const path = ev.page_path
      if (!timeByPath[path]) timeByPath[path] = []
      timeByPath[path].push(ev.time_on_page_ms!)
    }

    const avgTime = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

    const timePerStep = [
      { step: 'Property', avgMs: avgTime(Object.entries(timeByPath).filter(([p]) => p.includes('/property')).flatMap(([, v]) => v)) },
      { step: 'Details', avgMs: avgTime(Object.entries(timeByPath).filter(([p]) => p.includes('/details')).flatMap(([, v]) => v)) },
      { step: 'Contact', avgMs: avgTime(Object.entries(timeByPath).filter(([p]) => p.includes('/contact')).flatMap(([, v]) => v)) },
      { step: 'Estimate', avgMs: avgTime(Object.entries(timeByPath).filter(([p]) => p.includes('/estimate')).flatMap(([, v]) => v)) },
    ]

    // Source attribution
    const sourceMap = new Map<string, { sessions: Set<string>; conversions: number }>()
    for (const ev of rows) {
      const source = ev.utm_source || 'direct'
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { sessions: new Set(), conversions: 0 })
      }
      const entry = sourceMap.get(source)!
      entry.sessions.add(ev.session_id)
      if (ev.event_name === 'estimate_generated') {
        entry.conversions++
      }
    }

    const sources = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        sessions: data.sessions.size,
        conversions: data.conversions,
        conversionRate: data.sessions.size > 0
          ? Math.round((data.conversions / data.sessions.size) * 100)
          : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10)

    // Device breakdown
    const deviceMap = new Map<string, Set<string>>()
    for (const ev of rows) {
      const device = ev.device_type || 'unknown'
      if (!deviceMap.has(device)) deviceMap.set(device, new Set())
      deviceMap.get(device)!.add(ev.session_id)
    }

    const devices = Array.from(deviceMap.entries()).map(([device, sessions]) => ({
      device,
      sessions: sessions.size,
      percentage: uniqueSessions > 0 ? Math.round((sessions.size / uniqueSessions) * 100) : 0,
    }))

    // Daily trends (sessions and conversions per day)
    const dailyMap = new Map<string, { sessions: Set<string>; conversions: number }>()
    for (const ev of rows) {
      const day = ev.created_at.slice(0, 10)
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { sessions: new Set(), conversions: 0 })
      }
      const entry = dailyMap.get(day)!
      entry.sessions.add(ev.session_id)
      if (ev.event_name === 'estimate_generated') {
        entry.conversions++
      }
    }

    const dailyTrends = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sessions: data.sessions.size,
        conversions: data.conversions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // CTA clicks
    const ctaClicks = rows
      .filter(r => r.event_type === 'cta_click')
      .reduce((acc, r) => {
        acc[r.event_name] = (acc[r.event_name] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Source Revenue Attribution: join leads + estimates by utm_source
    let sourceRevenue: Array<{
      source: string; leads: number; won: number; pipelineValue: number
    }> = []
    try {
      const { data: leadData } = await supabase
        .from('leads')
        .select('id, status, utm_source, estimates(price_likely)')
        .gte('created_at', since)
        .limit(1000)

      if (leadData) {
        const revenueBySource = new Map<string, { leads: number; won: number; pipelineValue: number }>()
        for (const lead of leadData as Array<{
          id: string; status: string; utm_source: string | null
          estimates: { price_likely: number }[] | null
        }>) {
          const source = lead.utm_source || 'direct'
          if (!revenueBySource.has(source)) {
            revenueBySource.set(source, { leads: 0, won: 0, pipelineValue: 0 })
          }
          const entry = revenueBySource.get(source)!
          entry.leads++
          if (lead.status === 'won') entry.won++
          entry.pipelineValue += lead.estimates?.[0]?.price_likely || 0
        }

        sourceRevenue = Array.from(revenueBySource.entries())
          .map(([source, data]) => ({ source, ...data }))
          .sort((a, b) => b.pipelineValue - a.pipelineValue)
      }
    } catch {
      // Non-critical - continue without source revenue
    }

    // Device Conversion Rates
    const deviceConversionMap = new Map<string, { sessions: Set<string>; conversions: number }>()
    for (const ev of rows) {
      const device = ev.device_type || 'unknown'
      if (!deviceConversionMap.has(device)) {
        deviceConversionMap.set(device, { sessions: new Set(), conversions: 0 })
      }
      const entry = deviceConversionMap.get(device)!
      entry.sessions.add(ev.session_id)
      if (ev.event_name === 'estimate_generated') {
        entry.conversions++
      }
    }

    const deviceConversions = Array.from(deviceConversionMap.entries()).map(([device, data]) => ({
      device,
      sessions: data.sessions.size,
      conversions: data.conversions,
      conversionRate: data.sessions.size > 0
        ? Math.round((data.conversions / data.sessions.size) * 100)
        : 0,
      percentage: uniqueSessions > 0 ? Math.round((data.sessions.size / uniqueSessions) * 100) : 0,
    }))

    return NextResponse.json({
      period: { days, since },
      overview: {
        totalSessions: uniqueSessions,
        totalEvents: rows.length,
        leadsCreated: leadCreated,
        estimatesGenerated: estimateGenerated,
        registrations: registrationCompleted,
        overallConversionRate: uniqueSessions > 0
          ? Math.round((estimateGenerated / uniqueSessions) * 100)
          : 0,
      },
      funnel: funnelData,
      timePerStep,
      sources,
      sourceRevenue,
      devices: deviceConversions,
      dailyTrends,
      ctaClicks,
    })
  } catch (err) {
    logger.error('[Funnel Analytics] Error', { error: String(err) })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
