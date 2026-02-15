'use client'

interface DonutChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  size?: number
  strokeWidth?: number
  formatValue?: (value: number) => string
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 24,
  formatValue,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">No data available</p>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">No data available</p>
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const defaultColors = ['#d4a853', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']

  let cumulativeOffset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((item, idx) => {
            const percentage = item.value / total
            const dashLength = circumference * percentage
            const dashOffset = circumference * cumulativeOffset
            const color = item.color || defaultColors[idx % defaultColors.length]
            cumulativeOffset += percentage

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-dashOffset}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-lg font-bold text-slate-900">{centerValue}</span>}
            {centerLabel && <span className="text-[10px] text-slate-500">{centerLabel}</span>}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, idx) => {
          const color = item.color || defaultColors[idx % defaultColors.length]
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <div>
                <span className="text-xs text-slate-700">{item.label}</span>
                <span className="text-xs text-slate-400 ml-1">
                  ({formatValue ? formatValue(item.value) : item.value.toLocaleString()}, {percentage}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
