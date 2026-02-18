'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/estimation/detailed-engine'
import { Search, Plus, Edit2, Trash2, Package, X } from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

type LineItemCategory =
  | 'tear_off' | 'underlayment' | 'shingles' | 'metal_roofing' | 'tile_roofing'
  | 'flat_roofing' | 'flashing' | 'ventilation' | 'gutters' | 'skylights'
  | 'chimneys' | 'decking' | 'insulation' | 'labor' | 'equipment' | 'disposal'
  | 'permits' | 'miscellaneous'

interface LineItem {
  id: string
  item_code: string
  name: string
  description: string | null
  category: LineItemCategory
  unit_type: string
  base_material_cost: number
  base_labor_cost: number
  base_equipment_cost: number
  quantity_formula: string | null
  default_waste_factor: number
  is_active: boolean
  is_taxable: boolean
  sort_order: number
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

const CATEGORY_OPTIONS: { value: LineItemCategory; label: string }[] = [
  { value: 'tear_off', label: 'Tear-Off' },
  { value: 'underlayment', label: 'Underlayment' },
  { value: 'shingles', label: 'Shingles' },
  { value: 'metal_roofing', label: 'Metal Roofing' },
  { value: 'tile_roofing', label: 'Tile Roofing' },
  { value: 'flat_roofing', label: 'Flat Roofing' },
  { value: 'flashing', label: 'Flashing' },
  { value: 'ventilation', label: 'Ventilation' },
  { value: 'gutters', label: 'Gutters' },
  { value: 'skylights', label: 'Skylights' },
  { value: 'chimneys', label: 'Chimneys' },
  { value: 'decking', label: 'Decking' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'disposal', label: 'Disposal' },
  { value: 'permits', label: 'Permits' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

const UNIT_TYPE_OPTIONS = [
  { value: 'SQ', label: 'SQ (Square)' },
  { value: 'SF', label: 'SF (Sq. Foot)' },
  { value: 'LF', label: 'LF (Linear Foot)' },
  { value: 'EA', label: 'EA (Each)' },
  { value: 'HR', label: 'HR (Hour)' },
  { value: 'DAY', label: 'DAY' },
  { value: 'TON', label: 'TON' },
  { value: 'GAL', label: 'GAL (Gallon)' },
  { value: 'BDL', label: 'BDL (Bundle)' },
  { value: 'RL', label: 'RL (Roll)' },
]

type LineItemFormData = {
  item_code: string
  name: string
  description: string
  category: LineItemCategory
  unit_type: string
  base_material_cost: number
  base_labor_cost: number
  base_equipment_cost: number
}

const emptyFormData: LineItemFormData = {
  item_code: '',
  name: '',
  description: '',
  category: 'shingles',
  unit_type: 'SQ',
  base_material_cost: 0,
  base_labor_cost: 0,
  base_equipment_cost: 0,
}

export default function LineItemsPage() {
  const { showToast } = useToast()
  const { confirm } = useConfirmDialog()
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LineItem | null>(null)
  const [formData, setFormData] = useState<LineItemFormData>(emptyFormData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchLineItems()
  }, [categoryFilter])

  async function fetchLineItems() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter && categoryFilter !== 'all') {
        params.set('category', categoryFilter)
      }

      const response = await fetch(`/api/line-items?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setLineItems(data.lineItems || [])
    } catch (error) {
      showToast('Failed to load line items', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = lineItems.filter((item) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.item_code.toLowerCase().includes(searchLower) ||
      (item.description?.toLowerCase().includes(searchLower) ?? false)
    )
  })

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData(emptyFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (item: LineItem) => {
    setEditingItem(item)
    setFormData({
      item_code: item.item_code,
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit_type: item.unit_type,
      base_material_cost: item.base_material_cost,
      base_labor_cost: item.base_labor_cost,
      base_equipment_cost: item.base_equipment_cost,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData(emptyFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingItem
        ? `/api/line-items/${editingItem.id}`
        : '/api/line-items'
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      showToast(
        editingItem ? 'Line item updated' : 'Line item created',
        'success'
      )
      closeModal()
      fetchLineItems()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save line item',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (item: LineItem) => {
    const confirmed = await confirm({
      title: 'Delete Line Item?',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/line-items/${item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('Line item deleted', 'success')
      fetchLineItems()
    } catch (error) {
      showToast('Failed to delete line item', 'error')
    }
  }

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, LineItem[]>)

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Line Items</h1>
          <p className="text-slate-500">
            Manage your roofing line item catalog ({lineItems.length} items)
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreateModal}
        >
          Add Line Item
        </Button>
      </div>
      </FadeInSection>

      <FadeInSection delay={100} animation="slide-up">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, code, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-48"
              options={[
                { value: 'all', label: 'All Categories' },
                ...CATEGORY_OPTIONS.map((cat) => ({
                  value: cat.value,
                  label: cat.label,
                })),
              ]}
            />
          </div>
        </CardContent>
      </Card>
      </FadeInSection>

      <FadeInSection delay={200} animation="slide-up">
      {/* Line Items Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No line items found</p>
            <p className="text-sm text-slate-400">
              {search || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first line item to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-normal text-slate-500">
                    {items.length} items
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                        <th className="py-2 px-4 text-left font-medium">Code</th>
                        <th className="py-2 px-4 text-left font-medium">Name</th>
                        <th className="py-2 px-4 text-center font-medium">Unit</th>
                        <th className="py-2 px-4 text-right font-medium">Material</th>
                        <th className="py-2 px-4 text-right font-medium">Labor</th>
                        <th className="py-2 px-4 text-right font-medium">Equipment</th>
                        <th className="py-2 px-4 text-right font-medium">Total</th>
                        <th className="py-2 px-4 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-slate-600">
                              {item.item_code}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                              {item.unit_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {formatCurrency(item.base_material_cost)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {formatCurrency(item.base_labor_cost)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {formatCurrency(item.base_equipment_cost)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(
                              item.base_material_cost +
                                item.base_labor_cost +
                                item.base_equipment_cost
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openEditModal(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
              {editingItem ? 'Edit Line Item' : 'Add Line Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Item Code *
                  </label>
                  <Input
                    value={formData.item_code}
                    onChange={(e) =>
                      setFormData({ ...formData, item_code: e.target.value })
                    }
                    placeholder="e.g., SHG-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as LineItemCategory,
                      })
                    }
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., 30-Year Architectural Shingles"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Type *
                </label>
                <Select
                  value={formData.unit_type}
                  onChange={(value) =>
                    setFormData({ ...formData, unit_type: value })
                  }
                  options={UNIT_TYPE_OPTIONS}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Material Cost
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_material_cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_material_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Labor Cost
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_labor_cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_labor_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Equipment Cost
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_equipment_cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_equipment_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
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
                    : editingItem
                      ? 'Update Item'
                      : 'Create Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageTransition>
  )
}
