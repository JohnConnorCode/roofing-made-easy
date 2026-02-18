'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart } from '@/components/admin/charts/bar-chart'
import {
  FileCheck,
  AlertTriangle,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface DocumentComplianceData {
  summary: {
    totalActiveJobs: number
    fullyCompliantJobs: number
    complianceRate: number
    jobsMissingContract: number
    jobsMissingPermit: number
    jobsMissingInsuranceCert: number
    expiredDocumentCount: number
  }
  nonCompliantJobs: Array<{
    jobId: string
    jobNumber: string
    address: string
    status: string
    missingDocs: string[]
    expiredDocs: string[]
  }>
  documentCoverage: Array<{
    docType: string
    jobsWithDoc: number
    applicableJobs: number
    coverageRate: number
  }>
  expiringDocuments: Array<{
    jobNumber: string
    docType: string
    expirationDate: string
    daysLeft: number
  }>
}

const docTypeLabels: Record<string, string> = {
  contract: 'Contract',
  permit: 'Permit',
  insurance_cert: 'Insurance Cert',
  inspection_report: 'Inspection Report',
  warranty_cert: 'Warranty Cert',
  photo: 'Photos',
}

export default function DocumentCompliancePage() {
  const [data, setData] = useState<DocumentComplianceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/reports/document-compliance')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch {
      setError('Unable to load document compliance data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const complianceRate = data?.summary.complianceRate || 0
  const complianceColor = complianceRate >= 80 ? 'bg-green-500' : complianceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const complianceTextColor = complianceRate >= 80 ? 'text-green-600' : complianceRate >= 60 ? 'text-amber-600' : 'text-red-600'

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Compliance</h1>
          <p className="text-slate-500">Missing documents, permits, and expiring certifications</p>
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
                    <p className="text-sm text-slate-500">Compliance Rate</p>
                    <p className={`text-2xl font-bold ${complianceTextColor}`}>
                      {isLoading ? '...' : `${complianceRate}%`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-100 p-2">
                    <FileCheck className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.summary.fullyCompliantJobs || 0} of {data?.summary.totalActiveJobs || 0} jobs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Missing Contracts</p>
                    <p className={`text-2xl font-bold ${
                      (data?.summary.jobsMissingContract || 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : data?.summary.jobsMissingContract || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-100 p-2">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Missing Permits</p>
                    <p className={`text-2xl font-bold ${
                      (data?.summary.jobsMissingPermit || 0) > 0 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : data?.summary.jobsMissingPermit || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Expired Docs</p>
                    <p className={`text-2xl font-bold ${
                      (data?.summary.expiredDocumentCount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : data?.summary.expiredDocumentCount || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-100 p-2">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {data?.expiringDocuments?.length || 0} expiring soon
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Compliance Progress Bar */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-5 w-5 ${complianceTextColor}`} />
                  <span className="font-medium text-slate-700">Overall Compliance</span>
                </div>
                <span className={`text-lg font-bold ${complianceTextColor}`}>
                  {isLoading ? '...' : `${complianceRate}%`}
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${complianceColor}`}
                  style={{ width: `${isLoading ? 0 : complianceRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Non-Compliant Jobs Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Non-Compliant Jobs ({data?.nonCompliantJobs?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.nonCompliantJobs && data.nonCompliantJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Job #</th>
                        <th className="pb-3 pr-4">Address</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Missing Documents</th>
                        <th className="pb-3">Expired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.nonCompliantJobs.map(j => (
                        <tr key={j.jobId} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{j.jobNumber}</td>
                          <td className="py-3 pr-4 text-slate-600 max-w-[200px] truncate">{j.address}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {titleCase(j.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {j.missingDocs.map(d => (
                                <span key={d} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                  {docTypeLabels[d] || d}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {j.expiredDocs.map(d => (
                                <span key={d} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                  {docTypeLabels[d] || d}
                                </span>
                              ))}
                              {j.expiredDocs.length === 0 && <span className="text-slate-400 text-xs">None</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">All jobs are compliant</div>
              )}
            </CardContent>
          </Card>

          {/* Document Coverage Chart */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Coverage by Document Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.documentCoverage && data.documentCoverage.length > 0 ? (
                <BarChart
                  data={data.documentCoverage.map(d => ({
                    label: docTypeLabels[d.docType] || d.docType,
                    value: d.coverageRate,
                    color: d.coverageRate >= 80 ? '#22c55e' : d.coverageRate >= 60 ? '#f59e0b' : '#ef4444',
                  }))}
                  horizontal
                  formatValue={v => `${v}%`}
                />
              ) : (
                <div className="py-8 text-center text-slate-400">No coverage data</div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Documents Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Expiring Soon (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading...</div>
              ) : data?.expiringDocuments && data.expiringDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Job #</th>
                        <th className="pb-3 pr-4">Document Type</th>
                        <th className="pb-3 pr-4">Expiration Date</th>
                        <th className="pb-3 text-right">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.expiringDocuments.map((d, idx) => (
                        <tr key={`${d.jobNumber}-${d.docType}-${d.expirationDate}-${idx}`} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-700">{d.jobNumber}</td>
                          <td className="py-3 pr-4 text-slate-600">{docTypeLabels[d.docType] || d.docType}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {new Date(d.expirationDate + 'T00:00:00').toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              d.daysLeft < 7 ? 'text-red-600' : d.daysLeft < 14 ? 'text-amber-600' : 'text-yellow-600'
                            }`}>
                              {d.daysLeft}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No documents expiring soon</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminPageTransition>
  )
}
