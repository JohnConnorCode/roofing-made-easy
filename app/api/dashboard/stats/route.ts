import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Fetch all leads with estimates
    const { data: allLeads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        status,
        source,
        created_at,
        updated_at,
        estimates(price_likely)
      `)
      .order('updated_at', { ascending: false })

    if (leadsError) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboard stats' },
        { status: 500 }
      )
    }

    interface LeadWithEstimates {
      id: string
      status: string
      source: string
      created_at: string
      updated_at: string
      estimates: { price_likely: number }[] | null
    }
    const leads = (allLeads || []) as LeadWithEstimates[]

    // Calculate stats
    const totalLeads = leads.length
    const newLeadsThisMonth = leads.filter(l =>
      new Date(l.created_at) >= startOfMonth
    ).length
    const newLeadsLastMonth = leads.filter(l =>
      new Date(l.created_at) >= startOfLastMonth &&
      new Date(l.created_at) <= endOfLastMonth
    ).length

    // Status counts
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Pipeline value (all leads not won/lost/archived)
    const pipelineLeads = leads.filter(l =>
      !['won', 'lost', 'archived'].includes(l.status)
    )
    const pipelineValue = pipelineLeads.reduce((sum, lead) => {
      const estimates = lead.estimates as { price_likely: number }[] | null
      return sum + (estimates?.[0]?.price_likely || 0)
    }, 0)

    // Closed value (won leads)
    const wonLeads = leads.filter(l => l.status === 'won')
    const closedValue = wonLeads.reduce((sum, lead) => {
      const estimates = lead.estimates as { price_likely: number }[] | null
      return sum + (estimates?.[0]?.price_likely || 0)
    }, 0)

    // Win rate
    const closedDeals = wonLeads.length + statusCounts['lost'] || 0
    const winRate = closedDeals > 0 ? Math.round((wonLeads.length / closedDeals) * 100) : 0

    // Conversion rate (leads with estimates / total leads)
    const leadsWithEstimates = leads.filter(l =>
      l.estimates && (l.estimates as unknown[]).length > 0
    ).length
    const conversionRate = totalLeads > 0 ? Math.round((leadsWithEstimates / totalLeads) * 100) : 0

    // Month-over-month growth
    const mtdGrowth = newLeadsLastMonth > 0
      ? Math.round(((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100)
      : newLeadsThisMonth > 0 ? 100 : 0

    // Recent 30-day vs previous 30-day
    const last30Days = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length
    const prev30Days = leads.filter(l =>
      new Date(l.created_at) >= sixtyDaysAgo &&
      new Date(l.created_at) < thirtyDaysAgo
    ).length
    const thirtyDayGrowth = prev30Days > 0
      ? Math.round(((last30Days - prev30Days) / prev30Days) * 100)
      : last30Days > 0 ? 100 : 0

    // Source breakdown
    const sourceBreakdown = leads.reduce((acc, lead) => {
      const source = lead.source || 'unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent activity (leads that changed status recently)
    const recentActivity = leads
      .filter(l => new Date(l.updated_at) >= thirtyDaysAgo)
      .slice(0, 10)
      .map(l => ({
        id: l.id,
        status: l.status,
        updated_at: l.updated_at
      }))

    // Speed-to-Lead: avg minutes to first non-system contact activity for leads this month
    const monthLeadIds = leads
      .filter(l => new Date(l.created_at) >= startOfMonth)
      .map(l => l.id)

    let avgResponseMinutes: number | null = null
    let staleLeadCount = 0
    const staleLeadIds: string[] = []

    if (monthLeadIds.length > 0) {
      const { data: activities } = await supabase
        .from('lead_activities')
        .select('lead_id, type, created_at, is_system_generated')
        .in('lead_id', monthLeadIds.slice(0, 100))
        .in('type', ['call', 'email', 'sms'])
        .eq('is_system_generated', false)
        .order('created_at', { ascending: true })

      if (activities && activities.length > 0) {
        // Find first contact per lead
        const firstContactByLead = new Map<string, string>()
        for (const act of activities as { lead_id: string; created_at: string }[]) {
          if (!firstContactByLead.has(act.lead_id)) {
            firstContactByLead.set(act.lead_id, act.created_at)
          }
        }

        // Calculate avg response time
        const responseTimes: number[] = []
        const leadMap = new Map(leads.map(l => [l.id, l]))
        for (const [leadId, firstContact] of firstContactByLead) {
          const lead = leadMap.get(leadId)
          if (lead) {
            const diffMs = new Date(firstContact).getTime() - new Date(lead.created_at).getTime()
            responseTimes.push(diffMs / 60000) // convert to minutes
          }
        }
        if (responseTimes.length > 0) {
          avgResponseMinutes = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        }
      }
    }

    // Stale leads: open leads with no activity in 48+ hours
    const openLeads = leads.filter(l =>
      !['won', 'lost', 'archived'].includes(l.status)
    )
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    if (openLeads.length > 0) {
      const openLeadIds = openLeads.map(l => l.id).slice(0, 200)
      const { data: recentActivities } = await supabase
        .from('lead_activities')
        .select('lead_id, created_at')
        .in('lead_id', openLeadIds)
        .order('created_at', { ascending: false })

      // Find latest activity per lead
      const latestActivityByLead = new Map<string, string>()
      for (const act of (recentActivities || []) as { lead_id: string; created_at: string }[]) {
        if (!latestActivityByLead.has(act.lead_id)) {
          latestActivityByLead.set(act.lead_id, act.created_at)
        }
      }

      for (const lead of openLeads) {
        const lastActivity = latestActivityByLead.get(lead.id)
        if (!lastActivity || new Date(lastActivity) < fortyEightHoursAgo) {
          staleLeadCount++
          if (staleLeadIds.length < 10) staleLeadIds.push(lead.id)
        }
      }
    }

    // Revenue MTD: sum contract_amount from jobs completed this month
    let revenueMTD = 0
    const { data: completedJobs } = await supabase
      .from('jobs')
      .select('contract_amount')
      .in('status', ['completed', 'warranty_active', 'closed'])
      .gte('actual_end', startOfMonth.toISOString())

    if (completedJobs) {
      revenueMTD = (completedJobs as { contract_amount: number }[]).reduce(
        (sum, j) => sum + (j.contract_amount || 0), 0
      )
    }

    return NextResponse.json({
      stats: {
        totalLeads,
        newLeadsThisMonth,
        newLeadsLastMonth,
        mtdGrowth,
        thirtyDayGrowth,
        pipelineValue,
        closedValue,
        winRate,
        conversionRate,
        estimatesGenerated: leadsWithEstimates,
        wonDeals: wonLeads.length,
        lostDeals: statusCounts['lost'] || 0,
        avgResponseMinutes,
        staleLeadCount,
        staleLeadIds,
        revenueMTD,
      },
      statusCounts,
      sourceBreakdown,
      recentActivity
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
