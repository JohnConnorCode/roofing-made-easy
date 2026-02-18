import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Skeleton component for loading states
 * Shows a pulsing placeholder while content is loading
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200',
        className
      )}
    />
  )
}

/**
 * Skeleton for a table row
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <Skeleton className="h-4 w-full max-w-[200px]" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton for a card
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-6', className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

/**
 * Skeleton for stats cards
 */
export function SkeletonStatCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the dashboard page
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Recent leads card */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b p-6">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Name', 'Location', 'Status', 'Date'].map((_, i) => (
                  <th key={i} className="pb-3 pr-4 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={4} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the leads list page
 */
export function SkeletonLeadsTable() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b p-6">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {['Name', 'Contact', 'Location', 'Status', 'Score', 'Date'].map((_, i) => (
                <th key={i} className="pb-3 pr-4 text-left">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonTableRow key={i} columns={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Skeleton for KPI stat cards (icon + label + value)
 */
export function SkeletonKPICard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

/**
 * Skeleton for report card body (4 rows of label + value)
 */
export function SkeletonReportContent() {
  return (
    <div className="py-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for a full page with header and content cards
 */
export function SkeletonPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for lead detail page
 */
export function SkeletonLeadDetail() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
