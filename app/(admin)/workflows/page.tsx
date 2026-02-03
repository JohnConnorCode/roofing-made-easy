'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Zap,
  Mail,
  MessageSquare,
  Play,
  Pause,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  Loader2,
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import type { WorkflowTrigger, MessageChannel } from '@/lib/communication/types'

interface Template {
  id: string
  name: string
  type: string
  subject: string | null
}

interface Workflow {
  id: string
  name: string
  description: string | null
  trigger_event: WorkflowTrigger
  conditions: Record<string, unknown>
  delay_minutes: number
  template_id: string
  channel: MessageChannel | null
  is_active: boolean
  priority: number
  max_sends_per_lead: number
  cooldown_hours: number
  respect_business_hours: boolean
  business_hours_start: string
  business_hours_end: string
  business_days: number[]
  created_at: string
  template: Template | null
}

const TRIGGER_OPTIONS = [
  { value: '', label: 'All Triggers' },
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'lead_status_changed', label: 'Status Changed' },
  { value: 'intake_completed', label: 'Intake Completed' },
  { value: 'estimate_generated', label: 'Estimate Generated' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'quote_viewed', label: 'Quote Viewed' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
  { value: 'appointment_reminder', label: 'Appointment Reminder' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'job_completed', label: 'Job Completed' },
  { value: 'review_request', label: 'Review Request' },
  { value: 'manual', label: 'Manual Trigger' },
]

const TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  lead_created: 'Lead Created',
  lead_status_changed: 'Status Changed',
  intake_completed: 'Intake Completed',
  estimate_generated: 'Estimate Generated',
  quote_sent: 'Quote Sent',
  quote_viewed: 'Quote Viewed',
  appointment_scheduled: 'Appointment Scheduled',
  appointment_reminder: 'Appointment Reminder',
  payment_received: 'Payment Received',
  job_completed: 'Job Completed',
  review_request: 'Review Request',
  manual: 'Manual',
}

const TRIGGER_COLORS: Record<WorkflowTrigger, string> = {
  lead_created: 'bg-green-100 text-green-700',
  lead_status_changed: 'bg-blue-100 text-blue-700',
  intake_completed: 'bg-purple-100 text-purple-700',
  estimate_generated: 'bg-gold-light/30 text-gold-dark',
  quote_sent: 'bg-cyan-100 text-cyan-700',
  quote_viewed: 'bg-indigo-100 text-indigo-700',
  appointment_scheduled: 'bg-orange-100 text-orange-700',
  appointment_reminder: 'bg-pink-100 text-pink-700',
  payment_received: 'bg-emerald-100 text-emerald-700',
  job_completed: 'bg-teal-100 text-teal-700',
  review_request: 'bg-rose-100 text-rose-700',
  manual: 'bg-slate-100 text-slate-700',
}

