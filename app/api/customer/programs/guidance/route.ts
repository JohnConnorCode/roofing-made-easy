import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateEligibilityGuidance } from '@/lib/ai'
import { z } from 'zod'

const guidanceSchema = z.object({
  eligiblePrograms: z.array(z.object({
    name: z.string(),
    programType: z.string(),
    maxBenefitAmount: z.number().optional(),
    applicationDeadline: z.string().optional(),
    tips: z.array(z.string()).optional(),
  })),
  userContext: z.object({
    income: z.number().optional(),
    state: z.string().min(2).max(2),
    age: z.number().optional(),
    isVeteran: z.boolean().optional(),
    isDisabled: z.boolean().optional(),
    hasDisasterDeclaration: z.boolean().optional(),
  }),
  estimateAmount: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimitAsync(clientIP, 'ai')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = guidanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await generateEligibilityGuidance(parsed.data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'AI generation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: result.data,
      provider: result.provider,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
