'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFocusTrap } from '@/components/ui/use-focus-trap'
import {
  BookOpen,
  Pencil,
  RotateCcw,
  RefreshCw,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

interface EstimateContent {
  id: string
  slug: string
  title: string
  content: string
  default_content: string
  content_type: 'warranty' | 'scope' | 'terms' | 'payment_terms'
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  warranty: 'Warranties',
  scope: 'Scope of Work',
  terms: 'General Terms',
  payment_terms: 'Payment Terms',
}

const CONTENT_TYPE_COLORS: Record<string, string> = {
  warranty: 'bg-green-100 text-green-700',
  scope: 'bg-blue-100 text-blue-700',
  terms: 'bg-amber-100 text-amber-700',
  payment_terms: 'bg-purple-100 text-purple-700',
}

interface EstimateContentPanelProps {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
  onTotalChange?: (total: number) => void
}

export function EstimateContentPanel({ onSuccess, onError, onTotalChange }: EstimateContentPanelProps) {
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [content, setContent] = useState<EstimateContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const onTotalChangeRef = useRef(onTotalChange)
  onTotalChangeRef.current = onTotalChange
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  // Edit modal state
  const [editingContent, setEditingContent] = useState<EstimateContent | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContentText, setEditContentText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const focusTrapRef = useFocusTrap(!!editingContent)

  // Track initial values for dirty detection
  const editInitial = useRef({ title: '', content: '' })

  const isEditDirty =
    editTitle !== editInitial.current.title ||
    editContentText !== editInitial.current.content

  const isEditDirtyRef = useRef(isEditDirty)
  isEditDirtyRef.current = isEditDirty

  const handleEditClose = useCallback(() => {
    if (isEditDirtyRef.current && !window.confirm('You have unsaved changes. Discard them?')) return
    setEditingContent(null)
  }, [])

  // Escape key + body scroll lock for edit modal
  useEffect(() => {
    if (!editingContent) return
    document.body.style.overflow = 'hidden'
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEditClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [editingContent, handleEditClose])

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/communications/estimate-content')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setContent(data.content || [])
    } catch {
      onErrorRef.current?.('Failed to load estimate content')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Report total count to parent
  useEffect(() => {
    onTotalChangeRef.current?.(content.length)
  }, [content.length])

  const handleEdit = (item: EstimateContent) => {
    editInitial.current = { title: item.title, content: item.content }
    setEditingContent(item)
    setEditTitle(item.title)
    setEditContentText(item.content)
  }

  const handleSave = async () => {
    if (!editingContent || !editContentText) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/communications/estimate-content/${editingContent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContentText,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update content')
      }

      await fetchContent()
      setEditingContent(null)
      onSuccess?.('Estimate content updated successfully')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to update content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async (item: EstimateContent) => {
    const confirmed = await confirm({
      title: 'Reset Content',
      description: `Reset "${item.title}" to its default text? Your customizations will be lost.`,
      confirmText: 'Reset',
      variant: 'warning',
    })
    if (!confirmed) return

    setIsResetting(item.id)
    try {
      const response = await fetch(`/api/admin/communications/estimate-content/${item.id}/reset`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset content')
      }

      await fetchContent()
      onSuccess?.('Content reset to default')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to reset content')
    } finally {
      setIsResetting(null)
    }
  }

  const handleToggleActive = async (item: EstimateContent) => {
    setTogglingIds(prev => new Set(prev).add(item.id))
    try {
      const response = await fetch(`/api/admin/communications/estimate-content/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !item.is_active,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      await fetchContent()
      onSuccess?.(`Content ${item.is_active ? 'hidden' : 'shown'} on estimates`)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to toggle visibility')
    } finally {
      setTogglingIds(prev => { const next = new Set(prev); next.delete(item.id); return next })
    }
  }

  const grouped = {
    warranty: content.filter(c => c.content_type === 'warranty'),
    scope: content.filter(c => c.content_type === 'scope'),
    terms: content.filter(c => c.content_type === 'terms'),
    payment_terms: content.filter(c => c.content_type === 'payment_terms'),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm flex items-start gap-2">
        <BookOpen className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">About Estimate Content</p>
          <p className="mt-1">
            This content appears on customer-facing estimates and quotes. Edit the text below
            to customize what customers see when viewing their quote.
          </p>
        </div>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <Card key={type} className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${CONTENT_TYPE_COLORS[type]}`}>
                {CONTENT_TYPE_LABELS[type]}
              </span>
              <span className="text-sm font-normal text-slate-500">({items.length} items)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-slate-400">No content items for this category.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const isModified = item.content !== item.default_content

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{item.title}</span>
                            {isModified && (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-xs">
                                Customized
                              </span>
                            )}
                            {!item.is_active && (
                              <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{item.content}</p>
                          {isModified && (
                            <details className="mt-2">
                              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                                View default text
                              </summary>
                              <p className="text-xs text-slate-400 mt-1 italic">{item.default_content}</p>
                            </details>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(item)}
                            disabled={togglingIds.has(item.id)}
                            role="switch"
                            aria-checked={item.is_active}
                            aria-label={item.is_active ? 'Hide from estimates' : 'Show on estimates'}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.is_active ? 'bg-green-500' : 'bg-slate-300'
                            } ${togglingIds.has(item.id) ? 'opacity-50' : ''}`}
                            title={item.is_active ? 'Hide from estimates' : 'Show on estimates'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            aria-label="Edit content"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isModified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReset(item)}
                              aria-label="Reset to default"
                              title="Reset to default"
                              disabled={isResetting === item.id}
                            >
                              {isResetting === item.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleEditClose}>
          <div ref={focusTrapRef} role="dialog" aria-modal="true" aria-label="Edit Estimate Content" className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Estimate Content
                </h2>
                <button onClick={handleEditClose} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-0.5 rounded text-xs ${CONTENT_TYPE_COLORS[editingContent.content_type]}`}>
                  {CONTENT_TYPE_LABELS[editingContent.content_type]}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900"
                    rows={6}
                    value={editContentText}
                    onChange={(e) => setEditContentText(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    This text appears on customer-facing estimates and quotes.
                  </p>
                </div>

                {editingContent.content !== editingContent.default_content && (
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    This content has been customized from the default.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={handleEditClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!editContentText || isSaving}
                  leftIcon={isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  )
}
