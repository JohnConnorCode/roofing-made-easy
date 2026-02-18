'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  DollarSign,
  Hammer,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

interface TeamStats {
  id: string
  name: string
  color: string
  totalJobs: number
  activeJobs: number
  completedJobs: number
  revenue: number
  costs: number
  collected: number
}

interface PMStats {
  id: string
  name: string
  totalJobs: number
  revenue: number
  completedJobs: number
}

interface TeamPerformanceData {
  teams: TeamStats[]
  projectManagers: PMStats[]
}

export default function TeamPerformancePage() {
  const [data, setData] = useState<TeamPerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/team-performance')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load team performance data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalRevenue = data?.teams.reduce((sum, t) => sum + t.revenue, 0) || 0
  const totalJobs = data?.teams.reduce((sum, t) => sum + t.totalJobs, 0) || 0
  const totalActive = data?.teams.reduce((sum, t) => sum + t.activeJobs, 0) || 0
  const topTeam = data?.teams[0]
  const maxRevenue = Math.max(...(data?.teams.map(t => t.revenue) || [1]))

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Performance</h1>
          <p className="text-slate-500">Crew and project manager productivity and profitability</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
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
                    <p className="text-sm text-slate-500">Total Teams</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : data?.teams.length || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Top Team</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : topTeam?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {topTeam ? formatCurrency(topTeam.revenue) : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Active Jobs</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? '...' : totalActive}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Hammer className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">{totalJobs} total jobs</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {isLoading ? '...' : formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Team Chart */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Revenue by Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.teams && data.teams.length > 0 ? (
                <div className="space-y-3">
                  {data.teams.map(team => {
                    const width = maxRevenue > 0 ? (team.revenue / maxRevenue) * 100 : 0
                    return (
                      <div key={team.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{team.name}</span>
                          <span className="text-sm font-semibold text-slate-900">{formatCurrency(team.revenue)}</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${width}%`,
                              backgroundColor: team.color || '#3b82f6',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No team data yet</div>
              )}
            </CardContent>
          </Card>

          {/* Team Breakdown Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.teams && data.teams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Team</th>
                        <th className="pb-3 pr-4 text-right">Jobs</th>
                        <th className="pb-3 pr-4 text-right">Active</th>
                        <th className="pb-3 pr-4 text-right">Completed</th>
                        <th className="pb-3 pr-4 text-right">Revenue</th>
                        <th className="pb-3 pr-4 text-right">Costs</th>
                        <th className="pb-3 pr-4 text-right">Margin</th>
                        <th className="pb-3 text-right">Collected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.teams.map(team => {
                        const margin = team.revenue > 0
                          ? Math.round(((team.revenue - team.costs) / team.revenue) * 100)
                          : 0
                        return (
                          <tr key={team.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: team.color || '#94a3b8' }}
                                />
                                <span className="font-medium text-slate-700">{team.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right text-slate-600">{team.totalJobs}</td>
                            <td className="py-3 pr-4 text-right text-slate-600">{team.activeJobs}</td>
                            <td className="py-3 pr-4 text-right text-slate-600">{team.completedJobs}</td>
                            <td className="py-3 pr-4 text-right font-medium text-slate-900">{formatCurrency(team.revenue)}</td>
                            <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(team.costs)}</td>
                            <td className="py-3 pr-4 text-right">
                              <span className={`font-medium ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                                {margin}%
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-600">{formatCurrency(team.collected)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No team data yet</div>
              )}
            </CardContent>
          </Card>

          {/* PM Breakdown Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Project Manager Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.projectManagers && data.projectManagers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4 text-right">Total Jobs</th>
                        <th className="pb-3 pr-4 text-right">Revenue</th>
                        <th className="pb-3 text-right">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projectManagers.map(pm => (
                        <tr key={pm.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{pm.name || 'Unassigned'}</td>
                          <td className="py-3 pr-4 text-right text-slate-600">{pm.totalJobs}</td>
                          <td className="py-3 pr-4 text-right font-medium text-slate-900">{formatCurrency(pm.revenue)}</td>
                          <td className="py-3 text-right text-slate-600">{pm.completedJobs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No project manager data yet</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminPageTransition>
  )
}
