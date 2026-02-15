import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateFinancingGuidance } from '@/lib/ai'
import { z } from 'zod'
import { persistAiContent } from '@/lib/ai/persist-content'
import { requireCustomer } from '@/lib/api/auth'

const guidanceSchema = z.object({
  estimateAmount: z.number().positive(),
  creditRange: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor']),
  incomeRange: z.string().optional(),
  insurancePayoutAmount: z.number().optional(),
  state: z.string().min(2).max(2),
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

    const result = await generateFinancingGuidance(parsed.data)

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
        contentType: 'financing_guidance',
        topic: 'financing',
        content: result.data as unknown as Record<string, unknown>,
        provider: result.provider,
        inputContext: { estimateAmount: parsed.data.estimateAmount, creditRange: parsed.data.creditRange },
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
