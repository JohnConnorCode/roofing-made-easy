'use client'

import { useState, useCallback, useRef } from 'react'
import { LeadCard, type LeadCardData } from './LeadCard'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronUp, Loader2, X } from 'lucide-react'
import { LEAD_STATUSES, getStatusConfig } from '@/lib/constants/status'

// Primary statuses for main pipeline view
const PRIMARY_STATUS_IDS = ['new', 'estimate_generated', 'consultation_scheduled', 'quote_sent', 'won']
const SECONDARY_STATUS_IDS = ['intake_started', 'intake_complete', 'lost', 'archived']

export const PIPELINE_COLUMNS = LEAD_STATUSES.filter(s => PRIMARY_STATUS_IDS.includes(s.value))
export const SECONDARY_COLUMNS = LEAD_STATUSES.filter(s => SECONDARY_STATUS_IDS.includes(s.value))

interface PipelineBoardProps {
  leads: LeadCardData[]
  onLeadClick: (lead: LeadCardData) => void
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>
  isUpdating?: string | null
}

interface MoveMenuState {
  isOpen: boolean
  lead: LeadCardData | null
  position: { x: number; y: number }
}

export function PipelineBoard({ leads, onLeadClick, onStatusChange, isUpdating }: PipelineBoardProps) {
  const [showSecondary, setShowSecondary] = useState(false)
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [moveMenu, setMoveMenu] = useState<MoveMenuState>({ isOpen: false, lead: null, position: { x: 0, y: 0 } })
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const columns = showSecondary
    ? [...PIPELINE_COLUMNS.slice(0, 2), ...SECONDARY_COLUMNS.slice(0, 2), ...PIPELINE_COLUMNS.slice(2), ...SECONDARY_COLUMNS.slice(2)]
    : PIPELINE_COLUMNS

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

  return (
    <div className="space-y-4">
      {/* Toggle secondary columns */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSecondary(!showSecondary)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          {showSecondary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showSecondary ? 'Hide additional statuses' : 'Show all statuses'}
        </button>

        {/* Touch hint */}
        <p className="text-xs text-slate-400 hidden sm:block md:hidden">
          Long-press cards to move
        </p>
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
                  <h3 className="font-semibold text-slate-900 text-sm">{column.label}</h3>
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, lead)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                      onContextMenu={(e) => handleContextMenu(e, lead)}
                      className="relative touch-manipulation"
                    >
                      {isUpdating === lead.id && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                          <Loader2 className="h-5 w-5 animate-spin text-gold" />
                        </div>
                      )}
                      <LeadCard
                        lead={lead}
                        onClick={() => onLeadClick(lead)}
                        isDragging={draggedLead === lead.id}
                        onMoveClick={(e) => {
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
    </div>
  )
}
