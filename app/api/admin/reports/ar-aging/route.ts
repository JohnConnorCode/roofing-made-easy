/**
 * Accounts Receivable Aging Report API
 * GET - AR aging buckets with drill-down data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
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

    // Get AR aging data from the view
    const { data: arData, error } = await supabase
      .from('ar_aging')
      .select('*')

    if (error) {
      // If the view doesn't exist yet, fall back to direct query
      logger.error('AR aging view error', { error: String(error) })

      // Fallback: query invoices directly
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, bill_to_name, bill_to_email, total, amount_paid, balance_due, issue_date, due_date, status')
        .not('status', 'in', '(paid,cancelled,refunded)')
        .gt('balance_due', 0)
        .order('due_date', { ascending: true })

      const now = new Date()
      const aging = (invoices || []).map((inv) => {
        const i = inv as {
          id: string; invoice_number: string; bill_to_name: string; bill_to_email: string
          total: number; amount_paid: number; balance_due: number
          issue_date: string; due_date: string; status: string
        }
        const dueDate = i.due_date ? new Date(i.due_date) : null
        const daysOverdue = dueDate ? Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / 86400000)) : 0
        let bucket = 'current'
        if (daysOverdue >= 1 && daysOverdue <= 30) bucket = '1_30'
        else if (daysOverdue >= 31 && daysOverdue <= 60) bucket = '31_60'
        else if (daysOverdue >= 61 && daysOverdue <= 90) bucket = '61_90'
        else if (daysOverdue > 90) bucket = '90_plus'

        return {
          invoice_id: i.id,
          invoice_number: i.invoice_number,
          bill_to_name: i.bill_to_name,
          bill_to_email: i.bill_to_email,
          total: i.total,
          amount_paid: i.amount_paid,
          balance_due: i.balance_due,
          issue_date: i.issue_date,
          due_date: i.due_date,
          status: i.status,
          aging_bucket: bucket,
          days_overdue: daysOverdue,
        }
      })

      return buildResponse(aging)
    }

    return buildResponse(arData || [])
  } catch (error) {
    logger.error('AR aging report GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildResponse(arData: Array<Record<string, unknown>>) {
  // Aggregate by bucket
  const buckets: Record<string, { count: number; total: number }> = {
    current: { count: 0, total: 0 },
    '1_30': { count: 0, total: 0 },
    '31_60': { count: 0, total: 0 },
    '61_90': { count: 0, total: 0 },
    '90_plus': { count: 0, total: 0 },
  }

  for (const row of arData) {
    const bucket = row.aging_bucket as string
    const balanceDue = (row.balance_due as number) || 0
    if (buckets[bucket]) {
      buckets[bucket].count += 1
      buckets[bucket].total += balanceDue
    }
  }

  const totalAR = Object.values(buckets).reduce((s, b) => s + b.total, 0)
  const totalInvoices = Object.values(buckets).reduce((s, b) => s + b.count, 0)

  return NextResponse.json({
    invoices: arData,
    buckets,
    summary: {
      totalAR,
      totalInvoices,
    },
  })
}
