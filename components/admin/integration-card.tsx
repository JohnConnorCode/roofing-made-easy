'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import {
  getIconClasses,
  getBadgeClasses,
  getSourceBadgeClasses,
  getResultClasses,
} from '@/lib/styles/integration-status'

interface FieldConfig {
  key: string
  label: string
  required: boolean
  placeholder: string
  sensitive: boolean
}

interface IntegrationCardProps {
  id: string
  name: string
  description: string
  configured: boolean
  configuredVia: 'db' | 'env' | 'none'
  keyHint?: string
  lastTestedAt?: string
  lastTestSuccess?: boolean
  lastTestError?: string
  fields: FieldConfig[]
  docsUrl?: string
  onSave: (credentials: Record<string, string>) => Promise<{ success: boolean; error?: string }>
  onTest: (credentials: Record<string, string>) => Promise<{ success: boolean; error?: string; details?: string }>
  onRemove: () => Promise<{ success: boolean; error?: string }>
}

export function IntegrationCard({
  id,
  name,
  description,
  configured,
  configuredVia,
  keyHint,
  lastTestedAt,
  lastTestSuccess,
  lastTestError,
  fields,
  docsUrl,
  onSave,
  onTest,
  onRemove,
}: IntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [showFields, setShowFields] = useState<Record<string, boolean>>({})
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; details?: string } | null>(null)
  const [saveResult, setSaveResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleFieldChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
    setTestResult(null)
    setSaveResult(null)
  }

  const toggleFieldVisibility = (key: string) => {
    setShowFields((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    setSaveResult(null)
    try {
      const result = await onTest(credentials)
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Test failed' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)
    try {
      const result = await onSave(credentials)
      setSaveResult(result)
      if (result.success) {
        setCredentials({})
        setIsExpanded(false)
      }
    } catch (error) {
      setSaveResult({ success: false, error: error instanceof Error ? error.message : 'Save failed' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const result = await onRemove()
      if (result.success) {
        setShowRemoveConfirm(false)
        setCredentials({})
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsRemoving(false)
    }
  }

  const hasRequiredFields = fields
    .filter((f) => f.required)
    .every((f) => credentials[f.key]?.trim())

  const canSave = hasRequiredFields && testResult?.success

  // Format last tested time
  const formatLastTested = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <Card
      className={`
        bg-white border-2 transition-all border-slate-200
        ${configured ? 'hover:border-slate-300' : 'hover:border-gold-light'}
      `}
    >
      <CardContent className="p-0">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start justify-between text-left hover:bg-slate-50 transition-colors rounded-t-lg"
        >
          <div className="flex items-start gap-3">
            {configured ? (
              <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconClasses(true)}`} />
            ) : (
              <XCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconClasses(false)}`} />
            )}
            <div>
              <h4 className="font-semibold text-slate-900">{name}</h4>
              <p className="text-sm text-slate-600 mt-0.5">{description}</p>
              {configured && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={getSourceBadgeClasses(configuredVia)}>
                    {configuredVia === 'db' ? 'Configured in Settings' : 'Using Environment Variable'}
                  </span>
                  {keyHint && configuredVia === 'db' && (
                    <span className="text-xs text-slate-500 font-mono">{keyHint}</span>
                  )}
                </div>
              )}
              {lastTestedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Last tested: {formatLastTested(lastTestedAt)}
                  {lastTestSuccess !== undefined && (
                    <span className={lastTestSuccess ? 'text-gold' : 'text-red-600'}>
                      {' '}- {lastTestSuccess ? 'Passed' : 'Failed'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={getBadgeClasses(configured)}>
              {configured ? 'Connected' : 'Not configured'}
            </span>
            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                title="View documentation"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Expanded content - Configuration form */}
        {isExpanded && fields.length > 0 && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="pt-4 space-y-4">
              {/* Form fields */}
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <Input
                      type={field.sensitive && !showFields[field.key] ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="pr-10"
                    />
                    {field.sensitive && (
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showFields[field.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Test result */}
              {testResult && (
                <div className={getResultClasses(testResult.success)}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">
                    {testResult.success
                      ? testResult.details || 'Connection successful!'
                      : testResult.error || 'Connection failed'}
                  </span>
                </div>
              )}

              {/* Save result */}
              {saveResult && (
                <div className={getResultClasses(saveResult.success)}>
                  {saveResult.success ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">
                    {saveResult.success
                      ? 'Credentials saved successfully!'
                      : saveResult.error || 'Failed to save credentials'}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={!hasRequiredFields || isTesting}
                  leftIcon={isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  leftIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>

                {/* Remove button (only show if configured via DB) */}
                {configured && configuredVia === 'db' && (
                  <>
                    {showRemoveConfirm ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-slate-600">Remove credentials?</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemove}
                          disabled={isRemoving}
                        >
                          {isRemoving ? 'Removing...' : 'Yes, Remove'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRemoveConfirm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRemoveConfirm(true)}
                        className="ml-auto text-slate-500 hover:text-red-600"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Help text */}
              <p className="text-xs text-slate-500 pt-2">
                Test your credentials before saving. Once saved, credentials are encrypted and stored securely.
                {configuredVia === 'env' && (
                  <span className="block mt-1">
                    Note: Credentials configured via environment variables take precedence over saved settings.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Show message for non-configurable integrations */}
        {isExpanded && fields.length === 0 && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <p className="pt-4 text-sm text-slate-600">
              This integration is configured via environment variables and cannot be modified through the UI.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
