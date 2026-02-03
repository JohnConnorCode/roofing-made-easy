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
      l.estimates && (l.estimates as any[]).length > 0
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
        lostDeals: statusCounts['lost'] || 0
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
