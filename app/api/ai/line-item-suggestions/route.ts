import { NextResponse } from 'next/server'
import {
  suggestLineItems,
  checkForMissingItems,
  type LineItemSuggestionInput,
} from '@/lib/ai'
import type { RoofVariables, EstimateLineItem, MacroRoofType, MacroJobType } from '@/lib/supabase/types'
import { getEmptyVariables } from '@/lib/estimation/variables'
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
} from '@/lib/rate-limit'
import { requireAuth } from '@/lib/api/auth'

export async function POST(request: Request) {
  try {
    // Require authentication for AI endpoints (cost protection)
    const { error: authError } = await requireAuth()
    if (authError) return authError

    // Rate limiting for AI
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'ai')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()

    // Validate variables
    if (!body.variables) {
      return NextResponse.json(
        { error: 'variables is required' },
        { status: 400 }
      )
    }

    const input: LineItemSuggestionInput = {
      variables: {
        ...getEmptyVariables(),
        ...body.variables,
      } as RoofVariables,
      currentLineItems: body.currentLineItems as EstimateLineItem[] | undefined,
      roofType: body.roofType as MacroRoofType | undefined,
      jobType: body.jobType as MacroJobType | undefined,
      detectedIssues: body.detectedIssues,
      photoMeasurements: body.photoMeasurements,
      customerNotes: body.customerNotes,
      estimateTotal: body.estimateTotal,
      region: body.region,
    }

    const result = await suggestLineItems(input)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate suggestions' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      suggestions: result.data,
      provider: result.provider,
      latencyMs: result.latencyMs,
    })
  } catch (error) {
    console.error('Line item suggestion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Quick check endpoint for missing items only (no AI call, just local logic)
export async function GET(request: Request) {
  try {
    // Rate limiting (lighter limit since no AI call)
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { searchParams } = new URL(request.url)

    // Parse variables from query params
    const variables: RoofVariables = {
      ...getEmptyVariables(),
      SQ: parseFloat(searchParams.get('sq') || '0'),
      SF: parseFloat(searchParams.get('sf') || '0'),
      P: parseFloat(searchParams.get('p') || '0'),
      EAVE: parseFloat(searchParams.get('eave') || '0'),
      R: parseFloat(searchParams.get('ridge') || '0'),
      VAL: parseFloat(searchParams.get('valley') || '0'),
      HIP: parseFloat(searchParams.get('hip') || '0'),
      RAKE: parseFloat(searchParams.get('rake') || '0'),
      SKYLIGHT_COUNT: parseInt(searchParams.get('skylights') || '0'),
      CHIMNEY_COUNT: parseInt(searchParams.get('chimneys') || '0'),
      PIPE_COUNT: parseInt(searchParams.get('pipes') || '0'),
      VENT_COUNT: parseInt(searchParams.get('vents') || '0'),
      GUTTER_LF: parseFloat(searchParams.get('gutter') || '0'),
      DS_COUNT: parseInt(searchParams.get('downspouts') || '0'),
    }

    // Parse current line items from JSON param
    let currentLineItems: EstimateLineItem[] = []
    const lineItemsJson = searchParams.get('lineItems')
    if (lineItemsJson) {
      try {
        currentLineItems = JSON.parse(lineItemsJson)
      } catch {
        // Ignore parse errors
      }
    }

    const missing = checkForMissingItems(variables, currentLineItems)

    return NextResponse.json({
      success: true,
      missingItems: missing,
    })
  } catch (error) {
    console.error('Missing items check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
