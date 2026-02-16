'use client'

import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/stores/customerStore'
import type { CustomerJob } from '@/stores/customerStore'
import { JobProgress, EmptyState } from '@/components/customer'
import { Skeleton } from '@/components/ui/skeleton'
import { Hammer } from 'lucide-react'
import { useAnalytics } from '@/lib/analytics'

export default function ProjectPage() {
  const { selectedLeadId, jobs, setJobs } = useCustomerStore()
  const { trackEngagement } = useAnalytics()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const url = selectedLeadId
          ? `/api/customer/jobs?leadId=${selectedLeadId}`
          : '/api/customer/jobs'

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
          trackEngagement('portal_project_viewed')
        }
      } catch {
        // Failed to fetch jobs
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [selectedLeadId, setJobs, trackEngagement])

  // Filter jobs for selected lead
  const leadJobs = selectedLeadId
    ? jobs.filter((j: CustomerJob) => j.lead_id === selectedLeadId)
    : jobs

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Project</h1>
        <p className="text-slate-400">Track your roofing project progress in real time.</p>
      </div>

      {leadJobs.length === 0 ? (
        <EmptyState
          icon={Hammer}
          title="No Active Project"
          description="Your project hasn't started yet. Once your contract is signed, you'll see real-time progress updates here."
          variant="encouraging"
        />
      ) : (
        <div className="space-y-6">
          {leadJobs.map((job: CustomerJob) => (
            <JobProgress key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
