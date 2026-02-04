/**
 * Cron Job: Cleanup Abandoned Uploads
 *
 * Removes upload records that were started but never completed.
 * Should be called daily via Vercel Cron or external scheduler.
 *
 * Security: Uses CRON_SECRET to authenticate requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CRON_SECRET = process.env.CRON_SECRET

// How old (in hours) an upload must be to be considered abandoned
const ABANDONED_THRESHOLD_HOURS = 24

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET is configured
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 503 }
    )
  }

  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - ABANDONED_THRESHOLD_HOURS)

  const results = {
    deletedUploads: 0,
    deletedFiles: 0,
    errors: [] as string[],
  }

  try {
    // Find abandoned uploads (created before cutoff, no completed_at)
    const { data: abandonedUploads, error: fetchError } = await supabase
      .from('uploads')
      .select('id, storage_path')
      .lt('created_at', cutoffTime.toISOString())
      .is('completed_at', null)
      .limit(100)

    if (fetchError) {
      console.error('[Cleanup] Failed to fetch abandoned uploads:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch uploads' },
        { status: 500 }
      )
    }

    if (!abandonedUploads || abandonedUploads.length === 0) {
      return NextResponse.json({
        message: 'No abandoned uploads to clean up',
        ...results,
      })
    }

    // Delete files from storage
    const storagePaths = abandonedUploads
      .map(u => (u as { storage_path: string | null }).storage_path)
      .filter((path): path is string => path !== null)

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove(storagePaths)

      if (storageError) {
        results.errors.push(`Storage deletion error: ${storageError.message}`)
      } else {
        results.deletedFiles = storagePaths.length
      }
    }

    // Delete upload records
    const uploadIds = abandonedUploads.map(u => (u as { id: string }).id)
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .in('id', uploadIds)

    if (deleteError) {
      results.errors.push(`Database deletion error: ${deleteError.message}`)
    } else {
      results.deletedUploads = uploadIds.length
    }

    return NextResponse.json({
      message: `Cleaned up ${results.deletedUploads} abandoned uploads`,
      ...results,
    })
  } catch (error) {
    console.error('[Cleanup] Cron job error:', error)
    return NextResponse.json(
      { error: 'Cleanup job failed' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
