'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { LeadCard, type LeadCardData, type CardFieldKey } from './LeadCard'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronUp, Loader2, X, Settings2, CheckSquare, Square, MoveRight, Trash2, Tag } from 'lucide-react'
import { LEAD_STATUSES } from '@/lib/constants/status'
import { PipelineConfigModal } from './PipelineConfigModal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Primary statuses for main pipeline view (fallback if API fails)
const PRIMARY_STATUS_IDS = ['new', 'estimate_generated', 'consultation_scheduled', 'quote_sent', 'won']
const SECONDARY_STATUS_IDS = ['intake_started', 'intake_complete', 'lost', 'archived']

export const PIPELINE_COLUMNS = LEAD_STATUSES.filter(s => PRIMARY_STATUS_IDS.includes(s.value))
export const SECONDARY_COLUMNS = LEAD_STATUSES.filter(s => SECONDARY_STATUS_IDS.includes(s.value))

interface PipelineStage {
  id: string
  name: string
  slug: string
  color: string
  position: number
  is_system: boolean
  is_visible: boolean
}

// Convert dynamic stage to display config
function stageToColumnConfig(stage: PipelineStage) {
  // Map color to Tailwind classes
  const colorMap: Record<string, { dot: string; border: string; bg: string }> = {
    '#D4A853': { dot: 'bg-gold', border: 'border-gold', bg: 'bg-gold-light/10' },
    '#22C55E': { dot: 'bg-green-500', border: 'border-green-500', bg: 'bg-green-50' },
    '#3B82F6': { dot: 'bg-blue-500', border: 'border-blue-500', bg: 'bg-blue-50' },
    '#A855F7': { dot: 'bg-purple-500', border: 'border-purple-500', bg: 'bg-purple-50' },
    '#EF4444': { dot: 'bg-red-400', border: 'border-red-400', bg: 'bg-red-50' },
    '#10B981': { dot: 'bg-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-50' },
    '#94A3B8': { dot: 'bg-slate-400', border: 'border-slate-400', bg: 'bg-slate-50' },
    '#64748B': { dot: 'bg-slate-500', border: 'border-slate-500', bg: 'bg-slate-50' },
    '#CBD5E1': { dot: 'bg-slate-300', border: 'border-slate-300', bg: 'bg-slate-50' },
    '#F97316': { dot: 'bg-orange-500', border: 'border-orange-500', bg: 'bg-orange-50' },
    '#EC4899': { dot: 'bg-pink-500', border: 'border-pink-500', bg: 'bg-pink-50' },
    '#6B7280': { dot: 'bg-gray-500', border: 'border-gray-500', bg: 'bg-gray-50' },
  }

  const colors = colorMap[stage.color] || { dot: 'bg-gray-500', border: 'border-gray-500', bg: 'bg-gray-50' }

  return {
    value: stage.slug,
    label: stage.name,
    badge: `${colors.bg} text-slate-700`,
    ...colors,
  }
}

interface PipelineBoardProps {
  leads: LeadCardData[]
  onLeadClick: (lead: LeadCardData) => void
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>
  onBulkStatusChange?: (leadIds: string[], newStatus: string) => Promise<void>
  onBulkDelete?: (leadIds: string[]) => Promise<void>
  isUpdating?: string | null
  stages?: PipelineStage[]
  cardFields?: CardFieldKey[]
  onStagesChange?: (stages: PipelineStage[]) => void
  onCardFieldsChange?: (fields: CardFieldKey[]) => void
}

interface MoveMenuState {
  isOpen: boolean
  lead: LeadCardData | null
  position: { x: number; y: number }
}

const DEFAULT_CARD_FIELDS: CardFieldKey[] = ['name', 'estimate', 'location', 'job_type', 'urgency']

