import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'

const updateMacroSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  roof_type: z.enum([
    'asphalt_shingle', 'metal_standing_seam', 'metal_corrugated',
    'tile_concrete', 'tile_clay', 'slate', 'wood_shake',
    'flat_tpo', 'flat_epdm', 'flat_modified_bitumen', 'any'
  ]).optional(),
  job_type: z.enum([
    'full_replacement', 'repair', 'overlay', 'partial_replacement',
    'storm_damage', 'insurance_claim', 'maintenance', 'gutter_only', 'any'
  ]).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
})

const addLineItemSchema = z.object({
  line_item_id: z.string().uuid(),
  quantity_formula: z.string().nullable().optional(),
  waste_factor: z.number().min(1).max(2).nullable().optional(),
  is_optional: z.boolean().default(false),
  is_selected_by_default: z.boolean().default(true),
  material_cost_override: z.number().min(0).nullable().optional(),
  labor_cost_override: z.number().min(0).nullable().optional(),
  equipment_cost_override: z.number().min(0).nullable().optional(),
  sort_order: z.number().int().default(0),
  group_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ macroId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { macroId } = await params
    const supabase = await createClient()

    const { data: macro, error } = await supabase
      .from('estimate_macros')
      .select(`
        *,
        line_items:macro_line_items(
          *,
          line_item:line_items(*)
        )
      `)
      .eq('id', macroId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Macro not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch macro' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { macro },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ macroId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { macroId } = await params
    const body = await request.json()
    const parsed = updateMacroSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if system macro
    const { data: existingForUpdate } = await supabase
      .from('estimate_macros')
      .select('is_system')
      .eq('id', macroId)
      .single()

    if ((existingForUpdate as unknown as { is_system?: boolean })?.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system macros' },
        { status: 403 }
      )
    }

    const { data: macro, error } = await supabase
      .from('estimate_macros')
      .update(parsed.data as never)
      .eq('id', macroId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Macro not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update macro' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { macro },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ macroId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { macroId } = await params
    const supabase = await createClient()

    // Check if system macro
    const { data: existingForDelete } = await supabase
      .from('estimate_macros')
      .select('is_system')
      .eq('id', macroId)
      .single()

    if ((existingForDelete as unknown as { is_system?: boolean })?.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system macros' },
        { status: 403 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('estimate_macros')
      .update({ is_active: false } as never)
      .eq('id', macroId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete macro' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST to add a line item to macro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ macroId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { macroId } = await params
    const body = await request.json()
    const parsed = addLineItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: macroLineItem, error } = await supabase
      .from('macro_line_items')
      .insert({
        macro_id: macroId,
        ...parsed.data,
      } as never)
      .select(`*, line_item:line_items(*)`)
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Line item already in macro' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to add line item to macro' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { macroLineItem },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
