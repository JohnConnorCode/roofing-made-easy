'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart } from '@/components/admin/charts/bar-chart'
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Receipt,
  Hammer,
  Download,
  AlertTriangle,
  ArrowUpRight,
  Users,
  Target,
  Clock,
  Shield,
  Landmark,
  FileCheck,
  Package,
  Crosshair,
} from 'lucide-react'
import Link from 'next/link'

interface ReportSummary {
  currentMonth: {
    revenue: number
    costs: number
    profit: number
    margin: number
    collected: number
  }
  arSummary: {
    totalAR: number
    totalInvoices: number
  }
  activeJobs: number
}

interface FunnelItem {
  status: string
  label: string
  count: number
}

interface FunnelData {
  funnel: FunnelItem[]
  summary: {
    totalLeads: number
    wonCount: number
    conversionRate: number
  }
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [revenueRes, arRes, jobsRes, funnelRes] = await Promise.all([
        fetch('/api/admin/reports/revenue'),
        fetch('/api/admin/reports/ar-aging'),
        fetch('/api/admin/jobs?limit=1'),
        fetch('/api/admin/reports/lead-funnel'),
      ])

      if (!revenueRes.ok) throw new Error('Failed to fetch revenue data')

      const revenueData = await revenueRes.json()
      const arData = arRes.ok ? await arRes.json() : { summary: { totalAR: 0, totalInvoices: 0 } }
      const jobsData = jobsRes.ok ? await jobsRes.json() : { summary: {} }

      const funnelData = funnelRes.ok ? await funnelRes.json() : null

      const activeStatuses = ['in_progress', 'scheduled', 'inspection_pending', 'punch_list']
      const activeJobs = activeStatuses.reduce((sum, s) => sum + ((jobsData.summary || {})[s] || 0), 0)

      setSummary({
        currentMonth: revenueData.currentMonth,
        arSummary: arData.summary,
        activeJobs,
      })
      if (funnelData) setFunnel(funnelData)
    } catch {
      setError('Unable to load report data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Financial overview and business intelligence</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/reports/export?type=jobs" download>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export Jobs
            </Button>
          </a>
          <a href="/api/admin/reports/export?type=invoices" download>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export Invoices
            </Button>
          </a>
        </div>
      </div>

      {error && (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-slate-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchSummary}>
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Revenue MTD</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {isLoading ? '...' : formatCurrency(summary?.currentMonth.revenue || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Gross Margin MTD</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {isLoading ? '...' : `${(summary?.currentMonth.margin || 0).toFixed(1)}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Profit: {isLoading ? '...' : formatCurrency(summary?.currentMonth.profit || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Outstanding AR</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {isLoading ? '...' : formatCurrency(summary?.arSummary.totalAR || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-3">
                    <Receipt className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {summary?.arSummary.totalInvoices || 0} open invoices
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Active Jobs</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {isLoading ? '...' : summary?.activeJobs || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-100 p-3">
                    <Hammer className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Conversion Funnel */}
          {funnel && funnel.funnel.length > 0 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Lead Conversion Funnel
                  </CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{funnel.summary.totalLeads} total leads</p>
                    <p className="text-sm font-medium text-green-600">{funnel.summary.conversionRate}% conversion</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={funnel.funnel.filter(f => f.count > 0).map(f => ({
                    label: f.label,
                    value: f.count,
                  }))}
                  horizontal
                />
              </CardContent>
            </Card>
          )}

          {/* Report Links */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/reports/funnel">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Funnel Analytics</h3>
                        <p className="text-sm text-slate-500">Drop-off rates, time per step, source attribution</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/revenue">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Revenue & Profitability</h3>
                        <p className="text-sm text-slate-500">Monthly revenue, expense breakdown, job-level P&L</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/aging">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <Receipt className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">AR Aging</h3>
                        <p className="text-sm text-slate-500">Aging bucket summary with drill-down invoice table</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/lead-response">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Lead Response</h3>
                        <p className="text-sm text-slate-500">Speed-to-lead metrics and follow-up performance</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/operations">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-100 p-2">
                        <Hammer className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Operations</h3>
                        <p className="text-sm text-slate-500">Schedule adherence, crew productivity, change orders</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/team">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-violet-100 p-2">
                        <Users className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Team Performance</h3>
                        <p className="text-sm text-slate-500">Crew and project manager productivity and revenue</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/insurance-claims">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-rose-100 p-2">
                        <Shield className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Insurance Claims</h3>
                        <p className="text-sm text-slate-500">Claims pipeline, carrier performance, stuck claims</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/financing">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-100 p-2">
                        <Landmark className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Financing</h3>
                        <p className="text-sm text-slate-500">Application pipeline, lender stats, conversion impact</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/estimate-accuracy">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-100 p-2">
                        <Crosshair className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Estimate Accuracy</h3>
                        <p className="text-sm text-slate-500">Estimate vs actual cost variance and trends</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/document-compliance">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-100 p-2">
                        <FileCheck className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Document Compliance</h3>
                        <p className="text-sm text-slate-500">Missing permits, contracts, and expiring documents</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/material-costs">
              <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2">
                        <Package className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">Material Costs</h3>
                        <p className="text-sm text-slate-500">Vendor spend, category breakdown, cost trends</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
