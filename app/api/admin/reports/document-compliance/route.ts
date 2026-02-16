/**
 * Document Compliance Report API
 * GET - Missing documents, compliance rates, expiring documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile, hasPermission } from '@/lib/team/permissions'

// Compliance rules by job status progression
const REQUIRED_DOCS: Record<string, string[]> = {
  base: ['contract'],
  in_progress: ['contract', 'permit', 'insurance_cert'],
  completed: ['contract', 'permit', 'insurance_cert', 'inspection_report', 'warranty_cert', 'photo'],
}

function getRequiredDocs(status: string): string[] {
  const completedStatuses = ['completed', 'warranty_active', 'closed']
  const inProgressStatuses = ['in_progress', 'scheduled', 'inspection_pending', 'punch_list']

  if (completedStatuses.includes(status)) return REQUIRED_DOCS.completed
  if (inProgressStatuses.includes(status)) return REQUIRED_DOCS.in_progress
  return REQUIRED_DOCS.base
}

export async function GET(_request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getUserWithProfile()
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(profile, 'reports', 'view', user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    // Fetch active jobs (not closed)
    const { data: jobData } = await supabase
      .from('jobs')
      .select('id, job_number, status, property_address')
      .neq('status', 'closed')
      .limit(500)

    const jobs = (jobData || []) as Array<{
      id: string; job_number: string; status: string
      property_address: string | null
    }>

    const jobIds = jobs.map(j => j.id)

    // Fetch documents for these jobs
    const { data: docData } = jobIds.length > 0
      ? await supabase
          .from('job_documents')
          .select('id, job_id, document_type, expiration_date')
          .in('job_id', jobIds)
      : { data: [] }

    const docs = (docData || []) as Array<{
      id: string; job_id: string; document_type: string; expiration_date: string | null
    }>

    // Build document map by job
    const docsByJob = new Map<string, Set<string>>()
    const allDocsByJob = new Map<string, Array<{ docType: string; expirationDate: string | null }>>()
    for (const d of docs) {
      if (!docsByJob.has(d.job_id)) {
        docsByJob.set(d.job_id, new Set())
        allDocsByJob.set(d.job_id, [])
      }
      docsByJob.get(d.job_id)!.add(d.document_type)
      allDocsByJob.get(d.job_id)!.push({ docType: d.document_type, expirationDate: d.expiration_date })
    }

    // Compliance analysis
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    let fullyCompliantJobs = 0
    let jobsMissingContract = 0
    let jobsMissingPermit = 0
    let jobsMissingInsuranceCert = 0
    let expiredDocumentCount = 0

    const nonCompliantJobs: Array<{
      jobId: string; jobNumber: string; address: string; status: string
      missingDocs: string[]; expiredDocs: string[]
    }> = []

    const expiringDocuments: Array<{
      jobNumber: string; docType: string; expirationDate: string; daysLeft: number
    }> = []

    // Document coverage tracking
    const allDocTypes = ['contract', 'permit', 'insurance_cert', 'inspection_report', 'warranty_cert', 'photo']
    const coverageMap: Record<string, { jobsWithDoc: number; applicableJobs: number }> = {}
    for (const dt of allDocTypes) {
      coverageMap[dt] = { jobsWithDoc: 0, applicableJobs: 0 }
    }

    for (const job of jobs) {
      const required = getRequiredDocs(job.status)
      const hasDocs = docsByJob.get(job.id) || new Set()
      const jobDocs = allDocsByJob.get(job.id) || []

      // Track coverage
      for (const dt of required) {
        if (coverageMap[dt]) {
          coverageMap[dt].applicableJobs++
          if (hasDocs.has(dt)) coverageMap[dt].jobsWithDoc++
        }
      }

      // Find missing docs
      const missingDocs = required.filter(d => !hasDocs.has(d))

      // Find expired docs
      const expiredDocs: string[] = []
      for (const d of jobDocs) {
        if (d.expirationDate && new Date(d.expirationDate) < now) {
          expiredDocs.push(d.docType)
          expiredDocumentCount++
        }
      }

      // Track specific missing docs
      if (missingDocs.includes('contract')) jobsMissingContract++
      if (missingDocs.includes('permit')) jobsMissingPermit++
      if (missingDocs.includes('insurance_cert')) jobsMissingInsuranceCert++

      if (missingDocs.length === 0 && expiredDocs.length === 0) {
        fullyCompliantJobs++
      } else {
        nonCompliantJobs.push({
          jobId: job.id,
          jobNumber: job.job_number,
          address: job.property_address || 'N/A',
          status: job.status,
          missingDocs,
          expiredDocs,
        })
      }

      // Check for expiring documents
      for (const d of jobDocs) {
        if (d.expirationDate) {
          const expDate = new Date(d.expirationDate)
          if (expDate > now && expDate <= thirtyDaysFromNow) {
            const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            expiringDocuments.push({
              jobNumber: job.job_number,
              docType: d.docType,
              expirationDate: d.expirationDate,
              daysLeft,
            })
          }
        }
      }
    }

    const complianceRate = jobs.length > 0
      ? Math.round((fullyCompliantJobs / jobs.length) * 100)
      : 100

    const documentCoverage = allDocTypes.map(dt => ({
      docType: dt,
      jobsWithDoc: coverageMap[dt].jobsWithDoc,
      applicableJobs: coverageMap[dt].applicableJobs,
      coverageRate: coverageMap[dt].applicableJobs > 0
        ? Math.round((coverageMap[dt].jobsWithDoc / coverageMap[dt].applicableJobs) * 100)
        : 100,
    }))

    return NextResponse.json({
      summary: {
        totalActiveJobs: jobs.length,
        fullyCompliantJobs,
        complianceRate,
        jobsMissingContract,
        jobsMissingPermit,
        jobsMissingInsuranceCert,
        expiredDocumentCount,
      },
      nonCompliantJobs: nonCompliantJobs.sort((a, b) => b.missingDocs.length - a.missingDocs.length),
      documentCoverage,
      expiringDocuments: expiringDocuments.sort((a, b) => a.daysLeft - b.daysLeft),
    })
  } catch (error) {
    console.error('Document compliance report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
