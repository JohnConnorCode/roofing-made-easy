import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { RoofVariables } from '@/lib/supabase/types'

// Type for line item from database (incomplete Supabase types)
interface LineItemRow {
  id: string
  item_code: string
  name: string
  category: string
  unit_type: string
  quantity_formula: string | null
  default_waste_factor: number
  base_material_cost: number
  base_labor_cost: number
  base_equipment_cost: number
  is_taxable: boolean
}

const addLineItemSchema = z.object({
  line_item_id: z.string().uuid(),
  quantity: z.number().min(0).optional(),
  quantity_formula: z.string().nullable().optional(),
  waste_factor: z.number().min(1).max(2).default(1),
  material_unit_cost: z.number().min(0).optional(),
  labor_unit_cost: z.number().min(0).optional(),
  equipment_unit_cost: z.number().min(0).optional(),
  is_included: z.boolean().default(true),
  is_optional: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  group_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

const updateLineItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().min(0).optional(),
  quantity_formula: z.string().nullable().optional(),
  waste_factor: z.number().min(1).max(2).optional(),
  material_unit_cost: z.number().min(0).optional(),
  labor_unit_cost: z.number().min(0).optional(),
  equipment_unit_cost: z.number().min(0).optional(),
  is_included: z.boolean().optional(),
  is_optional: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  group_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

const bulkAddSchema = z.object({
  items: z.array(addLineItemSchema),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { estimateId } = await params
    const supabase = await createClient()

    const { data: lineItems, error } = await supabase
      .from('estimate_line_items')
      .select('*')
      .eq('detailed_estimate_id', estimateId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching line items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch line items' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lineItems })
  } catch (error) {
    console.error('Error in GET line-items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { leadId, estimateId } = await params
    const body = await request.json()

    // Check if bulk add
    if (body.items) {
      const parsed = bulkAddSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const supabase = await createClient()

      // Fetch estimate with variables and geographic pricing
      const { data: estimate } = await supabase
        .from('detailed_estimates')
        .select('*, geographic:geographic_pricing(*)')
        .eq('id', estimateId)
        .eq('lead_id', leadId)
        .single()

      if (!estimate) {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 404 }
        )
      }

      // Type assertion for joined geographic data
      const geographic = (estimate as Record<string, unknown>).geographic as {
        material_multiplier?: number
        labor_multiplier?: number
        equipment_multiplier?: number
      } | null

      const geoMultipliers = {
        material: geographic?.material_multiplier || 1,
        labor: geographic?.labor_multiplier || 1,
        equipment: geographic?.equipment_multiplier || 1,
      }

      // Import formula parser
      const { evaluateFormula } = await import('@/lib/estimation/formula-parser')

      // Get estimate variables with type assertion
      const variables = (estimate as Record<string, unknown>).variables as RoofVariables

      // Process each item
      const itemsToInsert = await Promise.all(
        parsed.data.items.map(async (item) => {
          // Fetch line item
          const { data: lineItemData } = await supabase
            .from('line_items')
            .select('*')
            .eq('id', item.line_item_id)
            .single()

          const lineItem = lineItemData as LineItemRow | null

          if (!lineItem) {
            throw new Error(`Line item not found: ${item.line_item_id}`)
          }

          // Calculate quantity
          const formula = item.quantity_formula ?? lineItem.quantity_formula
          let quantity = item.quantity ?? 0

          if (formula && item.quantity === undefined) {
            try {
              quantity = evaluateFormula(formula, variables)
            } catch (e) {
              console.warn(`Formula evaluation failed: ${e}`)
            }
          }

          const wasteFactor = item.waste_factor ?? lineItem.default_waste_factor
          const quantityWithWaste = quantity * wasteFactor

          // Calculate costs
          const materialUnitCost = (item.material_unit_cost ?? lineItem.base_material_cost) * geoMultipliers.material
          const laborUnitCost = (item.labor_unit_cost ?? lineItem.base_labor_cost) * geoMultipliers.labor
          const equipmentUnitCost = (item.equipment_unit_cost ?? lineItem.base_equipment_cost) * geoMultipliers.equipment

          const materialTotal = quantityWithWaste * materialUnitCost
          const laborTotal = quantityWithWaste * laborUnitCost
          const equipmentTotal = quantityWithWaste * equipmentUnitCost
          const lineTotal = materialTotal + laborTotal + equipmentTotal

          return {
            detailed_estimate_id: estimateId,
            line_item_id: item.line_item_id,
            item_code: lineItem.item_code,
            name: lineItem.name,
            category: lineItem.category,
            unit_type: lineItem.unit_type,
            quantity: Math.round(quantity * 100) / 100,
            quantity_formula: formula,
            waste_factor: wasteFactor,
            quantity_with_waste: Math.round(quantityWithWaste * 100) / 100,
            material_unit_cost: Math.round(materialUnitCost * 100) / 100,
            labor_unit_cost: Math.round(laborUnitCost * 100) / 100,
            equipment_unit_cost: Math.round(equipmentUnitCost * 100) / 100,
            material_total: Math.round(materialTotal * 100) / 100,
            labor_total: Math.round(laborTotal * 100) / 100,
            equipment_total: Math.round(equipmentTotal * 100) / 100,
            line_total: Math.round(lineTotal * 100) / 100,
            is_included: item.is_included,
            is_optional: item.is_optional,
            is_taxable: lineItem.is_taxable,
            sort_order: item.sort_order,
            group_name: item.group_name,
            notes: item.notes,
            quantity_override: item.quantity !== undefined,
            cost_override: item.material_unit_cost !== undefined || item.labor_unit_cost !== undefined,
          }
        })
      )

      const { data: lineItems, error } = await supabase
        .from('estimate_line_items')
        .insert(itemsToInsert as never)
        .select()

      if (error) {
        console.error('Error inserting line items:', error)
        return NextResponse.json(
          { error: 'Failed to add line items' },
          { status: 500 }
        )
      }

      // Recalculate estimate totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('recalculate_estimate_totals', { p_estimate_id: estimateId })

      return NextResponse.json({ lineItems }, { status: 201 })
    }

    // Single item add
    const parsed = addLineItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch estimate and line item
    const { data: estimate } = await supabase
      .from('detailed_estimates')
      .select('*, geographic:geographic_pricing(*)')
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .single()

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    const { data: lineItemData2 } = await supabase
      .from('line_items')
      .select('*')
      .eq('id', parsed.data.line_item_id)
      .single()

    // Type assertion for line item data
    const typedLineItem = lineItemData2 as LineItemRow | null

    if (!typedLineItem) {
      return NextResponse.json(
        { error: 'Line item not found' },
        { status: 404 }
      )
    }

    // Type assertion for geographic pricing
    const geoData = (estimate as Record<string, unknown>).geographic as {
      material_multiplier?: number
      labor_multiplier?: number
      equipment_multiplier?: number
    } | null

    const geoMultipliers = {
      material: geoData?.material_multiplier || 1,
      labor: geoData?.labor_multiplier || 1,
      equipment: geoData?.equipment_multiplier || 1,
    }

    const { evaluateFormula } = await import('@/lib/estimation/formula-parser')

    // Get estimate variables with type assertion
    const estimateVars = (estimate as Record<string, unknown>).variables as RoofVariables

    // Calculate quantity
    const formula = parsed.data.quantity_formula ?? typedLineItem.quantity_formula
    let quantity = parsed.data.quantity ?? 0

    if (formula && parsed.data.quantity === undefined) {
      try {
        quantity = evaluateFormula(formula, estimateVars)
      } catch (e) {
        console.warn(`Formula evaluation failed: ${e}`)
      }
    }

    const wasteFactor = parsed.data.waste_factor ?? typedLineItem.default_waste_factor
    const quantityWithWaste = quantity * wasteFactor

    const materialUnitCost = (parsed.data.material_unit_cost ?? typedLineItem.base_material_cost) * geoMultipliers.material
    const laborUnitCost = (parsed.data.labor_unit_cost ?? typedLineItem.base_labor_cost) * geoMultipliers.labor
    const equipmentUnitCost = (parsed.data.equipment_unit_cost ?? typedLineItem.base_equipment_cost) * geoMultipliers.equipment

    const materialTotal = quantityWithWaste * materialUnitCost
    const laborTotal = quantityWithWaste * laborUnitCost
    const equipmentTotal = quantityWithWaste * equipmentUnitCost
    const lineTotal = materialTotal + laborTotal + equipmentTotal

    const { data: estimateLineItem, error } = await supabase
      .from('estimate_line_items')
      .insert({
        detailed_estimate_id: estimateId,
        line_item_id: parsed.data.line_item_id,
        item_code: typedLineItem.item_code,
        name: typedLineItem.name,
        category: typedLineItem.category,
        unit_type: typedLineItem.unit_type,
        quantity: Math.round(quantity * 100) / 100,
        quantity_formula: formula,
        waste_factor: wasteFactor,
        quantity_with_waste: Math.round(quantityWithWaste * 100) / 100,
        material_unit_cost: Math.round(materialUnitCost * 100) / 100,
        labor_unit_cost: Math.round(laborUnitCost * 100) / 100,
        equipment_unit_cost: Math.round(equipmentUnitCost * 100) / 100,
        material_total: Math.round(materialTotal * 100) / 100,
        labor_total: Math.round(laborTotal * 100) / 100,
        equipment_total: Math.round(equipmentTotal * 100) / 100,
        line_total: Math.round(lineTotal * 100) / 100,
        is_included: parsed.data.is_included,
        is_optional: parsed.data.is_optional,
        is_taxable: typedLineItem.is_taxable,
        sort_order: parsed.data.sort_order,
        group_name: parsed.data.group_name,
        notes: parsed.data.notes,
        quantity_override: parsed.data.quantity !== undefined,
        cost_override: parsed.data.material_unit_cost !== undefined || parsed.data.labor_unit_cost !== undefined,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Error adding line item:', error)
      return NextResponse.json(
        { error: 'Failed to add line item' },
        { status: 500 }
      )
    }

    // Recalculate estimate totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('recalculate_estimate_totals', { p_estimate_id: estimateId })

    return NextResponse.json({ lineItem: estimateLineItem }, { status: 201 })
  } catch (error) {
    console.error('Error in POST line-items:', error)
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
    const parsed = updateLineItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...updates } = parsed.data
    const supabase = await createClient()

    // Recalculate if quantity or cost changed
    if (
      updates.quantity !== undefined ||
      updates.waste_factor !== undefined ||
      updates.material_unit_cost !== undefined ||
      updates.labor_unit_cost !== undefined ||
      updates.equipment_unit_cost !== undefined
    ) {
      // Fetch current values
      const { data: currentData } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('id', id)
        .single()

      // Type assertion for current line item
      const current = currentData as {
        quantity: number
        waste_factor: number
        material_unit_cost: number
        labor_unit_cost: number
        equipment_unit_cost: number
      } | null

      if (current) {
        const quantity = updates.quantity ?? current.quantity
        const wasteFactor = updates.waste_factor ?? current.waste_factor
        const quantityWithWaste = quantity * wasteFactor

        const materialUnitCost = updates.material_unit_cost ?? current.material_unit_cost
        const laborUnitCost = updates.labor_unit_cost ?? current.labor_unit_cost
        const equipmentUnitCost = updates.equipment_unit_cost ?? current.equipment_unit_cost

        const materialTotal = quantityWithWaste * materialUnitCost
        const laborTotal = quantityWithWaste * laborUnitCost
        const equipmentTotal = quantityWithWaste * equipmentUnitCost
        const lineTotal = materialTotal + laborTotal + equipmentTotal

        updates.quantity = quantity
        updates.waste_factor = wasteFactor
        ;(updates as Record<string, unknown>).quantity_with_waste = quantityWithWaste
        ;(updates as Record<string, unknown>).material_total = materialTotal
        ;(updates as Record<string, unknown>).labor_total = laborTotal
        ;(updates as Record<string, unknown>).equipment_total = equipmentTotal
        ;(updates as Record<string, unknown>).line_total = lineTotal
        ;(updates as Record<string, unknown>).quantity_override = updates.quantity !== undefined
        ;(updates as Record<string, unknown>).cost_override =
          updates.material_unit_cost !== undefined ||
          updates.labor_unit_cost !== undefined
      }
    }

    const { data: lineItem, error } = await supabase
      .from('estimate_line_items')
      .update(updates as never)
      .eq('id', id)
      .eq('detailed_estimate_id', estimateId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Line item not found' },
          { status: 404 }
        )
      }
      console.error('Error updating line item:', error)
      return NextResponse.json(
        { error: 'Failed to update line item' },
        { status: 500 }
      )
    }

    // Recalculate estimate totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('recalculate_estimate_totals', { p_estimate_id: estimateId })

    return NextResponse.json({ lineItem })
  } catch (error) {
    console.error('Error in PATCH line-items:', error)
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
    const { estimateId } = await params
    const { searchParams } = new URL(request.url)
    const lineItemId = searchParams.get('id')

    if (!lineItemId) {
      return NextResponse.json(
        { error: 'Line item ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('estimate_line_items')
      .delete()
      .eq('id', lineItemId)
      .eq('detailed_estimate_id', estimateId)

    if (error) {
      console.error('Error deleting line item:', error)
      return NextResponse.json(
        { error: 'Failed to delete line item' },
        { status: 500 }
      )
    }

    // Recalculate estimate totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('recalculate_estimate_totals', { p_estimate_id: estimateId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE line-items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
