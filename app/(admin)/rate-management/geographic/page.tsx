'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'
import type { GeographicPricing } from '@/lib/supabase/types'
import { Save, Plus, Trash2, MapPin, RefreshCw, Loader2 } from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function GeographicPricingPage() {
  const { showToast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [regions, setRegions] = useState<GeographicPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRegion, setNewRegion] = useState<Partial<GeographicPricing>>({
    state: '',
    name: '',
    material_multiplier: 1.0,
    labor_multiplier: 1.0,
    equipment_multiplier: 1.0,
    zip_codes: [],
    county: null,
    is_active: true,
  })

  useEffect(() => {
    fetchRegions()
  }, [])

  async function fetchRegions() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/geographic-pricing')
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setRegions(data.regions || [])
    } catch (error) {
      showToast('Failed to load geographic pricing', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (region: GeographicPricing) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/geographic-pricing/${region.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: region.name,
          material_multiplier: region.material_multiplier,
          labor_multiplier: region.labor_multiplier,
          equipment_multiplier: region.equipment_multiplier,
          zip_codes: region.zip_codes,
          county: region.county,
          is_active: region.is_active,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')

      showToast('Region updated', 'success')
      setEditingId(null)
    } catch (error) {
      showToast('Failed to update region', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newRegion.state || !newRegion.name) {
      showToast('State and region name are required', 'error')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/geographic-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegion),
      })

      if (!response.ok) throw new Error('Failed to create')

      showToast('Region added', 'success')
      setShowAddForm(false)
      setNewRegion({
        state: '',
        name: '',
        material_multiplier: 1.0,
        labor_multiplier: 1.0,
        equipment_multiplier: 1.0,
        zip_codes: [],
        county: null,
        is_active: true,
      })
      fetchRegions()
    } catch (error) {
      showToast('Failed to add region', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Region',
      description: 'Are you sure you want to delete this geographic pricing region? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/geographic-pricing/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('Region deleted', 'success')
      setRegions((prev) => prev.filter((r) => r.id !== id))
    } catch {
      showToast('Failed to delete region', 'error')
    }
  }

  const updateRegion = (id: string, field: keyof GeographicPricing, value: unknown) => {
    setRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  // Group by state
  const regionsByState = regions.reduce((acc, region) => {
    const state = region.state || 'Other'
    if (!acc[state]) acc[state] = []
    acc[state].push(region)
    return acc
  }, {} as Record<string, GeographicPricing[]>)

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Geographic Pricing
          </h1>
          <p className="text-slate-500">
            Configure regional price multipliers by state, county, or ZIP code
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchRegions}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Region
          </Button>
        </div>
      </div>
      </FadeInSection>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base">Add New Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              <div>
                <label className="text-sm text-slate-600 block mb-1">State</label>
                <select
                  value={newRegion.state || ''}
                  onChange={(e) =>
                    setNewRegion((prev) => ({ ...prev, state: e.target.value }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-600 block mb-1">
                  Region Name
                </label>
                <Input
                  placeholder="e.g., Greater Houston Area"
                  value={newRegion.name}
                  onChange={(e) =>
                    setNewRegion((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">
                  Material ×
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.0"
                  value={newRegion.material_multiplier}
                  onChange={(e) =>
                    setNewRegion((prev) => ({
                      ...prev,
                      material_multiplier: parseFloat(e.target.value) || 1.0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">
                  Labor ×
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.0"
                  value={newRegion.labor_multiplier}
                  onChange={(e) =>
                    setNewRegion((prev) => ({
                      ...prev,
                      labor_multiplier: parseFloat(e.target.value) || 1.0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">
                  Equipment ×
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.0"
                  value={newRegion.equipment_multiplier}
                  onChange={(e) =>
                    setNewRegion((prev) => ({
                      ...prev,
                      equipment_multiplier: parseFloat(e.target.value) || 1.0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAdd}
                disabled={isSaving}
                leftIcon={isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              >
                Add Region
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <FadeInSection delay={100} animation="slide-up">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Regions</p>
            <p className="text-2xl font-bold text-slate-900">{regions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">States Covered</p>
            <p className="text-2xl font-bold text-slate-900">
              {Object.keys(regionsByState).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Avg Material ×</p>
            <p className="text-2xl font-bold text-slate-900">
              {regions.length > 0
                ? (
                    regions.reduce((sum, r) => sum + r.material_multiplier, 0) /
                    regions.length
                  ).toFixed(2)
                : '1.00'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Avg Labor ×</p>
            <p className="text-2xl font-bold text-slate-900">
              {regions.length > 0
                ? (
                    regions.reduce((sum, r) => sum + r.labor_multiplier, 0) /
                    regions.length
                  ).toFixed(2)
                : '1.00'}
            </p>
          </CardContent>
        </Card>
      </div>
      </FadeInSection>

      <FadeInSection delay={200} animation="slide-up">
      {/* Regions by State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : Object.keys(regionsByState).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No geographic pricing regions configured</p>
            <p className="text-sm text-slate-400 mb-4">
              Add regions to apply location-based pricing multipliers
            </p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Add First Region
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(regionsByState)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([state, stateRegions]) => (
              <Card key={state}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {state}
                    <span className="text-sm font-normal text-slate-400">
                      ({stateRegions.length} region{stateRegions.length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                          <th className="py-2 px-4 text-left font-medium">Region</th>
                          <th className="py-2 px-4 text-center font-medium">Material ×</th>
                          <th className="py-2 px-4 text-center font-medium">Labor ×</th>
                          <th className="py-2 px-4 text-center font-medium">Equipment ×</th>
                          <th className="py-2 px-4 text-left font-medium">ZIP Codes</th>
                          <th className="py-2 px-4 text-left font-medium">Counties</th>
                          <th className="py-2 px-4 text-center font-medium">Active</th>
                          <th className="py-2 px-4 text-center font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateRegions.map((region) => {
                          const isEditing = editingId === region.id
                          return (
                            <tr
                              key={region.id}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <Input
                                    value={region.name}
                                    onChange={(e) =>
                                      updateRegion(region.id, 'name', e.target.value)
                                    }
                                    className="w-full"
                                  />
                                ) : (
                                  <span className="font-medium">{region.name}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.5"
                                    max="2.0"
                                    value={region.material_multiplier}
                                    onChange={(e) =>
                                      updateRegion(
                                        region.id,
                                        'material_multiplier',
                                        parseFloat(e.target.value) || 1.0
                                      )
                                    }
                                    className="w-20 text-center"
                                  />
                                ) : (
                                  <span
                                    className={
                                      region.material_multiplier > 1
                                        ? 'text-red-600'
                                        : region.material_multiplier < 1
                                        ? 'text-green-600'
                                        : ''
                                    }
                                  >
                                    {region.material_multiplier.toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.5"
                                    max="2.0"
                                    value={region.labor_multiplier}
                                    onChange={(e) =>
                                      updateRegion(
                                        region.id,
                                        'labor_multiplier',
                                        parseFloat(e.target.value) || 1.0
                                      )
                                    }
                                    className="w-20 text-center"
                                  />
                                ) : (
                                  <span
                                    className={
                                      region.labor_multiplier > 1
                                        ? 'text-red-600'
                                        : region.labor_multiplier < 1
                                        ? 'text-green-600'
                                        : ''
                                    }
                                  >
                                    {region.labor_multiplier.toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.5"
                                    max="2.0"
                                    value={region.equipment_multiplier}
                                    onChange={(e) =>
                                      updateRegion(
                                        region.id,
                                        'equipment_multiplier',
                                        parseFloat(e.target.value) || 1.0
                                      )
                                    }
                                    className="w-20 text-center"
                                  />
                                ) : (
                                  <span
                                    className={
                                      region.equipment_multiplier > 1
                                        ? 'text-red-600'
                                        : region.equipment_multiplier < 1
                                        ? 'text-green-600'
                                        : ''
                                    }
                                  >
                                    {region.equipment_multiplier.toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-slate-600">
                                  {region.zip_codes?.length
                                    ? region.zip_codes.slice(0, 3).join(', ') +
                                      (region.zip_codes.length > 3
                                        ? ` +${region.zip_codes.length - 3} more`
                                        : '')
                                    : '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-slate-600">
                                  {region.county || '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isEditing ? (
                                  <input
                                    type="checkbox"
                                    checked={region.is_active}
                                    onChange={(e) =>
                                      updateRegion(region.id, 'is_active', e.target.checked)
                                    }
                                    className="h-4 w-4"
                                  />
                                ) : (
                                  <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                      region.is_active ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1">
                                  {isEditing ? (
                                    <>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleUpdate(region)}
                                        disabled={isSaving}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingId(null)
                                          fetchRegions() // Reset
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingId(region.id)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => handleDelete(region.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
      </FadeInSection>
      <ConfirmDialog />
    </AdminPageTransition>
  )
}
