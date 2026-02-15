/**
 * Change Orders API
 * GET - List change orders for a job
 * POST - Create a new change order
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { notifyAdmins } from '@/lib/notifications'
import { z } from 'zod'

const createChangeOrderSchema = z.object({
  description: z.string().min(1).max(2000),
  reason: z.string().max(2000).optional(),
  cost_delta: z.number(),
})

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

    const { data: changeOrders, error } = await supabase
      .from('change_orders')
      .select(`
        *,
        approved_by_user:approved_by(first_name, last_name),
        created_by_user:created_by(first_name, last_name)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching change orders:', error)
      return NextResponse.json({ error: 'Failed to fetch change orders' }, { status: 500 })
    }

    // Calculate net delta from approved orders
    const approved = (changeOrders || []).filter(
      (co: { status: string }) => co.status === 'approved'
    )
    const netDelta = approved.reduce(
      (sum: number, co: { cost_delta: number }) => sum + co.cost_delta, 0
    )

    return NextResponse.json({ changeOrders, netDelta })
  } catch (error) {
    console.error('Change orders GET error:', error)
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
    const parsed = createChangeOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify job exists
    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { data: changeOrder, error: insertError } = await supabase
      .from('change_orders')
      .insert({
        job_id: jobId,
        description: parsed.data.description,
        reason: parsed.data.reason || null,
        cost_delta: parsed.data.cost_delta,
        created_by: user.id,
      } as never)
      .select(`
        *,
        created_by_user:created_by(first_name, last_name)
      `)
      .single()

    if (insertError) {
      console.error('Error creating change order:', insertError)
      return NextResponse.json({ error: 'Failed to create change order' }, { status: 500 })
    }

    // Fetch job number for notification
    const { data: jobInfo } = await supabase
      .from('jobs')
      .select('job_number')
      .eq('id', jobId)
      .single()
    const jobNumber = (jobInfo as { job_number: string } | null)?.job_number || jobId.slice(0, 8)
    const delta = parsed.data.cost_delta
    const sign = delta >= 0 ? '+' : ''
    notifyAdmins(
      'change_order',
      `Change Order Created: Job ${jobNumber}`,
      `$${sign}${delta.toLocaleString(undefined, { minimumFractionDigits: 2 })} — ${parsed.data.description.slice(0, 80)}`,
      `/jobs/${jobId}`
    ).catch(err => console.error('Failed to notify admins of change order:', err))

    return NextResponse.json({ changeOrder }, { status: 201 })
  } catch (error) {
    console.error('Change orders POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
