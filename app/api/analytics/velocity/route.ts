import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createClient } from '@/lib/supabase/server'

interface StageVelocity {
  stage: string
  avgDurationMinutes: number
  avgDurationDays: number
  totalLeads: number
  medianDurationMinutes: number
}

interface ConversionStep {
  fromStage: string
  toStage: string
  count: number
  percentage: number
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '90', 10)

  const supabase = await createClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // Fetch stage history for velocity calculations
  const { data: stageHistory, error: historyError } = await supabase
    .from('lead_stage_history' as never)
    .select('*')
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true })

  if (historyError) {
    return NextResponse.json(
      { error: 'Failed to fetch stage history' },
      { status: 500 }
    )
  }

  const history = stageHistory as Array<{
    id: string
    lead_id: string
    from_stage: string | null
    to_stage: string
    duration_minutes: number | null
    created_at: string
  }> || []

  // Calculate average duration per stage
  const stageDurations: Record<string, number[]> = {}
  for (const entry of history) {
    const stage = entry.from_stage || 'new'
    if (entry.duration_minutes && entry.duration_minutes > 0) {
      if (!stageDurations[stage]) {
        stageDurations[stage] = []
      }
      stageDurations[stage].push(entry.duration_minutes)
    }
  }

  const stageVelocity: StageVelocity[] = Object.entries(stageDurations).map(([stage, durations]) => {
    const sorted = [...durations].sort((a, b) => a - b)
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    return {
      stage,
      avgDurationMinutes: Math.round(avg),
      avgDurationDays: Math.round(avg / 1440 * 10) / 10,
      totalLeads: durations.length,
      medianDurationMinutes: Math.round(median)
    }
  })

  // Calculate conversion funnel
  const stageOrder = [
    'new',
    'intake_started',
    'intake_complete',
    'estimate_generated',
    'consultation_scheduled',
    'quote_sent',
    'won'
  ]

  const stageTransitions: Record<string, Record<string, number>> = {}
  for (const entry of history) {
    const from = entry.from_stage || 'start'
    const to = entry.to_stage
    if (!stageTransitions[from]) {
      stageTransitions[from] = {}
    }
    stageTransitions[from][to] = (stageTransitions[from][to] || 0) + 1
  }

  // Calculate conversion rates between sequential stages
  const conversions: ConversionStep[] = []
  for (let i = 0; i < stageOrder.length - 1; i++) {
    const from = stageOrder[i]
    const to = stageOrder[i + 1]
    const fromTotal = history.filter(h => h.from_stage === from).length || 1
    const toCount = stageTransitions[from]?.[to] || 0
    conversions.push({
      fromStage: from,
      toStage: to,
      count: toCount,
      percentage: Math.round((toCount / fromTotal) * 100)
    })
  }

  // Fetch leads for cohort analysis
  const { data: leads } = await supabase
    .from('leads' as never)
    .select('id, status, created_at')
    .gte('created_at', cutoffDate.toISOString())

  const leadsData = leads as Array<{
    id: string
    status: string
    created_at: string
  }> || []

  // Group by month for cohort analysis
  const cohorts: Record<string, { total: number; won: number; lost: number; active: number }> = {}
  for (const lead of leadsData) {
    const month = lead.created_at.substring(0, 7) // YYYY-MM
    if (!cohorts[month]) {
      cohorts[month] = { total: 0, won: 0, lost: 0, active: 0 }
    }
    cohorts[month].total++
    if (lead.status === 'won') cohorts[month].won++
    else if (lead.status === 'lost' || lead.status === 'archived') cohorts[month].lost++
    else cohorts[month].active++
  }

  // Calculate deal velocity (time from new to won)
  const wonLeads = new Set(
    leadsData.filter(l => l.status === 'won').map(l => l.id)
  )

  const dealVelocities: number[] = []
  const leadStartTimes: Record<string, string> = {}

  for (const entry of history) {
    if (!entry.from_stage && entry.to_stage === 'new') {
      leadStartTimes[entry.lead_id] = entry.created_at
    }
    if (entry.to_stage === 'won' && wonLeads.has(entry.lead_id)) {
      const startTime = leadStartTimes[entry.lead_id]
      if (startTime) {
        const start = new Date(startTime)
        const end = new Date(entry.created_at)
        const daysToClose = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        if (daysToClose > 0) {
          dealVelocities.push(daysToClose)
        }
      }
    }
  }

  const avgDealVelocity = dealVelocities.length > 0
    ? Math.round(dealVelocities.reduce((a, b) => a + b, 0) / dealVelocities.length)
    : 0

  return NextResponse.json({
    period: {
      days,
      from: cutoffDate.toISOString(),
      to: new Date().toISOString()
    },
    stageVelocity: stageVelocity.sort((a, b) => {
      const aIndex = stageOrder.indexOf(a.stage)
      const bIndex = stageOrder.indexOf(b.stage)
      return aIndex - bIndex
    }),
    conversions,
    cohorts: Object.entries(cohorts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
        conversionRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0
      })),
    dealVelocity: {
      avgDaysToClose: avgDealVelocity,
      dealsAnalyzed: dealVelocities.length
    }
  })
}
