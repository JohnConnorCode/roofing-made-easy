import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { generateInsuranceLetter } from '@/lib/ai'
import { z } from 'zod'

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

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json({
      data: result.data,
      provider: result.provider,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
