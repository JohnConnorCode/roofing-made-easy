/**
 * Create Job from Lead API
 * POST - Convert a won lead into a job, auto-populating from lead/estimate data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { logActivity } from '@/lib/team/activity-logger'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createFromLeadSchema = z.object({
  lead_id: z.string().uuid(),
  assigned_team_id: z.string().uuid().optional(),
  project_manager_id: z.string().uuid().optional(),
  scheduled_start: z.string().optional(),
  scheduled_end: z.string().optional(),
  warranty_type: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
})

export async function POST(request: NextRequest) {
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
    const parsed = createFromLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    // Fetch lead with related data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        id,
        status,
        properties(street_address, city, state, zip_code),
        contacts(first_name, last_name, email),
        detailed_estimates(id, price_likely)
      `)
      .eq('id', data.lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if job already exists for this lead
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id, job_number')
      .eq('lead_id', data.lead_id)
      .single()

    if (existingJob) {
      return NextResponse.json(
        {
          error: 'Job already exists for this lead',
          job: existingJob,
        },
        { status: 409 }
      )
    }

    // Get customer ID from customer_leads if linked
    const { data: customerLead } = await supabase
      .from('customer_leads')
      .select('customer_id')
      .eq('lead_id', data.lead_id)
      .single()

    // Extract data from lead
    const leadData = lead as {
      properties: Array<{ street_address: string; city: string; state: string; zip_code: string }>
      detailed_estimates: Array<{ id: string; price_likely: number }>
    }

    const property = leadData.properties?.[0]
    const estimate = leadData.detailed_estimates?.[0]

    const { data: job, error: createError } = await supabase
      .from('jobs')
      .insert({
        lead_id: data.lead_id,
        customer_id: (customerLead as { customer_id: string } | null)?.customer_id || null,
        estimate_id: estimate?.id || null,
        assigned_team_id: data.assigned_team_id || null,
        project_manager_id: data.project_manager_id || null,
        scheduled_start: data.scheduled_start || null,
        scheduled_end: data.scheduled_end || null,
        contract_amount: estimate?.price_likely || 0,
        property_address: property?.street_address || null,
        property_city: property?.city || null,
        property_state: property?.state || null,
        property_zip: property?.zip_code || null,
        warranty_type: data.warranty_type || null,
        notes: data.notes || null,
        status: 'pending_start',
        created_by: user.id,
      } as never)
      .select(`
        *,
        team:assigned_team_id(id, name, color),
        project_manager:project_manager_id(id, first_name, last_name)
      `)
      .single()

    if (createError || !job) {
      logger.error('Error creating job from lead', { error: String(createError) })
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    await logActivity({
      user,
      action: 'job_created_from_lead',
      category: 'job',
      entityType: 'job',
      entityId: (job as { id: string }).id,
      entityName: (job as { job_number: string }).job_number,
      metadata: { lead_id: data.lead_id },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    logger.error('Create job from lead POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
