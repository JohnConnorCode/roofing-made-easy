import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
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

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_UPLOADS_PER_LEAD = 20

/** Lead statuses that allow new photo uploads (funnel is still in progress) */
const UPLOAD_ALLOWED_STATUSES = ['new', 'intake_started', 'in_progress', 'contacted', 'intake_complete']

/**
 * Zod schema for validating FormData fields.
 * The file itself is validated separately since Zod doesn't handle File objects.
 */
const uploadMetaSchema = z.object({
  leadId: z.string().uuid('leadId must be a valid UUID'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit uploads (use leadCreation limit: 5/min to prevent abuse)
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'leadCreation')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File | null
    const rawLeadId = formData.get('leadId') as string | null

    // Validate required fields exist
    if (!file || !rawLeadId) {
      return NextResponse.json(
        { error: 'file and leadId are required' },
        { status: 400 }
      )
    }

    // Validate leadId with Zod
    const parsed = uploadMetaSchema.safeParse({ leadId: rawLeadId })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid leadId format', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { leadId } = parsed.data

    // Validate file MIME type against allowlist
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size <= 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 15MB' },
        { status: 400 }
      )
    }

    // Use admin client for all DB operations (anonymous users have no auth session)
    const supabase = await createAdminClient()

    // Verify lead exists and is in an appropriate funnel stage
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, status')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const leadStatus = (lead as { status?: string }).status
    if (leadStatus && !UPLOAD_ALLOWED_STATUSES.includes(leadStatus)) {
      return NextResponse.json(
        { error: 'Uploads are no longer accepted for this lead' },
        { status: 400 }
      )
    }

    // Prevent upload flooding: limit total uploads per lead
    const { count: existingCount, error: countError } = await supabase
      .from('uploads')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', leadId)

    if (countError) {
      logger.error('[Upload] Failed to check upload count', { leadId, error: String(countError) })
      return NextResponse.json(
        { error: 'Failed to validate upload limit' },
        { status: 500 }
      )
    }

    if (existingCount !== null && existingCount >= MAX_UPLOADS_PER_LEAD) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_UPLOADS_PER_LEAD} uploads per lead reached` },
        { status: 400 }
      )
    }

    // Derive safe file extension from the validated MIME type (not from user-provided filename)
    const safeExtension = MIME_TO_EXTENSION[file.type] || 'jpg'
    const storagePath = `${leadId}/${uuidv4()}.${safeExtension}`

    // Upload file to storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      logger.error('[Upload] Storage upload failed', { leadId, error: String(uploadError) })
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Sanitize original filename for the DB record (strip path components)
    const sanitizedFilename = file.name.replace(/[/\\]/g, '_').slice(0, 255)

    // Create upload record
    const { data: upload, error: recordError } = await supabase
      .from('uploads')
      .insert({
        lead_id: leadId,
        storage_path: storagePath,
        original_filename: sanitizedFilename,
        content_type: file.type,
        file_size: file.size,
        status: 'uploaded',
      } as never)
      .select()
      .single()

    if (recordError || !upload) {
      logger.error('[Upload] Failed to create upload record', { leadId, error: String(recordError) })
      return NextResponse.json(
        { error: 'Failed to create upload record' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      uploadId: (upload as { id: string }).id,
      storagePath,
      publicUrl: urlData.publicUrl,
    })
  } catch (error) {
    logger.error('[Upload] Unexpected error in upload/complete', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
