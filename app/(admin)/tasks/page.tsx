'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  User,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { TaskType, TaskPriority, TaskStatus } from '@/lib/team/types'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

interface Task {
  id: string
  title: string
  description: string | null
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  due_at: string | null
  completed_at: string | null
  created_at: string
  assignee: User | null
  assigner: User | null
  lead: {
    id: string
    contacts: { first_name: string | null; last_name: string | null }[]
  } | null
}

interface TaskSummary {
  pending: number
  in_progress: number
  completed: number
  cancelled: number
  overdue: number
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'internal', label: 'Internal' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const TYPE_ICONS: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  site_visit: MapPin,
  follow_up: Calendar,
  meeting: Users,
  inspection: FileText,
  internal: Circle,
}

const TYPE_COLORS: Record<TaskType, string> = {
  call: 'bg-green-100 text-green-700',
  email: 'bg-blue-100 text-blue-700',
  site_visit: 'bg-purple-100 text-purple-700',
  follow_up: 'bg-gold-light/30 text-gold-dark',
  meeting: 'bg-pink-100 text-pink-700',
  inspection: 'bg-orange-100 text-orange-700',
  internal: 'bg-slate-100 text-slate-700',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
}

const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: AlertCircle,
}

const LIMIT = 20

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showOverdue, setShowOverdue] = useState(false)
  const [offset, setOffset] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  // Create task form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('follow_up')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      })
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (showOverdue) params.set('overdue', 'true')

      const response = await fetch(`/api/admin/tasks?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()

      setTasks(data.tasks || [])
      setTotal(data.total || 0)
      setSummary(data.summary || null)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, typeFilter, priorityFilter, showOverdue, offset])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users?is_active=true')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [fetchTasks, fetchUsers])

  const filteredTasks = tasks.filter((task) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    )
  })

  const handleCreateTask = async () => {
    if (!taskTitle) return
    setIsCreating(true)

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || undefined,
          type: taskType,
          priority: taskPriority,
          assigned_to: taskAssignee || undefined,
          due_at: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create task')
      }

      // Refresh tasks
      await fetchTasks()
      setShowCreateModal(false)
      setTaskTitle('')
      setTaskDescription('')
      setTaskType('follow_up')
      setTaskPriority('medium')
      setTaskAssignee('')
      setTaskDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : task
      ))
    } catch {
      setError('Failed to update task')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  const isOverdue = (task: Task) => {
    if (!task.due_at) return false
    if (task.status === 'completed' || task.status === 'cancelled') return false
    return new Date(task.due_at) < new Date()
  }

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Manage team tasks and follow-ups</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Task
        </Button>
      </div>
      </FadeInSection>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchTasks} leftIcon={<RefreshCw className="h-3 w-3" />}>
                Try Again
              </Button>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <FadeInSection delay={100} animation="slide-up">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-900">{summary.pending}</div>
              <div className="text-sm text-slate-500">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{summary.in_progress}</div>
              <div className="text-sm text-slate-500">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
              <div className="text-sm text-slate-500">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
              <div className="text-sm text-slate-500">Overdue</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-400">{summary.cancelled}</div>
              <div className="text-sm text-slate-500">Cancelled</div>
            </CardContent>
          </Card>
        </div>
      )}
      </FadeInSection>

      {/* Filters */}
      <FadeInSection delay={200} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-900"
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              className="md:w-36 bg-white border-slate-300 text-slate-900"
            />
            <Select
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
              className="md:w-36 bg-white border-slate-300 text-slate-900"
            />
            <Select
              options={PRIORITY_OPTIONS}
              value={priorityFilter}
              onChange={setPriorityFilter}
              className="md:w-36 bg-white border-slate-300 text-slate-900"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
              <Checkbox
                checked={showOverdue}
                onChange={(e) => setShowOverdue(e.target.checked)}
              />
              Overdue only
            </label>
          </div>
        </CardContent>
      </Card>
      </FadeInSection>

      {/* Tasks List */}
      <FadeInSection delay={300} animation="slide-up">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {total} Task{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 mt-1 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded" />
                      </div>
                      <Skeleton className="h-3 w-64 mb-2" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No tasks found</p>
              <p className="text-sm text-slate-400">Create a task to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const TypeIcon = TYPE_ICONS[task.type]
                const StatusIcon = STATUS_ICONS[task.status]
                const overdueTask = isOverdue(task)

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${
                      overdueTask
                        ? 'border-red-200 bg-red-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    } transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status checkbox */}
                      <button
                        onClick={() => handleStatusChange(
                          task.id,
                          task.status === 'completed' ? 'pending' : 'completed'
                        )}
                        className={`mt-1 ${
                          task.status === 'completed'
                            ? 'text-green-500'
                            : overdueTask
                              ? 'text-red-400'
                              : 'text-slate-400'
                        } hover:text-green-600`}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </button>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${
                              task.status === 'completed'
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[task.type]}`}>
                            <TypeIcon className="h-3 w-3 inline mr-1" />
                            {task.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          {task.due_at && (
                            <span className={`flex items-center gap-1 ${overdueTask ? 'text-red-600 font-medium' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {overdueTask && 'Overdue: '}
                              {formatDate(task.due_at)}
                            </span>
                          )}
                          {task.assignee && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignee.first_name} {task.assignee.last_name}
                            </span>
                          )}
                          {task.lead && (
                            <Link
                              href={`/leads/${task.lead.id}`}
                              className="flex items-center gap-1 text-gold hover:underline"
                            >
                              <FileText className="h-3 w-3" />
                              {task.lead.contacts?.[0]?.first_name} {task.lead.contacts?.[0]?.last_name}
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1">
                        {task.status !== 'completed' && task.status !== 'cancelled' && (
                          <Select
                            options={[
                              { value: 'pending', label: 'Pending' },
                              { value: 'in_progress', label: 'In Progress' },
                              { value: 'completed', label: 'Complete' },
                              { value: 'cancelled', label: 'Cancel' },
                            ]}
                            value={task.status}
                            onChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                            className="w-32 text-xs"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {offset + 1}-{Math.min(offset + LIMIT, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                  disabled={offset === 0}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + LIMIT)}
                  disabled={currentPage >= totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </FadeInSection>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Follow up with customer"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Task details..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type
                    </label>
                    <Select
                      options={TYPE_OPTIONS.filter(t => t.value)}
                      value={taskType}
                      onChange={(v) => setTaskType(v as TaskType)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Priority
                    </label>
                    <Select
                      options={PRIORITY_OPTIONS.filter(p => p.value)}
                      value={taskPriority}
                      onChange={(v) => setTaskPriority(v as TaskPriority)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assign To
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...users.map(u => ({
                        value: u.id,
                        label: u.first_name && u.last_name
                          ? `${u.first_name} ${u.last_name}`
                          : u.id
                      }))
                    ]}
                    value={taskAssignee}
                    onChange={setTaskAssignee}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  disabled={!taskTitle || isCreating}
                  leftIcon={isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                >
                  {isCreating ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageTransition>
  )
}
