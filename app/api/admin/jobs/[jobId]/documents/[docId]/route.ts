/**
 * Job Document Detail API
 * DELETE - Remove a document (storage + DB record)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'

type Params = { params: Promise<{ jobId: string; docId: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user || !hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, docId } = await params
    const supabase = await createClient()

    // Get the document to find storage path
    const { data: doc } = await supabase
      .from('job_documents')
      .select('id, storage_path')
      .eq('id', docId)
      .eq('job_id', jobId)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const storagePath = (doc as { storage_path: string }).storage_path

    // Delete from storage
    if (storagePath) {
      await supabase.storage
        .from('job-documents')
        .remove([storagePath])
    }

    // Delete DB record
    const { error: deleteError } = await supabase
      .from('job_documents')
      .delete()
      .eq('id', docId)
      .eq('job_id', jobId)

    if (deleteError) {
      console.error('Error deleting document:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Document DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
