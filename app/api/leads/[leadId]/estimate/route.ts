import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { PricingEngine, DEFAULT_PRICING_RULES } from '@/lib/pricing/engine'
import { generateExplanation } from '@/lib/ai'
import { safeCompare } from '@/lib/utils'
import { notifyEstimateGenerated, sendCustomerEstimateEmail } from '@/lib/email'
import { sendEstimateReadySms } from '@/lib/sms'
import { autoCreateCustomerAccount, type AutoCreateCustomerResult } from '@/lib/customer/auto-create'
import { triggerWorkflows } from '@/lib/communication/workflow-engine'
import type { PricingRule, Intake, Property, Contact } from '@/lib/supabase/types'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  createRateLimitHeaders,
} from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

interface LeadWithRelations {
  id: string
  share_token: string
  intakes: Intake[] | Intake | null
  properties: Property[] | Property | null
  contacts: Contact[] | Contact | null
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
    const supabase = await createAdminClient()

    // Fetch lead data
    const { data, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        intakes(*),
        properties(*),
        contacts(*)
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

    // Security: Prevent estimate generation abuse
    // Only allow estimate generation for leads in appropriate status
    const leadStatus = (lead as { status?: string }).status
    const allowedStatuses = ['new', 'in_progress', 'contacted', 'intake_complete']
    if (leadStatus && !allowedStatuses.includes(leadStatus)) {
      return NextResponse.json(
        { error: 'Estimate already generated for this lead' },
        { status: 400 }
      )
    }

    // Idempotency check: prevent duplicate estimates within 30 seconds
    const { data: recentEstimate } = await supabase
      .from('estimates')
      .select('id, created_at')
      .eq('lead_id', leadId)
      .eq('is_superseded', false)
      .gte('created_at', new Date(Date.now() - 30000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentEstimate) {
      return NextResponse.json(
        { ...(recentEstimate as Record<string, unknown>), deduplicated: true },
        { status: 200, headers: createRateLimitHeaders(rateLimitResult) }
      )
    }

    // Fetch pricing rules
    let pricingRules: PricingRule[]
    const { data: rules, error: rulesError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError || !rules || rules.length === 0) {
      pricingRules = DEFAULT_PRICING_RULES as PricingRule[]
    } else {
      pricingRules = rules as PricingRule[]
    }

    // Calculate estimate
    const intake = Array.isArray(lead.intakes) ? lead.intakes[0] : lead.intakes
    const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties
    const contact = Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts

    // Validate required intake fields before running pricing engine
    const requiredFields = ['roof_size_sqft', 'roof_material'] as const
    const missing = requiredFields.filter(f => !intake?.[f])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Incomplete intake data. Missing: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

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
        hasInsuranceClaim: intake?.has_insurance_claim || undefined,
      },
      adjustments: result.adjustments,
    })

    // Determine AI explanation status
    const aiExplanationStatus = aiResult.provider === 'fallback'
      ? 'fallback'
      : aiResult.success
        ? 'success'
        : 'failed'

    // Verify supersede update succeeded before inserting
    const { error: supersedeError } = await supabase
      .from('estimates')
      .update({ is_superseded: true } as never)
      .eq('lead_id', leadId)
      .eq('is_superseded', false)

    if (supersedeError) {
      logger.error('Failed to supersede previous estimates', { error: String(supersedeError) })
      return NextResponse.json(
        { error: 'Failed to prepare estimate. Please try again.' },
        { status: 500 }
      )
    }

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
        ai_explanation_status: aiExplanationStatus,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      } as never)
      .select()
      .single()

    if (estimateError) {
      // Unique violation from idx_one_active_estimate_per_lead — concurrent request won the race
      if (estimateError.code === '23505') {
        const { data: existing } = await supabase
          .from('estimates')
          .select('*')
          .eq('lead_id', leadId)
          .eq('is_superseded', false)
          .single()

        if (existing) {
          return NextResponse.json(
            { ...(existing as Record<string, unknown>), deduplicated: true },
            { status: 200, headers: createRateLimitHeaders(rateLimitResult) }
          )
        }
      }

      logger.error('Failed to save estimate', { error: String(estimateError) })
      return NextResponse.json(
        { error: 'Failed to save estimate' },
        { status: 500 }
      )
    }

    // Prepare customer name
    const customerName = contact?.first_name && contact?.last_name
      ? `${contact.first_name} ${contact.last_name}`
      : contact?.first_name || undefined

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.smartroofpricing.com'
    const estimateRecord = estimate as { id: string; valid_until?: string }

    // Critical operations: await with Promise.allSettled
    const criticalOps: Array<{ name: string; promise: Promise<unknown> }> = []

    // Customer account creation is critical (needed for portal access)
    if (contact?.email) {
      criticalOps.push({
        name: 'customer_account',
        promise: autoCreateCustomerAccount({
          leadId,
          email: contact.email,
          firstName: contact.first_name || undefined,
          lastName: contact.last_name || undefined,
          phone: contact.phone || undefined,
        }),
      })
    }

    // Customer email is critical (primary delivery mechanism)
    if (contact?.email && lead.share_token) {
      criticalOps.push({
        name: 'customer_email',
        promise: sendCustomerEstimateEmail({
          customerEmail: contact.email,
          contactName: customerName,
          address: property?.street_address || undefined,
          city: property?.city || undefined,
          state: property?.state || undefined,
          jobType: intake?.job_type || undefined,
          priceLow: result.priceLow,
          priceLikely: result.priceLikely,
          priceHigh: result.priceHigh,
          shareToken: lead.share_token,
          validUntil: estimateRecord.valid_until,
        }),
      })
    }

    // Await critical ops in parallel
    const criticalResults = await Promise.allSettled(
      criticalOps.map(op => op.promise)
    )

    // Track which critical ops succeeded/failed, retry once on failure
    const notificationResults: Record<string, string> = {}
    const retryOps: Array<{ name: string; promise: Promise<unknown> }> = []
    let accountResult: AutoCreateCustomerResult | null = null

    criticalOps.forEach((op, i) => {
      const opResult = criticalResults[i]
      if (opResult.status === 'fulfilled') {
        notificationResults[op.name] = 'success'
        if (op.name === 'customer_account') {
          accountResult = opResult.value as AutoCreateCustomerResult
        }
      } else {
        logger.error(`[Estimate] ${op.name} failed (will retry)`, { error: String(opResult.reason instanceof Error ? opResult.reason.message : 'Unknown error') })
        retryOps.push(op)
      }
    })

    // Single retry for failed critical ops
    if (retryOps.length > 0) {
      const retryResults = await Promise.allSettled(
        retryOps.map(op => op.promise)
      )
      retryOps.forEach((op, i) => {
        const retryResult = retryResults[i]
        notificationResults[op.name] = retryResult.status === 'fulfilled' ? 'success' : 'failed'
        if (retryResult.status === 'fulfilled' && op.name === 'customer_account') {
          accountResult = retryResult.value as AutoCreateCustomerResult
        }
        if (retryResult.status === 'rejected') {
          logger.error(`[Estimate] ${op.name} retry failed`, { error: String(retryResult.reason instanceof Error ? retryResult.reason.message : 'Unknown error') })
        }
      })
    }

    // Determine lead status: estimate_sent if email confirmed, otherwise estimate_generated
    const emailSent = notificationResults['customer_email'] === 'success'
    const newLeadStatus = emailSent ? 'estimate_sent' : 'estimate_generated'

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: newLeadStatus } as never)
      .eq('id', leadId)

    // Update estimate status to 'sent' if email was successfully delivered
    if (emailSent) {
      await supabase
        .from('estimates')
        .update({ estimate_status: 'sent', sent_at: new Date().toISOString() } as never)
        .eq('id', estimateRecord.id)
    }

    // Non-critical operations: fire-and-forget with error logging
    triggerWorkflows('estimate_generated', {
      leadId,
      data: {
        email: contact?.email,
        phone: contact?.phone,
        estimateTotal: result.priceLikely,
        shareToken: lead.share_token,
      },
    }).catch(err => logger.error('Failed to trigger estimate_generated workflows', { error: String(err) }))

    notifyEstimateGenerated({
      leadId,
      contactName: customerName,
      email: contact?.email || undefined,
      phone: contact?.phone || undefined,
      address: property?.street_address || undefined,
      city: property?.city || undefined,
      state: property?.state || undefined,
      jobType: intake?.job_type || undefined,
      roofMaterial: intake?.roof_material || undefined,
      roofSizeSqft: intake?.roof_size_sqft || undefined,
      priceLow: result.priceLow,
      priceLikely: result.priceLikely,
      priceHigh: result.priceHigh,
    }).catch((err) => {
      logger.error('[Estimate] Admin notification failed', { error: String(err instanceof Error ? err.message : 'Unknown error') })
    })

    if (contact?.phone && contact.consent_sms && lead.share_token) {
      const estimateUrl = `${BASE_URL}/estimate/${lead.share_token}`
      sendEstimateReadySms(
        contact.phone,
        customerName || 'there',
        estimateUrl
      ).catch((err) => {
        logger.error('[Estimate] SMS notification failed', { error: String(err instanceof Error ? err.message : 'Unknown error') })
      })
    }

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

    return NextResponse.json({
      ...estimate as Record<string, unknown>,
      share_token: lead.share_token,
      notification_results: notificationResults,
      account_created: (accountResult as AutoCreateCustomerResult | null)?.success && !(accountResult as AutoCreateCustomerResult | null)?.alreadyExists,
      account_already_existed: (accountResult as AutoCreateCustomerResult | null)?.alreadyExists ?? false,
    }, {
      status: 201,
      headers: createRateLimitHeaders(rateLimitResult),
    })
  } catch (error) {
    logger.error('Estimate generation error', { error: String(error) })
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
    const supabase = await createAdminClient()

    // Authorization: require share_token query param or authenticated user
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (token) {
      // Validate share_token matches the lead
      const { data: lead } = await supabase
        .from('leads')
        .select('id, share_token')
        .eq('id', leadId)
        .single()

      if (!lead || !safeCompare((lead as { share_token: string }).share_token || '', token)) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 403 }
        )
      }
    } else {
      // No token — require authenticated user (admin or customer linked to this lead)
      const { createClient } = await import('@/lib/supabase/server')
      const authSupabase = await createClient()
      const { data: { user } } = await authSupabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required. Provide a token parameter or sign in.' },
          { status: 401 }
        )
      }

      // Check if user is admin or customer linked to this lead
      const isAdmin = user.user_metadata?.role === 'admin'
      if (!isAdmin) {
        const { data: customerRow } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        const customerId = (customerRow as { id: string } | null)?.id
        if (!customerId) {
          return NextResponse.json(
            { error: 'Not authorized to view this estimate' },
            { status: 403 }
          )
        }

        const { data: customerLink } = await supabase
          .from('customer_leads')
          .select('id')
          .eq('lead_id', leadId)
          .eq('customer_id', customerId)
          .maybeSingle()

        if (!customerLink) {
          return NextResponse.json(
            { error: 'Not authorized to view this estimate' },
            { status: 403 }
          )
        }
      }
    }

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
      return NextResponse.json(
        { error: 'Failed to fetch estimate' },
        { status: 500 }
      )
    }

    return NextResponse.json(estimate)
  } catch (error) {
    logger.error('Estimate fetch error', { error: String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
