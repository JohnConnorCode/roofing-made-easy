import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/api/auth'

const updateLineItemSchema = z.object({
  item_code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  category: z.enum([
    'tear_off', 'underlayment', 'shingles', 'metal_roofing', 'tile_roofing',
    'flat_roofing', 'flashing', 'ventilation', 'gutters', 'skylights',
    'chimneys', 'decking', 'insulation', 'labor', 'equipment', 'disposal',
    'permits', 'miscellaneous'
  ]).optional(),
  unit_type: z.enum(['SQ', 'SF', 'LF', 'EA', 'HR', 'DAY', 'TON', 'GAL', 'BDL', 'RL']).optional(),
  base_material_cost: z.number().min(0).optional(),
  base_labor_cost: z.number().min(0).optional(),
  base_equipment_cost: z.number().min(0).optional(),
  quantity_formula: z.string().nullable().optional(),
  default_waste_factor: z.number().min(1).max(2).optional(),
  is_active: z.boolean().optional(),
  is_taxable: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { itemId } = await params
    const supabase = await createClient()

    const { data: lineItem, error } = await supabase
      .from('line_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Line item not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch line item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lineItem })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { itemId } = await params
    const body = await request.json()
    const parsed = updateLineItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: lineItem, error } = await supabase
      .from('line_items')
      .update(parsed.data as never)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Line item not found' },
          { status: 404 }
        )
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Item code already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update line item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lineItem })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { itemId } = await params
    const supabase = await createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('line_items')
      .update({ is_active: false } as never)
      .eq('id', itemId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete line item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
