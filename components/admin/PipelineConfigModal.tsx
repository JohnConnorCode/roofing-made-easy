'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  X,
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  Save,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface PipelineStage {
  id: string
  name: string
  slug: string
  color: string
  position: number
  is_system: boolean
  is_visible: boolean
}

const DEFAULT_CARD_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'estimate', label: 'Estimate Amount' },
  { key: 'estimate_range', label: 'Estimate Range ($X - $Y)' },
  { key: 'location', label: 'Location' },
  { key: 'job_type', label: 'Job Type' },
  { key: 'urgency', label: 'Urgency' },
  { key: 'photo_count', label: 'Photo Count' },
  { key: 'insurance', label: 'Insurance Indicator' },
  { key: 'days_in_stage', label: 'Days in Stage' },
  { key: 'last_activity', label: 'Last Activity' },
]

const PRESET_COLORS = [
  '#D4A853', // Gold
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#EF4444', // Red
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#64748B', // Slate
  '#10B981', // Emerald
]

interface PipelineConfigModalProps {
  isOpen: boolean
  onClose: () => void
  stages: PipelineStage[]
  cardFields: string[]
  onSaveStages: (stages: PipelineStage[]) => Promise<boolean>
  onSaveCardFields: (fields: string[]) => Promise<void>
}

export function PipelineConfigModal({
  isOpen,
  onClose,
  stages: initialStages,
  cardFields: initialCardFields,
  onSaveStages,
  onSaveCardFields,
}: PipelineConfigModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'stages' | 'fields'>('stages')
  const [stages, setStages] = useState<PipelineStage[]>(initialStages)
  const [cardFields, setCardFields] = useState<string[]>(initialCardFields)
  const [newStageName, setNewStageName] = useState('')
  const [newStageColor, setNewStageColor] = useState('#6B7280')
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    setStages(initialStages)
    setCardFields(initialCardFields)
    setSaveError(null)
  }, [initialStages, initialCardFields])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newStages = [...stages]
    const [draggedStage] = newStages.splice(draggedIndex, 1)
    newStages.splice(index, 0, draggedStage)

    // Update positions
    newStages.forEach((stage, i) => {
      stage.position = i
    })

    setStages(newStages)
    setDraggedIndex(index)
  }, [draggedIndex, stages])

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleToggleVisibility = (stageId: string) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, is_visible: !s.is_visible } : s))
    )
  }

  const handleUpdateStage = (
    stageId: string,
    updates: Partial<PipelineStage>
  ) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, ...updates } : s))
    )
    setEditingStageId(null)
  }

  const handleAddStage = () => {
    if (!newStageName.trim()) return

    const slug = newStageName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    const newStage: PipelineStage = {
      id: `temp-${Date.now()}`,
      name: newStageName.trim(),
      slug,
      color: newStageColor,
      position: stages.length,
      is_system: false,
      is_visible: true,
    }

    setStages((prev) => [...prev, newStage])
    setNewStageName('')
    setNewStageColor('#6B7280')
  }

  const handleDeleteStage = (stageId: string) => {
    setStages((prev) => prev.filter((s) => s.id !== stageId))
  }

  const handleToggleCardField = (fieldKey: string) => {
    if (fieldKey === 'name') return // Name is required

    setCardFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      if (activeTab === 'stages') {
        const success = await onSaveStages(stages)
        if (success) {
          onClose()
        } else {
          setSaveError('Some changes failed to save. Please try again.')
        }
      } else {
        await onSaveCardFields(cardFields)
        onClose()
      }
    } catch {
      setSaveError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="config-title" className="text-xl font-semibold text-slate-900">
            <Settings2 className="mr-2 inline h-5 w-5" />
            Pipeline Configuration
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('stages')}
              className={cn(
                'px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'stages'
                  ? 'border-b-2 border-gold text-gold'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Pipeline Stages
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={cn(
                'px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'fields'
                  ? 'border-b-2 border-gold text-gold'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Card Fields
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {activeTab === 'stages' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Drag stages to reorder. Toggle visibility to show/hide columns.
              </p>

              {/* Stage list */}
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                      draggedIndex === index
                        ? 'border-gold bg-gold-light/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <GripVertical className="h-5 w-5 cursor-grab text-slate-400" />

                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />

                    {editingStageId === stage.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={stage.name}
                          onChange={(e) =>
                            handleUpdateStage(stage.id, { name: e.target.value })
                          }
                          className="h-8 flex-1"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() =>
                                handleUpdateStage(stage.id, { color })
                              }
                              className={cn(
                                'h-6 w-6 rounded-full border-2',
                                stage.color === color
                                  ? 'border-slate-900'
                                  : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span
                        className="flex-1 cursor-pointer font-medium text-slate-900"
                        onClick={() =>
                          !stage.is_system && setEditingStageId(stage.id)
                        }
                      >
                        {stage.name}
                        {stage.is_system && (
                          <span className="ml-2 text-xs text-slate-400">
                            (system)
                          </span>
                        )}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(stage.id)}
                        className={cn(
                          'rounded p-1.5 transition-colors',
                          stage.is_visible
                            ? 'text-slate-600 hover:bg-slate-100'
                            : 'text-slate-300 hover:bg-slate-100'
                        )}
                        title={stage.is_visible ? 'Hide stage' : 'Show stage'}
                      >
                        {stage.is_visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>

                      {!stage.is_system && (
                        <>
                          <button
                            onClick={() => setEditingStageId(stage.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Edit stage"
                          >
                            <Palette className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStage(stage.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete stage"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new stage */}
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4">
                <h4 className="mb-3 text-sm font-medium text-slate-700">
                  Add Custom Stage
                </h4>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Stage name..."
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewStageColor(color)}
                        className={cn(
                          'h-6 w-6 rounded-full border-2',
                          newStageColor === color
                            ? 'border-slate-900'
                            : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddStage}
                    disabled={!newStageName.trim()}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Select which fields to display on lead cards in the pipeline view.
              </p>

              <div className="space-y-2">
                {DEFAULT_CARD_FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      cardFields.includes(field.key)
                        ? 'border-gold bg-gold-light/10'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Checkbox
                      checked={cardFields.includes(field.key)}
                      onChange={() => handleToggleCardField(field.key)}
                      disabled={field.required}
                    />
                    <span className="flex-1 font-medium text-slate-900">
                      {field.label}
                      {field.required && (
                        <span className="ml-2 text-xs text-slate-400">
                          (required)
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          {saveError && (
            <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {saveError}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
