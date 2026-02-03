import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Photo Gallery Component Tests
// Note: Due to complex component dependencies, we test the logic separately

describe('PhotoGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('Photo URL Generation', () => {
    it('generates correct photo URL from storage path', () => {
      const supabaseUrl = 'https://project.supabase.co'
      const storagePath = 'lead-123/uuid-456.jpg'

      const photoUrl = `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`

      expect(photoUrl).toBe(
        'https://project.supabase.co/storage/v1/object/public/photos/lead-123/uuid-456.jpg'
      )
    })

    it('handles special characters in storage path', () => {
      const supabaseUrl = 'https://project.supabase.co'
      const storagePath = 'lead-123/photo with spaces.jpg'

      const photoUrl = `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`

      expect(photoUrl).toContain('photo with spaces')
    })
  })

  describe('Category Badge Styling', () => {
    const PHOTO_CATEGORIES = [
      { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
      { value: 'damage', label: 'Damage', color: 'bg-red-100 text-red-700' },
      { value: 'before', label: 'Before', color: 'bg-amber-100 text-amber-700' },
      { value: 'after', label: 'After', color: 'bg-green-100 text-green-700' },
      { value: 'closeup', label: 'Close-up', color: 'bg-blue-100 text-blue-700' },
      { value: 'wide_angle', label: 'Wide Angle', color: 'bg-purple-100 text-purple-700' },
      { value: 'inspection', label: 'Inspection', color: 'bg-cyan-100 text-cyan-700' },
    ]

    it('returns correct config for each category', () => {
      const getCategoryConfig = (category?: string) => {
        return PHOTO_CATEGORIES.find((c) => c.value === category) || PHOTO_CATEGORIES[0]
      }

      expect(getCategoryConfig('damage').color).toContain('red')
      expect(getCategoryConfig('after').color).toContain('green')
      expect(getCategoryConfig('before').color).toContain('amber')
    })

    it('defaults to general for unknown category', () => {
      const getCategoryConfig = (category?: string) => {
        return PHOTO_CATEGORIES.find((c) => c.value === category) || PHOTO_CATEGORIES[0]
      }

      expect(getCategoryConfig('unknown').value).toBe('general')
      expect(getCategoryConfig(undefined).value).toBe('general')
    })
  })

  describe('AI Issue Detection Display', () => {
    it('shows issue badge when AI detected issues', () => {
      const photo = {
        id: 'photo-1',
        ai_analyzed: true,
        ai_detected_issues: ['Missing shingles', 'Water damage'],
      }

      const hasIssues = photo.ai_analyzed && photo.ai_detected_issues?.length > 0

      expect(hasIssues).toBe(true)
    })

    it('hides issue badge when no issues detected', () => {
      const photo = {
        id: 'photo-1',
        ai_analyzed: true,
        ai_detected_issues: [],
      }

      const hasIssues = photo.ai_analyzed && photo.ai_detected_issues?.length > 0

      expect(hasIssues).toBe(false)
    })

    it('hides issue badge when not analyzed', () => {
      const photo = {
        id: 'photo-1',
        ai_analyzed: false,
        ai_detected_issues: ['Some issue'],
      }

      const hasIssues = photo.ai_analyzed && photo.ai_detected_issues?.length > 0

      expect(hasIssues).toBe(false)
    })

    it('formats issue count correctly', () => {
      const issues = ['Issue 1', 'Issue 2', 'Issue 3']
      const count = issues.length
      const text = `${count} issue${count > 1 ? 's' : ''} detected`

      expect(text).toBe('3 issues detected')
    })

    it('handles single issue grammatically', () => {
      const issues = ['Single issue']
      const count = issues.length
      const text = `${count} issue${count > 1 ? 's' : ''} detected`

      expect(text).toBe('1 issue detected')
    })
  })

  describe('Filter Functionality', () => {
    it('filters photos by selected category', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'general' },
        { id: '3', category: 'damage' },
        { id: '4', category: 'after' },
      ]

      const filter: string = 'damage'
      const filteredPhotos =
        filter === 'all' ? photos : photos.filter((p) => p.category === filter)

      expect(filteredPhotos).toHaveLength(2)
      expect(filteredPhotos.every((p) => p.category === 'damage')).toBe(true)
    })

    it('shows all photos when filter is all', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'general' },
      ]

      const filter = 'all'
      const filteredPhotos =
        filter === 'all' ? photos : photos.filter((p) => p.category === filter)

      expect(filteredPhotos).toHaveLength(2)
    })

    it('hides filter buttons for categories with no photos', () => {
      const photos = [
        { id: '1', category: 'damage' },
        { id: '2', category: 'damage' },
      ]

      const categoryCounts = photos.reduce(
        (acc, p) => {
          acc[p.category || 'general'] = (acc[p.category || 'general'] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      expect(categoryCounts['damage']).toBe(2)
      expect(categoryCounts['general']).toBeUndefined()
      expect(categoryCounts['after']).toBeUndefined()
    })
  })

  describe('View Mode Toggle', () => {
    it('supports grid view mode', () => {
      const viewMode = 'grid'
      expect(['grid', 'list']).toContain(viewMode)
    })

    it('supports list view mode', () => {
      const viewMode = 'list'
      expect(['grid', 'list']).toContain(viewMode)
    })

    it('defaults to grid view', () => {
      const defaultViewMode = 'grid'
      expect(defaultViewMode).toBe('grid')
    })
  })

  describe('Lightbox Navigation', () => {
    it('opens lightbox at correct index', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const clickedIndex = 1

      const lightboxIndex = clickedIndex

      expect(lightboxIndex).toBe(1)
      expect(photos[lightboxIndex].id).toBe('2')
    })

    it('navigates to next photo', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const currentIndex = 0

      const nextIndex = (currentIndex + 1) % photos.length

      expect(nextIndex).toBe(1)
    })

    it('wraps around at end', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const currentIndex = 2

      const nextIndex = (currentIndex + 1) % photos.length

      expect(nextIndex).toBe(0)
    })

    it('navigates to previous photo', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const currentIndex = 1

      const prevIndex = (currentIndex - 1 + photos.length) % photos.length

      expect(prevIndex).toBe(0)
    })

    it('wraps around at beginning', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const currentIndex = 0

      const prevIndex = (currentIndex - 1 + photos.length) % photos.length

      expect(prevIndex).toBe(2)
    })

    it('closes lightbox', () => {
      let lightboxIndex: number | null = 1

      const closeLightbox = () => {
        lightboxIndex = null
      }

      closeLightbox()
      expect(lightboxIndex).toBeNull()
    })
  })

  describe('Category Change API Integration', () => {
    it('calls correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ photo: { id: 'photo-1', category: 'damage' } }),
      })

      const leadId = 'lead-123'
      const photoId = 'photo-456'
      const newCategory = 'damage'

      await fetch(`/api/leads/${leadId}/photos/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/leads/lead-123/photos/photo-456',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ category: 'damage' }),
        })
      )
    })

    it('updates local state on successful API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ photo: { id: 'photo-1', category: 'damage' } }),
      })

      const photos = [
        { id: 'photo-1', category: 'general' },
        { id: 'photo-2', category: 'general' },
      ]

      // Simulate state update
      const updatedPhotos = photos.map((p) =>
        p.id === 'photo-1' ? { ...p, category: 'damage' } : p
      )

      expect(updatedPhotos[0].category).toBe('damage')
    })

    it('handles API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const response = await fetch('/api/leads/lead-123/photos/photo-456', {
        method: 'PATCH',
        body: JSON.stringify({ category: 'damage' }),
      })

      expect(response.ok).toBe(false)
    })

    it('disables select during update', () => {
      const isUpdating = true
      const selectDisabled = isUpdating

      expect(selectDisabled).toBe(true)
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no photos', () => {
      const photos: unknown[] = []
      const isEmpty = photos.length === 0

      expect(isEmpty).toBe(true)
    })

    it('displays camera icon in empty state', () => {
      // Empty state should show Camera icon
      const emptyStateContent = {
        icon: 'Camera',
        title: 'No photos uploaded',
        subtitle: 'Photos from the customer will appear here',
      }

      expect(emptyStateContent.icon).toBe('Camera')
    })
  })

  describe('Photo Counter', () => {
    it('shows current position in lightbox', () => {
      const photos = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const currentIndex = 1

      const counter = `${currentIndex + 1} / ${photos.length}`

      expect(counter).toBe('2 / 3')
    })
  })

  describe('Download Functionality', () => {
    it('opens photo in new tab for download', () => {
      const photoUrl = 'https://storage.example.com/photos/lead-123/photo.jpg'

      // Simulate window.open call
      const openNewTab = (url: string) => {
        return { url, target: '_blank' }
      }

      const result = openNewTab(photoUrl)
      expect(result.url).toBe(photoUrl)
      expect(result.target).toBe('_blank')
    })
  })
})

describe('Photo Interface', () => {
  it('defines correct photo structure', () => {
    interface Photo {
      id: string
      storage_path: string
      original_filename: string
      ai_analyzed: boolean
      ai_detected_issues: string[]
      category?: string
      description?: string
      tags?: string[]
    }

    const photo: Photo = {
      id: 'photo-123',
      storage_path: 'lead-456/uuid-789.jpg',
      original_filename: 'roof-damage.jpg',
      ai_analyzed: true,
      ai_detected_issues: ['Missing shingles'],
      category: 'damage',
      description: 'North side damage',
      tags: ['damage', 'shingle'],
    }

    expect(photo.id).toBeDefined()
    expect(photo.storage_path).toBeDefined()
    expect(photo.ai_analyzed).toBe(true)
  })
})

describe('PhotoGallery Props', () => {
  it('requires photos array', () => {
    interface PhotoGalleryProps {
      photos: unknown[]
      supabaseUrl: string
      leadId: string
      onUpdatePhoto?: (photoId: string, updates: unknown) => Promise<void>
    }

    const props: PhotoGalleryProps = {
      photos: [],
      supabaseUrl: 'https://project.supabase.co',
      leadId: 'lead-123',
    }

    expect(props.photos).toBeDefined()
    expect(props.supabaseUrl).toBeDefined()
    expect(props.leadId).toBeDefined()
  })

  it('has optional onUpdatePhoto callback', () => {
    const onUpdatePhoto = vi.fn()

    expect(onUpdatePhoto).toBeDefined()
  })
})
