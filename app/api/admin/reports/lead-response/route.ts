/**
 * Lead Response Report API
 * GET - Speed-to-lead metrics, activity volume, stale leads
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 1), 90)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Fetch leads created in the period
    const { data: leads } = await supabase
      .from('leads')
      .select('id, status, created_at, utm_source, estimates(price_likely)')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(500)

    const leadRows = (leads || []) as Array<{
      id: string; status: string; created_at: string; utm_source: string | null
      estimates: { price_likely: number }[] | null
    }>
    const leadIds = leadRows.map(l => l.id)

    // Fetch all activities for these leads
    const { data: activities } = leadIds.length > 0
      ? await supabase
          .from('lead_activities')
          .select('lead_id, type, created_at, is_system_generated')
          .in('lead_id', leadIds.slice(0, 200))
          .order('created_at', { ascending: true })
      : { data: [] }

    const activityRows = (activities || []) as Array<{
      lead_id: string; type: string; created_at: string; is_system_generated: boolean
    }>

    // Speed-to-Lead: find first human contact activity per lead
    const firstContactByLead = new Map<string, string>()
    for (const act of activityRows) {
      if (!act.is_system_generated && ['call', 'email', 'sms'].includes(act.type)) {
        if (!firstContactByLead.has(act.lead_id)) {
          firstContactByLead.set(act.lead_id, act.created_at)
        }
      }
    }

    const leadMap = new Map(leadRows.map(l => [l.id, l]))
    const responseTimes: number[] = []
    for (const [leadId, firstContact] of firstContactByLead) {
      const lead = leadMap.get(leadId)
      if (lead) {
        const diffMinutes = (new Date(firstContact).getTime() - new Date(lead.created_at).getTime()) / 60000
        responseTimes.push(diffMinutes)
      }
    }

    const sorted = [...responseTimes].sort((a, b) => a - b)
    const avgResponseMinutes = sorted.length > 0
      ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
      : null
    const medianResponseMinutes = sorted.length > 0
      ? Math.round(sorted[Math.floor(sorted.length / 2)])
      : null

    const under5Min = sorted.filter(t => t <= 5).length
    const under30Min = sorted.filter(t => t <= 30).length
    const under1Hr = sorted.filter(t => t <= 60).length

    const pctUnder5 = sorted.length > 0 ? Math.round((under5Min / sorted.length) * 100) : 0
    const pctUnder30 = sorted.length > 0 ? Math.round((under30Min / sorted.length) * 100) : 0
    const pctUnder1Hr = sorted.length > 0 ? Math.round((under1Hr / sorted.length) * 100) : 0

    // Response time by source
    const sourceStats = new Map<string, { responseTimes: number[]; total: number; won: number; pipelineValue: number }>()
    for (const lead of leadRows) {
      const source = lead.utm_source || 'direct'
      if (!sourceStats.has(source)) {
        sourceStats.set(source, { responseTimes: [], total: 0, won: 0, pipelineValue: 0 })
      }
      const stats = sourceStats.get(source)!
      stats.total++
      if (lead.status === 'won') stats.won++
      stats.pipelineValue += lead.estimates?.[0]?.price_likely || 0

      const firstContact = firstContactByLead.get(lead.id)
      if (firstContact) {
        const diffMinutes = (new Date(firstContact).getTime() - new Date(lead.created_at).getTime()) / 60000
        stats.responseTimes.push(diffMinutes)
      }
    }

    const responseBySource = Array.from(sourceStats.entries())
      .map(([source, stats]) => ({
        source,
        leads: stats.total,
        avgResponseMinutes: stats.responseTimes.length > 0
          ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
          : null,
        conversionRate: stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0,
        pipelineValue: stats.pipelineValue,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 10)

    // Activity volume breakdown
    const activityCounts: Record<string, number> = {}
    const dailyActivityMap = new Map<string, number>()
    for (const act of activityRows) {
      if (!act.is_system_generated) {
        activityCounts[act.type] = (activityCounts[act.type] || 0) + 1
        const day = act.created_at.slice(0, 10)
        dailyActivityMap.set(day, (dailyActivityMap.get(day) || 0) + 1)
      }
    }

    const totalActivities = Object.values(activityCounts).reduce((a, b) => a + b, 0)

    // Daily response time trend
    const dailyResponseMap = new Map<string, number[]>()
    for (const [leadId, firstContact] of firstContactByLead) {
      const lead = leadMap.get(leadId)
      if (lead) {
        const day = lead.created_at.slice(0, 10)
        const diffMinutes = (new Date(firstContact).getTime() - new Date(lead.created_at).getTime()) / 60000
        if (!dailyResponseMap.has(day)) dailyResponseMap.set(day, [])
        dailyResponseMap.get(day)!.push(diffMinutes)
      }
    }

    const dailyTrends = Array.from(dailyResponseMap.entries())
      .map(([date, times]) => ({
        date,
        avgResponseMinutes: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        leadsResponded: times.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Stale leads: open leads with no activity in 48+ hours
    const openLeads = leadRows.filter(l =>
      !['won', 'lost', 'archived'].includes(l.status)
    )

    // Get latest activity per lead for open leads
    const latestActivityByLead = new Map<string, string>()
    for (const act of activityRows) {
      const existing = latestActivityByLead.get(act.lead_id)
      if (!existing || act.created_at > existing) {
        latestActivityByLead.set(act.lead_id, act.created_at)
      }
    }

    // Also fetch open leads outside of the "days" filter for stale detection
    const { data: allOpenLeads } = await supabase
      .from('leads')
      .select('id, status, created_at, utm_source, contacts(first_name, last_name)')
      .not('status', 'in', '("won","lost","archived")')
      .order('created_at', { ascending: false })
      .limit(200)

    const allOpenRows = (allOpenLeads || []) as Array<{
      id: string; status: string; created_at: string; utm_source: string | null
      contacts: { first_name: string; last_name: string }[] | null
    }>

    // Get activities for open leads outside the initial set
    const missingIds = allOpenRows.map(l => l.id).filter(id => !leadIds.includes(id))
    if (missingIds.length > 0) {
      const { data: extraActivities } = await supabase
        .from('lead_activities')
        .select('lead_id, created_at')
        .in('lead_id', missingIds.slice(0, 200))
        .order('created_at', { ascending: false })

      for (const act of (extraActivities || []) as { lead_id: string; created_at: string }[]) {
        const existing = latestActivityByLead.get(act.lead_id)
        if (!existing || act.created_at > existing) {
          latestActivityByLead.set(act.lead_id, act.created_at)
        }
      }
    }

    const staleLeads = allOpenRows
      .filter(lead => {
        const lastActivity = latestActivityByLead.get(lead.id)
        return !lastActivity || new Date(lastActivity) < fortyEightHoursAgo
      })
      .map(lead => {
        const lastActivity = latestActivityByLead.get(lead.id)
        const daysSinceActivity = lastActivity
          ? Math.round((Date.now() - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000))
          : Math.round((Date.now() - new Date(lead.created_at).getTime()) / (24 * 60 * 60 * 1000))
        const contact = lead.contacts?.[0]
        return {
          id: lead.id,
          name: contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : 'Unknown',
          status: lead.status,
          daysSinceActivity,
          lastActivity: lastActivity || null,
        }
      })
      .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)
      .slice(0, 20)

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      speedToLead: {
        avgMinutes: avgResponseMinutes,
        medianMinutes: medianResponseMinutes,
        pctUnder5Min: pctUnder5,
        pctUnder30Min: pctUnder30,
        pctUnder1Hr: pctUnder1Hr,
        totalLeads: leadRows.length,
        leadsWithResponse: firstContactByLead.size,
      },
      responseBySource,
      activityVolume: {
        total: totalActivities,
        breakdown: activityCounts,
      },
      dailyTrends,
      staleLeads,
      staleLeadCount: staleLeads.length,
    })
  } catch (error) {
    console.error('Lead response report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
