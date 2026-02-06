'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ImageIcon,
  Upload,
  Download,
  FileText,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILES = 10

interface Photo {
  id: string
  storage_path: string
  original_filename: string | null
  ai_analyzed: boolean
  ai_detected_issues?: unknown // JSON type from database
  created_at: string
}

interface ValidationResult {
  valid: File[]
  errors: string[]
}

interface DocumentHubProps {
  photos: Photo[]
  supabaseUrl: string
  leadId: string
  onUpload?: (files: FileList) => Promise<void>
  isUploading?: boolean
}

export function DocumentHub({
  photos,
  supabaseUrl,
  leadId,
  onUpload,
  isUploading = false,
}: DocumentHubProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [imageError, setImageError] = useState<Set<string>>(new Set())

  // Clear validation errors after 5 seconds
  useEffect(() => {
    if (validationErrors.length > 0) {
      const timer = setTimeout(() => setValidationErrors([]), 5000)
      return () => clearTimeout(timer)
    }
  }, [validationErrors])

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

  // Validate files before upload
  const validateFiles = useCallback((files: FileList): ValidationResult => {
    const errors: string[] = []
    const valid: File[] = []

    if (files.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files at once. You selected ${files.length}.`)
      return { valid: [], errors }
    }

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, or HEIC.`)
      } else if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1)
        errors.push(`"${file.name}" is too large (${sizeMB}MB). Maximum size is 10MB.`)
      } else {
        valid.push(file)
      }
    })

    return { valid, errors }
  }, [])

  const getPhotoUrl = useCallback((path: string) => {
    return `${supabaseUrl}/storage/v1/object/public/photos/${path}`
  }, [supabaseUrl])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (!onUpload || e.dataTransfer.files.length === 0) return

    const { valid, errors } = validateFiles(e.dataTransfer.files)
    if (errors.length > 0) {
      setValidationErrors(errors)
    }
    if (valid.length > 0) {
      // Create a new FileList-like object from valid files
      const dt = new DataTransfer()
      valid.forEach(f => dt.items.add(f))
      onUpload(dt.files)
    }
  }, [onUpload, validateFiles])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUpload || !e.target.files || e.target.files.length === 0) return

    const { valid, errors } = validateFiles(e.target.files)
    if (errors.length > 0) {
      setValidationErrors(errors)
    }
    if (valid.length > 0) {
      const dt = new DataTransfer()
      valid.forEach(f => dt.items.add(f))
      onUpload(dt.files)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }, [onUpload, validateFiles])

  const handleImageError = useCallback((photoId: string) => {
    setImageError(prev => new Set(prev).add(photoId))
  }, [])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goToPrevious = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
  }

  const goToNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % photos.length)
  }

  return (
    <Card variant="dark" className="border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ImageIcon className="h-5 w-5 text-gold-light" />
          Your Photos
        </CardTitle>
        <CardDescription>
          Photos uploaded during your estimate request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-1">Some files couldn't be uploaded:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setValidationErrors([])} className="text-red-400 hover:text-red-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {onUpload && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              dragOver
                ? 'border-gold-light bg-gold-light/5'
                : 'border-slate-600 hover:border-slate-500'
            )}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-gold-light animate-spin" />
                <p className="text-sm text-slate-400">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-300">
                  Drag photos here or <span className="text-gold-light">click to browse</span>
                </p>
                <p className="text-xs text-slate-500">
                  JPEG, PNG, WebP, or HEIC. Max 10MB per file, up to 10 files.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => {
              const photoUrl = getPhotoUrl(photo.storage_path)
              const issues = photo.ai_detected_issues as string[] | null | undefined
              const hasIssues = photo.ai_analyzed && issues && Array.isArray(issues) && issues.length > 0

              return (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-slate-800 cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  {imageError.has(photo.id) ? (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-700/50 text-slate-400">
                      <AlertTriangle className="h-6 w-6 mb-1" />
                      <span className="text-xs">Image unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={photoUrl}
                      alt={photo.original_filename || 'Roof photo'}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={() => handleImageError(photo.id)}
                    />
                  )}

                  {/* Hover overlay */}
                  {!imageError.has(photo.id) && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {/* AI Analyzed Badge */}
                  {photo.ai_analyzed && !imageError.has(photo.id) && (
                    <div className="absolute top-2 right-2">
                      {hasIssues && issues ? (
                        <div className="flex items-center gap-1 bg-amber-500/90 text-white text-xs font-medium px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" />
                          {issues.length}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-green-500/90 text-white text-xs font-medium px-2 py-0.5 rounded">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Camera className="h-10 w-10 text-slate-600" />
            <p className="mt-3 text-slate-400">No photos uploaded yet</p>
            <p className="text-sm text-slate-500">
              Upload photos of your roof to help us provide an accurate estimate
            </p>
          </div>
        )}

        {/* Photo count */}
        {photos.length > 0 && (
          <p className="text-xs text-slate-500 text-center">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
          </p>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious() }}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext() }}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getPhotoUrl(photos[lightboxIndex].storage_path)}
                alt={photos[lightboxIndex].original_filename || 'Photo'}
                className="max-w-full max-h-[85vh] object-contain"
              />

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white/70 text-sm">
                      {lightboxIndex + 1} / {photos.length}
                    </span>
                    <span className="text-white/50 text-xs hidden sm:inline">
                      Use arrow keys to navigate, Esc to close
                    </span>
                  </div>
                  {(() => {
                    const lightboxIssues = photos[lightboxIndex].ai_detected_issues as string[] | null | undefined
                    return lightboxIssues && Array.isArray(lightboxIssues) && lightboxIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lightboxIssues.map((issue: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/80 text-white text-xs"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {issue}
                          </span>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
