import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendContactFormEmails } from '@/lib/email'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(50).optional(),
  subject: z.string().max(500).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for contact form
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400, headers: createRateLimitHeaders(rateLimitResult) }
      )
    }

    const { name, email, phone, subject, message } = validation.data

    // Create Supabase client
    const supabase = await createClient()

    // Get client info for tracking
    const userAgent = request.headers.get('user-agent') || undefined

    // Save submission to database
    // Note: contact_submissions table may not be in generated types yet
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        source: 'contact_page',
        ip_address: clientIP,
        user_agent: userAgent,
      } as never)
      .select('id, created_at')
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500, headers: createRateLimitHeaders(rateLimitResult) }
      )
    }

    // Send emails (non-blocking)
    const submissionData = submission as { id: string; created_at: string }
    sendContactFormEmails({
      name,
      email,
      phone,
      subject,
      message,
      submittedAt: submissionData.created_at,
      submissionId: submissionData.id,
    }).catch((err) => {
      const [localPart, domain] = email.split('@')
      const maskedEmail = localPart ? `${localPart[0]}***@${domain}` : '***'
      logger.error('[Contact Form] Failed to send contact form emails', {
        submissionId: submissionData.id,
        email: maskedEmail,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent. We\'ll get back to you within 24 hours.',
        id: submissionData.id,
      },
      { status: 201, headers: createRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    logger.error('[Contact Form] Error', { error: String(error instanceof Error ? error.message : 'Unknown error') })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
