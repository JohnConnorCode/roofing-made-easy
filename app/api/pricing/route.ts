import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { z } from 'zod'

const pricingRuleSchema = z.object({
  rule_key: z.string().min(1).max(100),
  rule_category: z.string().min(1).max(50),
  display_name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  base_rate: z.number().min(0).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  multiplier: z.number().min(0).optional().nullable(),
  flat_fee: z.number().min(0).optional().nullable(),
  min_charge: z.number().min(0).optional().nullable(),
  max_charge: z.number().min(0).optional().nullable(),
  conditions: z.record(z.string(), z.unknown()).optional().nullable(),
  is_active: z.boolean().optional(),
})

const pricingRuleUpdateSchema = z.object({
  id: z.string().uuid(),
  rule_key: z.string().min(1).max(100).optional(),
  rule_category: z.string().min(1).max(50).optional(),
  display_name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  base_rate: z.number().min(0).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  multiplier: z.number().min(0).optional().nullable(),
  flat_fee: z.number().min(0).optional().nullable(),
  min_charge: z.number().min(0).optional().nullable(),
  max_charge: z.number().min(0).optional().nullable(),
  conditions: z.record(z.string(), z.unknown()).optional().nullable(),
  is_active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') !== 'false'

    let query = supabase
      .from('pricing_rules')
      .select('*')
      .order('rule_category')
      .order('rule_key')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('rule_category', category)
    }

    const { data: rules, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pricing rules' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rules })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const body = await request.json()
    const validation = pricingRuleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid pricing rule data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const validated = validation.data

    const { data: rule, error } = await supabase
      .from('pricing_rules')
      .insert({
        rule_key: validated.rule_key,
        rule_category: validated.rule_category,
        display_name: validated.display_name,
        description: validated.description,
        base_rate: validated.base_rate,
        unit: validated.unit,
        multiplier: validated.multiplier,
        flat_fee: validated.flat_fee,
        min_charge: validated.min_charge,
        max_charge: validated.max_charge,
        conditions: validated.conditions,
        is_active: validated.is_active ?? true,
      } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create pricing rule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const body = await request.json()
    const validation = pricingRuleUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { id, ...updates } = validation.data

    const supabase = await createClient()

    const { data: rule, error } = await supabase
      .from('pricing_rules')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update pricing rule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
