'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFocusTrap } from '@/components/ui/use-focus-trap'
import { RefreshCw, Plus, Lock, X, Save } from 'lucide-react'
import { AVAILABLE_VARIABLES } from './VariablesReference'
import type { MessageTemplate, TemplateType } from '@/lib/communication/types'
import { TEMPLATE_CATEGORY_OPTIONS, TEMPLATE_VARIABLE_DEFINITIONS } from '@/lib/communication/types'

const TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

// Derive expanded lengths from canonical variable list using example string lengths
const VARIABLE_EXPANDED_LENGTHS: Record<string, number> = Object.fromEntries(
  TEMPLATE_VARIABLE_DEFINITIONS.map(v => [`{{${v.variable}}}`, v.example.length])
)

function estimateExpandedLength(text: string): number {
  let expanded = text
  for (const [variable, length] of Object.entries(VARIABLE_EXPANDED_LENGTHS)) {
    expanded = expanded.replaceAll(variable, 'x'.repeat(length))
  }
  // Replace any remaining unknown variables with a reasonable estimate
  expanded = expanded.replace(/\{\{[^}]+\}\}/g, 'x'.repeat(12))
  return expanded.length
}

interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  editingTemplate?: MessageTemplate | null
  lockedType?: 'email' | 'sms'
  /** If provided, pre-fills the form for duplication */
  duplicateFrom?: MessageTemplate | null
}

