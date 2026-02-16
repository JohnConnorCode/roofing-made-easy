/**
 * Financing Performance Report API
 * GET - Application pipeline, lender stats, credit ranges, conversion impact
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'

export async function GET(_request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(profile, 'reports', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    // Fetch applications, won leads, and total lead count in parallel
    const [appResult, wonLeadsResult, totalLeadsResult] = await Promise.all([
      supabase
        .from('financing_applications')
        .select('id, lead_id, status, amount_requested, pre_approved_amount, approved_rate, approved_term_months, lender_name, credit_range, created_at')
        .limit(2000),
      supabase
        .from('leads')
        .select('id, status')
        .eq('status', 'won'),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true }),
    ])

    const apps = (appResult.data || []) as Array<{
      id: string; lead_id: string | null; status: string
      amount_requested: number | null; pre_approved_amount: number | null
      approved_rate: number | null; approved_term_months: number | null
      lender_name: string | null; credit_range: string | null; created_at: string
    }>
    const wonLeads = (wonLeadsResult.data || []) as Array<{ id: string; status: string }>
    const totalLeadCount = totalLeadsResult.count || 0

    // Pipeline
    const statusCounts: Record<string, number> = {}
    for (const a of apps) {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
    }
    const pipeline = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))

    // Summary
    const approvedApps = apps.filter(a => a.status === 'approved')
    const deniedApps = apps.filter(a => a.status === 'denied')
    const totalRequestedAmount = apps.reduce((sum, a) => sum + (a.amount_requested || 0), 0)
    const totalApprovedAmount = approvedApps.reduce((sum, a) => sum + (a.pre_approved_amount || 0), 0)
    const avgRequestedAmount = apps.length > 0 ? Math.round(totalRequestedAmount / apps.length) : 0
    const avgApprovedAmount = approvedApps.length > 0 ? Math.round(totalApprovedAmount / approvedApps.length) : 0

    // By credit range
    const creditMap = new Map<string, { count: number; approvedCount: number }>()
    for (const a of apps) {
      const range = a.credit_range || 'Unknown'
      if (!creditMap.has(range)) {
        creditMap.set(range, { count: 0, approvedCount: 0 })
      }
      const cr = creditMap.get(range)!
      cr.count++
      if (a.status === 'approved') cr.approvedCount++
    }
    const byCreditRange = Array.from(creditMap.entries())
      .map(([creditRange, data]) => ({
        creditRange,
        count: data.count,
        approvedCount: data.approvedCount,
        approvalRate: data.count > 0 ? Math.round((data.approvedCount / data.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // By lender
    const lenderMap = new Map<string, {
      count: number; approvedCount: number; totalApproved: number; rates: number[]; terms: number[]
    }>()
    for (const a of apps) {
      const lender = a.lender_name || 'Unknown'
      if (!lenderMap.has(lender)) {
        lenderMap.set(lender, { count: 0, approvedCount: 0, totalApproved: 0, rates: [], terms: [] })
      }
      const ld = lenderMap.get(lender)!
      ld.count++
      if (a.status === 'approved') {
        ld.approvedCount++
        ld.totalApproved += a.pre_approved_amount || 0
        if (a.approved_rate != null) ld.rates.push(a.approved_rate)
        if (a.approved_term_months != null) ld.terms.push(a.approved_term_months)
      }
    }
    const byLender = Array.from(lenderMap.entries())
      .map(([lenderName, data]) => ({
        lenderName,
        count: data.count,
        approvedCount: data.approvedCount,
        approvalRate: data.count > 0 ? Math.round((data.approvedCount / data.count) * 100) : 0,
        avgApprovedAmount: data.approvedCount > 0 ? Math.round(data.totalApproved / data.approvedCount) : 0,
        avgRate: data.rates.length > 0
          ? Math.round((data.rates.reduce((a, b) => a + b, 0) / data.rates.length) * 100) / 100
          : null,
        avgTermMonths: data.terms.length > 0
          ? Math.round(data.terms.reduce((a, b) => a + b, 0) / data.terms.length)
          : null,
      }))
      .sort((a, b) => b.count - a.count)

    // Conversion impact: leads with financing vs without
    const wonLeadIds = new Set(wonLeads.map(l => l.id))
    const financedLeadIds = new Set(apps.map(a => a.lead_id).filter(Boolean))
    const financedWonCount = [...financedLeadIds].filter(id => wonLeadIds.has(id!)).length
    const financedWinRate = financedLeadIds.size > 0
      ? Math.round((financedWonCount / financedLeadIds.size) * 100)
      : 0
    const nonFinancedWonCount = wonLeads.length - financedWonCount
    const nonFinancedLeadCount = totalLeadCount - financedLeadIds.size
    const nonFinancedWinRate = nonFinancedLeadCount > 0
      ? Math.round((nonFinancedWonCount / nonFinancedLeadCount) * 100)
      : 0
    const liftPct = nonFinancedWinRate > 0
      ? Math.round(((financedWinRate - nonFinancedWinRate) / nonFinancedWinRate) * 100)
      : 0

    // Pending applications
    const terminalStatuses = ['approved', 'denied', 'withdrawn']
    const now = Date.now()
    const pendingApplications = apps
      .filter(a => !terminalStatuses.includes(a.status))
      .map(a => ({
        id: a.id,
        lenderName: a.lender_name || 'Unknown',
        status: a.status,
        requestedAmount: a.amount_requested || 0,
        daysPending: Math.ceil((now - new Date(a.created_at).getTime()) / (24 * 60 * 60 * 1000)),
      }))
      .sort((a, b) => b.daysPending - a.daysPending)

    return NextResponse.json({
      pipeline,
      summary: {
        totalApplications: apps.length,
        approvedCount: approvedApps.length,
        deniedCount: deniedApps.length,
        approvalRate: apps.length > 0 ? Math.round((approvedApps.length / apps.length) * 100) : 0,
        avgRequestedAmount,
        avgApprovedAmount,
        totalApprovedAmount,
      },
      byCreditRange,
      byLender,
      conversionImpact: {
        financedWinRate,
        nonFinancedWinRate,
        financedLeadCount: financedLeadIds.size,
        liftPct,
      },
      pendingApplications,
    })
  } catch (error) {
    console.error('Financing report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
