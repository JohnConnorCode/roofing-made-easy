/**
 * Job Billing Schedule API
 * GET - List billing milestones for a job
 * POST - Create billing schedule from template or custom milestones
 * PUT - Update billing schedule (recalculate amounts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'
import { BILLING_TEMPLATES } from '@/lib/jobs/billing-types'

const milestoneSchema = z.object({
  milestone_name: z.string().min(1).max(255),
  percentage: z.number().min(0.01).max(100),
  trigger_status: z.enum([
    'pending_start', 'materials_ordered', 'scheduled', 'in_progress',
    'inspection_pending', 'punch_list', 'completed', 'warranty_active', 'closed',
  ]),
})

const createScheduleSchema = z.union([
  z.object({ template: z.string() }),
  z.object({ milestones: z.array(milestoneSchema).min(1) }),
])

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()

    const { data: milestones, error } = await supabase
      .from('job_billing_schedules')
      .select(`
        *,
        invoice:invoice_id(id, invoice_number, status, total, balance_due)
      `)
      .eq('job_id', jobId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching billing schedule:', error)
      return NextResponse.json({ error: 'Failed to fetch billing schedule' }, { status: 500 })
    }

    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('Billing schedule GET error:', error)
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
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = createScheduleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get job contract amount
    const { data: job } = await supabase
      .from('jobs')
      .select('contract_amount')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const contractAmount = (job as { contract_amount: number }).contract_amount

    // Resolve milestones from template or custom input
    let milestones: Array<{ milestone_name: string; percentage: number; trigger_status: string }>
    const data = parsed.data

    if ('template' in data) {
      const template = BILLING_TEMPLATES.find(t => t.name === data.template)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found', available: BILLING_TEMPLATES.map(t => t.name) },
          { status: 400 }
        )
      }
      milestones = template.milestones
    } else {
      milestones = data.milestones
    }

    // Validate percentages sum to 100
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json(
        { error: `Percentages must sum to 100 (got ${totalPercentage})` },
        { status: 400 }
      )
    }

    // Delete existing schedule
    await supabase
      .from('job_billing_schedules')
      .delete()
      .eq('job_id', jobId)

    // Insert new milestones
    const rows = milestones.map((m, index) => ({
      job_id: jobId,
      milestone_name: m.milestone_name,
      percentage: m.percentage,
      amount: Math.round(contractAmount * m.percentage) / 100,
      trigger_status: m.trigger_status,
      sort_order: index,
    }))

    const { data: created, error: insertError } = await supabase
      .from('job_billing_schedules')
      .insert(rows as never[])
      .select(`
        *,
        invoice:invoice_id(id, invoice_number, status, total, balance_due)
      `)

    if (insertError) {
      console.error('Error creating billing schedule:', insertError)
      return NextResponse.json({ error: 'Failed to create billing schedule' }, { status: 500 })
    }

    return NextResponse.json({ milestones: created }, { status: 201 })
  } catch (error) {
    console.error('Billing schedule POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()

    // Get current contract amount
    const { data: job } = await supabase
      .from('jobs')
      .select('contract_amount')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const contractAmount = (job as { contract_amount: number }).contract_amount

    // Get existing milestones
    const { data: milestones } = await supabase
      .from('job_billing_schedules')
      .select('id, percentage')
      .eq('job_id', jobId)

    if (!milestones || milestones.length === 0) {
      return NextResponse.json({ error: 'No billing schedule found' }, { status: 404 })
    }

    // Recalculate amounts
    for (const m of milestones) {
      const milestone = m as { id: string; percentage: number }
      const newAmount = Math.round(contractAmount * milestone.percentage) / 100
      await supabase
        .from('job_billing_schedules')
        .update({ amount: newAmount } as never)
        .eq('id', milestone.id)
    }

    // Return updated schedule
    const { data: updated } = await supabase
      .from('job_billing_schedules')
      .select(`
        *,
        invoice:invoice_id(id, invoice_number, status, total, balance_due)
      `)
      .eq('job_id', jobId)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ milestones: updated })
  } catch (error) {
    console.error('Billing schedule PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
