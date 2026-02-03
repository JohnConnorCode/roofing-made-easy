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
  Users,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  Pencil,
  UserX,
} from 'lucide-react'
import type { UserRole } from '@/lib/team/types'

interface User {
  id: string
  email: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  job_title: string | null
  is_active: boolean
  created_at: string
  team_names: string[] | null
}

interface Team {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  is_active: boolean
  member_count: number
  manager: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface Invitation {
  id: string
  email: string
  role: UserRole
  expires_at: string
  created_at: string
  inviter: { first_name: string | null; last_name: string | null } | null
  team: { name: string; color: string } | null
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales Rep' },
  { value: 'crew_lead', label: 'Crew Lead' },
  { value: 'crew', label: 'Crew' },
]

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  sales: 'bg-blue-100 text-blue-700',
  crew_lead: 'bg-green-100 text-green-700',
  crew: 'bg-slate-100 text-slate-700',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  sales: 'Sales Rep',
  crew_lead: 'Crew Lead',
  crew: 'Crew',
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'teams' | 'invitations'>('users')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('crew')
  const [inviteTeamId, setInviteTeamId] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  // Team form state
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [teamColor, setTeamColor] = useState('#6366f1')
  const [teamManagerId, setTeamManagerId] = useState('')
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch {
      setError('Failed to load users')
    }
  }, [roleFilter, search])

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data.teams || [])
    } catch {
      setError('Failed to load teams')
    }
  }, [])

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users/invite?status=pending')
      if (!response.ok) throw new Error('Failed to fetch invitations')
      const data = await response.json()
      setInvitations(data.invitations || [])
    } catch {
      // Invitations may not exist yet
      setInvitations([])
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchUsers(), fetchTeams(), fetchInvitations()])
    setIsLoading(false)
  }, [fetchUsers, fetchTeams, fetchInvitations])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (!isLoading) {
      fetchUsers()
    }
  }, [roleFilter, search, fetchUsers, isLoading])

  const handleInviteUser = async () => {
    if (!inviteEmail) return
    setIsInviting(true)

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          team_id: inviteTeamId || undefined,
          message: inviteMessage || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Refresh invitations
      await fetchInvitations()
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('crew')
      setInviteTeamId('')
      setInviteMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName) return
    setIsCreatingTeam(true)

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription || undefined,
          color: teamColor,
          manager_id: teamManagerId || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create team')
      }

      // Refresh teams
      await fetchTeams()
      setShowCreateTeamModal(false)
      setTeamName('')
      setTeamDescription('')
      setTeamColor('#6366f1')
      setTeamManagerId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/admin/users/invite?id=${invitationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to cancel invitation')
      await fetchInvitations()
    } catch {
      setError('Failed to cancel invitation')
    }
  }

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev)
      if (newSet.has(teamId)) {
        newSet.delete(teamId)
      } else {
        newSet.add(teamId)
      }
      return newSet
    })
  }

  const filteredUsers = users.filter(user => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    )
  })

  const activeUsers = filteredUsers.filter(u => u.is_active)
  const inactiveUsers = filteredUsers.filter(u => !u.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500">Manage users, roles, and teams</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateTeamModal(true)}
            leftIcon={<Users className="h-4 w-4" />}
          >
            Create Team
          </Button>
          <Button
            size="sm"
            onClick={() => setShowInviteModal(true)}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Invite User
          </Button>
        </div>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-gold text-gold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users ({activeUsers.length})
        </button>
        <button
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'teams'
              ? 'border-gold text-gold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('teams')}
        >
          Teams ({teams.length})
        </button>
        <button
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invitations'
              ? 'border-gold text-gold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <Select
                  options={ROLE_OPTIONS}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  className="md:w-48 bg-white border-slate-300 text-slate-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users list */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : activeUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No users found
                </div>
              ) : (
                <div className="divide-y">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="py-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.email}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {user.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          )}
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                        {user.team_names && user.team_names.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {user.team_names.map((team, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                                {team}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inactive users */}
          {inactiveUsers.length > 0 && (
            <Card className="bg-white border-slate-200 opacity-60">
              <CardHeader>
                <CardTitle className="text-slate-700">Inactive Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {inactiveUsers.map((user) => (
                    <div key={user.id} className="py-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <UserX className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-600">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}
                        </span>
                        <span className="ml-2 text-sm text-slate-400">
                          ({ROLE_LABELS[user.role]})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ) : teams.length === 0 ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">No teams yet</p>
                <p className="text-sm text-slate-400 mb-4">Create a team to organize your crew</p>
                <Button onClick={() => setShowCreateTeamModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleTeamExpanded(team.id)}
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: team.color + '20', color: team.color }}
                    >
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{team.name}</span>
                        <span className="text-sm text-slate-500">
                          ({team.member_count} member{team.member_count !== 1 ? 's' : ''})
                        </span>
                      </div>
                      {team.manager && (
                        <div className="text-sm text-slate-500">
                          Manager: {team.manager.first_name} {team.manager.last_name}
                        </div>
                      )}
                    </div>
                    {expandedTeams.has(team.id) ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  {expandedTeams.has(team.id) && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {team.description && (
                        <p className="text-sm text-slate-600 mb-4">{team.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                          Add Member
                        </Button>
                        <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                          Edit Team
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600">No pending invitations</p>
                <p className="text-sm text-slate-400">Invite users to join your team</p>
              </div>
            ) : (
              <div className="divide-y">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="py-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gold-light/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{invitation.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[invitation.role]}`}>
                          {ROLE_LABELS[invitation.role]}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Invited {formatDate(invitation.created_at)}
                        {invitation.inviter && ` by ${invitation.inviter.first_name} ${invitation.inviter.last_name}`}
                      </div>
                      <div className="text-sm text-slate-400">
                        Expires {formatDate(invitation.expires_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Invite User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <Select
                    options={ROLE_OPTIONS.filter(r => r.value)}
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v as UserRole)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team (optional)
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'No team' },
                      ...teams.map(t => ({ value: t.id, label: t.name }))
                    ]}
                    value={inviteTeamId}
                    onChange={setInviteTeamId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Personal Message (optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Welcome to the team!"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail || isInviting}
                  leftIcon={isInviting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create Team</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team Name
                  </label>
                  <Input
                    placeholder="e.g., Installation Crew A"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    rows={2}
                    placeholder="Team responsibilities and notes"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team Color
                  </label>
                  <div className="flex gap-2">
                    {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 ${
                          teamColor === color ? 'border-slate-900' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTeamColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team Manager (optional)
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'No manager' },
                      ...users
                        .filter(u => u.is_active && ['admin', 'manager', 'crew_lead'].includes(u.role))
                        .map(u => ({
                          value: u.id,
                          label: u.first_name && u.last_name
                            ? `${u.first_name} ${u.last_name}`
                            : u.email
                        }))
                    ]}
                    value={teamManagerId}
                    onChange={setTeamManagerId}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName || isCreatingTeam}
                  leftIcon={isCreatingTeam ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                >
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
