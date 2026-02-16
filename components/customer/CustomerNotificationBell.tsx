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

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-slate-500',
  normal: 'bg-blue-400',
  high: 'bg-amber-400',
  urgent: 'bg-red-500',
}

function isSafeUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}

export function CustomerNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/customer/notifications/unread-count')
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
      const response = await fetch('/api/customer/notifications?limit=10')
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

  // Poll for unread count every 30 seconds (pause when tab hidden)
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id)
      if (notification?.read_at) return // Already read
      const res = await fetch(`/api/customer/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (!res.ok) return
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Non-critical — will sync on next poll
    }
  }

  const dismiss = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id)
      const res = await fetch(`/api/customer/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      })
      if (!res.ok) return
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      // Only decrement if the notification was unread
      if (notification && !notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      // Non-critical — will sync on next poll
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-gold-light hover:bg-slate-800 transition-colors"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-gold text-ink text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-slate-deep rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 border-2 border-slate-600 border-t-gold rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="mt-2 text-sm text-slate-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-slate-700/50 last:border-0 ${
                    !notification.read_at ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                        PRIORITY_DOTS[notification.priority] || 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read_at ? 'font-medium text-slate-100' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-slate-500 hover:text-green-400 transition-colors"
                          aria-label={`Mark as read: ${notification.title}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(notification.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        aria-label={`Dismiss: ${notification.title}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {notification.action_url && isSafeUrl(notification.action_url) && (
                    <Link
                      href={notification.action_url}
                      onClick={() => {
                        markAsRead(notification.id)
                        setIsOpen(false)
                      }}
                      className="inline-flex items-center gap-1 text-xs text-gold-light hover:underline mt-1 ml-5"
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
