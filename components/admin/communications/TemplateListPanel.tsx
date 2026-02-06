'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Plus,
  RefreshCw,
  Mail,
  MessageSquare,
  FileText,
  Copy,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Lock,
  Tag,
  RotateCcw,
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmailPreviewModal } from '@/components/admin/EmailPreviewModal'
import { TemplateFormModal } from './TemplateFormModal'
import type { MessageTemplate } from '@/lib/communication/types'
import { TEMPLATE_CATEGORY_OPTIONS } from '@/lib/communication/types'

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...TEMPLATE_CATEGORY_OPTIONS,
]

const LIMIT = 20

interface TemplateListPanelProps {
  lockedType: 'email' | 'sms'
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onTotalChange?: (total: number) => void
}

export function TemplateListPanel({ lockedType, onError, onSuccess, onTotalChange }: TemplateListPanelProps) {
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showSystemOnly, setShowSystemOnly] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const onTotalChangeRef = useRef(onTotalChange)
  onTotalChangeRef.current = onTotalChange

  // Preview
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)

  // Form modal
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [duplicateFrom, setDuplicateFrom] = useState<MessageTemplate | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset offset when filters change (not search - handled by debounce)
  useEffect(() => {
    setOffset(0)
  }, [categoryFilter, showSystemOnly])

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
        type: lockedType,
        include_inactive: 'true',
      })
      if (categoryFilter) params.set('category', categoryFilter)
      if (showSystemOnly) params.set('is_system', 'true')
      if (debouncedSearch) params.set('search', debouncedSearch)

      const response = await fetch(`/api/admin/templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()

      setTemplates(data.templates || [])
      setTotal(data.total || 0)
    } catch {
      onErrorRef.current?.('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }, [lockedType, categoryFilter, showSystemOnly, debouncedSearch, offset])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Report total count to parent
  useEffect(() => {
    onTotalChangeRef.current?.(total)
  }, [total])

  const handlePreview = (template: MessageTemplate) => {
    setPreviewTemplate(template)
    setShowPreviewModal(true)
  }

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template)
    setDuplicateFrom(null)
    setShowFormModal(true)
  }

  const handleDuplicate = (template: MessageTemplate) => {
    setEditingTemplate(null)
    setDuplicateFrom(template)
    setShowFormModal(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setDuplicateFrom(null)
    setShowFormModal(true)
  }

  const handleDelete = async (template: MessageTemplate) => {
    const confirmed = await confirm({
      title: 'Delete Template',
      description: `Delete "${template.name}"? Workflows using this template will no longer work.`,
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      onSuccess?.('Template deleted')
      await fetchTemplates()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  const handleReset = async (template: MessageTemplate) => {
    if (!template.default_body) return

    const confirmed = await confirm({
      title: 'Reset Template',
      description: 'Reset this template to its default content? Your customizations will be lost.',
      confirmText: 'Reset',
      variant: 'warning',
    })
    if (!confirmed) return

    setIsResetting(template.id)
    try {
      const response = await fetch(`/api/admin/communications/templates/${template.id}/reset`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset template')
      }

      onSuccess?.('Template reset to default')
      await fetchTemplates()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to reset template')
    } finally {
      setIsResetting(null)
    }
  }

  const handleToggleActive = async (template: MessageTemplate) => {
    setTogglingIds(prev => new Set(prev).add(template.id))
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !template.is_active }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      onSuccess?.(template.is_active ? 'Template deactivated' : 'Template activated')
      await fetchTemplates()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to toggle template')
    } finally {
      setTogglingIds(prev => { const next = new Set(prev); next.delete(template.id); return next })
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1
  const TypeIcon = lockedType === 'email' ? Mail : MessageSquare
  const typeColor = lockedType === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900"
              />
            </div>
            <Select
              options={CATEGORY_FILTER_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="md:w-36 bg-white border-slate-300 text-slate-900"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
              <Checkbox
                checked={showSystemOnly}
                onChange={(e) => setShowSystemOnly(e.target.checked)}
              />
              System only
            </label>
            <Button
              size="sm"
              onClick={handleCreate}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {total} {lockedType === 'email' ? 'Email' : 'SMS'} Template{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No {lockedType} templates found</p>
              <p className="text-sm text-slate-400 mt-1">Create a template to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`hidden sm:flex p-2 rounded-lg ${typeColor}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900">{template.name}</span>
                        {template.is_system && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            System
                          </span>
                        )}
                        {template.category && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs">
                            {template.category}
                          </span>
                        )}
                        {!template.is_active && (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs">
                            Inactive
                          </span>
                        )}
                        {template.is_system && template.default_body && (template.body !== template.default_body || (template.default_subject && template.subject !== template.default_subject)) && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-xs">
                            Customized
                          </span>
                        )}
                      </div>

                      {template.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{template.description}</p>
                      )}

                      {lockedType === 'email' && template.subject && (
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="text-slate-400">Subject:</span> {template.subject}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        {template.usage_count > 0 && (
                          <span>Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}</span>
                        )}
                        {template.last_used_at && (
                          <span>Last used {formatDate(template.last_used_at)}</span>
                        )}
                        {template.variables && template.variables.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Actions - below content on mobile, inline on desktop */}
                      <div className="flex items-center gap-1 mt-3 sm:hidden">
                        <button
                          onClick={() => handleToggleActive(template)}
                          disabled={togglingIds.has(template.id)}
                          role="switch"
                          aria-checked={template.is_active}
                          aria-label={template.is_active ? 'Deactivate template' : 'Activate template'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            template.is_active ? 'bg-green-500' : 'bg-slate-300'
                          } ${togglingIds.has(template.id) ? 'opacity-50' : ''}`}
                          title={template.is_active ? 'Deactivate template' : 'Activate template'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              template.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        {lockedType === 'email' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(template)} aria-label="Preview template" title="Preview">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(template)} aria-label="Edit template" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)} aria-label="Duplicate template" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        {template.is_system && template.default_body && (
                          <Button variant="ghost" size="sm" onClick={() => handleReset(template)} aria-label="Reset to default" title="Reset to default" disabled={isResetting === template.id}>
                            {isResetting === template.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          </Button>
                        )}
                        {!template.is_system && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(template)} aria-label="Delete template" className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Actions - inline on desktop */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(template)}
                        disabled={togglingIds.has(template.id)}
                        role="switch"
                        aria-checked={template.is_active}
                        aria-label={template.is_active ? 'Deactivate template' : 'Activate template'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          template.is_active ? 'bg-green-500' : 'bg-slate-300'
                        } ${togglingIds.has(template.id) ? 'opacity-50' : ''}`}
                        title={template.is_active ? 'Deactivate template' : 'Activate template'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            template.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {lockedType === 'email' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          aria-label="Preview template"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        aria-label="Duplicate template"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        aria-label="Edit template"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {template.is_system && template.default_body && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(template)}
                          aria-label="Reset to default"
                          title="Reset to default"
                          disabled={isResetting === template.id}
                        >
                          {isResetting === template.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {!template.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          aria-label="Delete template"
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {offset + 1}-{Math.min(offset + LIMIT, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={currentPage >= totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <TemplateFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingTemplate(null)
          setDuplicateFrom(null)
        }}
        onSaved={fetchTemplates}
        onError={onError}
        onSuccess={onSuccess}
        editingTemplate={editingTemplate}
        duplicateFrom={duplicateFrom}
        lockedType={lockedType}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewTemplate(null)
        }}
        templateId={previewTemplate?.id}
        subject={previewTemplate?.subject || undefined}
        htmlBody={previewTemplate?.body}
      />

      <ConfirmDialog />
    </div>
  )
}
