import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PricingEngine, DEFAULT_PRICING_RULES } from '@/lib/pricing/engine'
import { generateExplanation } from '@/lib/ai'
import type { PricingRule, Intake, Property } from '@/lib/supabase/types'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  createRateLimitHeaders,
} from '@/lib/rate-limit'

interface LeadWithRelations {
  id: string
  intakes: Intake[] | Intake | null
  properties: Property[] | Property | null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Rate limiting for estimate calculation
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'estimateCalculation')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const supabase = await createClient()

    // Fetch lead data
    const { data, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        intakes(*),
        properties(*)
      `)
      .eq('id', leadId)
      .single()

    const lead = data as LeadWithRelations | null

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Fetch pricing rules
    let pricingRules: PricingRule[]
    const { data: rules, error: rulesError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError || !rules || rules.length === 0) {
      console.warn('Using default pricing rules')
      pricingRules = DEFAULT_PRICING_RULES as PricingRule[]
    } else {
      pricingRules = rules as PricingRule[]
    }

    // Calculate estimate
    const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes
    const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties

    const engine = new PricingEngine(pricingRules)
    const result = engine.calculateEstimate({
      intake: intake || {},
      property: property || {},
    })

    // Generate AI explanation
    const aiResult = await generateExplanation({
      estimate: {
        priceLow: result.priceLow,
        priceLikely: result.priceLikely,
        priceHigh: result.priceHigh,
      },
      intake: {
        jobType: intake?.job_type || undefined,
        roofMaterial: intake?.roof_material || undefined,
        roofSizeSqft: intake?.roof_size_sqft || undefined,
        roofPitch: intake?.roof_pitch || undefined,
        stories: intake?.stories || undefined,
        issues: (intake?.issues as string[]) || [],
        timelineUrgency: intake?.timeline_urgency || undefined,
        hasSkylights: intake?.has_skylights || undefined,
        hasChimneys: intake?.has_chimneys || undefined,
        hasSolarPanels: intake?.has_solar_panels || undefined,
      },
      adjustments: result.adjustments,
    })

    // Mark any previous estimates as superseded
    await supabase
      .from('estimates')
      .update({ is_superseded: true } as never)
      .eq('lead_id', leadId)
      .eq('is_superseded', false)

    // Save estimate
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .insert({
        lead_id: leadId,
        price_low: result.priceLow,
        price_likely: result.priceLikely,
        price_high: result.priceHigh,
        base_cost: result.baseCost,
        material_cost: result.materialCost,
        labor_cost: result.laborCost,
        adjustments: result.adjustments,
        input_snapshot: result.inputSnapshot,
        pricing_rules_snapshot: result.rulesSnapshot,
        ai_explanation: aiResult.success ? aiResult.data : null,
        ai_explanation_provider: aiResult.provider,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      } as never)
      .select()
      .single()

    if (estimateError) {
      console.error('Error saving estimate:', estimateError)
      return NextResponse.json(
        { error: 'Failed to save estimate' },
        { status: 500 }
      )
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'estimate_generated' } as never)
      .eq('id', leadId)

    // Log AI output
    if (aiResult.success && estimate) {
      await supabase.from('ai_outputs').insert({
        lead_id: leadId,
        estimate_id: (estimate as { id: string }).id,
        provider: aiResult.provider,
        operation: 'generate_explanation',
        model: aiResult.model,
        input_data: {
          estimate: { priceLow: result.priceLow, priceLikely: result.priceLikely, priceHigh: result.priceHigh },
          intake,
          adjustments: result.adjustments,
        },
        output_data: { explanation: aiResult.data },
        latency_ms: aiResult.latencyMs,
        success: true,
      } as never)
    }

    return NextResponse.json(estimate, {
      status: 201,
      headers: createRateLimitHeaders(rateLimitResult),
    })
  } catch (error) {
    console.error('Error in POST /api/leads/[leadId]/estimate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    // Rate limiting for general API calls
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId } = await params
    const supabase = await createClient()

    const { data: estimate, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('lead_id', leadId)
      .eq('is_superseded', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No estimate found' },
          { status: 404 }
        )
      }
      console.error('Error fetching estimate:', error)
      return NextResponse.json(
        { error: 'Failed to fetch estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json(estimate)
  } catch (error) {
    console.error('Error in GET /api/leads/[leadId]/estimate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
