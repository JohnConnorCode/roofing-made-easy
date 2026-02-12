'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Save, RotateCcw } from 'lucide-react'

interface PricingRule {
  id: string
  rule_key: string
  rule_category: string
  display_name: string
  description: string | null
  base_rate: number | null
  unit: string
  multiplier: number
  flat_fee: number
  is_active: boolean
}

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [originalRules, setOriginalRules] = useState<PricingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch('/api/pricing')
        const data = await response.json()
        if (data.rules) {
          setRules(data.rules)
          setOriginalRules(JSON.parse(JSON.stringify(data.rules)))
        }
      } catch {
        // Failed to fetch pricing rules
      } finally {
        setIsLoading(false)
      }
    }

    fetchRules()
  }, [])

  const handleRuleChange = (
    id: string,
    field: keyof PricingRule,
    value: string | number | boolean
  ) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const rule of rules) {
        const original = originalRules.find((r) => r.id === rule.id)
        if (JSON.stringify(rule) !== JSON.stringify(original)) {
          await fetch('/api/pricing', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: rule.id,
              base_rate: rule.base_rate,
              multiplier: rule.multiplier,
              flat_fee: rule.flat_fee,
              is_active: rule.is_active,
            }),
          })
        }
      }
      setOriginalRules(JSON.parse(JSON.stringify(rules)))
      setHasChanges(false)
    } catch {
      // Failed to save pricing rules
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setRules(JSON.parse(JSON.stringify(originalRules)))
    setHasChanges(false)
  }

  const categories = [...new Set(rules.map((r) => r.rule_category))]

  if (isLoading) {
    return <div className="text-slate-500">Loading pricing rules...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Rules</h1>
          <p className="text-slate-500">Configure base rates, multipliers, and fees</p>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">
              {category.replace('_', ' ')} Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-slate-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Base Rate</th>
                    <th className="pb-3 pr-4">Multiplier</th>
                    <th className="pb-3 pr-4">Flat Fee</th>
                    <th className="pb-3">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rules
                    .filter((r) => r.rule_category === category)
                    .map((rule) => (
                      <tr key={rule.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium">{rule.display_name}</p>
                            {rule.description && (
                              <p className="text-sm text-slate-500">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {rule.base_rate !== null ? (
                            <Input
                              type="number"
                              value={rule.base_rate}
                              onChange={(e) =>
                                handleRuleChange(
                                  rule.id,
                                  'base_rate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-28"
                              step="0.01"
                            />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Input
                            type="number"
                            value={rule.multiplier}
                            onChange={(e) =>
                              handleRuleChange(
                                rule.id,
                                'multiplier',
                                parseFloat(e.target.value) || 1
                              )
                            }
                            className="w-24"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <Input
                            type="number"
                            value={rule.flat_fee}
                            onChange={(e) =>
                              handleRuleChange(
                                rule.id,
                                'flat_fee',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-28"
                            step="0.01"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={rule.is_active}
                            onChange={(e) =>
                              handleRuleChange(rule.id, 'is_active', e.target.checked)
                            }
                            className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
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
  )
}
