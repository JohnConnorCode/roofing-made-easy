import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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
      console.error('Error fetching pricing rules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pricing rules' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Error in GET /api/pricing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: rule, error } = await supabase
      .from('pricing_rules')
      .insert({
        rule_key: body.rule_key,
        rule_category: body.rule_category,
        display_name: body.display_name,
        description: body.description,
        base_rate: body.base_rate,
        unit: body.unit,
        multiplier: body.multiplier,
        flat_fee: body.flat_fee,
        min_charge: body.min_charge,
        max_charge: body.max_charge,
        conditions: body.conditions,
        is_active: body.is_active ?? true,
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Error creating pricing rule:', error)
      return NextResponse.json(
        { error: 'Failed to create pricing rule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pricing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Rule id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: rule, error } = await supabase
      .from('pricing_rules')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pricing rule:', error)
      return NextResponse.json(
        { error: 'Failed to update pricing rule' },
        { status: 500 }
      )
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Error in PATCH /api/pricing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
