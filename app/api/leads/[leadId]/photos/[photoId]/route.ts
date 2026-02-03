import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const VALID_CATEGORIES = ['general', 'damage', 'before', 'after', 'closeup', 'wide_angle', 'inspection'] as const

const updatePhotoSchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; photoId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'general')
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const { leadId, photoId } = await params
    const body = await request.json()
    const parsed = updatePhotoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = {}
    if (parsed.data.category !== undefined) updates.category = parsed.data.category
    if (parsed.data.description !== undefined) updates.description = parsed.data.description
    if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the photo
    const { data, error } = await supabase
      .from('uploads')
      .update(updates as never)
      .eq('id', photoId)
      .eq('lead_id', leadId) // Ensure photo belongs to this lead
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ photo: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string; photoId: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const { leadId, photoId } = await params
    const supabase = await createClient()

    // Get the photo to find the storage path
    const { data: photo, error: fetchError } = await supabase
      .from('uploads')
      .select('storage_path')
      .eq('id', photoId)
      .eq('lead_id', leadId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([(photo as { storage_path: string }).storage_path])

    if (storageError) {
      // Continue anyway - the DB record should still be deleted
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', photoId)
      .eq('lead_id', leadId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
