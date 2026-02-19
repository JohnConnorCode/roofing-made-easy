/**
 * Job Status Transition API
 * PATCH - Update job status with validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logActivity } from '@/lib/team/activity-logger'
import { JOB_STATUS_TRANSITIONS, type JobStatus } from '@/lib/jobs/types'
import { notifyAdmins, notifyJobStatusChange } from '@/lib/notifications'
import { triggerWorkflows } from '@/lib/communication/workflow-engine'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const statusUpdateSchema = z.object({
  status: z.enum([
    'pending_start', 'materials_ordered', 'scheduled', 'in_progress',
    'inspection_pending', 'punch_list', 'completed', 'warranty_active', 'closed',
  ]),
  notes: z.string().max(2000).optional(),
})

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

    const { jobId } = await params
    const body = await request.json()
    const parsed = statusUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { status: newStatus, notes } = parsed.data

    // Get current job status
    const { data: currentJob } = await supabase
      .from('jobs')
      .select('status, job_number, actual_start')
      .eq('id', jobId)
      .single()

    if (!currentJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const currentStatus = (currentJob as { status: JobStatus }).status

    // Validate transition
    const allowedTransitions = JOB_STATUS_TRANSITIONS[currentStatus]
    if (!allowedTransitions?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          message: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowedTransitions?.join(', ') || 'none'}`,
        },
        { status: 400 }
      )
    }

    // Build update data with auto-populated dates
    const updateData: Record<string, unknown> = { status: newStatus }

    if (newStatus === 'in_progress' && !(currentJob as { actual_start: string | null }).actual_start) {
      updateData.actual_start = new Date().toISOString().split('T')[0]
    }

    if ((newStatus === 'completed' || newStatus === 'closed') && (currentJob as { actual_start: string | null }).actual_start) {
      updateData.actual_end = new Date().toISOString().split('T')[0]
    }

    if (newStatus === 'warranty_active') {
      updateData.warranty_start_date = new Date().toISOString().split('T')[0]
    }

    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update(updateData as never)
      .eq('id', jobId)
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name)
      `)
      .single()

    if (updateError || !job) {
      logger.error('Error updating job status', { error: String(updateError) })
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Log status change with notes
    if (notes) {
      await supabase
        .from('job_status_history')
        .update({ notes } as never)
        .eq('job_id', jobId)
        .eq('new_status', newStatus)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    await logActivity({
      user,
      action: 'job_status_changed',
      category: 'job',
      entityType: 'job',
      entityId: jobId,
      entityName: (currentJob as { job_number: string }).job_number,
      oldValues: { status: currentStatus },
      newValues: { status: newStatus },
      metadata: notes ? { notes } : {},
    })

    const jobNumber = (currentJob as { job_number: string }).job_number

    // Fire-and-forget notifications
    notifyAdmins(
      'job_status_changed',
      `Job ${jobNumber} status changed`,
      `${currentStatus.replace(/_/g, ' ')} → ${newStatus.replace(/_/g, ' ')}`,
      `/jobs/${jobId}`
    ).catch(err => logger.error('Failed to notify admins of job status change', { error: String(err) }))

    // Notify PM if assigned and not the actor
    const pm = (job as { project_manager_id?: string }).project_manager_id
    if (pm && pm !== user!.id) {
      notifyJobStatusChange(pm, jobNumber, jobId, currentStatus, newStatus)
        .catch(err => logger.error('Failed to notify PM of job status change', { error: String(err) }))
    }

    // Trigger workflows for downstream automation
    const fullJobData = job as { lead_id?: string; customer_id?: string }
    triggerWorkflows('lead_status_changed', {
      leadId: fullJobData.lead_id || '',
      customerId: fullJobData.customer_id || undefined,
      data: { status: newStatus, old_status: currentStatus },
    }).catch(err => logger.error('Failed to trigger job status workflows', { error: String(err) }))

    // Auto-create invoices for billing milestones triggered by this status
    try {
      const { data: milestones } = await supabase
        .from('job_billing_schedules')
        .select('id, milestone_name, amount, trigger_status')
        .eq('job_id', jobId)
        .eq('trigger_status', newStatus)
        .is('invoice_id', null)

      if (milestones && milestones.length > 0) {
        // Get job lead_id for invoice creation
        const { data: fullJob } = await supabase
          .from('jobs')
          .select('lead_id, customer_id')
          .eq('id', jobId)
          .single()

        if (fullJob) {
          const fj = fullJob as { lead_id: string | null; customer_id: string | null }

          for (const m of milestones) {
            const milestone = m as { id: string; milestone_name: string; amount: number }

            if (fj.lead_id) {
              // Check for existing invoice already created for this milestone
              const { data: existingInvoices } = await supabase
                .from('invoices')
                .select('id')
                .eq('job_id', jobId)
                .eq('payment_type', 'progress')
                .ilike('notes', `${milestone.milestone_name}%`)

              if (existingInvoices && existingInvoices.length > 0) {
                // Link existing invoice to milestone if not already linked
                await supabase
                  .from('job_billing_schedules')
                  .update({ invoice_id: (existingInvoices[0] as { id: string }).id } as never)
                  .eq('id', milestone.id)
                continue
              }

              // Create draft invoice for this milestone
              const { data: invoice } = await supabase
                .from('invoices')
                .insert({
                  lead_id: fj.lead_id,
                  customer_id: fj.customer_id || null,
                  job_id: jobId,
                  payment_type: 'progress',
                  subtotal: milestone.amount,
                  total: milestone.amount,
                  balance_due: milestone.amount,
                  tax_rate: 0,
                  tax_amount: 0,
                  discount_percent: 0,
                  discount_amount: 0,
                  notes: `${milestone.milestone_name} - auto-generated from billing schedule`,
                  created_by: user!.id,
                } as never)
                .select('id')
                .single()

              if (invoice) {
                const invId = (invoice as { id: string }).id
                // Insert a line item for the milestone
                await supabase
                  .from('invoice_line_items')
                  .insert({
                    invoice_id: invId,
                    description: milestone.milestone_name,
                    quantity: 1,
                    unit_price: milestone.amount,
                    total: milestone.amount,
                    is_taxable: false,
                    sort_order: 0,
                  } as never)

                // Link invoice back to billing schedule
                await supabase
                  .from('job_billing_schedules')
                  .update({ invoice_id: invId } as never)
                  .eq('id', milestone.id)
              }
            }
          }
        }
      }
    } catch (autoInvoiceError) {
      // Don't fail the status update if auto-invoicing fails
      logger.error('Auto-invoicing error (non-fatal)', { error: String(autoInvoiceError) })
    }

    return NextResponse.json({ job })
  } catch (error) {
    logger.error('Job status PATCH error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
