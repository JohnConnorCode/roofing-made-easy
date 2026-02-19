/**
 * Lien Waiver Detail API
 * PATCH - Update lien waiver status or edit fields (draft only)
 * DELETE - Delete a draft lien waiver
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'signed']),
})

const editSchema = z.object({
  waiver_type: z.enum(['conditional', 'unconditional']).optional(),
  through_date: z.string().optional(),
  amount: z.number().min(0).optional(),
  claimant_name: z.string().max(255).optional(),
  owner_name: z.string().max(255).optional(),
  property_description: z.string().max(2000).optional(),
})

const updateSchema = z.union([statusUpdateSchema, editSchema])

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['signed'],
  signed: [],
}

type Params = { params: Promise<{ jobId: string; waiverId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, waiverId } = await params
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

    // Status transition
    if ('status' in data && data.status) {
      // Get current waiver
      const { data: existing } = await supabase
        .from('lien_waivers')
        .select('id, status')
        .eq('id', waiverId)
        .eq('job_id', jobId)
        .single()

      if (!existing) {
        return NextResponse.json({ error: 'Lien waiver not found' }, { status: 404 })
      }

      const current = existing as { id: string; status: string }
      const allowed = STATUS_TRANSITIONS[current.status] || []

      if (!allowed.includes(data.status)) {
        return NextResponse.json(
          { error: `Cannot transition from "${current.status}" to "${data.status}"` },
          { status: 400 }
        )
      }

      const { data: updated, error: updateError } = await supabase
        .from('lien_waivers')
        .update({ status: data.status } as never)
        .eq('id', waiverId)
        .select(`
          *,
          invoice:invoice_id(id, invoice_number),
          created_by_user:created_by(first_name, last_name)
        `)
        .single()

      if (updateError) {
        logger.error('Error updating lien waiver', { error: String(updateError) })
        return NextResponse.json({ error: 'Failed to update lien waiver' }, { status: 500 })
      }

      return NextResponse.json({ waiver: updated })
    }

    // Field edit — only allowed for draft waivers
    const editFields: Record<string, unknown> = {}
    if ('waiver_type' in data && data.waiver_type !== undefined) editFields.waiver_type = data.waiver_type
    if ('through_date' in data && data.through_date !== undefined) editFields.through_date = data.through_date
    if ('amount' in data && data.amount !== undefined) editFields.amount = data.amount
    if ('claimant_name' in data && data.claimant_name !== undefined) editFields.claimant_name = data.claimant_name
    if ('owner_name' in data && data.owner_name !== undefined) editFields.owner_name = data.owner_name
    if ('property_description' in data && data.property_description !== undefined) editFields.property_description = data.property_description

    if (Object.keys(editFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: edited, error: editError } = await supabase
      .from('lien_waivers')
      .update(editFields as never)
      .eq('id', waiverId)
      .eq('job_id', jobId)
      .eq('status', 'draft')
      .select(`
        *,
        invoice:invoice_id(id, invoice_number),
        created_by_user:created_by(first_name, last_name)
      `)
      .single()

    if (editError || !edited) {
      return NextResponse.json(
        { error: 'Lien waiver not found or not editable (must be draft)' },
        { status: 400 }
      )
    }

    return NextResponse.json({ waiver: edited })
  } catch (error) {
    logger.error('Lien waiver PATCH error', { error: String(error) })
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

    const { jobId, waiverId } = await params
    const supabase = await createClient()

    // Only delete if status is 'draft'
    const { data, error } = await supabase
      .from('lien_waivers')
      .delete()
      .eq('id', waiverId)
      .eq('job_id', jobId)
      .eq('status', 'draft')
      .select()

    if (error) {
      logger.error('Error deleting lien waiver', { error: String(error) })
      return NextResponse.json({ error: 'Failed to delete lien waiver' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Lien waiver not found or cannot be deleted (must be draft)' },
        { status: 409 }
      )
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    logger.error('Lien waiver DELETE error', { error: String(error) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
