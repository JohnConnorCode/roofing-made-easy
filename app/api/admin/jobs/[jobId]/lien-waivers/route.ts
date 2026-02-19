/**
 * Lien Waivers API
 * GET - List lien waivers for a job
 * POST - Create a new lien waiver
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const createWaiverSchema = z.object({
  waiver_type: z.enum(['conditional', 'unconditional']),
  invoice_id: z.string().uuid().optional(),
  invoice_payment_id: z.string().uuid().optional(),
  through_date: z.string(),
  amount: z.number().min(0),
  claimant_name: z.string().max(255).optional(),
  owner_name: z.string().max(255).optional(),
  property_description: z.string().max(2000).optional(),
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

    const { data: waivers, error } = await supabase
      .from('lien_waivers')
      .select(`
        *,
        invoice:invoice_id(id, invoice_number),
        created_by_user:created_by(first_name, last_name)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching lien waivers', { error: String(error) })
      return NextResponse.json({ error: 'Failed to fetch lien waivers' }, { status: 500 })
    }

    return NextResponse.json({ waivers })
  } catch (error) {
    logger.error('Lien waivers GET error', { error: String(error) })
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
    const parsed = createWaiverSchema.safeParse(body)

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

    const { data: waiver, error: insertError } = await supabase
      .from('lien_waivers')
      .insert({
        job_id: jobId,
        waiver_type: parsed.data.waiver_type,
        invoice_id: parsed.data.invoice_id || null,
        invoice_payment_id: parsed.data.invoice_payment_id || null,
        through_date: parsed.data.through_date,
        amount: parsed.data.amount,
        claimant_name: parsed.data.claimant_name || null,
        owner_name: parsed.data.owner_name || null,
        property_description: parsed.data.property_description || null,
        created_by: user.id,
      } as never)
      .select(`
        *,
        invoice:invoice_id(id, invoice_number)
      `)
      .single()

    if (insertError) {
      logger.error('Error creating lien waiver', { error: String(insertError) })
      return NextResponse.json({ error: 'Failed to create lien waiver' }, { status: 500 })
    }

    return NextResponse.json({ waiver }, { status: 201 })
  } catch (error) {
    logger.error('Lien waivers POST error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
