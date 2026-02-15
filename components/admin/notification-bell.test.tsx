import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { NotificationBell } from './notification-bell'

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock lucide-react icons to render identifiable elements
vi.mock('lucide-react', () => ({
  Bell: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
  Check: ({ className }: { className?: string }) => (
    <svg data-testid="check-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg data-testid="external-link-icon" className={className} />
  ),
}))

// Mock @/lib/utils
vi.mock('@/lib/utils', () => ({
  formatDate: (date: string) => date,
}))

const mockNotifications = [
  {
    id: 'n1',
    type: 'new_lead',
    title: 'New lead received',
    message: 'John Doe submitted a request',
    priority: 'normal',
    action_url: '/admin/leads/123',
    action_label: 'View Lead',
    read_at: null,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'n2',
    type: 'estimate_approved',
    title: 'Estimate approved',
    message: null,
    priority: 'high',
    action_url: null,
    action_label: null,
    read_at: '2025-01-15T11:00:00Z',
    created_at: '2025-01-15T09:00:00Z',
  },
]

function createFetchMock(unreadCount: number, notifications: typeof mockNotifications = []) {
  return vi.fn((url: string) => {
    if (url === '/api/admin/notifications/unread-count') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: unreadCount }),
      })
    }
    if (url.startsWith('/api/admin/notifications?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ notifications }),
      })
    }
    if (url === '/api/admin/notifications/mark-all-read') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    if (url.match(/\/api\/admin\/notifications\/.+/)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('NotificationBell', () => {
  it('renders bell icon', async () => {
    global.fetch = createFetchMock(0) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
  })

  it('shows badge with unread count when count > 0', async () => {
    global.fetch = createFetchMock(5) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('shows 99+ when unread count exceeds 99', async () => {
    global.fetch = createFetchMock(150) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument()
    })
  })

  it('hides badge when count is 0', async () => {
    global.fetch = createFetchMock(0) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('opens dropdown panel on click', async () => {
    global.fetch = createFetchMock(2, mockNotifications) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })

    // Dropdown should not be visible initially
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()

    // Click the bell button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    // Dropdown header should now be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('fetches notifications when dropdown opens', async () => {
    const fetchMock = createFetchMock(2, mockNotifications)
    global.fetch = fetchMock as unknown as typeof fetch

    await act(async () => {
      render(<NotificationBell />)
    })

    // Open dropdown
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    // Verify notification content appears
    await waitFor(() => {
      expect(screen.getByText('New lead received')).toBeInTheDocument()
      expect(screen.getByText('Estimate approved')).toBeInTheDocument()
    })

    // Verify fetch was called for notifications endpoint
    const notifCalls = fetchMock.mock.calls.filter(
      (call: string[]) => call[0].startsWith('/api/admin/notifications?')
    )
    expect(notifCalls.length).toBeGreaterThan(0)
  })

  it('shows notification messages', async () => {
    global.fetch = createFetchMock(1, mockNotifications) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe submitted a request')).toBeInTheDocument()
    })
  })

  it('shows action link when action_url is provided', async () => {
    global.fetch = createFetchMock(1, mockNotifications) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('View Lead')).toBeInTheDocument()
    })
  })

  it('shows "Mark all read" button when there are unread notifications', async () => {
    global.fetch = createFetchMock(2, mockNotifications) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument()
    })
  })

  it('calls mark-all-read API when button is clicked', async () => {
    const fetchMock = createFetchMock(2, mockNotifications)
    global.fetch = fetchMock as unknown as typeof fetch

    await act(async () => {
      render(<NotificationBell />)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Mark all read'))
    })

    const markAllCalls = fetchMock.mock.calls.filter(
      (call: string[]) => call[0] === '/api/admin/notifications/mark-all-read'
    )
    expect(markAllCalls.length).toBe(1)
  })

  it('shows empty state when no notifications exist', async () => {
    global.fetch = createFetchMock(0, []) as unknown as typeof fetch
    await act(async () => {
      render(<NotificationBell />)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument()
    })
  })

  it('fetches unread count on mount', async () => {
    const fetchMock = createFetchMock(3)
    global.fetch = fetchMock as unknown as typeof fetch

    await act(async () => {
      render(<NotificationBell />)
    })

    await waitFor(() => {
      const countCalls = fetchMock.mock.calls.filter(
        (call: string[]) => call[0] === '/api/admin/notifications/unread-count'
      )
      expect(countCalls.length).toBe(1)
    })
  })

  it('polls unread count at 30-second intervals', async () => {
    vi.useFakeTimers()
    const fetchMock = createFetchMock(1)
    global.fetch = fetchMock as unknown as typeof fetch

    await act(async () => {
      render(<NotificationBell />)
    })

    // Initial fetch
    const initialCalls = fetchMock.mock.calls.filter(
      (call: string[]) => call[0] === '/api/admin/notifications/unread-count'
    ).length

    // Advance 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000)
    })

    const afterOnePoll = fetchMock.mock.calls.filter(
      (call: string[]) => call[0] === '/api/admin/notifications/unread-count'
    ).length

    expect(afterOnePoll).toBe(initialCalls + 1)

    vi.useRealTimers()
  })
})
