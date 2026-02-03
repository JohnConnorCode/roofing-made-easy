'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
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
  Loader2,
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import type { MessageTemplate, TemplateType } from '@/lib/communication/types'
import { EmailPreviewModal } from '@/components/admin/EmailPreviewModal'

interface Template extends MessageTemplate {
  usage_count: number
  last_used_at: string | null
  slug?: string
  default_body?: string
  default_subject?: string
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'estimate', label: 'Estimate' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review' },
  { value: 'general', label: 'General' },
]

const TYPE_ICONS: Record<TemplateType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
}

const TYPE_COLORS: Record<TemplateType, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
}

const LIMIT = 20

export default function TemplatesPage() {
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [templates, setTemplates] = useState<Template[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showSystemOnly, setShowSystemOnly] = useState(false)
  const [offset, setOffset] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isResetting, setIsResetting] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<TemplateType>('email')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formCategory, setFormCategory] = useState('general')
  const [formTags, setFormTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      })
      if (typeFilter) params.set('type', typeFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (showSystemOnly) params.set('is_system', 'true')
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()

      setTemplates(data.templates || [])
      setTotal(data.total || 0)
    } catch {
      setError('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }, [typeFilter, categoryFilter, showSystemOnly, search, offset])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template)
    setShowPreviewModal(true)
  }

  const handleResetToDefault = async (template: Template) => {
    if (!template.default_body) {
      setError('No default template available')
      return
    }
    const confirmed = await confirm({
      title: 'Reset Template',
      description: 'Reset this template to its default? Your customizations will be lost.',
      confirmText: 'Reset',
      variant: 'warning',
    })
    if (!confirmed) return

    setIsResetting(template.id)
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: template.default_body,
          subject: template.default_subject || template.subject,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset template')
      }

      await fetchTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset template')
    } finally {
      setIsResetting(null)
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formName || !formBody) return
    setIsSaving(true)

    try {
      const payload = {
        name: formName,
        description: formDescription || undefined,
        type: formType,
        subject: formType === 'email' ? formSubject : undefined,
        body: formBody,
        category: formCategory,
        tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }

      const url = editingTemplate
        ? `/api/admin/templates/${editingTemplate.id}`
        : '/api/admin/templates'

      const response = await fetch(url, {
        method: editingTemplate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      await fetchTemplates()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    const confirmed = await confirm({
      title: 'Delete Template',
      description: 'Are you sure you want to delete this template? Workflows using this template will no longer work.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      await fetchTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  const handleDuplicate = (template: Template) => {
    setEditingTemplate(null)
    setFormName(`${template.name} (Copy)`)
    setFormDescription(template.description || '')
    setFormType(template.type)
    setFormSubject(template.subject || '')
    setFormBody(template.body)
    setFormCategory(template.category || 'general')
    setFormTags(template.tags?.join(', ') || '')
    setShowCreateModal(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormDescription(template.description || '')
    setFormType(template.type)
    setFormSubject(template.subject || '')
    setFormBody(template.body)
    setFormCategory(template.category || 'general')
    setFormTags(template.tags?.join(', ') || '')
    setShowCreateModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingTemplate(null)
    setFormName('')
    setFormDescription('')
    setFormType('email')
    setFormSubject('')
    setFormBody('')
    setFormCategory('general')
    setFormTags('')
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  // Available variables for reference
  const availableVariables = [
    '{{customer_name}}',
    '{{customer_first_name}}',
    '{{customer_email}}',
    '{{customer_phone}}',
    '{{estimate_total}}',
    '{{estimate_link}}',
    '{{appointment_date}}',
    '{{appointment_time}}',
    '{{company_name}}',
    '{{company_phone}}',
    '{{company_email}}',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Message Templates</h1>
          <p className="text-slate-500">Create and manage email and SMS templates</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Template
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
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
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
              className="md:w-32 bg-white border-slate-300 text-slate-900"
            />
            <Select
              options={CATEGORY_OPTIONS}
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
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {total} Template{total !== 1 ? 's' : ''}
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
              <p className="text-slate-600">No templates found</p>
              <p className="text-sm text-slate-400">Create a template to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => {
                const TypeIcon = TYPE_ICONS[template.type]

                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <div className={`p-2 rounded-lg ${TYPE_COLORS[template.type]}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900">
                            {template.name}
                          </span>
                          {template.is_system && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              System
                            </span>
                          )}
                          {template.category && (
                            <span className="px-2 py-0.5 rounded bg-gold-light/30 text-gold-dark text-xs">
                              {template.category}
                            </span>
                          )}
                        </div>

                        {template.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                            {template.description}
                          </p>
                        )}

                        {template.type === 'email' && template.subject && (
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
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {template.is_system && template.default_body && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetToDefault(template)}
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
                            onClick={() => handleDelete(template.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>

              {editingTemplate?.is_system && (
                <div className="mb-4 p-3 bg-gold-light/20 rounded-lg text-gold-dark text-sm">
                  <Lock className="h-4 w-4 inline mr-2" />
                  System template: You can edit the subject and body, but not delete or change metadata.
                  {editingTemplate.default_body && (
                    <> Use the reset button to restore the default template.</>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Welcome Email"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      disabled={editingTemplate?.is_system}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type
                    </label>
                    <Select
                      options={TYPE_OPTIONS.filter(t => t.value)}
                      value={formType}
                      onChange={(v) => setFormType(v as TemplateType)}
                      disabled={!!editingTemplate}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of when to use this template"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={editingTemplate?.is_system}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <Select
                      options={CATEGORY_OPTIONS.filter(c => c.value)}
                      value={formCategory}
                      onChange={setFormCategory}
                      disabled={editingTemplate?.is_system}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <Input
                      placeholder="e.g., sales, urgent"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      disabled={editingTemplate?.is_system}
                    />
                  </div>
                </div>

                {formType === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Your estimate from {{company_name}}"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono bg-white text-slate-900"
                    rows={12}
                    placeholder={formType === 'email'
                      ? "Hi {{customer_first_name}},\n\nThank you for your interest..."
                      : "Hi {{customer_first_name}}, your estimate is ready! View it here: {{estimate_link}}"
                    }
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {formType === 'sms' ? 'Max 160 characters for single SMS' : 'Full HTML/CSS supported. Use inline styles for email compatibility.'}
                  </p>
                </div>

                {/* Available Variables */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Variables
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-mono text-slate-600 transition-colors"
                        onClick={() => {
                          if (!editingTemplate?.is_system) {
                            setFormBody(formBody + variable)
                          }
                        }}
                        disabled={editingTemplate?.is_system}
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrUpdate}
                  disabled={!formName || !formBody || (formType === 'email' && !formSubject) || isSaving}
                  leftIcon={isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                >
                  {isSaving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
