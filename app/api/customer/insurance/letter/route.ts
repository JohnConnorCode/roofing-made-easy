import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateInsuranceLetter } from '@/lib/ai'
import { z } from 'zod'
import { persistAiContent } from '@/lib/ai/persist-content'
import { requireCustomer } from '@/lib/api/auth'

const letterSchema = z.object({
  letterType: z.enum(['initial_claim', 'appeal', 'follow_up']),
  claimData: z.object({
    insuranceCompany: z.string().optional(),
    claimNumber: z.string().optional(),
    policyNumber: z.string().optional(),
    dateOfLoss: z.string().optional(),
    causeOfLoss: z.string().optional(),
    customerNotes: z.string().optional(),
  }),
  propertyAddress: z.string().min(1),
  customerName: z.string().min(1),
  estimateAmount: z.number().optional(),
  claimAmountApproved: z.number().optional(),
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
    const parsed = letterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await generateInsuranceLetter(parsed.data)

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
        contentType: 'insurance_letter',
        topic: 'insurance',
        content: { letterType: parsed.data.letterType, letter: result.data },
        provider: result.provider,
        inputContext: { letterType: parsed.data.letterType, insuranceCompany: parsed.data.claimData.insuranceCompany },
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
