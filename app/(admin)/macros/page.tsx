'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit2, Trash2, FileText, Star, Copy, X, Loader2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

type MacroRoofType =
  | 'asphalt_shingle' | 'metal_standing_seam' | 'metal_corrugated'
  | 'tile_concrete' | 'tile_clay' | 'slate' | 'wood_shake'
  | 'flat_tpo' | 'flat_epdm' | 'flat_modified_bitumen' | 'any'

type MacroJobType =
  | 'full_replacement' | 'repair' | 'overlay' | 'partial_replacement'
  | 'storm_damage' | 'insurance_claim' | 'maintenance' | 'gutter_only' | 'any'

interface EstimateMacro {
  id: string
  name: string
  description: string | null
  roof_type: MacroRoofType
  job_type: MacroJobType
  is_default: boolean
  is_system: boolean
  is_active: boolean
  usage_count: number
  tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

const ROOF_TYPE_LABELS: Record<MacroRoofType, string> = {
  asphalt_shingle: 'Asphalt Shingle',
  metal_standing_seam: 'Metal Standing Seam',
  metal_corrugated: 'Metal Corrugated',
  tile_concrete: 'Concrete Tile',
  tile_clay: 'Clay Tile',
  slate: 'Slate',
  wood_shake: 'Wood Shake',
  flat_tpo: 'TPO Flat',
  flat_epdm: 'EPDM Flat',
  flat_modified_bitumen: 'Modified Bitumen',
  any: 'Any',
}

const JOB_TYPE_LABELS: Record<MacroJobType, string> = {
  full_replacement: 'Full Replacement',
  repair: 'Repair',
  overlay: 'Overlay',
  partial_replacement: 'Partial Replacement',
  storm_damage: 'Storm Damage',
  insurance_claim: 'Insurance Claim',
  maintenance: 'Maintenance',
  gutter_only: 'Gutter Only',
  any: 'Any',
}

const ROOF_TYPE_OPTIONS = Object.entries(ROOF_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

type MacroFormData = {
  name: string
  description: string
  roof_type: MacroRoofType
  job_type: MacroJobType
  tags: string[]
}

const emptyFormData: MacroFormData = {
  name: '',
  description: '',
  roof_type: 'any',
  job_type: 'any',
  tags: [],
}

export default function MacrosPage() {
  const { showToast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [macros, setMacros] = useState<EstimateMacro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMacro, setEditingMacro] = useState<EstimateMacro | null>(null)
  const [formData, setFormData] = useState<MacroFormData>(emptyFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    fetchMacros()
  }, [])

  async function fetchMacros() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/macros?include_line_items=true')
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setMacros(data.macros || [])
    } catch (error) {
      showToast('Failed to load templates', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (macroId: string) => {
    try {
      const response = await fetch(`/api/macros/${macroId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })

      if (!response.ok) throw new Error('Failed to update')

      showToast('Default template updated', 'success')
      fetchMacros()
    } catch (error) {
      showToast('Failed to set default', 'error')
    }
  }

  const handleDelete = async (macroId: string) => {
    const confirmed = await confirm({
      title: 'Delete Template',
      description: 'Are you sure you want to delete this estimate template? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/macros/${macroId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('Template deleted', 'success')
      setMacros((prev) => prev.filter((m) => m.id !== macroId))
    } catch {
      showToast('Failed to delete template', 'error')
    }
  }

  const openCreateModal = () => {
    setEditingMacro(null)
    setFormData(emptyFormData)
    setTagsInput('')
    setIsModalOpen(true)
  }

  const openEditModal = (macro: EstimateMacro) => {
    setEditingMacro(macro)
    setFormData({
      name: macro.name,
      description: macro.description || '',
      roof_type: macro.roof_type,
      job_type: macro.job_type,
      tags: macro.tags || [],
    })
    setTagsInput((macro.tags || []).join(', '))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMacro(null)
    setFormData(emptyFormData)
    setTagsInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      const url = editingMacro
        ? `/api/macros/${editingMacro.id}`
        : '/api/macros'
      const method = editingMacro ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      showToast(
        editingMacro ? 'Template updated' : 'Template created',
        'success'
      )
      closeModal()
      fetchMacros()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save template',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicate = async (macro: EstimateMacro) => {
    try {
      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${macro.name} (Copy)`,
          description: macro.description,
          roof_type: macro.roof_type,
          job_type: macro.job_type,
          tags: macro.tags,
          is_default: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to duplicate')

      showToast('Template duplicated', 'success')
      fetchMacros()
    } catch (error) {
      showToast('Failed to duplicate template', 'error')
    }
  }

  // Group macros by job type
  const groupedMacros = macros.reduce((acc, macro) => {
    const key = macro.job_type
    if (!acc[key]) acc[key] = []
    acc[key].push(macro)
    return acc
  }, {} as Record<string, EstimateMacro[]>)

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Estimate Templates
          </h1>
          <p className="text-slate-500">
            Pre-built line item bundles for quick estimate creation
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
        >
          Create Template
        </Button>
      </div>
      </FadeInSection>

      <FadeInSection delay={100} animation="slide-up">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Templates</p>
            <p className="text-2xl font-bold text-slate-900">{macros.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">System Templates</p>
            <p className="text-2xl font-bold text-slate-900">
              {macros.filter((m) => m.is_system).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Custom Templates</p>
            <p className="text-2xl font-bold text-slate-900">
              {macros.filter((m) => !m.is_system).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Uses</p>
            <p className="text-2xl font-bold text-slate-900">
              {macros.reduce((sum, m) => sum + m.usage_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>
      </FadeInSection>

      <FadeInSection delay={200} animation="slide-up">
      {/* Templates */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMacros).map(([jobType, items]) => (
            <div key={jobType}>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                {JOB_TYPE_LABELS[jobType as MacroJobType]}
                <span className="text-sm font-normal text-slate-400">
                  ({items.length})
                </span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((macro) => (
                  <Card key={macro.id} className={macro.is_default ? 'ring-2 ring-amber-400' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {macro.name}
                          {macro.is_default && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                        </CardTitle>
                        {macro.is_system && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            System
                          </span>
                        )}
                      </div>
                      {macro.description && (
                        <CardDescription className="line-clamp-2">
                          {macro.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {ROOF_TYPE_LABELS[macro.roof_type]}
                        </span>
                        {macro.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                        <span>
                          {(macro as unknown as Record<string, unknown>).line_items ? ((macro as unknown as Record<string, unknown>).line_items as unknown[]).length : 0} line items
                        </span>
                        <span>{macro.usage_count} uses</span>
                      </div>

                      <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                        {!macro.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleSetDefault(macro.id)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDuplicate(macro)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Button>
                        {!macro.is_system && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => openEditModal(macro)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(macro.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </FadeInSection>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editingMacro ? 'Edit Template' : 'Create Template'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Standard Shingle Replacement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Roof Type
                  </label>
                  <Select
                    value={formData.roof_type}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        roof_type: value as MacroRoofType,
                      })
                    }
                    options={ROOF_TYPE_OPTIONS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Job Type
                  </label>
                  <Select
                    value={formData.job_type}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        job_type: value as MacroJobType,
                      })
                    }
                    options={JOB_TYPE_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Comma-separated tags, e.g., popular, budget"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate tags with commas
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : editingMacro
                      ? 'Update Template'
                      : 'Create Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </AdminPageTransition>
  )
}
