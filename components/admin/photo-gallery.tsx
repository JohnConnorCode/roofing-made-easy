'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Tag,
  AlertTriangle,
  Camera,
  Eye,
  Maximize2,
  Grid3X3,
  List,
  Loader2,
  CheckCircle,
} from 'lucide-react'

const PHOTO_CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
  { value: 'damage', label: 'Damage', color: 'bg-red-100 text-red-700' },
  { value: 'before', label: 'Before', color: 'bg-amber-100 text-amber-700' },
  { value: 'after', label: 'After', color: 'bg-green-100 text-green-700' },
  { value: 'closeup', label: 'Close-up', color: 'bg-blue-100 text-blue-700' },
  { value: 'wide_angle', label: 'Wide Angle', color: 'bg-purple-100 text-purple-700' },
  { value: 'inspection', label: 'Inspection', color: 'bg-cyan-100 text-cyan-700' },
] as const

type PhotoCategory = typeof PHOTO_CATEGORIES[number]['value']

interface Photo {
  id: string
  storage_path: string
  original_filename: string
  ai_analyzed: boolean
  ai_detected_issues: string[]
  category?: PhotoCategory
  description?: string
  tags?: string[]
}

interface PhotoGalleryProps {
  photos: Photo[]
  supabaseUrl: string
  leadId: string
  onUpdatePhoto?: (photoId: string, updates: Partial<Photo>) => Promise<void>
}

export function PhotoGallery({ photos, supabaseUrl, leadId, onUpdatePhoto }: PhotoGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<PhotoCategory | 'all'>('all')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState(photos)

  // Update local photos when props change
  useEffect(() => {
    setLocalPhotos(photos)
  }, [photos])

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (updateSuccess || updateError) {
      const timer = setTimeout(() => {
        setUpdateSuccess(null)
        setUpdateError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [updateSuccess, updateError])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex])

  const handleCategoryChange = async (photoId: string, newCategory: PhotoCategory) => {
    const previousPhotos = [...localPhotos]
    const previousCategory = localPhotos.find(p => p.id === photoId)?.category

    // Optimistic update
    setLocalPhotos(prev =>
      prev.map(p => p.id === photoId ? { ...p, category: newCategory } : p)
    )
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const response = await fetch(`/api/leads/${leadId}/photos/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      })

      if (!response.ok) {
        // Rollback on failure
        setLocalPhotos(previousPhotos)
        const errorData = await response.json().catch(() => ({ error: 'Update failed' }))
        setUpdateError(errorData.error || 'Failed to update category')
        return
      }

      // Success
      setUpdateSuccess('Category updated')
      if (onUpdatePhoto) {
        await onUpdatePhoto(photoId, { category: newCategory })
      }
    } catch {
      // Rollback on error
      setLocalPhotos(previousPhotos)
      setUpdateError('Network error. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getPhotoUrl = useCallback((path: string) => {
    return `${supabaseUrl}/storage/v1/object/public/photos/${path}`
  }, [supabaseUrl])

  const filteredPhotos = filter === 'all'
    ? localPhotos
    : localPhotos.filter(p => p.category === filter)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const goToPrevious = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  const goToNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
  }

  const getCategoryConfig = (category?: string) => {
    return PHOTO_CATEGORIES.find(c => c.value === category) || PHOTO_CATEGORIES[0]
  }

  if (localPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Camera className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-600 font-medium">No photos uploaded</p>
        <p className="text-sm text-slate-400">Photos from the customer will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {updateError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{updateError}</span>
          <button onClick={() => setUpdateError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {updateSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({localPhotos.length})
          </button>
          {PHOTO_CATEGORIES.map((cat) => {
            const count = localPhotos.filter(p => p.category === cat.value).length
            if (count === 0) return null
            return (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === cat.value
                    ? cat.color
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => {
            const categoryConfig = getCategoryConfig(photo.category)
            const photoUrl = getPhotoUrl(photo.storage_path)
            const hasIssues = photo.ai_analyzed && photo.ai_detected_issues?.length > 0

            return (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photoUrl}
                  alt={photo.original_filename || 'Photo'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                    {categoryConfig.label}
                  </span>
                </div>

                {/* AI Issues Badge */}
                {hasIssues && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      {photo.ai_detected_issues.length} issue{photo.ai_detected_issues.length > 1 ? 's' : ''} detected
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredPhotos.map((photo, index) => {
            const categoryConfig = getCategoryConfig(photo.category)
            const photoUrl = getPhotoUrl(photo.storage_path)
            const hasIssues = photo.ai_analyzed && photo.ai_detected_issues?.length > 0

            return (
              <div
                key={photo.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={photoUrl}
                    alt={photo.original_filename || 'Photo'}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </span>
                    {photo.ai_analyzed && (
                      <span className="text-xs text-slate-400">AI Analyzed</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {photo.original_filename || 'Unnamed photo'}
                  </p>
                  {photo.description && (
                    <p className="text-xs text-slate-500 truncate">{photo.description}</p>
                  )}
                  {hasIssues && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      {photo.ai_detected_issues.join(', ')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(photoUrl, '_blank')
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openLightbox(index)
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getPhotoUrl(filteredPhotos[lightboxIndex].storage_path)}
              alt={filteredPhotos[lightboxIndex].original_filename || 'Photo'}
              className="max-w-full max-h-[85vh] object-contain"
            />

            {/* Photo Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                {/* Category Selector */}
                <div className="flex items-center gap-2">
                  {isUpdating && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                  <select
                    value={filteredPhotos[lightboxIndex].category || 'general'}
                    onChange={(e) => handleCategoryChange(filteredPhotos[lightboxIndex].id, e.target.value as PhotoCategory)}
                    disabled={isUpdating}
                    className="px-2 py-1 rounded text-xs font-medium bg-white/20 text-white border border-white/30 cursor-pointer hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="text-slate-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-white/70 text-sm">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>
              {filteredPhotos[lightboxIndex].ai_detected_issues?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filteredPhotos[lightboxIndex].ai_detected_issues.map((issue, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/80 text-white text-xs"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {issue}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
