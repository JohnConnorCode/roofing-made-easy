/**
 * Change Order Detail API
 * PATCH - Approve, reject, or edit a change order
 * DELETE - Delete a pending change order
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { notifyAdmins } from '@/lib/notifications'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const statusUpdateSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

const editSchema = z.object({
  description: z.string().min(1).max(2000).optional(),
  reason: z.string().max(2000).optional(),
  cost_delta: z.number().optional(),
})

const updateSchema = z.union([statusUpdateSchema, editSchema])

type Params = { params: Promise<{ jobId: string; changeOrderId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, changeOrderId } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    // Status transition (approve/reject)
    if ('status' in data && data.status) {
      const newStatus = data.status
      const now = new Date().toISOString()

      // Atomic update — only rows still in 'pending' status
      const { data: updated, error: updateError } = await supabase
        .from('change_orders')
        .update({
          status: newStatus,
          approved_by: user.id,
          approved_at: now,
        } as never)
        .eq('id', changeOrderId)
        .eq('job_id', jobId)
        .eq('status', 'pending')
        .select(`
          *,
          approved_by_user:approved_by(first_name, last_name),
          created_by_user:created_by(first_name, last_name)
        `)
        .single()

      if (updateError || !updated) {
        return NextResponse.json(
          { error: 'Change order not found or already processed' },
          { status: 409 }
        )
      }

      // Fetch job number for notification
      const { data: jobInfo } = await supabase
        .from('jobs')
        .select('job_number')
        .eq('id', jobId)
        .single()
      const jobNumber = (jobInfo as { job_number: string } | null)?.job_number || jobId.slice(0, 8)
      const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      notifyAdmins(
        'change_order',
        `Change Order ${statusLabel}: Job ${jobNumber}`,
        `$${(updated as { cost_delta: number }).cost_delta.toLocaleString(undefined, { minimumFractionDigits: 2 })} — ${(updated as { description: string }).description.slice(0, 80)}`,
        `/jobs/${jobId}`
      ).catch(err => logger.error('Failed to notify admins of change order update', { error: String(err) }))

      // If approved, update job contract_amount and recalculate billing schedule
      if (newStatus === 'approved') {
        const costDelta = (updated as { cost_delta: number }).cost_delta

        const { data: job } = await supabase
          .from('jobs')
          .select('contract_amount')
          .eq('id', jobId)
          .single()

        if (job) {
          const currentAmount = (job as { contract_amount: number }).contract_amount
          const newAmount = currentAmount + costDelta

          await supabase
            .from('jobs')
            .update({ contract_amount: newAmount } as never)
            .eq('id', jobId)

          // Recalculate billing schedule amounts
          const { data: milestones } = await supabase
            .from('job_billing_schedules')
            .select('id, percentage')
            .eq('job_id', jobId)

          if (milestones && milestones.length > 0) {
            for (const m of milestones) {
              const milestone = m as { id: string; percentage: number }
              const updatedAmount = Math.round(newAmount * milestone.percentage) / 100
              await supabase
                .from('job_billing_schedules')
                .update({ amount: updatedAmount } as never)
                .eq('id', milestone.id)
            }
          }
        }
      }

      return NextResponse.json({ changeOrder: updated })
    }

    // Field edit — only allowed for pending change orders
    const editFields: Record<string, unknown> = {}
    if ('description' in data && data.description !== undefined) editFields.description = data.description
    if ('reason' in data && data.reason !== undefined) editFields.reason = data.reason
    if ('cost_delta' in data && data.cost_delta !== undefined) editFields.cost_delta = data.cost_delta

    if (Object.keys(editFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: edited, error: editError } = await supabase
      .from('change_orders')
      .update(editFields as never)
      .eq('id', changeOrderId)
      .eq('job_id', jobId)
      .eq('status', 'pending')
      .select(`
        *,
        approved_by_user:approved_by(first_name, last_name),
        created_by_user:created_by(first_name, last_name)
      `)
      .single()

    if (editError || !edited) {
      return NextResponse.json(
        { error: 'Change order not found or not editable (must be pending)' },
        { status: 400 }
      )
    }

    return NextResponse.json({ changeOrder: edited })
  } catch (error) {
    logger.error('Change order PATCH error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, changeOrderId } = await params
    const supabase = await createClient()

    // Only delete if status is 'pending'
    const { data, error } = await supabase
      .from('change_orders')
      .delete()
      .eq('id', changeOrderId)
      .eq('job_id', jobId)
      .eq('status', 'pending')
      .select()

    if (error) {
      logger.error('Error deleting change order', { error: String(error) })
      return NextResponse.json({ error: 'Failed to delete change order' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Change order not found or cannot be deleted (must be pending)' },
        { status: 409 }
      )
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    logger.error('Change order DELETE error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
