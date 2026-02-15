/**
 * Signed URL API for Job Document Uploads
 * POST - Generate a signed upload URL for the job-documents bucket
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'

const signedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = signedUrlSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const ext = parsed.data.filename.split('.').pop() || 'bin'
    const storagePath = `${jobId}/${crypto.randomUUID()}.${ext}`

    const { data, error } = await supabase.storage
      .from('job-documents')
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      storagePath,
    })
  } catch (error) {
    console.error('Signed URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
