/**
 * Automation Workflows API
 * GET - List workflows
 * POST - Create workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/team/permissions'
import type { WorkflowTrigger, CreateWorkflowRequest } from '@/lib/communication/types'
import { z } from 'zod'

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
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
  ]),
  conditions: z.record(z.string(), z.unknown()).optional(),
  delay_minutes: z.number().min(0).max(43200).optional(), // Max 30 days
  template_id: z.string().uuid(),
  channel: z.enum(['email', 'sms']).optional(),
  priority: z.number().min(0).max(100).optional(),
  max_sends_per_lead: z.number().min(1).max(100).optional(),
  cooldown_hours: z.number().min(0).max(720).optional(), // Max 30 days
  respect_business_hours: z.boolean().optional(),
  business_hours_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  business_hours_end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  business_days: z.array(z.number().min(1).max(7)).optional(),
})

// GET /api/admin/workflows - List workflows
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requirePermission('settings', 'view')
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const trigger = searchParams.get('trigger') as WorkflowTrigger | null
    const isActive = searchParams.get('is_active')
    const templateId = searchParams.get('template_id')
    const search = searchParams.get('search')

    let query = supabase
      .from('automation_workflows')
      .select(`
        *,
        template:template_id(
          id,
          name,
          type,
          subject
        )
      `, { count: 'exact' })
      .order('priority', { ascending: false })
      .order('name', { ascending: true })

    if (trigger) {
      query = query.eq('trigger_event', trigger)
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: workflows, error, count } = await query

    if (error) {
      console.error('Error fetching workflows:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      )
    }

    // Get counts by trigger
    const { data: triggerCounts } = await supabase
      .from('automation_workflows')
      .select('trigger_event, is_active')

    const workflowList = triggerCounts as { trigger_event: string; is_active: boolean }[] | null
    const countsByTrigger: Record<string, { total: number; active: number }> = {}
    for (const w of workflowList || []) {
      const t = w.trigger_event
      if (!countsByTrigger[t]) {
        countsByTrigger[t] = { total: 0, active: 0 }
      }
      countsByTrigger[t].total++
      if (w.is_active) {
        countsByTrigger[t].active++
      }
    }

    return NextResponse.json({
      workflows,
      total: count,
      countsByTrigger,
    })
  } catch (error) {
    console.error('Workflows GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/workflows - Create workflow
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requirePermission('settings', 'edit')
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createWorkflowSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const workflowData = parsed.data as CreateWorkflowRequest
    const supabase = await createClient()

    // Verify template exists
    const { data: template } = await supabase
      .from('message_templates')
      .select('id, type')
      .eq('id', workflowData.template_id)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 }
      )
    }

    // Create workflow
    const { data: workflow, error: createError } = await supabase
      .from('automation_workflows')
      .insert({
        name: workflowData.name,
        description: workflowData.description || null,
        trigger_event: workflowData.trigger_event,
        conditions: workflowData.conditions || {},
        delay_minutes: workflowData.delay_minutes || 0,
        template_id: workflowData.template_id,
        channel: workflowData.channel || null,
        priority: workflowData.priority || 0,
        max_sends_per_lead: workflowData.max_sends_per_lead || 1,
        cooldown_hours: workflowData.cooldown_hours || 24,
        respect_business_hours: workflowData.respect_business_hours ?? true,
        business_hours_start: workflowData.business_hours_start || '08:00',
        business_hours_end: workflowData.business_hours_end || '18:00',
        business_days: workflowData.business_days || [1, 2, 3, 4, 5],
        is_active: true,
        created_by: user.id,
      } as never)
      .select(`
        *,
        template:template_id(
          id,
          name,
          type,
          subject
        )
      `)
      .single()

    if (createError || !workflow) {
      console.error('Error creating workflow:', createError)
      return NextResponse.json(
        { error: 'Failed to create workflow' },
        { status: 500 }
      )
    }

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    console.error('Workflows POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
