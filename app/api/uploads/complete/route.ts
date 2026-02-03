import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const leadId = formData.get('leadId') as string | null

    if (!file || !leadId) {
      return NextResponse.json(
        { error: 'file and leadId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' },
        { status: 400 }
      )
    }

    // Validate file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 15MB' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate unique storage path
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const storagePath = `${leadId}/${uuidv4()}.${fileExtension}`

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
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create upload record
    const { data: upload, error: recordError } = await supabase
      .from('uploads')
      .insert({
        lead_id: leadId,
        storage_path: storagePath,
        original_filename: file.name,
        content_type: file.type,
        file_size: file.size,
        status: 'uploaded',
      } as never)
      .select()
      .single()

    if (recordError || !upload) {
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
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
