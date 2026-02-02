'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { EstimateLineItem, LineItemCategory, UnitType } from '@/lib/supabase/types'
import { formatCurrency, formatQuantity } from '@/lib/estimation/detailed-engine'
import { cn } from '@/lib/utils'

interface LineItemTableProps {
  lineItems: EstimateLineItem[]
  onToggleInclude?: (id: string, included: boolean) => void
  onQuantityChange?: (id: string, quantity: number) => void
  onRemove?: (id: string) => void
  editable?: boolean
  showCosts?: boolean
  groupBy?: 'category' | 'group_name' | 'none'
  className?: string
}

const CATEGORY_LABELS: Record<LineItemCategory, string> = {
  tear_off: 'Tear-Off',
  underlayment: 'Underlayment',
  shingles: 'Shingles',
  metal_roofing: 'Metal Roofing',
  tile_roofing: 'Tile Roofing',
  flat_roofing: 'Flat Roofing',
  flashing: 'Flashing',
  ventilation: 'Ventilation',
  gutters: 'Gutters',
  skylights: 'Skylights',
  chimneys: 'Chimneys',
  decking: 'Decking',
  insulation: 'Insulation',
  labor: 'Labor',
  equipment: 'Equipment',
  disposal: 'Disposal',
  permits: 'Permits',
  miscellaneous: 'Miscellaneous',
}

const CATEGORY_ORDER: LineItemCategory[] = [
  'tear_off',
  'underlayment',
  'shingles',
  'metal_roofing',
  'tile_roofing',
  'flat_roofing',
  'flashing',
  'ventilation',
  'skylights',
  'chimneys',
  'decking',
  'gutters',
  'labor',
  'equipment',
  'disposal',
  'permits',
  'miscellaneous',
  'insulation',
]

