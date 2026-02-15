/**
 * Lead Conversion Funnel Report
 * GET - Returns lead counts by status for funnel visualization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'

const FUNNEL_ORDER = [
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'estimate_sent',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived',
]

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  intake_started: 'Intake Started',
  intake_complete: 'Intake Complete',
  estimate_generated: 'Estimate Generated',
  estimate_sent: 'Estimate Sent',
  consultation_scheduled: 'Consultation Scheduled',
  quote_sent: 'Quote Sent',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
}

export async function GET(_request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .select('status')

    if (error) {
      console.error('Error fetching lead funnel:', error)
      return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 })
    }

    // Count by status
    const counts: Record<string, number> = {}
    for (const row of (data || [])) {
      const status = (row as { status: string }).status
      counts[status] = (counts[status] || 0) + 1
    }

    // Build ordered funnel data
    const funnel = FUNNEL_ORDER.map(status => ({
      status,
      label: STATUS_LABELS[status] || status,
      count: counts[status] || 0,
    }))

    const totalLeads = (data || []).length
    const wonCount = counts['won'] || 0
    const conversionRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0

    return NextResponse.json({
      funnel,
      summary: {
        totalLeads,
        wonCount,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    })
  } catch (error) {
    console.error('Lead funnel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
