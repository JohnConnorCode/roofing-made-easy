import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'

const adjustmentSchema = z.object({
  estimateId: z.string().uuid(),
  adjustmentType: z.enum(['discount_percent', 'discount_fixed', 'price_override']),
  value: z.number().positive(),
  description: z.string().optional(),
  reason: z.string().optional(),
})

/**
 * GET /api/leads/[leadId]/detailed-estimate/adjust
 * List all price adjustments for a lead's estimates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId } = await params
    const { searchParams } = new URL(request.url)
    const estimateId = searchParams.get('estimateId')

    const supabase = await createClient()

    let query = supabase
      .from('price_adjustments')
      .select(`
        *,
        detailed_estimates!inner(id, lead_id, name)
      `)
      .eq('detailed_estimates.lead_id', leadId)
      .order('created_at', { ascending: false })

    if (estimateId) {
      query = query.eq('estimate_id', estimateId)
    }

    const { data: adjustments, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch adjustments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ adjustments })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leads/[leadId]/detailed-estimate/adjust
 * Apply a price adjustment to an estimate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId } = await params
    const body = await request.json()
    const parsed = adjustmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { estimateId, adjustmentType, value, description, reason } = parsed.data

    // Validate discount percent doesn't exceed 50%
    if (adjustmentType === 'discount_percent' && value > 50) {
      return NextResponse.json(
        { error: 'Discount percentage cannot exceed 50%' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify estimate exists and belongs to this lead
    const { data: estimate, error: estimateError } = await supabase
      .from('detailed_estimates')
      .select('id, lead_id, price_likely, adjusted_price')
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .single()

    if (estimateError || !estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Calculate the new adjusted price
    const basePrice = (estimate as { adjusted_price?: number; price_likely: number }).adjusted_price || (estimate as { price_likely: number }).price_likely
    let adjustedPrice: number
    let adjustmentAmount: number

    switch (adjustmentType) {
      case 'discount_percent':
        adjustmentAmount = basePrice * (value / 100)
        adjustedPrice = basePrice - adjustmentAmount
        break
      case 'discount_fixed':
        adjustmentAmount = value
        adjustedPrice = basePrice - adjustmentAmount
        break
      case 'price_override':
        adjustmentAmount = basePrice - value
        adjustedPrice = value
        break
      default:
        adjustedPrice = basePrice
        adjustmentAmount = 0
    }

    // Insert the adjustment record
    const { data: adjustment, error: insertError } = await supabase
      .from('price_adjustments')
      .insert({
        estimate_id: estimateId,
        adjustment_type: adjustmentType,
        adjustment_value: value,
        adjustment_amount: adjustmentAmount,
        description: description || null,
        internal_reason: reason || null,
        applied_by: user?.id || null,
        original_price: basePrice,
        new_price: adjustedPrice,
      } as never)
      .select()
      .single()

    if (insertError) {
      // Table might not exist - create it
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { error: 'Price adjustments table not found. Please run migrations.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create adjustment' },
        { status: 500 }
      )
    }

    // Update the estimate's adjusted price
    const { error: updateError } = await supabase
      .from('detailed_estimates')
      .update({ adjusted_price: adjustedPrice } as never)
      .eq('id', estimateId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update estimate price' },
        { status: 500 }
      )
    }

    return NextResponse.json({ adjustment, adjustedPrice }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leads/[leadId]/detailed-estimate/adjust
 * Remove a price adjustment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId } = await params
    const { searchParams } = new URL(request.url)
    const adjustmentId = searchParams.get('adjustmentId')

    if (!adjustmentId) {
      return NextResponse.json(
        { error: 'Adjustment ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the adjustment and verify it belongs to an estimate in this lead
    const { data: adjustment, error: fetchError } = await supabase
      .from('price_adjustments')
      .select(`
        *,
        detailed_estimates!inner(id, lead_id, price_likely)
      `)
      .eq('id', adjustmentId)
      .single()

    if (fetchError || !adjustment) {
      return NextResponse.json(
        { error: 'Adjustment not found' },
        { status: 404 }
      )
    }

    const estimateData = (adjustment as { detailed_estimates: { id: string; lead_id: string; price_likely: number } }).detailed_estimates
    if (estimateData.lead_id !== leadId) {
      return NextResponse.json(
        { error: 'Adjustment not found for this lead' },
        { status: 404 }
      )
    }

    // Delete the adjustment
    const { error: deleteError } = await supabase
      .from('price_adjustments')
      .delete()
      .eq('id', adjustmentId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete adjustment' },
        { status: 500 }
      )
    }

    // Recalculate and update the estimate's adjusted price
    // Get remaining adjustments for this estimate
    const { data: remainingAdjustments } = await supabase
      .from('price_adjustments')
      .select('*')
      .eq('estimate_id', estimateData.id)
      .order('created_at', { ascending: true })

    // Calculate new price based on remaining adjustments
    let newPrice = estimateData.price_likely

    if (remainingAdjustments && remainingAdjustments.length > 0) {
      for (const adj of remainingAdjustments) {
        const adjRecord = adj as { adjustment_type: string; adjustment_value: number }
        switch (adjRecord.adjustment_type) {
          case 'discount_percent':
            newPrice = newPrice * (1 - adjRecord.adjustment_value / 100)
            break
          case 'discount_fixed':
            newPrice = newPrice - adjRecord.adjustment_value
            break
          case 'price_override':
            newPrice = adjRecord.adjustment_value
            break
        }
      }
    }

    // Update estimate with new adjusted price (or null if no adjustments)
    await supabase
      .from('detailed_estimates')
      .update({
        adjusted_price: remainingAdjustments && remainingAdjustments.length > 0 ? newPrice : null,
      } as never)
      .eq('id', estimateData.id)

    return NextResponse.json({ success: true, newPrice })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
