import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { RoofVariables, SlopeVariables } from '@/lib/supabase/types'

const applyMacroSchema = z.object({
  lead_id: z.string().uuid(),
  variables: z.object({
    SQ: z.number(),
    SF: z.number(),
    P: z.number(),
    EAVE: z.number(),
    R: z.number(),
    VAL: z.number(),
    HIP: z.number(),
    RAKE: z.number(),
    SKYLIGHT_COUNT: z.number(),
    CHIMNEY_COUNT: z.number(),
    PIPE_COUNT: z.number(),
    VENT_COUNT: z.number(),
    GUTTER_LF: z.number(),
    DS_COUNT: z.number(),
    slopes: z.record(z.string(), z.object({
      SQ: z.number(),
      SF: z.number(),
      PITCH: z.number(),
      EAVE: z.number(),
      RIDGE: z.number(),
      VALLEY: z.number(),
      HIP: z.number(),
      RAKE: z.number(),
    })).optional(),
  }),
  sketch_id: z.string().uuid().optional(),
  geographic_pricing_id: z.string().uuid().optional(),
  overhead_percent: z.number().min(0).max(50).default(10),
  profit_percent: z.number().min(0).max(50).default(15),
  tax_percent: z.number().min(0).max(20).default(0),
  name: z.string().default('Estimate'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ macroId: string }> }
) {
  try {
    const { macroId } = await params
    const body = await request.json()
    const parsed = applyMacroSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch macro with line items
    const { data: macro, error: macroError } = await supabase
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

    if (macroError || !macro) {
      return NextResponse.json(
        { error: 'Macro not found' },
        { status: 404 }
      )
    }

    // Fetch geographic pricing if specified
    let geographicPricing = null
    if (parsed.data.geographic_pricing_id) {
      const { data } = await supabase
        .from('geographic_pricing')
        .select('*')
        .eq('id', parsed.data.geographic_pricing_id)
        .single()
      geographicPricing = data
    }

    // Calculate geographic multipliers
    const geoPricing = geographicPricing as { material_multiplier?: number; labor_multiplier?: number; equipment_multiplier?: number } | null
    const geoMultipliers = {
      material: geoPricing?.material_multiplier || 1,
      labor: geoPricing?.labor_multiplier || 1,
      equipment: geoPricing?.equipment_multiplier || 1,
    }

    // Import formula parser dynamically to avoid issues
    const { evaluateFormula } = await import('@/lib/estimation/formula-parser')

    // Calculate line items
    const macroLineItems = (macro as Record<string, unknown>).line_items as Array<{
      line_item: Record<string, unknown>
      quantity_formula: string | null
      waste_factor: number | null
      is_optional: boolean
      is_selected_by_default: boolean
      material_cost_override: number | null
      labor_cost_override: number | null
      equipment_cost_override: number | null
      sort_order: number
      group_name: string | null
      notes: string | null
    }>

    const calculatedLineItems = macroLineItems.map((mli) => {
      const lineItem = mli.line_item

      // Calculate quantity from formula
      const formula = mli.quantity_formula || (lineItem.quantity_formula as string | null)
      let quantity = 0

      if (formula) {
        try {
          const vars: RoofVariables = {
            ...parsed.data.variables,
            slopes: (parsed.data.variables.slopes || {}) as Record<string, SlopeVariables>,
          }
          quantity = evaluateFormula(formula, vars)
        } catch (e) {
          console.warn(`Formula evaluation failed for ${lineItem.item_code}: ${e}`)
        }
      }

      const wasteFactor = mli.waste_factor || (lineItem.default_waste_factor as number) || 1
      const quantityWithWaste = quantity * wasteFactor

      // Calculate costs with geographic adjustment
      const materialUnitCost = (mli.material_cost_override ?? (lineItem.base_material_cost as number)) * geoMultipliers.material
      const laborUnitCost = (mli.labor_cost_override ?? (lineItem.base_labor_cost as number)) * geoMultipliers.labor
      const equipmentUnitCost = (mli.equipment_cost_override ?? (lineItem.base_equipment_cost as number)) * geoMultipliers.equipment

      const materialTotal = quantityWithWaste * materialUnitCost
      const laborTotal = quantityWithWaste * laborUnitCost
      const equipmentTotal = quantityWithWaste * equipmentUnitCost
      const lineTotal = materialTotal + laborTotal + equipmentTotal

      return {
        line_item_id: lineItem.id as string,
        item_code: lineItem.item_code as string,
        name: lineItem.name as string,
        category: lineItem.category as string,
        unit_type: lineItem.unit_type as string,
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
        is_included: mli.is_selected_by_default,
        is_optional: mli.is_optional,
        is_taxable: (lineItem.is_taxable as boolean) ?? true,
        sort_order: mli.sort_order,
        group_name: mli.group_name,
        notes: mli.notes,
      }
    })

    // Calculate totals
    const includedItems = calculatedLineItems.filter((li) => li.is_included)
    const totalMaterial = includedItems.reduce((sum, li) => sum + li.material_total, 0)
    const totalLabor = includedItems.reduce((sum, li) => sum + li.labor_total, 0)
    const totalEquipment = includedItems.reduce((sum, li) => sum + li.equipment_total, 0)
    const subtotal = totalMaterial + totalLabor + totalEquipment

    const overheadAmount = subtotal * (parsed.data.overhead_percent / 100)
    const profitAmount = (subtotal + overheadAmount) * (parsed.data.profit_percent / 100)
    const taxableAmount = includedItems.filter((li) => li.is_taxable).reduce((sum, li) => sum + li.line_total, 0)
    const taxAmount = taxableAmount * (parsed.data.tax_percent / 100)
    const priceLikely = subtotal + overheadAmount + profitAmount + taxAmount

    // Create detailed estimate
    const { data: estimate, error: estimateError } = await supabase
      .from('detailed_estimates')
      .insert({
        lead_id: parsed.data.lead_id,
        sketch_id: parsed.data.sketch_id || null,
        name: parsed.data.name,
        variables: parsed.data.variables,
        total_material: Math.round(totalMaterial * 100) / 100,
        total_labor: Math.round(totalLabor * 100) / 100,
        total_equipment: Math.round(totalEquipment * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        overhead_percent: parsed.data.overhead_percent,
        overhead_amount: Math.round(overheadAmount * 100) / 100,
        profit_percent: parsed.data.profit_percent,
        profit_amount: Math.round(profitAmount * 100) / 100,
        taxable_amount: Math.round(taxableAmount * 100) / 100,
        tax_percent: parsed.data.tax_percent,
        tax_amount: Math.round(taxAmount * 100) / 100,
        price_low: Math.round(priceLikely * 0.9 * 100) / 100,
        price_likely: Math.round(priceLikely * 100) / 100,
        price_high: Math.round(priceLikely * 1.15 * 100) / 100,
        geographic_pricing_id: parsed.data.geographic_pricing_id || null,
        geographic_adjustment: (geoMultipliers.material + geoMultipliers.labor + geoMultipliers.equipment) / 3,
        source_macro_id: macroId,
        status: 'draft',
      } as never)
      .select()
      .single()

    if (estimateError) {
      console.error('Error creating estimate:', estimateError)
      return NextResponse.json(
        { error: 'Failed to create estimate' },
        { status: 500 }
      )
    }

    // Create estimate line items
    const lineItemsToInsert = calculatedLineItems.map((li) => ({
      detailed_estimate_id: (estimate as { id: string }).id,
      ...li,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: lineItemsError } = await (supabase as any)
      .from('estimate_line_items')
      .insert(lineItemsToInsert)

    if (lineItemsError) {
      console.error('Error creating estimate line items:', lineItemsError)
      // Don't fail the request, estimate was created successfully
    }

    // Increment macro usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('increment_macro_usage', { p_macro_id: macroId })

    // Fetch complete estimate with line items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: completeEstimate } = await (supabase as any)
      .from('detailed_estimates')
      .select(`
        *,
        line_items:estimate_line_items(*)
      `)
      .eq('id', (estimate as { id: string }).id)
      .single()

    return NextResponse.json({ estimate: completeEstimate }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/macros/[macroId]/apply:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