const CHANNEL_ICONS: Record<MessageChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export default function WorkflowsPage() {
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [total, setTotal] = useState(0)
  const [countsByTrigger, setCountsByTrigger] = useState<Record<string, { total: number; active: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set())

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTrigger, setFormTrigger] = useState<WorkflowTrigger>('lead_created')
  const [formTemplateId, setFormTemplateId] = useState('')
  const [formChannel, setFormChannel] = useState<MessageChannel | ''>('')
  const [formDelayMinutes, setFormDelayMinutes] = useState(0)
  const [formDelayUnit, setFormDelayUnit] = useState<'minutes' | 'hours' | 'days'>('minutes')
  const [formPriority, setFormPriority] = useState(0)
  const [formMaxSends, setFormMaxSends] = useState(1)
  const [formCooldownHours, setFormCooldownHours] = useState(24)
  const [formRespectBusinessHours, setFormRespectBusinessHours] = useState(true)
  const [formBusinessStart, setFormBusinessStart] = useState('08:00')
  const [formBusinessEnd, setFormBusinessEnd] = useState('18:00')
  const [formBusinessDays, setFormBusinessDays] = useState([1, 2, 3, 4, 5])
  const [isSaving, setIsSaving] = useState(false)

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (triggerFilter) params.set('trigger', triggerFilter)
      if (statusFilter) params.set('is_active', statusFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/workflows?${params}`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      const data = await response.json()

      setWorkflows(data.workflows || [])
      setTotal(data.total || 0)
      setCountsByTrigger(data.countsByTrigger || {})
    } catch {
      setError('Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }, [triggerFilter, statusFilter, search])

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/templates?is_active=true&limit=100')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    fetchWorkflows()
    fetchTemplates()
  }, [fetchWorkflows, fetchTemplates])

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !workflow.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update workflow')

      setWorkflows(prev => prev.map(w =>
        w.id === workflow.id ? { ...w, is_active: !w.is_active } : w
      ))
    } catch {
      setError('Failed to update workflow')
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formName || !formTemplateId) return
    setIsSaving(true)

    try {
      // Convert delay to minutes
      let delayMinutes = formDelayMinutes
      if (formDelayUnit === 'hours') delayMinutes *= 60
      if (formDelayUnit === 'days') delayMinutes *= 1440

      const payload = {
        name: formName,
        description: formDescription || undefined,
        trigger_event: formTrigger,
        template_id: formTemplateId,
        channel: formChannel || null,
        delay_minutes: delayMinutes,
        priority: formPriority,
        max_sends_per_lead: formMaxSends,
        cooldown_hours: formCooldownHours,
        respect_business_hours: formRespectBusinessHours,
        business_hours_start: formBusinessStart,
        business_hours_end: formBusinessEnd,
        business_days: formBusinessDays,
      }

      const url = editingWorkflow
        ? `/api/admin/workflows/${editingWorkflow.id}`
        : '/api/admin/workflows'

      const response = await fetch(url, {
        method: editingWorkflow ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save workflow')
      }

      await fetchWorkflows()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (workflowId: string) => {
    const confirmed = await confirm({
      title: 'Delete Workflow',
      description: 'Are you sure you want to delete this workflow? Any scheduled messages will not be sent.',
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete workflow')
      }

      await fetchWorkflows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow')
    }
  }

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setFormName(workflow.name)
    setFormDescription(workflow.description || '')
    setFormTrigger(workflow.trigger_event)
    setFormTemplateId(workflow.template_id)
    setFormChannel(workflow.channel || '')

    // Convert delay back to appropriate unit
    const delayMinutes = workflow.delay_minutes
    if (delayMinutes >= 1440 && delayMinutes % 1440 === 0) {
      setFormDelayMinutes(delayMinutes / 1440)
      setFormDelayUnit('days')
    } else if (delayMinutes >= 60 && delayMinutes % 60 === 0) {
      setFormDelayMinutes(delayMinutes / 60)
      setFormDelayUnit('hours')
    } else {
      setFormDelayMinutes(delayMinutes)
      setFormDelayUnit('minutes')
    }

    setFormPriority(workflow.priority)
    setFormMaxSends(workflow.max_sends_per_lead)
    setFormCooldownHours(workflow.cooldown_hours)
    setFormRespectBusinessHours(workflow.respect_business_hours)
    setFormBusinessStart(workflow.business_hours_start)
    setFormBusinessEnd(workflow.business_hours_end)
    setFormBusinessDays(workflow.business_days)
    setShowCreateModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingWorkflow(null)
    setFormName('')
    setFormDescription('')
    setFormTrigger('lead_created')
    setFormTemplateId('')
    setFormChannel('')
    setFormDelayMinutes(0)
    setFormDelayUnit('minutes')
    setFormPriority(0)
    setFormMaxSends(1)
    setFormCooldownHours(24)
    setFormRespectBusinessHours(true)
    setFormBusinessStart('08:00')
    setFormBusinessEnd('18:00')
    setFormBusinessDays([1, 2, 3, 4, 5])
  }

  const toggleExpanded = (workflowId: string) => {
    setExpandedWorkflows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId)
      } else {
        newSet.add(workflowId)
      }
      return newSet
    })
  }

  const formatDelay = (minutes: number): string => {
    if (minutes === 0) return 'Immediately'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    const days = Math.floor(minutes / 1440)
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const DAY_LABELS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const activeCount = workflows.filter(w => w.is_active).length
  const inactiveCount = workflows.filter(w => !w.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automation Workflows</h1>
          <p className="text-slate-500">Automate communications based on events</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Workflow
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <div className="text-sm text-slate-500">Total Workflows</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-slate-500">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-400">{inactiveCount}</div>
            <div className="text-sm text-slate-500">Inactive</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(countsByTrigger).length}</div>
            <div className="text-sm text-slate-500">Trigger Types</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900"
              />
            </div>
            <Select
              options={TRIGGER_OPTIONS}
              value={triggerFilter}
              onChange={setTriggerFilter}
              className="md:w-44 bg-white border-slate-300 text-slate-900"
            />
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              className="md:w-32 bg-white border-slate-300 text-slate-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {workflows.length} Workflow{workflows.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No workflows found</p>
              <p className="text-sm text-slate-400">Create a workflow to automate communications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => {
                const isExpanded = expandedWorkflows.has(workflow.id)
                const ChannelIcon = workflow.channel ? CHANNEL_ICONS[workflow.channel] : null

                return (
                  <div
                    key={workflow.id}
                    className={`rounded-lg border ${
                      workflow.is_active
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleExpanded(workflow.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status indicator */}
                        <div className="mt-1">
                          {workflow.is_active ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-slate-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${workflow.is_active ? 'text-slate-900' : 'text-slate-500'}`}>
                              {workflow.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TRIGGER_COLORS[workflow.trigger_event]}`}>
                              {TRIGGER_LABELS[workflow.trigger_event]}
                            </span>
                            {ChannelIcon && (
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <ChannelIcon className="h-3 w-3" />
                                {workflow.channel}
                              </span>
                            )}
                          </div>

                          {workflow.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                              {workflow.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDelay(workflow.delay_minutes)}
                            </span>
                            {workflow.template && (
                              <span>Template: {workflow.template.name}</span>
                            )}
                            {workflow.priority > 0 && (
                              <span>Priority: {workflow.priority}</span>
                            )}
                          </div>
                        </div>

                        {/* Expand indicator */}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-slate-400">Max sends per lead</span>
                            <div className="font-medium text-slate-900">{workflow.max_sends_per_lead}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Cooldown</span>
                            <div className="font-medium text-slate-900">{workflow.cooldown_hours}h</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Business hours</span>
                            <div className="font-medium text-slate-900">
                              {workflow.respect_business_hours
                                ? `${workflow.business_hours_start} - ${workflow.business_hours_end}`
                                : 'Any time'
                              }
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Business days</span>
                            <div className="font-medium text-slate-900">
                              {workflow.business_days.map(d => DAY_LABELS[d]).join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleActive(workflow)
                            }}
                            leftIcon={workflow.is_active
                              ? <Pause className="h-4 w-4" />
                              : <Play className="h-4 w-4" />
                            }
                          >
                            {workflow.is_active ? 'Pause' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(workflow)
                            }}
                            leftIcon={<Pencil className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(workflow.id)
                            }}
                            className="text-red-500 hover:text-red-700"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
              </h2>

              <div className="space-y-4">
                {/* Basic info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Welcome Email for New Leads"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of this workflow"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Trigger and Template */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Trigger Event <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={TRIGGER_OPTIONS.filter(t => t.value)}
                      value={formTrigger}
                      onChange={(v) => setFormTrigger(v as WorkflowTrigger)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Template <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Select template...' },
                        ...templates.map(t => ({ value: t.id, label: `${t.name} (${t.type})` }))
                      ]}
                      value={formTemplateId}
                      onChange={setFormTemplateId}
                    />
                  </div>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Delay After Trigger
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={formDelayMinutes}
                      onChange={(e) => setFormDelayMinutes(parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Select
                      options={[
                        { value: 'minutes', label: 'Minutes' },
                        { value: 'hours', label: 'Hours' },
                        { value: 'days', label: 'Days' },
                      ]}
                      value={formDelayUnit}
                      onChange={(v) => setFormDelayUnit(v as 'minutes' | 'hours' | 'days')}
                      className="w-32"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Set to 0 for immediate sending
                  </p>
                </div>

                {/* Channel override */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Channel Override
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Use template default' },
                      { value: 'email', label: 'Email' },
                      { value: 'sms', label: 'SMS' },
                    ]}
                    value={formChannel}
                    onChange={(v) => setFormChannel(v as MessageChannel | '')}
                  />
                </div>

                {/* Advanced settings */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-4"
                    onClick={() => {}}
                  >
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Priority (0-100)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={formPriority}
                        onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Max Sends Per Lead
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={formMaxSends}
                        onChange={(e) => setFormMaxSends(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cooldown (hours)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={720}
                        value={formCooldownHours}
                        onChange={(e) => setFormCooldownHours(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Business hours */}
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <input
                        type="checkbox"
                        checked={formRespectBusinessHours}
                        onChange={(e) => setFormRespectBusinessHours(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Respect Business Hours
                    </label>

                    {formRespectBusinessHours && (
                      <div className="ml-6 space-y-3">
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Start</label>
                            <Input
                              type="time"
                              value={formBusinessStart}
                              onChange={(e) => setFormBusinessStart(e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">End</label>
                            <Input
                              type="time"
                              value={formBusinessEnd}
                              onChange={(e) => setFormBusinessEnd(e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-2">Business Days</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(day => (
                              <button
                                key={day}
                                type="button"
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                                  formBusinessDays.includes(day)
                                    ? 'bg-gold text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                onClick={() => {
                                  if (formBusinessDays.includes(day)) {
                                    setFormBusinessDays(formBusinessDays.filter(d => d !== day))
                                  } else {
                                    setFormBusinessDays([...formBusinessDays, day].sort())
                                  }
                                }}
                              >
                                {DAY_LABELS[day]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrUpdate}
                  disabled={!formName || !formTemplateId || isSaving}
                  leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                >
                  {isSaving ? 'Saving...' : editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  )
}
