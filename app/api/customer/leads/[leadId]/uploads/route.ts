import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireLeadOwnership } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'

/**
 * Get signed URL for customer to upload photos to their lead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Verify customer owns this lead
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      )
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate unique storage path
    const fileExtension = filename.split('.').pop() || 'jpg'
    const storagePath = `${leadId}/${uuidv4()}.${fileExtension}`

    // Create signed upload URL
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('photos')
      .createSignedUploadUrl(storagePath)

    if (signedUrlError) {
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    // Create upload record
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        lead_id: leadId,
        storage_path: storagePath,
        original_filename: filename,
        content_type: contentType,
        status: 'pending',
        category: 'general',
      } as never)
      .select()
      .single()

    if (uploadError || !upload) {
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
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Mark upload as complete after customer finishes uploading
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    // Verify customer owns this lead
    const { error: authError } = await requireLeadOwnership(leadId)
    if (authError) return authError

    const body = await request.json()
    const { uploadId, fileSize } = body

    if (!uploadId) {
      return NextResponse.json(
        { error: 'uploadId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update upload status to completed
    const { data: upload, error: updateError } = await supabase
      .from('uploads')
      .update({
        status: 'completed',
        file_size: fileSize || null,
      } as never)
      .eq('id', uploadId)
      .eq('lead_id', leadId) // Ensure upload belongs to this lead
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update upload' },
        { status: 500 }
      )
    }

    return NextResponse.json({ upload })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
