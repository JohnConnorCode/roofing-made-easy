'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SCOPE_OF_WORK } from '@/lib/data/estimate-content'
import type { JobType } from '@/lib/supabase/types'
import { CheckCircle2, Circle } from 'lucide-react'

interface ScopeOfWorkProps {
  jobType: JobType | null
}

export function ScopeOfWork({ jobType }: ScopeOfWorkProps) {
  const scope = SCOPE_OF_WORK[jobType || 'default']

  return (
    <Card className="border-slate-700/50 bg-[#161a23]">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a25c]/20 text-[#c9a25c] text-sm font-semibold">
            2
          </span>
          Scope of Work
        </CardTitle>
        <p className="text-slate-400 text-sm mt-1">
          {scope.title} - What&apos;s included in your project
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {scope.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 pb-4 border-b border-slate-700/30 last:border-0 last:pb-0"
            >
              <div className="shrink-0 mt-0.5">
                {item.included ? (
                  <CheckCircle2 className="h-5 w-5 text-[#3d7a5a]" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-500" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-slate-100">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.description}</p>
                {!item.included && (
                  <p className="text-xs text-[#c9a25c]">Optional - ask about adding this</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note about inspection */}
        <div className="mt-6 p-4 rounded-lg bg-[#1a1f2e] border border-slate-700/50">
          <p className="text-sm text-slate-400">
            <span className="text-[#c9a25c] font-medium">Note:</span> Final scope may vary based
            on findings during on-site inspection. Any additional work will be discussed and
            approved before proceeding.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
