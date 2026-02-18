'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { BarChart } from '@/components/admin/charts/bar-chart'
import { DonutChart } from '@/components/admin/charts/donut-chart'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface MonthlySummary {
  month: string
  total_jobs: number
  total_revenue: number
  total_material_cost: number
  total_labor_cost: number
  gross_profit: number
  gross_margin_pct: number
  total_collected: number
}

interface TeamRevenue {
  name: string
  color: string
  revenue: number
  cost: number
  jobs: number
}

interface JobProfit {
  id: string
  job_number: string
  status: string
  contract_amount: number
  total_cost: number
  profit: number
  margin: number
  team: string | null
  location: string | null
}

export default function RevenueReportPage() {
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [teamRevenue, setTeamRevenue] = useState<TeamRevenue[]>([])
  const [profitability, setProfitability] = useState<{
    jobs: JobProfit[]
    expenseBreakdown: Record<string, number>
    summary: { totalRevenue: number; totalCosts: number; totalProfit: number; avgMargin: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [revenueRes, profitRes] = await Promise.all([
        fetch('/api/admin/reports/revenue?months=12'),
        fetch('/api/admin/reports/profitability'),
      ])

      if (!revenueRes.ok) throw new Error('Failed to fetch revenue data')

      const revenueData = await revenueRes.json()
      setMonthlySummary(revenueData.monthlySummary || [])
      setTeamRevenue(revenueData.teamRevenue || [])

      if (profitRes.ok) {
        const profitData = await profitRes.json()
        setProfitability(profitData)
      }
    } catch (err) {
      setError('Unable to load report data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const monthlyChartData = [...monthlySummary].reverse().slice(-6).map((m) => ({
    label: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
    value: m.total_revenue,
  }))

  const expenseChartData = profitability?.expenseBreakdown
    ? Object.entries(profitability.expenseBreakdown)
        .filter(([, value]) => value > 0)
        .map(([category, value]) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value,
        }))
    : []

  return (
    <AdminPageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue & Profitability</h1>
            <p className="text-slate-500">Monthly trends, team performance, and expense analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/reports/export?type=jobs" download>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export CSV
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {!error && isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {!error && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(profitability?.summary.totalRevenue || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Total Costs</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(profitability?.summary.totalCosts || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Gross Profit</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(profitability?.summary.totalProfit || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Avg Margin</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profitability?.summary.avgMargin || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Revenue (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={monthlyChartData}
                  height={220}
                  formatValue={(v) => formatCurrency(v)}
                />
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={expenseChartData}
                  formatValue={(v) => formatCurrency(v)}
                  centerValue={formatCurrency(profitability?.summary.totalCosts || 0)}
                  centerLabel="Total"
                />
              </CardContent>
            </Card>
          </div>

          {/* Team Revenue */}
          {teamRevenue.length > 0 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Revenue by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={teamRevenue.map((t) => ({
                    label: t.name,
                    value: t.revenue,
                    color: t.color,
                  }))}
                  height={180}
                  formatValue={(v) => formatCurrency(v)}
                  horizontal
                />
              </CardContent>
            </Card>
          )}

          {/* Job P&L Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Job-Level Profitability</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-slate-500">
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-right">Cost</th>
                      <th className="px-4 py-3 text-right">Profit</th>
                      <th className="px-4 py-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(profitability?.jobs || []).slice(0, 20).map((job) => (
                      <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-gold hover:underline">
                            {job.job_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                          {job.status.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{job.team || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(job.contract_amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(job.total_cost)}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${job.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(job.profit)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right ${job.margin >= 20 ? 'text-green-600' : job.margin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {job.margin}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminPageTransition>
  )
}
