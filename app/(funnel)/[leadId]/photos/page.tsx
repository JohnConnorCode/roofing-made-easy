'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFunnelStore, type UploadedPhoto } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useCallback, useRef } from 'react'
import { Upload, Camera, X, Image, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const MAX_PHOTOS = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function PhotosPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const { photos, addPhoto, removePhoto, updatePhoto, setCurrentStep } = useFunnelStore()
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
          status: 'pending',
        }

        addPhoto(newPhoto)

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
            updatePhoto(id, { status: 'failed' })
          }
        } catch (error) {
          console.error('Upload failed:', error)
          updatePhoto(id, { status: 'failed' })
        }
      }
    },
    [photos.length, addPhoto, updatePhoto, leadId]
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
      await fetch(`/api/leads/${leadId}/intake`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_step: 6,
        }),
      })

      setCurrentStep(6)
      router.push(`/${leadId}/timeline`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/issues`)
  }

  const uploadingCount = photos.filter((p) => p.status === 'uploading').length

  const handleRemovePhoto = useCallback((photoId: string) => {
    if (window.confirm('Remove this photo?')) {
      removePhoto(photoId)
    }
  }, [removePhoto])

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
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop photos here
              </p>
              <p className="text-sm text-gray-500">or</p>
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

            <p className="text-xs text-gray-400">
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
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
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
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="font-medium text-blue-900">Tips for good photos:</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
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
