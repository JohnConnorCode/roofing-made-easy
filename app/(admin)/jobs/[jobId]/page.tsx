'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Hammer,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  Clock,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Plus,
} from 'lucide-react'
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_TRANSITIONS,
  type Job,
  type JobStatus,
  type JobStatusHistory,
  type JobExpense,
  type JobDailyLog,
} from '@/lib/jobs/types'
import { BillingScheduleCard } from '@/components/admin/BillingScheduleCard'
import { ChangeOrderList } from '@/components/admin/ChangeOrderList'
import { LienWaiverList } from '@/components/admin/LienWaiverList'
import { InvoiceList } from '@/components/admin/InvoiceList'
import { CommunicationTimeline } from '@/components/admin/communication-timeline'
import { JobDocumentsTab } from '@/components/admin/job-documents-tab'
import { TimeTrackingTab } from '@/components/admin/time-tracking-tab'
import { ActivityLogPanel } from '@/components/admin/activity-log-panel'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'

type TabId = 'overview' | 'documents' | 'daily-logs' | 'expenses' | 'history' | 'billing' | 'change-orders' | 'communications' | 'time-tracking'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Hammer },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'change-orders', label: 'Change Orders', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'time-tracking', label: 'Time', icon: Clock },
  { id: 'daily-logs', label: 'Daily Logs', icon: ClipboardList },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'communications', label: 'Comms', icon: MessageSquare },
  { id: 'history', label: 'Status History', icon: Clock },
]

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const { showToast } = useToast()

  const [job, setJob] = useState<Job | null>(null)
  const [statusHistory, setStatusHistory] = useState<JobStatusHistory[]>([])
  const [dailyLogs, setDailyLogs] = useState<JobDailyLog[]>([])
  const [expenses, setExpenses] = useState<JobExpense[]>([])
  const [expenseTotals, setExpenseTotals] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isSaving, setIsSaving] = useState(false)

  // Add Daily Log form state
  const [showLogForm, setShowLogForm] = useState(false)
  const [isAddingLog, setIsAddingLog] = useState(false)
  const [logForm, setLogForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    work_performed: '',
    hours_worked: '',
    weather_conditions: '',
    work_delayed: false,
  })

  // Add Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'materials',
    description: '',
    amount: '',
    vendor: '',
  })

  const fetchJob = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job')
      const data = await response.json()
      setJob(data.job)
      setStatusHistory(data.statusHistory || [])
    } catch (err) {
      setError('Unable to load job. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  const fetchTabData = useCallback(async (tab: TabId) => {
    if (tab === 'overview' || tab === 'history' || tab === 'documents') return

    try {
      const endpoint = tab === 'daily-logs' ? 'daily-logs' : tab
      const response = await fetch(`/api/admin/jobs/${jobId}/${endpoint}`)
      if (!response.ok) return
      const data = await response.json()

      if (tab === 'daily-logs') setDailyLogs(data.logs || [])
      if (tab === 'expenses') {
        setExpenses(data.expenses || [])
        setExpenseTotals(data.totals || {})
      }
    } catch {
      // Tab data fetch failures are non-critical
    }
  }, [jobId])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  useEffect(() => {
    if (activeTab !== 'overview' && activeTab !== 'history' && activeTab !== 'documents' && activeTab !== 'communications' && activeTab !== 'time-tracking') {
      fetchTabData(activeTab)
    }
  }, [activeTab, fetchTabData])

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to update status')
      }

      const data = await response.json()
      setJob(data.job)
      showToast(`Status updated to "${JOB_STATUS_LABELS[newStatus as JobStatus]}"`, 'success')
      fetchJob() // refresh history
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status'
      showToast(msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLog = async () => {
    if (!logForm.work_performed) {
      showToast('Work performed is required', 'error')
      return
    }
    setIsAddingLog(true)
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/daily-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_date: logForm.log_date || undefined,
          work_performed: logForm.work_performed,
          hours_worked: logForm.hours_worked ? parseFloat(logForm.hours_worked) : undefined,
          weather_conditions: logForm.weather_conditions || undefined,
          work_delayed: logForm.work_delayed,
        }),
      })
      if (!response.ok) throw new Error('Failed to add log')
      showToast('Daily log added', 'success')
      setShowLogForm(false)
      setLogForm({ log_date: new Date().toISOString().split('T')[0], work_performed: '', hours_worked: '', weather_conditions: '', work_delayed: false })
      fetchTabData('daily-logs')
    } catch {
      showToast('Failed to add daily log', 'error')
    } finally {
      setIsAddingLog(false)
    }
  }

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      showToast('Description and amount are required', 'error')
      return
    }
    setIsAddingExpense(true)
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense_date: expenseForm.expense_date || undefined,
          category: expenseForm.category,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          vendor: expenseForm.vendor || undefined,
        }),
      })
      if (!response.ok) throw new Error('Failed to add expense')
      showToast('Expense added', 'success')
      setShowExpenseForm(false)
      setExpenseForm({ expense_date: new Date().toISOString().split('T')[0], category: 'materials', description: '', amount: '', vendor: '' })
      fetchTabData('expenses')
    } catch {
      showToast('Failed to add expense', 'error')
    } finally {
      setIsAddingExpense(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="mt-4 text-lg font-medium text-slate-900">{error || 'Job not found'}</p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={fetchJob} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Button variant="primary" onClick={() => router.push('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  // Build status transition options
  const allowedTransitions = JOB_STATUS_TRANSITIONS[job.status] || []
  const statusOptions = [
    { value: job.status, label: JOB_STATUS_LABELS[job.status] },
    ...allowedTransitions.map((s) => ({ value: s, label: JOB_STATUS_LABELS[s] })),
  ]

  const grossProfit = job.contract_amount - job.material_cost - job.labor_cost
  const margin = job.contract_amount > 0 ? (grossProfit / job.contract_amount) * 100 : 0

  return (
    <AdminPageTransition className="space-y-6">
      <FadeInSection delay={0} animation="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.job_number}</h1>
            {job.property_city && (
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.property_address && `${job.property_address}, `}
                {job.property_city}, {job.property_state} {job.property_zip}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={statusOptions}
            value={job.status}
            onChange={handleStatusChange}
            disabled={isSaving || allowedTransitions.length === 0}
          />
        </div>
      </div>
      </FadeInSection>

      <FadeInSection delay={100} animation="slide-up">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      </FadeInSection>

      <FadeInSection delay={200} animation="slide-up">
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Job Number</p>
                  <p className="font-medium">{job.job_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="font-medium">{formatDate(job.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Warranty Type</p>
                  <p className="font-medium">{job.warranty_type || 'N/A'}</p>
                </div>
              </div>
              {job.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Scheduled Start</p>
                  <p className="font-medium">{job.scheduled_start ? formatDate(job.scheduled_start) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Scheduled End</p>
                  <p className="font-medium">{job.scheduled_end ? formatDate(job.scheduled_end) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Actual Start</p>
                  <p className="font-medium">{job.actual_start ? formatDate(job.actual_start) : 'Not started'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Actual End</p>
                  <p className="font-medium">{job.actual_end ? formatDate(job.actual_end) : 'In progress'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Assigned Team</p>
                {job.team ? (
                  <p className="font-medium flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: job.team.color }} />
                    {job.team.name}
                  </p>
                ) : (
                  <p className="text-slate-400">No team assigned</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500">Project Manager</p>
                {job.project_manager ? (
                  <p className="font-medium">
                    {job.project_manager.first_name} {job.project_manager.last_name}
                  </p>
                ) : (
                  <p className="text-slate-400">No PM assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Contract Amount</span>
                  <span className="font-medium">{formatCurrency(job.contract_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Material Cost</span>
                  <span className="font-medium text-red-600">-{formatCurrency(job.material_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Labor Cost</span>
                  <span className="font-medium text-red-600">-{formatCurrency(job.labor_cost)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-sm font-medium text-slate-700">Gross Profit</span>
                  <span className={`font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(grossProfit)} ({margin.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm text-slate-500">Total Invoiced</span>
                  <span className="font-medium">{formatCurrency(job.total_invoiced)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Total Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(job.total_paid)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <ActivityLogPanel entityType="job" entityId={jobId} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <JobDocumentsTab jobId={jobId} />
      )}

      {activeTab === 'daily-logs' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Logs ({dailyLogs.length})</CardTitle>
            <Button size="sm" onClick={() => setShowLogForm(!showLogForm)} leftIcon={<Plus className="h-4 w-4" />}>
              Add Log
            </Button>
          </CardHeader>
          {showLogForm && (
            <div className="px-6 pb-4 border-b space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  type="date"
                  label="Date"
                  value={logForm.log_date}
                  onChange={(e) => setLogForm({ ...logForm, log_date: e.target.value })}
                />
                <Input
                  type="number"
                  label="Hours Worked"
                  placeholder="8"
                  value={logForm.hours_worked}
                  onChange={(e) => setLogForm({ ...logForm, hours_worked: e.target.value })}
                />
                <Input
                  label="Weather"
                  placeholder="Sunny, 75F"
                  value={logForm.weather_conditions}
                  onChange={(e) => setLogForm({ ...logForm, weather_conditions: e.target.value })}
                />
              </div>
              <Textarea
                label="Work Performed"
                placeholder="Describe work completed today..."
                value={logForm.work_performed}
                onChange={(e) => setLogForm({ ...logForm, work_performed: e.target.value })}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={logForm.work_delayed}
                    onChange={(e) => setLogForm({ ...logForm, work_delayed: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Work was delayed
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddLog} disabled={isAddingLog}>
                    {isAddingLog ? 'Saving...' : 'Save Log'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <CardContent>
            {dailyLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No daily logs recorded yet</p>
            ) : (
              <div className="space-y-4">
                {dailyLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-sm">{formatDate(log.log_date)}</span>
                        {log.work_delayed && (
                          <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Delayed</span>
                        )}
                      </div>
                      {log.hours_worked && (
                        <span className="text-sm text-slate-500">{log.hours_worked}h</span>
                      )}
                    </div>
                    {log.work_performed && (
                      <p className="text-sm text-slate-700">{log.work_performed}</p>
                    )}
                    {log.weather_conditions && (
                      <p className="text-xs text-slate-400 mt-1">Weather: {log.weather_conditions}</p>
                    )}
                    {log.logged_by_user && (
                      <p className="text-xs text-slate-400 mt-1">
                        Logged by {log.logged_by_user.first_name} {log.logged_by_user.last_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Expense Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Total Expenses</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(expenseTotals.total || 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Materials</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(expenseTotals.materials || 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Labor</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(expenseTotals.labor || 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Other</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(
                    (expenseTotals.subcontractor || 0) +
                    (expenseTotals.permit || 0) +
                    (expenseTotals.equipment || 0) +
                    (expenseTotals.disposal || 0) +
                    (expenseTotals.other || 0)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expenses ({expenses.length})</CardTitle>
              <Button size="sm" onClick={() => setShowExpenseForm(!showExpenseForm)} leftIcon={<Plus className="h-4 w-4" />}>
                Add Expense
              </Button>
            </CardHeader>
            {showExpenseForm && (
              <div className="px-6 pb-4 border-b space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    type="date"
                    label="Date"
                    value={expenseForm.expense_date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <Select
                      options={[
                        { value: 'materials', label: 'Materials' },
                        { value: 'labor', label: 'Labor' },
                        { value: 'subcontractor', label: 'Subcontractor' },
                        { value: 'permit', label: 'Permit' },
                        { value: 'equipment', label: 'Equipment' },
                        { value: 'disposal', label: 'Disposal' },
                        { value: 'other', label: 'Other' },
                      ]}
                      value={expenseForm.category}
                      onChange={(val) => setExpenseForm({ ...expenseForm, category: val })}
                    />
                  </div>
                  <Input
                    type="number"
                    label="Amount ($)"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Description"
                    placeholder="What was this expense for?"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  />
                  <Input
                    label="Vendor (optional)"
                    placeholder="Vendor name"
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddExpense} disabled={isAddingExpense}>
                    {isAddingExpense ? 'Saving...' : 'Save Expense'}
                  </Button>
                </div>
              </div>
            )}
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No expenses recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-slate-500">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Description</th>
                        <th className="pb-3 pr-4">Vendor</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 text-sm">{formatDate(exp.expense_date)}</td>
                          <td className="py-3 pr-4">
                            <span className="text-xs rounded-full bg-slate-100 px-2 py-1 capitalize">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-slate-700">{exp.description}</td>
                          <td className="py-3 pr-4 text-sm text-slate-500">{exp.vendor || '-'}</td>
                          <td className="py-3 text-sm font-medium text-right">{formatCurrency(exp.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Billing Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Contract Amount</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(job.contract_amount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Total Invoiced</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(job.total_invoiced)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(job.total_paid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className={`text-xl font-bold ${(job.total_invoiced - job.total_paid) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {formatCurrency(job.total_invoiced - job.total_paid)}
                </p>
              </CardContent>
            </Card>
          </div>

          <BillingScheduleCard jobId={jobId} contractAmount={job.contract_amount} />
          <InvoiceList jobId={jobId} showCreateButton={false} />
          <LienWaiverList jobId={jobId} />
        </div>
      )}

      {activeTab === 'change-orders' && (
        <ChangeOrderList jobId={jobId} contractAmount={job.contract_amount} />
      )}

      {activeTab === 'time-tracking' && (
        <TimeTrackingTab jobId={jobId} />
      )}

      {activeTab === 'communications' && (
        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <CommunicationTimeline leadId={job.lead_id || undefined} customerId={job.customer_id || undefined} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {statusHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No status changes recorded</p>
            ) : (
              <div className="space-y-4">
                {statusHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.old_status && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_COLORS[entry.old_status]}`}>
                            {JOB_STATUS_LABELS[entry.old_status]}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">&rarr;</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_COLORS[entry.new_status]}`}>
                          {JOB_STATUS_LABELS[entry.new_status]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(entry.created_at)}
                        {entry.changed_by_user && ` by ${entry.changed_by_user.first_name} ${entry.changed_by_user.last_name}`}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </FadeInSection>
    </AdminPageTransition>
  )
}