export function PipelineBoard({
  leads,
  onLeadClick,
  onStatusChange,
  onBulkStatusChange,
  onBulkDelete,
  isUpdating,
  stages: externalStages,
  cardFields = DEFAULT_CARD_FIELDS,
  onStagesChange,
  onCardFieldsChange,
}: PipelineBoardProps) {
  const [showSecondary, setShowSecondary] = useState(false)
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [moveMenu, setMoveMenu] = useState<MoveMenuState>({ isOpen: false, lead: null, position: { x: 0, y: 0 } })
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [localCardFields, setLocalCardFields] = useState<CardFieldKey[]>(cardFields)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // Bulk selection state
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [showBulkMoveMenu, setShowBulkMoveMenu] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  // Load stages from API on mount
  useEffect(() => {
    if (externalStages && externalStages.length > 0) {
      setStages(externalStages)
      return
    }

    const loadStages = async () => {
      try {
        const response = await fetch('/api/admin/pipeline-stages')
        if (response.ok) {
          const data = await response.json()
          setStages(data)
        }
      } catch {
        // Fall back to default stages
      }
    }
    loadStages()
  }, [externalStages])

  // Convert stages to column configs
  const visibleStages = stages.filter(s => s.is_visible)
  const dynamicColumns = visibleStages.map(stageToColumnConfig)

  // Use dynamic columns if available, otherwise fall back to hardcoded
  const fallbackColumns = showSecondary
    ? [...PIPELINE_COLUMNS.slice(0, 2), ...SECONDARY_COLUMNS.slice(0, 2), ...PIPELINE_COLUMNS.slice(2), ...SECONDARY_COLUMNS.slice(2)]
    : PIPELINE_COLUMNS

  const columns = dynamicColumns.length > 0 ? dynamicColumns : fallbackColumns

  // Group leads by status
  const leadsByStatus = leads.reduce((acc, lead) => {
    const status = lead.status
    if (!acc[status]) acc[status] = []
    acc[status].push(lead)
    return acc
  }, {} as Record<string, LeadCardData[]>)

  // Calculate totals for each column
  const getColumnStats = useCallback((status: string) => {
    const columnLeads = leadsByStatus[status] || []
    const count = columnLeads.length
    const value = columnLeads.reduce((sum, lead) => {
      const estimate = lead.estimates?.[0]?.price_likely || 0
      return sum + estimate
    }, 0)
    return { count, value }
  }, [leadsByStatus])

  // Drag handlers (desktop)
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', leadId)
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    setDraggedLead(null)
    setDragOverColumn(null)

    if (leadId) {
      const lead = leads.find(l => l.id === leadId)
      if (lead && lead.status !== columnId) {
        await onStatusChange(leadId, columnId)
      }
    }
  }

  // Touch handlers (mobile/tablet)
  const handleTouchStart = (e: React.TouchEvent, lead: LeadCardData) => {
    const touch = e.touches[0]
    longPressTimer.current = setTimeout(() => {
      // Open move menu on long press
      setMoveMenu({
        isOpen: true,
        lead,
        position: { x: touch.clientX, y: touch.clientY }
      })
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchMove = () => {
    // Cancel long press on movement
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Context menu handler (right-click on desktop)
  const handleContextMenu = (e: React.MouseEvent, lead: LeadCardData) => {
    e.preventDefault()
    setMoveMenu({
      isOpen: true,
      lead,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const handleMoveToStatus = async (status: string) => {
    if (moveMenu.lead && moveMenu.lead.status !== status) {
      await onStatusChange(moveMenu.lead.id, status)
    }
    setMoveMenu({ isOpen: false, lead: null, position: { x: 0, y: 0 } })
  }

  const closeMoveMenu = () => {
    setMoveMenu({ isOpen: false, lead: null, position: { x: 0, y: 0 } })
  }

  // Bulk selection handlers
  const toggleBulkMode = () => {
    if (isBulkMode) {
      setSelectedLeads(new Set())
    }
    setIsBulkMode(!isBulkMode)
  }

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const selectAllInColumn = (status: string) => {
    const columnLeadIds = (leadsByStatus[status] || []).map(l => l.id)
    setSelectedLeads(prev => {
      const newSet = new Set(prev)
      const allSelected = columnLeadIds.every(id => prev.has(id))
      if (allSelected) {
        columnLeadIds.forEach(id => newSet.delete(id))
      } else {
        columnLeadIds.forEach(id => newSet.add(id))
      }
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)))
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!onBulkStatusChange || selectedLeads.size === 0) return
    setIsBulkUpdating(true)
    try {
      await onBulkStatusChange(Array.from(selectedLeads), newStatus)
      setSelectedLeads(new Set())
      setShowBulkMoveMenu(false)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedLeads.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)? This action cannot be undone.`)) {
      return
    }
    setIsBulkUpdating(true)
    try {
      await onBulkDelete(Array.from(selectedLeads))
      setSelectedLeads(new Set())
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Calculate selected leads value
  const selectedValue = useMemo(() => {
    return leads
      .filter(l => selectedLeads.has(l.id))
      .reduce((sum, lead) => sum + (lead.estimates?.[0]?.price_likely || 0), 0)
  }, [leads, selectedLeads])

  const handleSaveStages = async (newStages: PipelineStage[]): Promise<boolean> => {
    const errors: string[] = []

    try {
      // Collect all API calls to run in parallel
      const apiCalls: Promise<{ success: boolean; error?: string }>[] = []

      // Update positions via bulk API
      apiCalls.push(
        fetch('/api/admin/pipeline-stages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stages: newStages.map((s, i) => ({ id: s.id, position: i }))
          })
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { success: false, error: data.error || 'Failed to update positions' }
          }
          return { success: true }
        }).catch(() => ({ success: false, error: 'Network error updating positions' }))
      )

      // Update visibility for each changed stage - use externalStages as the reference
      // to avoid stale state issues
      const originalStages = externalStages || stages
      for (const stage of newStages) {
        const original = originalStages.find(s => s.id === stage.id)
        if (original && original.is_visible !== stage.is_visible) {
          apiCalls.push(
            fetch(`/api/admin/pipeline-stages/${stage.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_visible: stage.is_visible })
            }).then(async (res) => {
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                return { success: false, error: data.error || `Failed to update visibility for ${stage.name}` }
              }
              return { success: true }
            }).catch(() => ({ success: false, error: `Network error updating ${stage.name}` }))
          )
        }
      }

      // Handle new stages (temp IDs)
      for (const stage of newStages) {
        if (stage.id.startsWith('temp-')) {
          apiCalls.push(
            fetch('/api/admin/pipeline-stages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: stage.name,
                slug: stage.slug,
                color: stage.color,
                position: stage.position
              })
            }).then(async (res) => {
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                return { success: false, error: data.error || `Failed to create ${stage.name}` }
              }
              return { success: true }
            }).catch(() => ({ success: false, error: `Network error creating ${stage.name}` }))
          )
        }
      }

      // Execute all API calls in parallel using Promise.allSettled
      const results = await Promise.allSettled(apiCalls)

      // Collect errors from failed or rejected calls
      for (const result of results) {
        if (result.status === 'rejected') {
          errors.push('An unexpected error occurred')
        } else if (!result.value.success && result.value.error) {
          errors.push(result.value.error)
        }
      }

      // If there were errors, return failure
      if (errors.length > 0) {
        return false
      }

      // Refresh stages on success
      const response = await fetch('/api/admin/pipeline-stages')
      if (response.ok) {
        const data = await response.json()
        setStages(data)
        onStagesChange?.(data)
      }

      return true
    } catch {
      return false
    }
  }

  const handleSaveCardFields = async (fields: string[]) => {
    setLocalCardFields(fields as CardFieldKey[])
    onCardFieldsChange?.(fields as CardFieldKey[])

    // Save to preferences API
    try {
      await fetch('/api/admin/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_card_fields: fields })
      })
    } catch {
      // Handle error silently
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {isBulkMode && selectedLeads.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-gold-light/20 rounded-lg border border-gold-light">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-900">
              {selectedLeads.size} selected
              {selectedValue > 0 && (
                <span className="text-slate-500 ml-2">
                  ({formatCurrency(selectedValue)} total value)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkMoveMenu(!showBulkMoveMenu)}
                disabled={isBulkUpdating}
                leftIcon={<MoveRight className="h-4 w-4" />}
              >
                Move to...
              </Button>
              {showBulkMoveMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBulkMoveMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-xl border py-2 min-w-[180px]">
                    {LEAD_STATUSES.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleBulkStatusChange(status.value)}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 text-slate-700"
                      >
                        <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {onBulkDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                disabled={isBulkUpdating}
                className="text-red-500 hover:text-red-700 hover:border-red-300"
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedLeads(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Toggle secondary columns and bulk mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {dynamicColumns.length === 0 && (
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              {showSecondary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showSecondary ? 'Hide additional statuses' : 'Show all statuses'}
            </button>
          )}

          {/* Bulk select toggle */}
          <button
            onClick={toggleBulkMode}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors ${
              isBulkMode
                ? 'bg-gold-light/20 text-gold-dark'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isBulkMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {isBulkMode ? 'Exit bulk mode' : 'Select multiple'}
          </button>

          {isBulkMode && (
            <button
              onClick={selectAll}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              {selectedLeads.size === leads.length ? 'Deselect all' : 'Select all'}
            </button>
          )}

          {/* Touch hint */}
          {!isBulkMode && (
            <p className="text-xs text-slate-400 hidden sm:block md:hidden">
              Long-press cards to move
            </p>
          )}
        </div>

        {/* Configure button */}
        <button
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          Configure
        </button>
      </div>

      {/* Pipeline board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const stats = getColumnStats(column.value)
          const columnLeads = leadsByStatus[column.value] || []
          const isDropTarget = dragOverColumn === column.value

          return (
            <div
              key={column.value}
              className={`
                flex-shrink-0 w-72 rounded-lg border-t-4 ${column.border}
                ${isDropTarget ? 'bg-gold-light/10 ring-2 ring-gold-light' : 'bg-slate-50'}
                transition-all
              `}
              onDragOver={(e) => handleDragOver(e, column.value)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.value)}
            >
              {/* Column header */}
              <div className={`p-3 border-b border-slate-200 ${column.bg} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isBulkMode && columnLeads.length > 0 && (
                      <Checkbox
                        checked={columnLeads.every(l => selectedLeads.has(l.id))}
                        onChange={() => selectAllInColumn(column.value)}
                        className="h-4 w-4"
                      />
                    )}
                    <h3 className="font-semibold text-slate-900 text-sm">{column.label}</h3>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
                    {stats.count}
                  </span>
                </div>
                {stats.value > 0 && (
                  <p className="text-xs text-slate-600 mt-1">
                    {formatCurrency(stats.value)} pipeline
                  </p>
                )}
              </div>

              {/* Column body */}
              <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {isDropTarget ? 'Drop here' : 'No leads'}
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable={!isBulkMode}
                      onDragStart={(e) => !isBulkMode && handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => !isBulkMode && handleTouchStart(e, lead)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                      onContextMenu={(e) => !isBulkMode && handleContextMenu(e, lead)}
                      className="relative touch-manipulation"
                    >
                      {isUpdating === lead.id && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                          <Loader2 className="h-5 w-5 animate-spin text-gold" />
                        </div>
                      )}
                      {isBulkMode && (
                        <div
                          className={`absolute left-2 top-2 z-10 ${
                            selectedLeads.has(lead.id) ? 'opacity-100' : 'opacity-70'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLeadSelection(lead.id)
                          }}
                        >
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="h-4 w-4 bg-white shadow"
                          />
                        </div>
                      )}
                      <LeadCard
                        lead={lead}
                        onClick={() => isBulkMode ? toggleLeadSelection(lead.id) : onLeadClick(lead)}
                        isDragging={draggedLead === lead.id}
                        visibleFields={localCardFields}
                        onMoveClick={isBulkMode ? undefined : (e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMoveMenu({
                            isOpen: true,
                            lead,
                            position: { x: rect.right, y: rect.top }
                          })
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Move menu (for touch and context menu) */}
      {moveMenu.isOpen && moveMenu.lead && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={closeMoveMenu}
          />

          {/* Menu */}
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border py-2 min-w-[180px]"
            style={{
              left: Math.min(moveMenu.position.x, window.innerWidth - 200),
              top: Math.min(moveMenu.position.y, window.innerHeight - 300)
            }}
          >
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Move to</span>
              <button
                onClick={closeMoveMenu}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            </div>
            {LEAD_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => handleMoveToStatus(status.value)}
                disabled={status.value === moveMenu.lead?.status}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center gap-2
                  ${status.value === moveMenu.lead?.status
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-100 text-slate-700'
                  }
                `}
              >
                <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
                {status.value === moveMenu.lead?.status && (
                  <span className="ml-auto text-xs text-slate-400">(current)</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Pipeline Configuration Modal */}
      <PipelineConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        stages={stages}
        cardFields={localCardFields}
        onSaveStages={handleSaveStages}
        onSaveCardFields={handleSaveCardFields}
      />
    </div>
  )
}
