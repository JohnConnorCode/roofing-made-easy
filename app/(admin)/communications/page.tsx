'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  MessageSquare,
  FileText,
  Tag,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'
import { TemplateListPanel } from '@/components/admin/communications/TemplateListPanel'
import { EstimateContentPanel } from '@/components/admin/communications/EstimateContentPanel'
import { VariablesReference } from '@/components/admin/communications/VariablesReference'

type TabId = 'email' | 'sms' | 'estimate' | 'variables'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'sms', label: 'SMS Templates', icon: MessageSquare },
  { id: 'estimate', label: 'Estimate Content', icon: FileText },
  { id: 'variables', label: 'Variables', icon: Tag },
]

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('email')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})

  // Clear success after 3s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleError = useCallback((message: string) => setError(message), [])
  const handleSuccess = useCallback((message: string) => setSuccessMessage(message), [])

  const handleTotalChange = useCallback((tabId: string, total: number) => {
    setTabCounts(prev => prev[tabId] === total ? prev : { ...prev, [tabId]: total })
  }, [])

  const handleEmailTotal = useCallback((total: number) => handleTotalChange('email', total), [handleTotalChange])
  const handleSmsTotal = useCallback((total: number) => handleTotalChange('sms', total), [handleTotalChange])
  const handleEstimateTotal = useCallback((total: number) => handleTotalChange('estimate', total), [handleTotalChange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Communications</h1>
        <p className="text-slate-500">Manage email templates, SMS templates, and estimate content</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0">
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count = tabCounts[tab.id]
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {count !== undefined && count > 0 && (
                  <span className={`ml-0.5 sm:ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Panels - kept mounted with hidden to preserve state */}
      <div id="panel-email" role="tabpanel" className={activeTab !== 'email' ? 'hidden' : undefined}>
        <TemplateListPanel
          lockedType="email"
          onError={handleError}
          onSuccess={handleSuccess}
          onTotalChange={handleEmailTotal}
        />
      </div>

      <div id="panel-sms" role="tabpanel" className={activeTab !== 'sms' ? 'hidden' : undefined}>
        <TemplateListPanel
          lockedType="sms"
          onError={handleError}
          onSuccess={handleSuccess}
          onTotalChange={handleSmsTotal}
        />
      </div>

      <div id="panel-estimate" role="tabpanel" className={activeTab !== 'estimate' ? 'hidden' : undefined}>
        <EstimateContentPanel
          onError={handleError}
          onSuccess={handleSuccess}
          onTotalChange={handleEstimateTotal}
        />
      </div>

      <div id="panel-variables" role="tabpanel" className={activeTab !== 'variables' ? 'hidden' : undefined}>
        <VariablesReference />
      </div>
    </div>
  )
}
