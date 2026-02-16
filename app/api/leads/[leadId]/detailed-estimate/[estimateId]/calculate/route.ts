import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RoofVariables } from '@/lib/supabase/types'

/**
 * Recalculate all line items in an estimate based on current variables
 * and geographic pricing, then update estimate totals.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; estimateId: string }> }
) {
  try {
    const { leadId, estimateId } = await params
    const supabase = await createClient()

    // Fetch estimate with all related data
    const { data: estimate, error: fetchError } = await supabase
      .from('detailed_estimates')
      .select(`
        *,
        line_items:estimate_line_items(*),
        geographic:geographic_pricing(*)
      `)
      .eq('id', estimateId)
      .eq('lead_id', leadId)
      .single()

    if (fetchError || !estimate) {
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

    const { evaluateFormula } = await import('@/lib/estimation/formula-parser')

    // Recalculate each line item (type assertion for joined data)
    const lineItems = ((estimate as Record<string, unknown>).line_items || []) as Array<{
      id: string
      item_code: string
      quantity: number
      quantity_formula?: string
      quantity_override?: boolean
      waste_factor?: number
      material_unit_cost: number
      labor_unit_cost: number
      equipment_unit_cost: number
      cost_override?: boolean
      line_item_id: string
    }>
    const updates: Array<{ id: string; updates: Record<string, unknown> }> = []

    for (const item of lineItems) {
      // Skip items with manual quantity override
      if (item.quantity_override && !item.quantity_formula) {
        continue
      }

      let quantity = item.quantity

      // Recalculate from formula if available
      if (item.quantity_formula) {
        try {
          const variables = (estimate as Record<string, unknown>).variables as RoofVariables
          quantity = evaluateFormula(item.quantity_formula, variables)
        } catch {
          // Formula evaluation failed, use default quantity
        }
      }

      const wasteFactor = item.waste_factor || 1
      const quantityWithWaste = quantity * wasteFactor

      // Recalculate costs if not overridden
      let materialUnitCost = item.material_unit_cost
      let laborUnitCost = item.labor_unit_cost
      let equipmentUnitCost = item.equipment_unit_cost

      if (!item.cost_override) {
        // Fetch base costs from line item
        const { data: lineItemData } = await supabase
          .from('line_items')
          .select('base_material_cost, base_labor_cost, base_equipment_cost')
          .eq('id', item.line_item_id)
          .single()

        // Type assertion for line item costs
        const lineItem = lineItemData as {
          base_material_cost: number
          base_labor_cost: number
          base_equipment_cost: number
        } | null

        if (lineItem) {
          materialUnitCost = lineItem.base_material_cost * geoMultipliers.material
          laborUnitCost = lineItem.base_labor_cost * geoMultipliers.labor
          equipmentUnitCost = lineItem.base_equipment_cost * geoMultipliers.equipment
        }
      }

      const materialTotal = quantityWithWaste * materialUnitCost
      const laborTotal = quantityWithWaste * laborUnitCost
      const equipmentTotal = quantityWithWaste * equipmentUnitCost
      const lineTotal = materialTotal + laborTotal + equipmentTotal

      updates.push({
        id: item.id,
        updates: {
          quantity: Math.round(quantity * 100) / 100,
          quantity_with_waste: Math.round(quantityWithWaste * 100) / 100,
          material_unit_cost: Math.round(materialUnitCost * 100) / 100,
          labor_unit_cost: Math.round(laborUnitCost * 100) / 100,
          equipment_unit_cost: Math.round(equipmentUnitCost * 100) / 100,
          material_total: Math.round(materialTotal * 100) / 100,
          labor_total: Math.round(laborTotal * 100) / 100,
          equipment_total: Math.round(equipmentTotal * 100) / 100,
          line_total: Math.round(lineTotal * 100) / 100,
        },
      })
    }

    // Apply updates
    for (const { id, updates: itemUpdates } of updates) {
      await supabase
        .from('estimate_line_items')
        .update(itemUpdates as never)
        .eq('id', id)
    }

    // Recalculate estimate totals using database function
    await supabase.rpc('recalculate_estimate_totals' as never, { p_estimate_id: estimateId } as never)

    // Fetch updated estimate
    const { data: updatedEstimate, error: refetchError } = await supabase
      .from('detailed_estimates')
      .select(`
        *,
        line_items:estimate_line_items(*)
      `)
      .eq('id', estimateId)
      .single()

    if (refetchError) {
      console.error('Error refetching estimate:', refetchError)
      return NextResponse.json(
        { error: 'Failed to refetch estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      estimate: updatedEstimate,
      recalculated: updates.length,
    })
  } catch (error) {
    console.error('Error in POST calculate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
