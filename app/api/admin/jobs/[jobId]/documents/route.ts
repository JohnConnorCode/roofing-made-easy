/**
 * Job Documents API
 * GET - List documents for a job
 * POST - Add a document to a job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'
import { z } from 'zod'

const createDocumentSchema = z.object({
  document_type: z.enum(['contract', 'permit', 'insurance_cert', 'inspection_report', 'photo', 'warranty_cert', 'other']),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  storage_path: z.string().min(1),
  file_size: z.number().optional(),
  mime_type: z.string().max(100).optional(),
  permit_number: z.string().max(100).optional(),
  expiration_date: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const docType = searchParams.get('type')

    let query = supabase
      .from('job_documents')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (docType) {
      query = query.eq('document_type', docType)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching job documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Job documents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPermission(profile, 'jobs', 'edit', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId } = await params
    const body = await request.json()
    const parsed = createDocumentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const data = parsed.data

    const { data: document, error: createError } = await supabase
      .from('job_documents')
      .insert({
        job_id: jobId,
        document_type: data.document_type,
        title: data.title,
        description: data.description || null,
        storage_path: data.storage_path,
        file_size: data.file_size || null,
        mime_type: data.mime_type || null,
        permit_number: data.permit_number || null,
        expiration_date: data.expiration_date || null,
        uploaded_by: user.id,
      } as never)
      .select()
      .single()

    if (createError || !document) {
      console.error('Error creating job document:', createError)
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Job documents POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
