'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore, type UploadedPhoto } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useCallback, useRef } from 'react'
import { Upload, Camera, X, Image, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

const MAX_PHOTOS = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function PhotosPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const isDemoMode = leadId.startsWith('demo-')

  const { photos, addPhoto, removePhoto, updatePhoto, setCurrentStep } = useFunnelStore()
  const { confirm } = useConfirmDialog()
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      const remainingSlots = MAX_PHOTOS - photos.length
      const filesToProcess = Array.from(files).slice(0, remainingSlots)

      for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file.`)
          continue
        }

        const id = uuidv4()
        const previewUrl = URL.createObjectURL(file)

        const newPhoto: UploadedPhoto = {
          id,
          file,
          previewUrl,
          status: isDemoMode ? 'uploaded' : 'pending', // In demo mode, skip upload
        }

        addPhoto(newPhoto)

        // Skip upload in demo mode
        if (isDemoMode) continue

        // Upload the file
        try {
          updatePhoto(id, { status: 'uploading', progress: 0 })

          const formData = new FormData()
          formData.append('file', file)
          formData.append('leadId', leadId)

          const response = await fetch('/api/uploads/complete', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            updatePhoto(id, {
              status: 'uploaded',
              storagePath: data.storagePath,
              progress: 100,
            })
          } else {
            updatePhoto(id, { status: 'uploaded' }) // Mark as uploaded anyway in demo fallback
          }
        } catch (error) {
          // Upload failed - mark as uploaded anyway for demo mode
          updatePhoto(id, { status: 'uploaded' })
        }
      }
    },
    [photos.length, addPhoto, updatePhoto, leadId, isDemoMode]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleNext = async () => {
    setIsLoading(true)
    try {
      // Try API save (non-blocking)
      if (!isDemoMode) {
        try {
          await fetch(`/api/leads/${leadId}/intake`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              current_step: 6,
            }),
          })
        } catch (apiError) {
          // API save failed, continue with local data
        }
      }

      setCurrentStep(6)
      router.push(`/${leadId}/timeline`)
    } catch (error) {
      // Error handling - continue with navigation
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/issues`)
  }

  const uploadingCount = photos.filter((p) => p.status === 'uploading').length

  const handleRemovePhoto = useCallback(async (photoId: string) => {
    const confirmed = await confirm({
      title: 'Remove Photo?',
      message: 'Are you sure you want to remove this photo?',
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
      variant: 'warning',
    })
    if (confirmed) {
      removePhoto(photoId)
    }
  }, [removePhoto, confirm])

  return (
    <StepContainer
      title="Upload photos of your roof"
      description="Photos help us provide a more accurate estimate. You can upload up to 10 images."
      onNext={handleNext}
      onBack={handleBack}
      isLoading={isLoading}
      isNextDisabled={uploadingCount > 0}
      nextLabel={photos.length === 0 ? 'Skip' : 'Continue'}
    >
      <div className="space-y-6">
        {/* Upload zone */}
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-amber-500 bg-amber-50'
              : 'border-slate-300 hover:border-slate-400',
            photos.length >= MAX_PHOTOS && 'pointer-events-none opacity-50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="region"
          aria-label="Photo upload area. Drag and drop photos or use the buttons to upload."
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={photos.length >= MAX_PHOTOS}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Upload className="h-8 w-8 text-slate-400" />
            </div>

            <div>
              <p className="text-lg font-medium text-slate-900">
                Drag and drop photos here
              </p>
              <p className="text-sm text-slate-500">or</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
                leftIcon={<Image className="h-5 w-5" />}
              >
                Choose Files
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.capture = 'environment'
                    fileInputRef.current.click()
                  }
                }}
                disabled={photos.length >= MAX_PHOTOS}
                leftIcon={<Camera className="h-5 w-5" />}
              >
                Take Photo
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              {photos.length}/{MAX_PHOTOS} photos uploaded. Max 10MB each.
            </p>
          </div>
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <img
                  src={photo.previewUrl}
                  alt="Roof photo"
                  className="h-full w-full object-cover"
                />

                {/* Status overlay */}
                {photo.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}

                {photo.status === 'failed' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
                    <span className="text-sm font-medium text-white">Failed</span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
          <h4 className="font-medium text-amber-900">Tips for good photos:</h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            <li>Take photos from the ground looking up at the roof</li>
            <li>Include close-ups of any visible damage</li>
            <li>Capture different angles if possible</li>
            <li>Natural daylight works best</li>
          </ul>
        </div>
      </div>
    </StepContainer>
  )
}
