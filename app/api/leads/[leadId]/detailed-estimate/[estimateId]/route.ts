import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateEstimateSchema = z.object({
  name: z.string().optional(),
  overhead_percent: z.number().min(0).max(50).optional(),
  profit_percent: z.number().min(0).max(50).optional(),
  tax_percent: z.number().min(0).max(20).optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'declined', 'expired']).optional(),
  internal_notes: z.string().nullable().optional(),
  customer_notes: z.string().nullable().optional(),
  valid_until: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { leadId, estimateId } = await params
    const supabase = await createClient()

    const { data: estimate, error } = await supabase
      .from('detailed_estimates')
      .select(`
        *,
        line_items:estimate_line_items(*),
        sketch:roof_sketches(*),
        macro:estimate_macros(id, name),
        geographic:geographic_pricing(id, name, state)
      `)
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching estimate:', error)
      return NextResponse.json(
        { error: 'Failed to fetch estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ estimate })
  } catch (error) {
    console.error('Error in GET /api/leads/[leadId]/detailed-estimate/[estimateId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { leadId, estimateId } = await params
    const body = await request.json()
    const parsed = updateEstimateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Add status timestamps
    const updates: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.status === 'sent' && !updates.sent_at) {
      updates.sent_at = new Date().toISOString()
    }
    if (parsed.data.status === 'accepted' && !updates.accepted_at) {
      updates.accepted_at = new Date().toISOString()
    }
    if (parsed.data.status === 'declined' && !updates.declined_at) {
      updates.declined_at = new Date().toISOString()
    }

    const { data: estimate, error } = await supabase
      .from('detailed_estimates')
      .update(updates as never)
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .select(`
        *,
        line_items:estimate_line_items(*)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 404 }
        )
      }
      console.error('Error updating estimate:', error)
      return NextResponse.json(
        { error: 'Failed to update estimate' },
        { status: 500 }
      )
    }

    // If percentages changed, recalculate totals
    if (
      parsed.data.overhead_percent !== undefined ||
      parsed.data.profit_percent !== undefined ||
      parsed.data.tax_percent !== undefined
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('recalculate_estimate_totals', { p_estimate_id: estimateId })

      // Refetch with updated totals
      const { data: updated } = await supabase
        .from('detailed_estimates')
        .select(`*, line_items:estimate_line_items(*)`)
        .eq('id', estimateId)
        .single()

      return NextResponse.json({ estimate: updated })
    }

    return NextResponse.json({ estimate })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[leadId]/detailed-estimate/[estimateId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { leadId, estimateId } = await params
    const supabase = await createClient()

    // Check if estimate is in a deletable state
    const { data: existingData } = await supabase
      .from('detailed_estimates')
      .select('status')
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .single()

    const existing = existingData as { status: string } | null

    if (!existing) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    if (['accepted', 'sent'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Cannot delete sent or accepted estimates' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('detailed_estimates')
      .delete()
      .eq('id', estimateId)
      .eq('lead_id', leadId)

    if (error) {
      console.error('Error deleting estimate:', error)
      return NextResponse.json(
        { error: 'Failed to delete estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/leads/[leadId]/detailed-estimate/[estimateId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
