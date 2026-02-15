import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateEligibilityGuidance } from '@/lib/ai'
import { z } from 'zod'
import { persistAiContent } from '@/lib/ai/persist-content'
import { requireCustomer } from '@/lib/api/auth'

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

    const { customerId, error: authError } = await requireCustomer()
    if (authError) return authError

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

    // Persist AI response (fire-and-forget)
    if (customerId) {
      persistAiContent({
        customerId,
        contentType: 'program_guidance',
        topic: 'assistance',
        content: result.data as unknown as Record<string, unknown>,
        provider: result.provider,
        inputContext: {
          programCount: parsed.data.eligiblePrograms.length,
          state: parsed.data.userContext.state,
          estimateAmount: parsed.data.estimateAmount,
        },
      })
    }

    return NextResponse.json({
      data: result.data,
      provider: result.provider,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
