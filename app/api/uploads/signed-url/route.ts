import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, filename, contentType } = body

    if (!leadId || !filename || !contentType) {
      return NextResponse.json(
        { error: 'leadId, filename, and contentType are required' },
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
      console.error('Error creating signed URL:', signedUrlError)
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
      } as never)
      .select()
      .single()

    if (uploadError || !upload) {
      console.error('Error creating upload record:', uploadError)
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
    console.error('Error in POST /api/uploads/signed-url:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
