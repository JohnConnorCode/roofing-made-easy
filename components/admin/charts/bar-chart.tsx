'use client'

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  height?: number
  formatValue?: (value: number) => string
  horizontal?: boolean
}

export function BarChart({ data, height = 200, formatValue, horizontal = false }: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">No data available</p>
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const defaultColors = ['#d4a853', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#ec4899']

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => {
          const width = (item.value / maxValue) * 100
          const color = item.color || defaultColors[idx % defaultColors.length]
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 truncate">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 ml-2">
                  {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ height }} className="flex items-end gap-2">
      {data.map((item, idx) => {
        const barHeight = (item.value / maxValue) * (height - 30)
        const color = item.color || defaultColors[idx % defaultColors.length]
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: Math.max(barHeight, 2), backgroundColor: color }}
              title={`${item.label}: ${formatValue ? formatValue(item.value) : item.value}`}
            />
            <span className="text-[10px] text-slate-500 truncate w-full text-center">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
