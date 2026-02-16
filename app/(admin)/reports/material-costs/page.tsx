'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart } from '@/components/admin/charts/bar-chart'
import { DonutChart } from '@/components/admin/charts/donut-chart'
import {
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react'

const categoryLabels: Record<string, string> = {
  materials: 'Materials',
  labor: 'Labor',
  subcontractor: 'Subcontractor',
  permit: 'Permits',
  equipment: 'Equipment',
  disposal: 'Disposal',
  other: 'Other',
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface MaterialCostsData {
  period: { days: number; since: string }
  summary: {
    totalMaterialCost: number
    totalExpenses: number
    materialPctOfTotal: number
    uniqueVendors: number
    avgCostPerJob: number
  }
  byVendor: Array<{
    vendor: string
    totalAmount: number
    expenseCount: number
    avgPerExpense: number
    jobCount: number
  }>
  byCategory: Array<{
    category: string
    totalAmount: number
    expenseCount: number
    pctOfTotal: number
  }>
  monthlyTrend: Array<{
    month: string
    materialCost: number
    laborCost: number
    subcontractorCost: number
    otherCost: number
    totalCost: number
  }>
  topExpenses: Array<{
    description: string
    vendor: string
    amount: number
    category: string
    jobNumber: string
    date: string
  }>
}

export default function MaterialCostsPage() {
  const [data, setData] = useState<MaterialCostsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(180)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports/material-costs?days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load material costs data.')
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Material & Supplier Costs</h1>
          <p className="text-slate-500">Vendor spend, category breakdown, and cost trends</p>
        </div>
        <div className="flex items-center gap-2">
          {[30, 60, 90, 180, 365].map(d => (
            <Button
              key={d}
              variant={days === d ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Material Cost</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : formatCurrency(data?.summary.totalMaterialCost || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Material % of Total</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : `${data?.summary.materialPctOfTotal || 0}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Unique Vendors</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.summary.uniqueVendors || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg Cost / Job</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : formatCurrency(data?.summary.avgCostPerJob || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Cost Trend */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Cost Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.monthlyTrend && data.monthlyTrend.length > 0 ? (
                  <BarChart
                    data={data.monthlyTrend.map(m => ({
                      label: m.month,
                      value: m.totalCost,
                    }))}
                    formatValue={formatCurrency}
                  />
                ) : (
                  <div className="py-8 text-center text-slate-400">No trend data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-400">Loading...</div>
                ) : data?.byCategory && data.byCategory.length > 0 ? (
                  <DonutChart
                    data={data.byCategory.map(c => ({
                      label: categoryLabels[c.category] || titleCase(c.category),
                      value: c.totalAmount,
                    }))}
                    formatValue={formatCurrency}
                    centerLabel="Total"
                    centerValue={formatCurrency(data.summary.totalExpenses)}
                  />
                ) : (
                  <div className="py-8 text-center text-slate-400">No category data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vendor Breakdown Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Vendor Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.byVendor && data.byVendor.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Vendor</th>
                        <th className="pb-3 pr-4 text-right">Total Spend</th>
                        <th className="pb-3 pr-4 text-right">Expenses</th>
                        <th className="pb-3 pr-4 text-right">Avg/Expense</th>
                        <th className="pb-3 text-right">Jobs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byVendor.map(v => (
                        <tr key={v.vendor} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{v.vendor}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(v.totalAmount)}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{v.expenseCount}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(v.avgPerExpense)}</td>
                          <td className="py-3 text-right text-slate-600">{v.jobCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No vendor data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Top 20 Expenses Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                Top 20 Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.topExpenses && data.topExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Description</th>
                        <th className="pb-3 pr-4">Vendor</th>
                        <th className="pb-3 pr-4 text-right">Amount</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Job #</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topExpenses.map((e, idx) => (
                        <tr key={`${e.jobNumber}-${e.vendor}-${e.amount}-${idx}`} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 text-slate-700 max-w-[200px] truncate">{e.description}</td>
                          <td className="py-3 pr-4 text-slate-600">{e.vendor}</td>
                          <td className="py-3 pr-4 text-right font-medium text-slate-900">{formatCurrency(e.amount)}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{categoryLabels[e.category] || titleCase(e.category)}</span>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{e.jobNumber}</td>
                          <td className="py-3 text-slate-600">{e.date ? new Date(e.date + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No expense data yet</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