function LineItemRow({
  item,
  editable,
  showCosts,
  onToggleInclude,
  onQuantityChange,
  onRemove,
}: {
  item: EstimateLineItem
  editable?: boolean
  showCosts?: boolean
  onToggleInclude?: (id: string, included: boolean) => void
  onQuantityChange?: (id: string, quantity: number) => void
  onRemove?: (id: string) => void
}) {
  const [editingQty, setEditingQty] = useState(false)
  const [tempQty, setTempQty] = useState(item.quantity.toString())

  const handleQtySubmit = () => {
    const newQty = parseFloat(tempQty)
    if (!isNaN(newQty) && newQty >= 0 && onQuantityChange) {
      onQuantityChange(item.id, newQty)
    }
    setEditingQty(false)
  }

  return (
    <tr
      className={cn(
        'border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors',
        !item.is_included && 'opacity-50'
      )}
    >
      {/* Include checkbox */}
      {editable && (
        <td className="py-3 px-2">
          <Checkbox
            checked={item.is_included}
            onChange={(e) =>
              onToggleInclude?.(item.id, e.target.checked)
            }
          />
        </td>
      )}

      {/* Item code */}
      <td className="py-3 px-2">
        <span className="text-xs font-mono text-slate-500">{item.item_code}</span>
      </td>

      {/* Name */}
      <td className="py-3 px-2">
        <div>
          <span className="text-slate-200">{item.name}</span>
          {item.is_optional && (
            <span className="ml-2 text-xs text-[#c9a25c]">(Optional)</span>
          )}
          {item.notes && (
            <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
          )}
        </div>
      </td>

      {/* Quantity */}
      <td className="py-3 px-2 text-right">
        {editable && editingQty ? (
          <div className="flex items-center gap-1 justify-end">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={tempQty}
              onChange={(e) => setTempQty(e.target.value)}
              onBlur={handleQtySubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleQtySubmit()}
              className="w-20 h-7 text-sm text-right"
              autoFocus
            />
          </div>
        ) : (
          <button
            className={cn(
              'text-slate-200 hover:text-[#c9a25c] transition-colors',
              editable && 'cursor-pointer underline decoration-dotted'
            )}
            onClick={() => editable && setEditingQty(true)}
            disabled={!editable}
          >
            {formatQuantity(item.quantity_with_waste, item.unit_type as UnitType)}
          </button>
        )}
        {item.waste_factor > 1 && (
          <span className="text-xs text-slate-500 block">
            ({item.quantity.toFixed(2)} + {((item.waste_factor - 1) * 100).toFixed(0)}% waste)
          </span>
        )}
      </td>

      {/* Unit costs */}
      {showCosts && (
        <>
          <td className="py-3 px-2 text-right text-slate-400 text-sm">
            {formatCurrency(item.material_unit_cost)}
          </td>
          <td className="py-3 px-2 text-right text-slate-400 text-sm">
            {formatCurrency(item.labor_unit_cost)}
          </td>
        </>
      )}

      {/* Line total */}
      <td className="py-3 px-2 text-right font-medium text-slate-100">
        {formatCurrency(item.line_total)}
      </td>

      {/* Actions */}
      {editable && (
        <td className="py-3 px-2 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
            onClick={() => onRemove?.(item.id)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </td>
      )}
    </tr>
  )
}

function GroupHeader({ title, total }: { title: string; total: number }) {
  return (
    <tr className="bg-slate-800/50">
      <td
        colSpan={10}
        className="py-2 px-4 text-sm font-semibold text-[#c9a25c]"
      >
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-slate-300">{formatCurrency(total)}</span>
        </div>
      </td>
    </tr>
  )
}

export function LineItemTable({
  lineItems,
  onToggleInclude,
  onQuantityChange,
  onRemove,
  editable = false,
  showCosts = true,
  groupBy = 'category',
  className,
}: LineItemTableProps) {
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'total'>('order')
  const [sortAsc, setSortAsc] = useState(true)

  // Group and sort items
  const groupedItems = useMemo(() => {
    let items = [...lineItems]

    // Sort
    if (sortBy === 'name') {
      items.sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      )
    } else if (sortBy === 'total') {
      items.sort((a, b) =>
        sortAsc ? a.line_total - b.line_total : b.line_total - a.line_total
      )
    } else {
      items.sort((a, b) =>
        sortAsc ? a.sort_order - b.sort_order : b.sort_order - a.sort_order
      )
    }

    // Group
    if (groupBy === 'none') {
      return new Map([['All Items', items]])
    }

    const groups = new Map<string, EstimateLineItem[]>()

    if (groupBy === 'group_name') {
      for (const item of items) {
        const key = item.group_name || 'Other'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(item)
      }
    } else {
      // Group by category in predefined order
      for (const category of CATEGORY_ORDER) {
        const categoryItems = items.filter((i) => i.category === category)
        if (categoryItems.length > 0) {
          groups.set(CATEGORY_LABELS[category], categoryItems)
        }
      }
    }

    return groups
  }, [lineItems, groupBy, sortBy, sortAsc])

  const handleSort = (column: 'order' | 'name' | 'total') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(column)
      setSortAsc(true)
    }
  }

  const includedTotal = lineItems
    .filter((li) => li.is_included)
    .reduce((sum, li) => sum + li.line_total, 0)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Line Items</CardTitle>
        <div className="text-right">
          <p className="text-sm text-slate-400">Included Total</p>
          <p className="text-xl font-bold text-[#c9a25c]">
            {formatCurrency(includedTotal)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/30 text-sm text-slate-400">
                {editable && <th className="py-2 px-2 w-10" />}
                <th className="py-2 px-2 text-left w-20">Code</th>
                <th
                  className="py-2 px-2 text-left cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('name')}
                >
                  Item {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-2 text-right cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('order')}
                >
                  Qty {sortBy === 'order' && (sortAsc ? '↑' : '↓')}
                </th>
                {showCosts && (
                  <>
                    <th className="py-2 px-2 text-right">Material</th>
                    <th className="py-2 px-2 text-right">Labor</th>
                  </>
                )}
                <th
                  className="py-2 px-2 text-right cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('total')}
                >
                  Total {sortBy === 'total' && (sortAsc ? '↑' : '↓')}
                </th>
                {editable && <th className="py-2 px-2 w-10" />}
              </tr>
            </thead>
            <tbody>
              {Array.from(groupedItems.entries()).map(([group, items]) => (
                <Fragment key={group}>
                  {groupBy !== 'none' && (
                    <GroupHeader
                      title={group}
                      total={items
                        .filter((i) => i.is_included)
                        .reduce((sum, i) => sum + i.line_total, 0)}
                    />
                  )}
                  {items.map((item) => (
                    <LineItemRow
                      key={item.id}
                      item={item}
                      editable={editable}
                      showCosts={showCosts}
                      onToggleInclude={onToggleInclude}
                      onQuantityChange={onQuantityChange}
                      onRemove={onRemove}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {lineItems.length === 0 && (
          <div className="py-8 text-center text-slate-400">
            No line items added yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Need to import Fragment
import { Fragment } from 'react'
