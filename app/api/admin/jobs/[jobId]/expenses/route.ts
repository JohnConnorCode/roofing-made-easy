/**
 * Job Expenses API
 * GET - List expenses for a job
 * POST - Add an expense
 * PATCH - Update an expense (approve)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createExpenseSchema = z.object({
  category: z.enum(['materials', 'labor', 'subcontractor', 'permit', 'equipment', 'disposal', 'other']),
  description: z.string().min(1).max(500),
  vendor: z.string().max(255).optional(),
  amount: z.number().min(0),
  receipt_path: z.string().optional(),
  expense_date: z.string().optional(),
})

const updateExpenseSchema = z.object({
  expense_id: z.string().uuid(),
  approved: z.boolean().optional(),
  category: z.enum(['materials', 'labor', 'subcontractor', 'permit', 'equipment', 'disposal', 'other']).optional(),
  description: z.string().min(1).max(500).optional(),
  vendor: z.string().max(255).optional(),
  amount: z.number().min(0).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('job_expenses')
      .select(`
        *,
        approved_by_user:approved_by(first_name, last_name)
      `)
      .eq('job_id', jobId)
      .order('expense_date', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: expenses, error } = await query

    if (error) {
      logger.error('Error fetching job expenses', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    // Calculate totals by category
    const totals = (expenses || []).reduce((acc, exp) => {
      const e = exp as { category: string; amount: number }
      acc[e.category] = (acc[e.category] || 0) + e.amount
      acc.total = (acc.total || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ expenses, totals })
  } catch (error) {
    logger.error('Job expenses GET error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = createExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    const { data: expense, error: createError } = await supabase
      .from('job_expenses')
      .insert({
        job_id: jobId,
        category: data.category,
        description: data.description,
        vendor: data.vendor || null,
        amount: data.amount,
        receipt_path: data.receipt_path || null,
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        submitted_by: user.id,
      } as never)
      .select()
      .single()

    if (createError || !expense) {
      logger.error('Error creating expense', { error: String(createError) })
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    logger.error('Job expenses POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data
    const updateData: Record<string, unknown> = {}

    if (data.approved !== undefined) {
      updateData.approved_by = data.approved ? user.id : null
      updateData.approved_at = data.approved ? new Date().toISOString() : null
    }
    if (data.category) updateData.category = data.category
    if (data.description) updateData.description = data.description
    if (data.vendor !== undefined) updateData.vendor = data.vendor
    if (data.amount !== undefined) updateData.amount = data.amount

    const { data: expense, error: updateError } = await supabase
      .from('job_expenses')
      .update(updateData as never)
      .eq('id', data.expense_id)
      .select()
      .single()

    if (updateError || !expense) {
      logger.error('Error updating expense', { error: String(updateError) })
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    logger.error('Job expenses PATCH error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
