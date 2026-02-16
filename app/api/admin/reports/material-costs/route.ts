/**
 * Material & Supplier Costs Report API
 * GET - Vendor spend, category breakdown, monthly trends, top expenses
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
    if (!hasPermission(profile, 'reports', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '180', 10) || 180, 1), 365)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Fetch expenses and jobs in parallel
    const [expenseResult, jobResult] = await Promise.all([
      supabase
        .from('job_expenses')
        .select('id, job_id, category, vendor, description, amount, expense_date')
        .gte('expense_date', since.toISOString().split('T')[0])
        .limit(2000),
      supabase
        .from('jobs')
        .select('id, job_number')
        .limit(1000),
    ])

    const expenses = (expenseResult.data || []) as Array<{
      id: string; job_id: string; category: string; vendor: string | null
      description: string | null; amount: number; expense_date: string
    }>
    const jobs = (jobResult.data || []) as Array<{ id: string; job_number: string }>
    const jobMap = new Map(jobs.map(j => [j.id, j.job_number]))

    // Summary
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const materialExpenses = expenses.filter(e => e.category === 'materials')
    const totalMaterialCost = materialExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const uniqueVendors = new Set(expenses.filter(e => e.vendor).map(e => e.vendor)).size
    const jobIdsWithExpenses = new Set(expenses.map(e => e.job_id))
    const avgCostPerJob = jobIdsWithExpenses.size > 0
      ? Math.round(totalExpenses / jobIdsWithExpenses.size)
      : 0

    // By vendor
    const vendorMap = new Map<string, { totalAmount: number; expenseCount: number; jobIds: Set<string> }>()
    for (const e of expenses) {
      const vendor = e.vendor || 'Unknown'
      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, { totalAmount: 0, expenseCount: 0, jobIds: new Set() })
      }
      const v = vendorMap.get(vendor)!
      v.totalAmount += e.amount || 0
      v.expenseCount++
      v.jobIds.add(e.job_id)
    }
    const byVendor = Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({
        vendor,
        totalAmount: Math.round(data.totalAmount),
        expenseCount: data.expenseCount,
        avgPerExpense: data.expenseCount > 0 ? Math.round(data.totalAmount / data.expenseCount) : 0,
        jobCount: data.jobIds.size,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)

    // By category
    const categoryMap = new Map<string, { totalAmount: number; expenseCount: number }>()
    for (const e of expenses) {
      const cat = e.category || 'other'
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { totalAmount: 0, expenseCount: 0 })
      }
      const c = categoryMap.get(cat)!
      c.totalAmount += e.amount || 0
      c.expenseCount++
    }
    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalAmount: Math.round(data.totalAmount),
        expenseCount: data.expenseCount,
        pctOfTotal: totalExpenses > 0 ? Math.round((data.totalAmount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)

    // Monthly trend
    const monthlyMap = new Map<string, { materials: number; labor: number; subcontractor: number; other: number; total: number }>()
    for (const e of expenses) {
      const month = e.expense_date?.substring(0, 7) || 'unknown'
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { materials: 0, labor: 0, subcontractor: 0, other: 0, total: 0 })
      }
      const m = monthlyMap.get(month)!
      const amt = e.amount || 0
      m.total += amt
      if (e.category === 'materials') m.materials += amt
      else if (e.category === 'labor') m.labor += amt
      else if (e.category === 'subcontractor') m.subcontractor += amt
      else m.other += amt
    }
    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        materialCost: Math.round(data.materials),
        laborCost: Math.round(data.labor),
        subcontractorCost: Math.round(data.subcontractor),
        otherCost: Math.round(data.other),
        totalCost: Math.round(data.total),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Top 20 expenses
    const topExpenses = [...expenses]
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 20)
      .map(e => ({
        description: e.description || 'No description',
        vendor: e.vendor || 'Unknown',
        amount: e.amount || 0,
        category: e.category || 'other',
        jobNumber: jobMap.get(e.job_id) || 'N/A',
        date: e.expense_date,
      }))

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      summary: {
        totalMaterialCost,
        totalExpenses,
        materialPctOfTotal: totalExpenses > 0 ? Math.round((totalMaterialCost / totalExpenses) * 100) : 0,
        uniqueVendors,
        avgCostPerJob,
      },
      byVendor,
      byCategory,
      monthlyTrend,
      topExpenses,
    })
  } catch (error) {
    console.error('Material costs report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
