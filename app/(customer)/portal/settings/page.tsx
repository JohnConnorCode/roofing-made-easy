'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCustomerStore } from '@/stores/customerStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Home,
  Trash2,
  Save,
  Plus,
  Loader2,
} from 'lucide-react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import type { NotificationPreferences } from '@/lib/supabase/types'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const {
    customer,
    linkedLeads,
    updateCustomer,
    updateLinkedLead,
    removeLinkedLead,
  } = useCustomerStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'password' | 'properties'>('profile')
  const [nicknameEdits, setNicknameEdits] = useState<Record<string, string>>({})

  // Profile form
  const [profileData, setProfileData] = useState({
    firstName: customer?.first_name || '',
    lastName: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  })

  // Notification preferences
  const prefs = customer?.notification_preferences as NotificationPreferences | null
  const [notificationData, setNotificationData] = useState({
    email: prefs?.email ?? true,
    sms: prefs?.sms ?? false,
  })

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      updateCustomer(data)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast('Failed to update profile', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_preferences: notificationData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      updateCustomer({ notification_preferences: notificationData })
      showToast('Notification preferences updated', 'success')
    } catch (error) {
      showToast('Failed to update preferences', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully', 'success')
    } catch (error) {
      showToast('Failed to change password', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePropertyNickname = async (leadLinkId: string, nickname: string) => {
    try {
      const response = await fetch(`/api/customer/lead-links/${leadLinkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })

      if (!response.ok) throw new Error('Failed to update')

      const linkedLead = linkedLeads.find((l) => l.id === leadLinkId)
      if (linkedLead) {
        updateLinkedLead(linkedLead.lead_id, { nickname })
      }
      showToast('Property updated', 'success')
    } catch (error) {
      showToast('Failed to update property', 'error')
    }
  }

  const handleRemoveProperty = async (leadLinkId: string) => {
    const confirmed = await confirm({
      title: 'Remove Property',
      description: 'Are you sure you want to remove this property from your account? You can always add it back later using your estimate link.',
      confirmText: 'Remove',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`/api/customer/lead-links/${leadLinkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove')

      removeLinkedLead(leadLinkId)
      showToast('Property removed', 'success')
    } catch {
      showToast('Failed to remove property', 'error')
    }
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'properties', label: 'Properties', icon: Home },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200"
          onClick={() => router.push('/portal')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
          <p className="text-slate-400">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar navigation */}
        <Card className="border-slate-700 lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-gold-light/10 text-gold-light'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Profile section */}
          {activeSection === 'profile' && (
            <Card variant="dark" className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    type="email"
                    label="Email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled
                    hint="Contact support to change your email address"
                  />
                  <Input
                    type="tel"
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notifications section */}
          {activeSection === 'notifications' && (
            <Card variant="dark" className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between rounded-lg bg-slate-deep border border-slate-700 p-4">
                      <div>
                        <p className="font-medium text-slate-200">Email Notifications</p>
                        <p className="text-sm text-slate-400">
                          Receive updates about your project, financing, and claims via email
                        </p>
                      </div>
                      <Checkbox
                        name="email"
                        checked={notificationData.email}
                        onChange={(e) => setNotificationData({ ...notificationData, email: e.target.checked })}
                      />
                    </div>

                    <div className="flex items-start justify-between rounded-lg bg-slate-deep border border-slate-700 p-4">
                      <div>
                        <p className="font-medium text-slate-200">SMS Notifications</p>
                        <p className="text-sm text-slate-400">
                          Receive text message updates for important milestones
                        </p>
                      </div>
                      <Checkbox
                        name="sms"
                        checked={notificationData.sms}
                        onChange={(e) => setNotificationData({ ...notificationData, sms: e.target.checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Password section */}
          {activeSection === 'password' && (
            <Card variant="dark" className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    type="password"
                    label="New Password"
                    placeholder="At least 8 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                      className="bg-gradient-to-r from-gold-light to-gold hover:from-gold-hover hover:to-gold-light text-ink border-0"
                      leftIcon={<Lock className="h-4 w-4" />}
                    >
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Properties section */}
          {activeSection === 'properties' && (
            <Card variant="dark" className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Linked Properties</CardTitle>
                <CardDescription>Manage properties connected to your account</CardDescription>
              </CardHeader>
              <CardContent>
                {linkedLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No properties linked yet</p>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => router.push('/')}
                    >
                      Get an Estimate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {linkedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-lg bg-slate-deep border border-slate-700 p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-200">
                              {lead.lead?.property?.street_address || 'Property'}
                            </p>
                            {lead.is_primary && (
                              <span className="text-xs bg-gold-light/10 text-gold-light px-2 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            {lead.lead?.property?.city}, {lead.lead?.property?.state}
                          </p>
                          <Input
                            placeholder="Add a nickname (e.g., Main House)"
                            value={nicknameEdits[lead.id] ?? lead.nickname ?? ''}
                            onChange={(e) => {
                              setNicknameEdits(prev => ({ ...prev, [lead.id]: e.target.value }))
                            }}
                            onBlur={(e) => {
                              const newValue = e.target.value
                              if (newValue !== (lead.nickname || '')) {
                                handleUpdatePropertyNickname(lead.id, newValue)
                              }
                              setNicknameEdits(prev => {
                                const next = { ...prev }
                                delete next[lead.id]
                                return next
                              })
                            }}
                            className="mt-2"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-4"
                          onClick={() => handleRemoveProperty(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => router.push('/')}
                    >
                      Add Another Property
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  )
}
