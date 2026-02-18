'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { IntegrationCard } from '@/components/admin/integration-card'
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bell,
  Tags,
  Save,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Send,
  Plus,
  X,
  Plug,
  Key,
} from 'lucide-react'
import {
  getContainerClasses,
  getIconClasses,
  getBadgeClasses,
} from '@/lib/styles/integration-status'
import { getSectionNavClasses, adminSpinner, adminResult } from '@/lib/styles/admin-theme'
import { AdminPageTransition, FadeInSection } from '@/components/admin/page-transition'
import { SkeletonPageContent } from '@/components/ui/skeleton'

interface IntegrationStatus {
  name: string
  id: string
  configured: boolean
  configuredVia: 'db' | 'env' | 'none'
  description: string
  envVars: string[]
  docsUrl?: string
  keyHint?: string
  lastTestedAt?: string
  lastTestSuccess?: boolean
  lastTestError?: string
  fields: Array<{
    key: string
    label: string
    required: boolean
    placeholder: string
    sensitive: boolean
  }>
}

interface Settings {
  company: {
    name: string
    legalName?: string
    tagline?: string
    phone?: string
    email?: string
    website?: string
  }
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  hours: {
    weekdaysOpen?: string
    weekdaysClose?: string
    saturdayOpen?: string
    saturdayClose?: string
    sundayOpen?: string
    sundayClose?: string
    emergencyAvailable?: boolean
  }
  pricing: {
    overheadPercent?: number
    profitMarginPercent?: number
    taxRate?: number
  }
  notifications: {
    newLeadEmail?: boolean
    estimateEmail?: boolean
    dailyDigest?: boolean
    emailRecipients?: string[]
  }
  leadSources: Array<{
    id: string
    name: string
    enabled: boolean
  }>
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState('company')

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Email testing state
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [testEmailError, setTestEmailError] = useState<string | null>(null)
  const [testEmailSuccess, setTestEmailSuccess] = useState(false)
  const [newEmailRecipient, setNewEmailRecipient] = useState('')

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false)
  const [encryptionConfigured, setEncryptionConfigured] = useState(false)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data.settings)
    } catch (err) {
      setError('Unable to load settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchIntegrations = useCallback(async () => {
    setIsLoadingIntegrations(true)
    try {
      const response = await fetch('/api/admin/integrations')
      if (!response.ok) throw new Error('Failed to fetch integrations')
      const data = await response.json()
      setIntegrations(data.integrations)
      setEncryptionConfigured(data.encryptionConfigured ?? false)
    } catch {
      // Failed to fetch integrations
    } finally {
      setIsLoadingIntegrations(false)
    }
  }, [])

  // API handlers for integration credentials
  const handleTestIntegration = async (serviceId: string, credentials: Record<string, string>) => {
    const response = await fetch(`/api/admin/integrations/${serviceId}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await response.json()
    return {
      success: data.success,
      error: data.error,
      details: data.details,
    }
  }

  const handleSaveIntegration = async (serviceId: string, credentials: Record<string, string>) => {
    const response = await fetch(`/api/admin/integrations/${serviceId}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await response.json()
    if (data.success) {
      // Refresh integrations list
      fetchIntegrations()
    }
    return {
      success: data.success,
      error: data.error,
    }
  }

  const handleRemoveIntegration = async (serviceId: string) => {
    const response = await fetch(`/api/admin/integrations/${serviceId}/credentials`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.success) {
      // Refresh integrations list
      fetchIntegrations()
    }
    return {
      success: data.success,
      error: data.error,
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Fetch integrations when that section is selected
  useEffect(() => {
    if (activeSection === 'integrations' && integrations.length === 0) {
      fetchIntegrations()
    }
  }, [activeSection, integrations.length, fetchIntegrations])

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!response.ok) throw new Error('Failed to save settings')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateCompany = (field: string, value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      company: { ...settings.company, [field]: value }
    })
  }

  const updateAddress = (field: string, value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      address: { ...settings.address, [field]: value }
    })
  }

  const updateHours = (field: string, value: string | boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      hours: { ...settings.hours, [field]: value }
    })
  }

  const updatePricing = (field: string, value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      pricing: { ...settings.pricing, [field]: value }
    })
  }

  const updateNotifications = (field: string, value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [field]: value }
    })
  }

  const toggleLeadSource = (id: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      leadSources: settings.leadSources.map(source =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    })
  }

  const addEmailRecipient = () => {
    if (!settings || !newEmailRecipient || !newEmailRecipient.includes('@')) return
    const currentRecipients = settings.notifications.emailRecipients || []
    if (currentRecipients.includes(newEmailRecipient)) return
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        emailRecipients: [...currentRecipients, newEmailRecipient]
      }
    })
    setNewEmailRecipient('')
  }

  const removeEmailRecipient = (email: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        emailRecipients: (settings.notifications.emailRecipients || []).filter(e => e !== email)
      }
    })
  }

  const sendTestEmail = async () => {
    const recipients = settings?.notifications.emailRecipients || []
    if (recipients.length === 0) {
      setTestEmailError('Please add at least one email recipient first')
      return
    }

    setIsSendingTestEmail(true)
    setTestEmailError(null)
    setTestEmailSuccess(false)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipients[0] })
      })

      const data = await response.json()

      if (!response.ok) {
        setTestEmailError(data.details || data.error || 'Failed to send test email')
        return
      }

      setTestEmailSuccess(true)
      setTimeout(() => setTestEmailSuccess(false), 5000)
    } catch (err) {
      setTestEmailError('An error occurred. Please try again.')
    } finally {
      setIsSendingTestEmail(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validate
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter')
      return
    }
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter')
      return
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one number')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to change password')
        return
      }

      setPasswordSuccess(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(false), 5000)
    } catch (err) {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <AdminPageTransition className="space-y-6">
        <SkeletonPageContent />
      </AdminPageTransition>
    )
  }

  if (error || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-gold" />
        <p className="mt-4 text-slate-600">{error || 'Failed to load settings'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={fetchSettings}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
      </div>
    )
  }

  const sections = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'pricing', label: 'Default Pricing', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'sources', label: 'Lead Sources', icon: Tags },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <AdminPageTransition className="space-y-6">
      {/* Header */}
      <FadeInSection delay={0} animation="fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">Configure your business settings</p>
          </div>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={saveSuccess ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            className={saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </FadeInSection>

      <FadeInSection delay={150} animation="slide-up">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${getSectionNavClasses(activeSection === section.id)}
                    `}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Info */}
          {activeSection === 'company' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Company Information</CardTitle>
                <CardDescription>Basic information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <Input
                      value={settings.company.name}
                      onChange={(e) => updateCompany('name', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name</label>
                    <Input
                      value={settings.company.legalName || ''}
                      onChange={(e) => updateCompany('legalName', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                  <Input
                    value={settings.company.tagline || ''}
                    onChange={(e) => updateCompany('tagline', e.target.value)}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <Input
                      value={settings.company.phone || ''}
                      onChange={(e) => updateCompany('phone', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={settings.company.email || ''}
                      onChange={(e) => updateCompany('email', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address */}
          {activeSection === 'address' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Business Address</CardTitle>
                <CardDescription>Physical location of your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                  <Input
                    value={settings.address.street || ''}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <Input
                      value={settings.address.city || ''}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <Input
                      value={settings.address.state || ''}
                      onChange={(e) => updateAddress('state', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                    <Input
                      value={settings.address.zip || ''}
                      onChange={(e) => updateAddress('zip', e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Hours */}
          {activeSection === 'hours' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Business Hours</CardTitle>
                <CardDescription>When your business is open</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Weekdays (Mon-Fri)</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Open</label>
                      <Input
                        type="time"
                        value={settings.hours.weekdaysOpen || ''}
                        onChange={(e) => updateHours('weekdaysOpen', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Close</label>
                      <Input
                        type="time"
                        value={settings.hours.weekdaysClose || ''}
                        onChange={(e) => updateHours('weekdaysClose', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Saturday</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Open</label>
                      <Input
                        type="time"
                        value={settings.hours.saturdayOpen || ''}
                        onChange={(e) => updateHours('saturdayOpen', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Close</label>
                      <Input
                        type="time"
                        value={settings.hours.saturdayClose || ''}
                        onChange={(e) => updateHours('saturdayClose', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Sunday</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Open (leave blank if closed)</label>
                      <Input
                        type="time"
                        value={settings.hours.sundayOpen || ''}
                        onChange={(e) => updateHours('sundayOpen', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Close</label>
                      <Input
                        type="time"
                        value={settings.hours.sundayClose || ''}
                        onChange={(e) => updateHours('sundayClose', e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={settings.hours.emergencyAvailable || false}
                      onChange={(e) => updateHours('emergencyAvailable', e.target.checked)}
                    />
                    <span className="text-sm text-slate-700">24/7 Emergency Service Available</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Default Pricing */}
          {activeSection === 'pricing' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Default Pricing Settings</CardTitle>
                <CardDescription>Default markup and tax rates for estimates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Overhead %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.pricing.overheadPercent || 0}
                      onChange={(e) => updatePricing('overheadPercent', parseFloat(e.target.value) || 0)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">Added to base material + labor cost</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profit Margin %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.pricing.profitMarginPercent || 0}
                      onChange={(e) => updatePricing('profitMarginPercent', parseFloat(e.target.value) || 0)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">Applied after overhead</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.pricing.taxRate || 0}
                      onChange={(e) => updatePricing('taxRate', parseFloat(e.target.value) || 0)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">Sales tax for materials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <>
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Email Recipients</CardTitle>
                  <CardDescription>Who should receive notification emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email recipients list */}
                  <div className="space-y-2">
                    {(settings.notifications.emailRecipients || []).map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{email}</span>
                        </div>
                        <button
                          onClick={() => removeEmailRecipient(email)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(settings.notifications.emailRecipients || []).length === 0 && (
                      <p className="text-sm text-slate-500 p-3 bg-gold-light/10 rounded-lg border border-gold-light/30">
                        No email recipients configured. Add at least one to receive notifications.
                      </p>
                    )}
                  </div>

                  {/* Add new recipient */}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={newEmailRecipient}
                      onChange={(e) => setNewEmailRecipient(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addEmailRecipient()}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={addEmailRecipient}
                      disabled={!newEmailRecipient || !newEmailRecipient.includes('@')}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Test email */}
                  <div className="pt-4 border-t border-slate-200">
                    {testEmailSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 mb-3">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Test email sent successfully</span>
                      </div>
                    )}
                    {testEmailError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">{testEmailError}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={sendTestEmail}
                      isLoading={isSendingTestEmail}
                      leftIcon={<Send className="h-4 w-4" />}
                      disabled={(settings.notifications.emailRecipients || []).length === 0}
                    >
                      Send Test Email
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      Sends a test email to the first recipient to verify your configuration
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Notification Types</CardTitle>
                  <CardDescription>Configure when you receive email alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.notifications.newLeadEmail || false}
                        onChange={(e) => updateNotifications('newLeadEmail', e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700">New Lead Notifications</span>
                        <p className="text-xs text-slate-500">Receive email when a new lead submits contact info</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.notifications.estimateEmail || false}
                        onChange={(e) => updateNotifications('estimateEmail', e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700">Estimate Generated</span>
                        <p className="text-xs text-slate-500">Receive email when an estimate is created</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.notifications.dailyDigest || false}
                        onChange={(e) => updateNotifications('dailyDigest', e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700">Daily Digest</span>
                        <p className="text-xs text-slate-500">Daily summary of leads and pipeline status</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Integrations
                  </CardTitle>
                  <CardDescription>
                    Configure third-party service integrations. You can set up API keys directly here or use environment variables.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!encryptionConfigured && (
                    <div className="mb-4 p-4 bg-gold-light/10 border border-gold-light/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gold-muted">Encryption Not Configured</h4>
                          <p className="text-sm text-gold-muted/80 mt-1">
                            To save API keys through the UI, set the <code className="px-1 py-0.5 bg-gold-light/20 rounded">API_KEYS_ENCRYPTION_KEY</code> environment variable.
                          </p>
                          <p className="text-xs text-gold-muted/70 mt-2">
                            Generate one with: <code className="px-1 py-0.5 bg-gold-light/20 rounded">openssl rand -base64 32</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoadingIntegrations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`h-6 w-6 animate-spin ${adminSpinner}`} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {integrations
                        .filter((i) => i.fields.length > 0) // Only show configurable integrations
                        .map((integration) => (
                          <IntegrationCard
                            key={integration.id}
                            id={integration.id}
                            name={integration.name}
                            description={integration.description}
                            configured={integration.configured}
                            configuredVia={integration.configuredVia}
                            keyHint={integration.keyHint}
                            lastTestedAt={integration.lastTestedAt}
                            lastTestSuccess={integration.lastTestSuccess}
                            lastTestError={integration.lastTestError}
                            fields={integration.fields}
                            docsUrl={integration.docsUrl}
                            onTest={(creds) => handleTestIntegration(integration.id, creds)}
                            onSave={(creds) => handleSaveIntegration(integration.id, creds)}
                            onRemove={() => handleRemoveIntegration(integration.id)}
                          />
                        ))}

                      {/* Supabase - not configurable via UI */}
                      {integrations
                        .filter((i) => i.fields.length === 0)
                        .map((integration) => (
                          <div
                            key={integration.id}
                            className={`p-4 ${getContainerClasses(integration.configured)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {integration.configured ? (
                                  <CheckCircle className={`h-5 w-5 mt-0.5 ${getIconClasses(true)}`} />
                                ) : (
                                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${getIconClasses(false)}`} />
                                )}
                                <div>
                                  <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                                  <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
                                  <p className="text-xs text-slate-500 mt-2">
                                    Configured via environment variables (required for the app to function)
                                  </p>
                                </div>
                              </div>
                              <span className={getBadgeClasses(integration.configured)}>
                                {integration.configured ? 'Connected' : 'Not configured'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help section */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-slate-900 mb-3">How Integration Configuration Works</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <h5 className="font-medium text-slate-800 mb-1">Option 1: Configure Here</h5>
                      <p className="text-sm text-slate-600">
                        Click on any integration above and enter your API keys. Keys are encrypted and stored securely in the database.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <h5 className="font-medium text-slate-800 mb-1">Option 2: Environment Variables</h5>
                      <p className="text-sm text-slate-600">
                        Set API keys in your hosting platform (Vercel). Environment variables take precedence over saved settings.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Both options are secure. Use the UI for easier management, or environment variables for deployment automation.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lead Sources */}
          {activeSection === 'sources' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Lead Sources</CardTitle>
                <CardDescription>Configure which lead sources are tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.leadSources.map((source) => (
                    <label
                      key={source.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={source.enabled}
                          onChange={() => toggleLeadSource(source.id)}
                        />
                        <span className="text-sm font-medium text-slate-700">{source.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{source.id}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Change Password</CardTitle>
                <CardDescription>Update your admin account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Password changed successfully</span>
                  </div>
                )}

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{passwordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Min 8 characters, with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    isLoading={isChangingPassword}
                    leftIcon={<Shield className="h-4 w-4" />}
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </FadeInSection>
    </AdminPageTransition>
  )
}
