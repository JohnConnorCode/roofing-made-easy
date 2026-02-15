/**
 * Report Export API
 * GET - CSV export for any report type
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

    if (!hasPermission(profile, 'reports', 'export', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'jobs'

    const esc = (val: unknown): string => {
      const str = String(val ?? '')
      return `"${str.replace(/"/g, '""')}"`
    }

    let csvContent = ''
    let filename = 'report.csv'

    if (reportType === 'jobs') {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('job_number, status, contract_amount, material_cost, labor_cost, total_paid, property_city, property_state, scheduled_start, created_at')
        .order('created_at', { ascending: false })

      csvContent = 'Job Number,Status,Contract Amount,Material Cost,Labor Cost,Total Paid,City,State,Scheduled Start,Created\n'
      for (const row of (jobs || [])) {
        const j = row as Record<string, unknown>
        csvContent += `${esc(j.job_number)},${esc(j.status)},${j.contract_amount},${j.material_cost},${j.labor_cost},${j.total_paid},${esc(j.property_city || '')},${esc(j.property_state || '')},${esc(j.scheduled_start || '')},${esc(j.created_at)}\n`
      }
      filename = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`
    } else if (reportType === 'invoices') {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('invoice_number, status, total, amount_paid, balance_due, bill_to_name, issue_date, due_date')
        .order('issue_date', { ascending: false })

      csvContent = 'Invoice Number,Status,Total,Amount Paid,Balance Due,Bill To,Issue Date,Due Date\n'
      for (const row of (invoices || [])) {
        const i = row as Record<string, unknown>
        csvContent += `${esc(i.invoice_number)},${esc(i.status)},${i.total},${i.amount_paid},${i.balance_due},${esc(i.bill_to_name || '')},${esc(i.issue_date || '')},${esc(i.due_date || '')}\n`
      }
      filename = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
    } else if (reportType === 'expenses') {
      const { data: expenses } = await supabase
        .from('job_expenses')
        .select(`
          category, description, vendor, amount, expense_date,
          job:job_id(job_number)
        `)
        .order('expense_date', { ascending: false })

      csvContent = 'Job,Category,Description,Vendor,Amount,Date\n'
      for (const row of (expenses || [])) {
        const e = row as { category: string; description: string; vendor: string | null; amount: number; expense_date: string; job: { job_number: string } | null }
        csvContent += `${esc(e.job?.job_number || '')},${esc(e.category)},${esc(e.description)},${esc(e.vendor || '')},${e.amount},${esc(e.expense_date)}\n`
      }
      filename = `expenses-export-${new Date().toISOString().split('T')[0]}.csv`
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
