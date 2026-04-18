import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireLeadOwnership } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

/** Allowed MIME types for photo uploads */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

/** Map of MIME types to safe file extensions (prevents extension spoofing) */
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

/** Zod schema for the signed-url request body */
const signedUrlSchema = z.object({
  leadId: z.string().uuid('leadId must be a valid UUID'),
  filename: z.string().min(1, 'Filename is required').max(255),
  contentType: z.enum(
    ALLOWED_MIME_TYPES as unknown as [string, ...string[]],
    { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' }
  ),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit signed URL generation
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'leadCreation')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse and validate request body with Zod
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const parsed = signedUrlSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { leadId, filename, contentType } = parsed.data

    // Verify user owns this lead or is admin
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    const supabase = await createClient()

    // Derive safe file extension from validated MIME type (not from user-provided filename)
    const safeExtension = MIME_TO_EXTENSION[contentType] || 'jpg'
    const storagePath = `${leadId}/${uuidv4()}.${safeExtension}`

    // Create signed upload URL
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('photos')
      .createSignedUploadUrl(storagePath)

    if (signedUrlError) {
      logger.error('[Upload] Failed to create signed URL', { leadId, error: String(signedUrlError) })
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    // Sanitize original filename for the DB record (strip path components)
    const sanitizedFilename = filename.replace(/[/\\]/g, '_').slice(0, 255)

    // Create upload record
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        lead_id: leadId,
        storage_path: storagePath,
        original_filename: sanitizedFilename,
        content_type: contentType,
        status: 'pending',
      } as never)
      .select()
      .single()

    if (uploadError || !upload) {
      logger.error('[Upload] Failed to create upload record', { leadId, error: String(uploadError) })
      return NextResponse.json(
        { error: 'Failed to create upload record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      uploadId: (upload as { id: string }).id,
      signedUrl: signedUrl.signedUrl,
      token: signedUrl.token,
      storagePath,
    })
  } catch (error) {
    logger.error('[Upload] Unexpected error in signed-url', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
