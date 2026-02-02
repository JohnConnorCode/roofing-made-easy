'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Archive, Download, RefreshCw, ChevronDown, Loader2, AlertTriangle } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkStatusChange: (status: string) => Promise<void>
  onBulkExport: () => void
  onBulkArchive: () => Promise<void>
  isProcessing?: boolean
}

const BULK_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'intake_started', label: 'Intake Started' },
  { value: 'intake_complete', label: 'Intake Complete' },
  { value: 'estimate_generated', label: 'Estimate Generated' },
  { value: 'consultation_scheduled', label: 'Consultation Scheduled' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

// Statuses that require confirmation
const DESTRUCTIVE_STATUSES = ['lost', 'archived']

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isProcessing?: boolean
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isProcessing
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
  onBulkExport,
  onBulkArchive,
  isProcessing
}: BulkActionsProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: 'status' | 'archive'
    status?: string
    statusLabel?: string
  }>({ isOpen: false, action: 'archive' })

  if (selectedCount === 0) return null

  const handleStatusClick = (status: string, label: string) => {
    setShowStatusDropdown(false)

    // Require confirmation for destructive statuses
    if (DESTRUCTIVE_STATUSES.includes(status)) {
      setConfirmDialog({
        isOpen: true,
        action: 'status',
        status,
        statusLabel: label
      })
    } else {
      onBulkStatusChange(status)
    }
  }

  const handleArchiveClick = () => {
    setConfirmDialog({
      isOpen: true,
      action: 'archive'
    })
  }

  const handleConfirm = async () => {
    if (confirmDialog.action === 'status' && confirmDialog.status) {
      await onBulkStatusChange(confirmDialog.status)
    } else if (confirmDialog.action === 'archive') {
      await onBulkArchive()
    }
    setConfirmDialog({ isOpen: false, action: 'archive' })
  }

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, action: 'archive' })
  }

  const getConfirmDialogProps = () => {
    if (confirmDialog.action === 'archive') {
      return {
        title: 'Archive Leads',
        message: `Are you sure you want to archive ${selectedCount} lead${selectedCount > 1 ? 's' : ''}? Archived leads will be hidden from the main view but can be restored later.`,
        confirmLabel: 'Archive'
      }
    }
    return {
      title: `Mark as ${confirmDialog.statusLabel}`,
      message: `Are you sure you want to mark ${selectedCount} lead${selectedCount > 1 ? 's' : ''} as "${confirmDialog.statusLabel}"? This action can be undone by changing the status again.`,
      confirmLabel: `Mark as ${confirmDialog.statusLabel}`
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl">
          {/* Selected count */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-600">
            <span className="bg-amber-500 text-white text-sm font-semibold px-2 py-0.5 rounded">
              {selectedCount}
            </span>
            <span className="text-sm text-slate-300">selected</span>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-slate-700 rounded"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isProcessing && (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          )}

          {/* Change Status dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={isProcessing}
              className="text-white hover:bg-slate-700"
              rightIcon={<ChevronDown className="h-4 w-4" />}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Status
            </Button>

            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 bg-white text-slate-900 rounded-lg shadow-xl border py-1 min-w-[180px]">
                  {BULK_STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusClick(option.value, option.label)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                    >
                      {option.label}
                      {DESTRUCTIVE_STATUSES.includes(option.value) && (
                        <span className="text-xs text-amber-600">(confirm)</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkExport}
            disabled={isProcessing}
            className="text-white hover:bg-slate-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Archive */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveClick}
            disabled={isProcessing}
            className="text-white hover:bg-slate-700"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isProcessing={isProcessing}
        {...getConfirmDialogProps()}
      />
    </>
  )
}
