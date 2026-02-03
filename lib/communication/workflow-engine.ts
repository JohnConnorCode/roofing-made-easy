/**
 * Workflow execution engine
 * Handles triggering automation workflows and scheduling messages
 */

import { createClient } from '@/lib/supabase/server'
import { renderTemplate, getLeadVariables } from './template-renderer'
import type {
  WorkflowTrigger,
  AutomationWorkflow,
  MessageTemplate,
  ScheduledMessage,
  WorkflowExecution,
} from './types'

export interface TriggerContext {
  leadId?: string
  customerId?: string
  data?: Record<string, unknown>
  userId?: string
}

export interface TriggerResult {
  triggered: number
  skipped: number
  errors: string[]
  executions: WorkflowExecution[]
}

/**
 * Trigger all matching workflows for an event
 */
export async function triggerWorkflows(
  event: WorkflowTrigger,
  context: TriggerContext
): Promise<TriggerResult> {
  const supabase = await createClient()
  const result: TriggerResult = {
    triggered: 0,
    skipped: 0,
    errors: [],
    executions: [],
  }

  try {
    // Get all active workflows for this trigger
    const { data: workflows, error } = await supabase
      .from('automation_workflows')
      .select(`
        *,
        template:template_id(*)
      `)
      .eq('trigger_event', event)
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error || !workflows) {
      result.errors.push(`Failed to fetch workflows: ${error?.message || 'Unknown error'}`)
      return result
    }

    // Process each workflow
    for (const workflow of workflows as (AutomationWorkflow & { template: MessageTemplate })[]) {
      const execution = await executeWorkflow(workflow, context, supabase)
      result.executions.push(execution)

      if (execution.status === 'success') {
        result.triggered++
      } else if (execution.status === 'skipped') {
        result.skipped++
      } else {
        result.errors.push(execution.error_message || 'Unknown error')
      }
    }
  } catch (error) {
    result.errors.push(`Workflow engine error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Execute a single workflow
 */
async function executeWorkflow(
  workflow: AutomationWorkflow & { template: MessageTemplate },
  context: TriggerContext,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<WorkflowExecution> {
  const execution: Partial<WorkflowExecution> = {
    workflow_id: workflow.id,
    lead_id: context.leadId || null,
    customer_id: context.customerId || null,
    trigger_event: workflow.trigger_event,
    trigger_data: context.data || {},
    executed_at: new Date().toISOString(),
    status: 'pending',
  }

  try {
    // Check if we should execute (rate limits, cooldowns, etc.)
    const shouldExecute = await checkExecutionLimits(workflow, context, supabase)

    if (!shouldExecute.allowed) {
      execution.status = 'skipped'
      execution.skip_reason = shouldExecute.reason
      execution.completed_at = new Date().toISOString()

      // Save execution record
      const { data: savedExecution } = await supabase
        .from('workflow_executions')
        .insert(execution as never)
        .select()
        .single()

      return (savedExecution || execution) as WorkflowExecution
    }

    // Check conditions
    if (!checkConditions(workflow.conditions, context)) {
      execution.status = 'skipped'
      execution.skip_reason = 'Conditions not met'
      execution.completed_at = new Date().toISOString()

      const { data: savedExecution } = await supabase
        .from('workflow_executions')
        .insert(execution as never)
        .select()
        .single()

      return (savedExecution || execution) as WorkflowExecution
    }

    // Get recipient info
    const recipient = await getRecipientInfo(context, workflow.template.type, supabase)

    if (!recipient.valid) {
      execution.status = 'skipped'
      execution.skip_reason = `No valid ${workflow.template.type} recipient`
      execution.completed_at = new Date().toISOString()

      const { data: savedExecution } = await supabase
        .from('workflow_executions')
        .insert(execution as never)
        .select()
        .single()

      return (savedExecution || execution) as WorkflowExecution
    }

    // Get template variables
    const variables = context.leadId
      ? await getLeadVariables(context.leadId)
      : {}

    // Render template
    const renderedBody = renderTemplate(workflow.template.body, variables)
    const renderedSubject = workflow.template.subject
      ? renderTemplate(workflow.template.subject, variables)
      : null

    // Calculate scheduled time
    const scheduledFor = calculateScheduledTime(workflow)

    // Create scheduled message
    const scheduledMessage: Partial<ScheduledMessage> = {
      lead_id: context.leadId || null,
      customer_id: context.customerId || null,
      recipient_email: recipient.email || null,
      recipient_phone: recipient.phone || null,
      recipient_name: recipient.name || null,
      workflow_id: workflow.id,
      template_id: workflow.template.id,
      channel: workflow.channel || workflow.template.type,
      subject: renderedSubject,
      body: renderedBody,
      scheduled_for: scheduledFor.toISOString(),
      status: 'scheduled',
      created_by: context.userId || null,
    }

    const { data: savedMessage, error: messageError } = await supabase
      .from('scheduled_messages')
      .insert(scheduledMessage as never)
      .select()
      .single()

    if (messageError || !savedMessage) {
      throw new Error(`Failed to create scheduled message: ${messageError?.message || 'Unknown error'}`)
    }

    // Update workflow stats
    await supabase
      .from('automation_workflows')
      .update({
        execution_count: workflow.execution_count + 1,
        last_executed_at: new Date().toISOString(),
      } as never)
      .eq('id', workflow.id)

    // Update template stats
    await supabase
      .from('message_templates')
      .update({
        usage_count: workflow.template.usage_count + 1,
        last_used_at: new Date().toISOString(),
      } as never)
      .eq('id', workflow.template.id)

    // Save successful execution
    execution.status = 'success'
    execution.scheduled_message_id = (savedMessage as { id: string }).id
    execution.completed_at = new Date().toISOString()

    const { data: savedExecution } = await supabase
      .from('workflow_executions')
      .insert(execution as never)
      .select()
      .single()

    return (savedExecution || execution) as WorkflowExecution
  } catch (error) {
    execution.status = 'failed'
    execution.error_message = error instanceof Error ? error.message : 'Unknown error'
    execution.completed_at = new Date().toISOString()

    // Save failed execution
    const { data: savedExecution } = await supabase
      .from('workflow_executions')
      .insert(execution as never)
      .select()
      .single()

    return (savedExecution || execution) as WorkflowExecution
  }
}

/**
 * Check execution limits (rate limits, cooldowns)
 */
async function checkExecutionLimits(
  workflow: AutomationWorkflow,
  context: TriggerContext,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ allowed: boolean; reason?: string }> {
  if (!context.leadId) {
    return { allowed: true }
  }

  // Check how many times this workflow has executed for this lead
  const { data: executions, count } = await supabase
    .from('workflow_executions')
    .select('executed_at', { count: 'exact' })
    .eq('workflow_id', workflow.id)
    .eq('lead_id', context.leadId)
    .eq('status', 'success')
    .order('executed_at', { ascending: false })
    .limit(1)

  // Check max sends
  if (count && count >= workflow.max_sends_per_lead) {
    return { allowed: false, reason: `Max sends reached (${workflow.max_sends_per_lead})` }
  }

  // Check cooldown
  const executionList = executions as { executed_at: string }[] | null
  if (executionList && executionList.length > 0) {
    const lastExecution = new Date(executionList[0].executed_at)
    const cooldownEnd = new Date(lastExecution.getTime() + workflow.cooldown_hours * 60 * 60 * 1000)

    if (new Date() < cooldownEnd) {
      return { allowed: false, reason: `Cooldown period (${workflow.cooldown_hours}h)` }
    }
  }

  return { allowed: true }
}

/**
 * Check workflow conditions against context
 */
function checkConditions(
  conditions: Record<string, unknown>,
  context: TriggerContext
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true
  }

  // Check has_email condition
  if (conditions.has_email && !context.data?.email) {
    return false
  }

  // Check has_phone condition
  if (conditions.has_phone && !context.data?.phone) {
    return false
  }

  // Check lead_status condition
  if (conditions.lead_status) {
    const allowedStatuses = conditions.lead_status as string[]
    const currentStatus = context.data?.status as string
    if (currentStatus && !allowedStatuses.includes(currentStatus)) {
      return false
    }
  }

  return true
}

/**
 * Get recipient info for a message
 */
async function getRecipientInfo(
  context: TriggerContext,
  channel: 'email' | 'sms',
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ valid: boolean; email?: string; phone?: string; name?: string }> {
  if (!context.leadId && !context.customerId) {
    return { valid: false }
  }

  // Try to get from context data first
  if (context.data) {
    if (channel === 'email' && context.data.email) {
      return {
        valid: true,
        email: context.data.email as string,
        name: context.data.name as string || undefined,
      }
    }
    if (channel === 'sms' && context.data.phone) {
      return {
        valid: true,
        phone: context.data.phone as string,
        name: context.data.name as string || undefined,
      }
    }
  }

  // Fetch from lead
  if (context.leadId) {
    const { data: lead } = await supabase
      .from('leads')
      .select('contacts(first_name, last_name, email, phone)')
      .eq('id', context.leadId)
      .single()

    const leadData = lead as { contacts: Array<{
      first_name: string | null
      last_name: string | null
      email: string | null
      phone: string | null
    }> } | null

    if (leadData) {
      const contact = leadData.contacts?.[0]

      if (contact) {
        const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || undefined

        if (channel === 'email' && contact.email) {
          return { valid: true, email: contact.email, name }
        }
        if (channel === 'sms' && contact.phone) {
          return { valid: true, phone: contact.phone, name }
        }
      }
    }
  }

  return { valid: false }
}

/**
 * Calculate when a message should be sent based on workflow settings
 */
function calculateScheduledTime(workflow: AutomationWorkflow): Date {
  let scheduledTime = new Date()

  // Add delay
  if (workflow.delay_minutes > 0) {
    scheduledTime = new Date(scheduledTime.getTime() + workflow.delay_minutes * 60 * 1000)
  }

  // Respect business hours if enabled
  if (workflow.respect_business_hours) {
    scheduledTime = adjustForBusinessHours(
      scheduledTime,
      workflow.business_hours_start,
      workflow.business_hours_end,
      workflow.business_days
    )
  }

  return scheduledTime
}

/**
 * Adjust time to be within business hours
 */
function adjustForBusinessHours(
  time: Date,
  startTime: string,
  endTime: string,
  businessDays: number[]
): Date {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let adjusted = new Date(time)

  // Keep adjusting until we find a valid business time
  for (let i = 0; i < 14; i++) {
    // Max 2 weeks ahead
    const dayOfWeek = adjusted.getDay()
    // Convert JS day (0=Sunday) to ISO day (1=Monday, 7=Sunday)
    const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek

    // Check if it's a business day
    if (!businessDays.includes(isoDay)) {
      // Move to next day at start time
      adjusted.setDate(adjusted.getDate() + 1)
      adjusted.setHours(startHour, startMin, 0, 0)
      continue
    }

    const currentHour = adjusted.getHours()
    const currentMin = adjusted.getMinutes()
    const currentMinutes = currentHour * 60 + currentMin
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (currentMinutes < startMinutes) {
      // Before business hours - move to start time
      adjusted.setHours(startHour, startMin, 0, 0)
      return adjusted
    }

    if (currentMinutes >= endMinutes) {
      // After business hours - move to next business day
      adjusted.setDate(adjusted.getDate() + 1)
      adjusted.setHours(startHour, startMin, 0, 0)
      continue
    }

    // Within business hours
    return adjusted
  }

  return adjusted
}

/**
 * Manually trigger a workflow for a lead
 */
export async function triggerManualWorkflow(
  workflowId: string,
  context: TriggerContext
): Promise<TriggerResult> {
  const supabase = await createClient()
  const result: TriggerResult = {
    triggered: 0,
    skipped: 0,
    errors: [],
    executions: [],
  }

  try {
    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select(`*, template:template_id(*)`)
      .eq('id', workflowId)
      .single()

    if (error || !workflow) {
      result.errors.push(`Workflow not found: ${error?.message || 'Unknown error'}`)
      return result
    }

    const execution = await executeWorkflow(
      workflow as AutomationWorkflow & { template: MessageTemplate },
      context,
      supabase
    )
    result.executions.push(execution)

    if (execution.status === 'success') {
      result.triggered++
    } else if (execution.status === 'skipped') {
      result.skipped++
    } else {
      result.errors.push(execution.error_message || 'Unknown error')
    }
  } catch (error) {
    result.errors.push(`Manual trigger error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}