export function TemplateFormModal({
  isOpen,
  onClose,
  onSaved,
  onError,
  onSuccess,
  editingTemplate,
  lockedType,
  duplicateFrom,
}: TemplateFormModalProps) {
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<TemplateType>(lockedType || 'email')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formCategory, setFormCategory] = useState('general')
  const [formTags, setFormTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const focusTrapRef = useFocusTrap(isOpen)

  // Track initial values for dirty detection
  const initialValues = useRef({ name: '', description: '', subject: '', body: '', category: 'general', tags: '' })

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset form when opening
  useEffect(() => {
    if (!isOpen) return

    let init = { name: '', description: '', subject: '', body: '', category: 'general', tags: '' }

    if (editingTemplate) {
      init = {
        name: editingTemplate.name,
        description: editingTemplate.description || '',
        subject: editingTemplate.subject || '',
        body: editingTemplate.body,
        category: editingTemplate.category || 'general',
        tags: editingTemplate.tags?.join(', ') || '',
      }
      setFormName(init.name)
      setFormDescription(init.description)
      setFormType(editingTemplate.type)
      setFormSubject(init.subject)
      setFormBody(init.body)
      setFormCategory(init.category)
      setFormTags(init.tags)
    } else if (duplicateFrom) {
      init = {
        name: `${duplicateFrom.name} (Copy)`,
        description: duplicateFrom.description || '',
        subject: duplicateFrom.subject || '',
        body: duplicateFrom.body,
        category: duplicateFrom.category || 'general',
        tags: duplicateFrom.tags?.join(', ') || '',
      }
      setFormName(init.name)
      setFormDescription(init.description)
      setFormType(lockedType || duplicateFrom.type)
      setFormSubject(init.subject)
      setFormBody(init.body)
      setFormCategory(init.category)
      setFormTags(init.tags)
    } else {
      setFormName('')
      setFormDescription('')
      setFormType(lockedType || 'email')
      setFormSubject('')
      setFormBody('')
      setFormCategory('general')
      setFormTags('')
    }

    initialValues.current = init
  }, [isOpen, editingTemplate, duplicateFrom, lockedType])

  const effectiveType = lockedType || formType
  const isSystem = editingTemplate?.is_system

  const isDirty =
    formName !== initialValues.current.name ||
    formDescription !== initialValues.current.description ||
    formSubject !== initialValues.current.subject ||
    formBody !== initialValues.current.body ||
    formCategory !== initialValues.current.category ||
    formTags !== initialValues.current.tags

  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  const handleClose = useCallback(() => {
    if (isDirtyRef.current && !window.confirm('You have unsaved changes. Discard them?')) return
    onClose()
  }, [onClose])

  const handleSave = async () => {
    if (!formName || !formBody) return
    if (effectiveType === 'email' && !formSubject) return
    setIsSaving(true)

    try {
      const payload: Record<string, unknown> = {
        body: formBody,
      }

      if (editingTemplate?.is_system) {
        // System templates: only send subject and body
        if (effectiveType === 'email') {
          payload.subject = formSubject
        }
      } else {
        // Non-system or create: send all fields
        payload.name = formName
        payload.description = formDescription || undefined
        payload.type = effectiveType
        payload.category = formCategory
        payload.tags = formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : []
        if (effectiveType === 'email') {
          payload.subject = formSubject
        }
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

      onSuccess?.(editingTemplate ? 'Template updated successfully' : 'Template created successfully')
      onSaved()
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = bodyRef.current
    if (!textarea) {
      setFormBody(formBody + variable)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newBody = formBody.slice(0, start) + variable + formBody.slice(end)
    setFormBody(newBody)

    // Restore cursor position after the inserted variable
    requestAnimationFrame(() => {
      const cursorPos = start + variable.length
      textarea.setSelectionRange(cursorPos, cursorPos)
      textarea.focus()
    })
  }

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const rawLength = formBody.length
  const expandedLength = estimateExpandedLength(formBody)
  const hasVariables = /\{\{[^}]+\}\}/.test(formBody)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div ref={focusTrapRef} role="dialog" aria-modal="true" aria-label={editingTemplate ? 'Edit Template' : 'Create Template'} className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isSystem && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm flex items-start gap-2">
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                System template: You can edit the subject and body, but not the name, description, category, or tags.
              </span>
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
                  disabled={isSystem}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <Select
                  options={TYPE_OPTIONS}
                  value={effectiveType}
                  onChange={(v) => setFormType(v as TemplateType)}
                  disabled={!!editingTemplate || !!lockedType}
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
                disabled={isSystem}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <Select
                  options={TEMPLATE_CATEGORY_OPTIONS}
                  value={formCategory}
                  onChange={setFormCategory}
                  disabled={isSystem}
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
                  disabled={isSystem}
                />
              </div>
            </div>

            {effectiveType === 'email' && (
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  {effectiveType === 'email' ? 'Email Body' : 'Message'} <span className="text-red-500">*</span>
                </label>
                {effectiveType === 'sms' && (
                  <div className="text-right">
                    {hasVariables ? (
                      <>
                        {/* Show estimated expanded length as primary metric */}
                        <span className={`text-xs ${expandedLength > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                          ~{expandedLength}/160 chars (expanded)
                          {expandedLength > 160 && ` / ~${Math.ceil(expandedLength / 153)} segments`}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {rawLength} chars raw
                        </span>
                      </>
                    ) : (
                      <span className={`text-xs ${rawLength > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {rawLength}/160 chars
                        {rawLength > 160 && ` (${Math.ceil(rawLength / 153)} segments)`}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <textarea
                ref={bodyRef}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono bg-white text-slate-900"
                rows={effectiveType === 'email' ? 12 : 6}
                placeholder={effectiveType === 'email'
                  ? "Hi {{customer_first_name}},\n\nThank you for your interest..."
                  : "Hi {{customer_first_name}}, your estimate is ready! View it here: {{estimate_link}}"
                }
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                {effectiveType === 'email'
                  ? 'HTML supported. Use inline styles for email compatibility.'
                  : 'Plain text only. Keep under 160 characters for single SMS.'}
              </p>
            </div>

            {/* Variable quick-insert */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Insert Variable
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map(({ variable }) => (
                  <button
                    key={variable}
                    type="button"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-mono text-slate-600 transition-colors"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formName || !formBody ||
                (effectiveType === 'email' && !formSubject) ||
                isSaving
              }
              leftIcon={
                isSaving
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : editingTemplate
                    ? <Save className="h-4 w-4" />
                    : <Plus className="h-4 w-4" />
              }
            >
              {isSaving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
