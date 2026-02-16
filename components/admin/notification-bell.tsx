'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Bell, Check, X, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  priority: string
  action_url: string | null
  action_label: string | null
  read_at: string | null
  created_at: string
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'border-l-slate-300',
  normal: 'border-l-blue-400',
  high: 'border-l-amber-400',
  urgent: 'border-l-red-500',
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications/unread-count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch {
      // Silently fail - notification count is non-critical
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Poll for unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Silently fail
    }
  }

  const dismiss = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id)
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      // Only decrement if the notification was unread
      if (notification && !notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      // Silently fail
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/admin/notifications/mark-all-read', { method: 'POST' })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-gold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 border-2 border-slate-300 border-t-gold rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-slate-200 mx-auto" />
                <p className="mt-2 text-sm text-slate-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-slate-100 last:border-0 border-l-2 ${
                    PRIORITY_STYLES[notification.priority] || 'border-l-blue-400'
                  } ${!notification.read_at ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read_at ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(notification.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {notification.action_url && (
                    <Link
                      href={notification.action_url}
                      onClick={() => {
                        markAsRead(notification.id)
                        setIsOpen(false)
                      }}
                      className="inline-flex items-center gap-1 text-xs text-gold hover:underline mt-1"
                    >
                      {notification.action_label || 'View'}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
