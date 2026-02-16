'use client'

interface FunnelStep {
  step: number
  name: string
  entered: number
  completed: number
  dropOff: number
}

interface FunnelChartProps {
  data: FunnelStep[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) return null

  const maxEntered = Math.max(...data.map(d => d.entered), 1)

  return (
    <div className="space-y-3">
      {data.map((step, index) => {
        const widthPercent = Math.max((step.entered / maxEntered) * 100, 8)
        const nextStep = data[index + 1]

        return (
          <div key={step.step}>
            {/* Step bar */}
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm font-medium text-slate-700 text-right shrink-0">
                {step.name}
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-between px-3 transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="text-white text-sm font-semibold whitespace-nowrap">
                    {step.entered.toLocaleString()}
                  </span>
                  {step.completed !== step.entered && (
                    <span className="text-white/80 text-xs whitespace-nowrap">
                      {step.completed.toLocaleString()} completed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Drop-off indicator between steps */}
            {nextStep && step.completed > 0 && (
              <div className="flex items-center gap-3 my-1">
                <div className="w-20" />
                <div className="flex-1 flex items-center gap-2 pl-2">
                  <div className="h-4 w-px bg-slate-300" />
                  <span className="text-xs text-red-500 font-medium">
                    {step.dropOff > 0 ? `${step.dropOff}% drop-off` : 'No drop-off'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({(step.entered - step.completed).toLocaleString()} lost)
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
