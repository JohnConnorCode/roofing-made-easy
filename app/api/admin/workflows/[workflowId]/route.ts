/**
 * Individual Workflow API
 * GET - Get workflow by ID
 * PATCH - Update workflow
 * DELETE - Delete workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import { triggerManualWorkflow } from '@/lib/communication/workflow-engine'
import type { UpdateWorkflowRequest } from '@/lib/communication/types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  trigger_event: z.enum([
    'lead_created',
    'lead_status_changed',
    'intake_completed',
    'estimate_generated',
    'quote_sent',
    'quote_viewed',
    'appointment_scheduled',
    'appointment_reminder',
    'payment_received',
    'job_completed',
    'review_request',
    'manual',
  ]).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  delay_minutes: z.number().min(0).max(43200).optional(),
  template_id: z.string().uuid().optional(),
  channel: z.enum(['email', 'sms']).nullable().optional(),
  is_active: z.boolean().optional(),
  priority: z.number().min(0).max(100).optional(),
  max_sends_per_lead: z.number().min(1).max(100).optional(),
  cooldown_hours: z.number().min(0).max(720).optional(),
  respect_business_hours: z.boolean().optional(),
  business_hours_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  business_hours_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  business_days: z.array(z.number().min(1).max(7)).optional(),
})

interface RouteParams {
  params: Promise<{ workflowId: string }>
}

// GET /api/admin/workflows/[workflowId]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { workflowId } = await params
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const supabase = await createClient()

    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select(`
        *,
        template:template_id(*)
      `)
      .eq('id', workflowId)
      .single()

    if (error || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Get recent executions
    const { data: executions } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('executed_at', { ascending: false })
      .limit(10)

    // Get execution stats
    const { data: stats } = await supabase
      .from('workflow_executions')
      .select('status')
      .eq('workflow_id', workflowId)

    const statsList = stats as { status: string }[] | null
    const executionStats = {
      total: (statsList || []).length,
      success: (statsList || []).filter(s => s.status === 'success').length,
      skipped: (statsList || []).filter(s => s.status === 'skipped').length,
      failed: (statsList || []).filter(s => s.status === 'failed').length,
    }

    return NextResponse.json({
      workflow,
      recentExecutions: executions || [],
      stats: executionStats,
    })
  } catch (error) {
    logger.error('Workflow GET error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/workflows/[workflowId]
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { workflowId } = await params
    const { error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError

    const body = await request.json()
    const parsed = updateWorkflowSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parsed.data as UpdateWorkflowRequest
    const supabase = await createClient()

    // Verify workflow exists
    const { data: existingWorkflow } = await supabase
      .from('automation_workflows')
      .select('id')
      .eq('id', workflowId)
      .single()

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // If template_id is being changed, verify new template exists
    if (updates.template_id) {
      const { data: template } = await supabase
        .from('message_templates')
        .select('id')
        .eq('id', updates.template_id)
        .single()

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const workflowUpdate: Record<string, unknown> = {}
    if (updates.name !== undefined) workflowUpdate.name = updates.name
    if (updates.description !== undefined) workflowUpdate.description = updates.description
    if (updates.trigger_event !== undefined) workflowUpdate.trigger_event = updates.trigger_event
    if (updates.conditions !== undefined) workflowUpdate.conditions = updates.conditions
    if (updates.delay_minutes !== undefined) workflowUpdate.delay_minutes = updates.delay_minutes
    if (updates.template_id !== undefined) workflowUpdate.template_id = updates.template_id
    if (updates.channel !== undefined) workflowUpdate.channel = updates.channel
    if (updates.is_active !== undefined) workflowUpdate.is_active = updates.is_active
    if (updates.priority !== undefined) workflowUpdate.priority = updates.priority
    if (updates.max_sends_per_lead !== undefined) workflowUpdate.max_sends_per_lead = updates.max_sends_per_lead
    if (updates.cooldown_hours !== undefined) workflowUpdate.cooldown_hours = updates.cooldown_hours
    if (updates.respect_business_hours !== undefined) workflowUpdate.respect_business_hours = updates.respect_business_hours
    if (updates.business_hours_start !== undefined) workflowUpdate.business_hours_start = updates.business_hours_start
    if (updates.business_hours_end !== undefined) workflowUpdate.business_hours_end = updates.business_hours_end
    if (updates.business_days !== undefined) workflowUpdate.business_days = updates.business_days

    const { error: updateError } = await supabase
      .from('automation_workflows')
      .update(workflowUpdate as never)
      .eq('id', workflowId)

    if (updateError) {
      logger.error('Error updating workflow', { error: String(updateError) })
      return NextResponse.json(
        { error: 'Failed to update workflow' },
        { status: 500 }
      )
    }

    // Get updated workflow
    const { data: updatedWorkflow } = await supabase
      .from('automation_workflows')
      .select(`
        *,
        template:template_id(
          id,
          name,
          type,
          subject
        )
      `)
      .eq('id', workflowId)
      .single()

    return NextResponse.json({ workflow: updatedWorkflow })
  } catch (error) {
    logger.error('Workflow PATCH error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/workflows/[workflowId]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { workflowId } = await params
    const { error: authError } = await requirePermission('settings', 'delete')
    if (authError) return authError

    const supabase = await createClient()

    // Delete workflow (cascade will handle executions)
    const { error: deleteError } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', workflowId)

    if (deleteError) {
      logger.error('Error deleting workflow', { error: String(deleteError) })
      return NextResponse.json(
        { error: 'Failed to delete workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Workflow DELETE error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/workflows/[workflowId] - Manually trigger workflow
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { workflowId } = await params
    const { user, error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lead_id, customer_id, data } = body

    if (!lead_id && !customer_id) {
      return NextResponse.json(
        { error: 'Either lead_id or customer_id is required' },
        { status: 400 }
      )
    }

    const result = await triggerManualWorkflow(workflowId, {
      leadId: lead_id,
      customerId: customer_id,
      data: data || {},
      userId: user.id,
    })

    if (result.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Workflow execution failed',
          details: result.errors,
          executions: result.executions,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      triggered: result.triggered,
      skipped: result.skipped,
      executions: result.executions,
    })
  } catch (error) {
    logger.error('Workflow POST (trigger) error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
