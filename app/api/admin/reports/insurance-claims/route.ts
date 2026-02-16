/**
 * Insurance Claims Report API
 * GET - Claims pipeline, carrier performance, stuck claims, cause of loss
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

    const { data: claims } = await supabase
      .from('insurance_claims')
      .select('id, claim_number, insurance_company, status, claim_amount_approved, deductible, cause_of_loss, created_at, status_updated_at')
      .limit(2000)

    const rows = (claims || []) as Array<{
      id: string; claim_number: string; insurance_company: string | null
      status: string; claim_amount_approved: number | null; deductible: number | null
      cause_of_loss: string | null; created_at: string; status_updated_at: string | null
    }>

    // Pipeline
    const statusCounts: Record<string, number> = {}
    for (const c of rows) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
    }
    const pipeline = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))

    // Summary
    const approved = rows.filter(c => c.status === 'approved' || c.status === 'settled')
    const denied = rows.filter(c => c.status === 'denied')
    const totalApprovedAmount = approved.reduce((sum, c) => sum + (c.claim_amount_approved || 0), 0)
    const avgApprovedAmount = approved.length > 0 ? Math.round(totalApprovedAmount / approved.length) : 0

    // Avg days to approval
    const approvalDays: number[] = []
    for (const c of approved) {
      if (c.status_updated_at && c.created_at) {
        const days = Math.ceil(
          (new Date(c.status_updated_at).getTime() - new Date(c.created_at).getTime()) / (24 * 60 * 60 * 1000)
        )
        if (days >= 0) approvalDays.push(days)
      }
    }
    const avgDaysToApproval = approvalDays.length > 0
      ? Math.round(approvalDays.reduce((a, b) => a + b, 0) / approvalDays.length)
      : null

    // By carrier
    const carrierMap = new Map<string, { claimCount: number; approvedCount: number; totalApproved: number; approvalDays: number[] }>()
    for (const c of rows) {
      const carrier = c.insurance_company || 'Unknown'
      if (!carrierMap.has(carrier)) {
        carrierMap.set(carrier, { claimCount: 0, approvedCount: 0, totalApproved: 0, approvalDays: [] })
      }
      const cd = carrierMap.get(carrier)!
      cd.claimCount++
      if (c.status === 'approved' || c.status === 'settled') {
        cd.approvedCount++
        cd.totalApproved += c.claim_amount_approved || 0
        if (c.status_updated_at && c.created_at) {
          const days = Math.ceil(
            (new Date(c.status_updated_at).getTime() - new Date(c.created_at).getTime()) / (24 * 60 * 60 * 1000)
          )
          if (days >= 0) cd.approvalDays.push(days)
        }
      }
    }
    const byCarrier = Array.from(carrierMap.entries())
      .map(([carrier, data]) => ({
        carrier,
        claimCount: data.claimCount,
        approvedCount: data.approvedCount,
        approvalRate: data.claimCount > 0 ? Math.round((data.approvedCount / data.claimCount) * 100) : 0,
        avgApprovedAmount: data.approvedCount > 0 ? Math.round(data.totalApproved / data.approvedCount) : 0,
        avgDaysToApproval: data.approvalDays.length > 0
          ? Math.round(data.approvalDays.reduce((a, b) => a + b, 0) / data.approvalDays.length)
          : null,
      }))
      .sort((a, b) => b.claimCount - a.claimCount)

    // Stuck claims (non-terminal status, >30 days old)
    const terminalStatuses = ['approved', 'denied', 'settled']
    const now = Date.now()
    const stuckClaims = rows
      .filter(c => !terminalStatuses.includes(c.status))
      .map(c => {
        const daysSinceCreated = Math.ceil((now - new Date(c.created_at).getTime()) / (24 * 60 * 60 * 1000))
        return {
          id: c.id,
          claimNumber: c.claim_number,
          carrier: c.insurance_company || 'Unknown',
          status: c.status,
          daysSinceCreated,
          causeOfLoss: c.cause_of_loss || 'Unknown',
        }
      })
      .filter(c => c.daysSinceCreated > 30)
      .sort((a, b) => b.daysSinceCreated - a.daysSinceCreated)

    // By cause of loss
    const causeMap: Record<string, number> = {}
    for (const c of rows) {
      const cause = c.cause_of_loss || 'Unknown'
      causeMap[cause] = (causeMap[cause] || 0) + 1
    }
    const byCauseOfLoss = Object.entries(causeMap)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      pipeline,
      summary: {
        totalClaims: rows.length,
        approvedCount: approved.length,
        deniedCount: denied.length,
        totalApprovedAmount,
        avgApprovedAmount,
        avgDaysToApproval,
      },
      byCarrier,
      stuckClaims,
      byCauseOfLoss,
    })
  } catch (error) {
    console.error('Insurance claims report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
