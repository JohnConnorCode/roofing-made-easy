'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAnalytics } from '@/lib/analytics'
import { useFunnelStore, type RoofIssue, type UploadedPhoto } from '@/stores/funnelStore'
import { StepContainer } from '@/components/funnel/step-container'
import { useToast } from '@/components/ui/toast'
import { OptionCard } from '@/components/funnel/option-card'
import { CollapsibleSection } from '@/components/funnel/collapsible-section'
import { MultiSelectCard } from '@/components/funnel/multi-select-card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RoofMaterial, RoofPitch, TimelineUrgency } from '@/lib/supabase/types'
import { v4 as uuidv4 } from 'uuid'
import {
  Ruler,
  Camera,
  AlertTriangle,
  Clock,
  Upload,
  Image,
  X,
  Loader2,
  Droplets,
  Leaf,
  ArrowDown,
  Shield,
  Wind,
  Snowflake,
  CloudLightning,
  CircleHelp,
  Layers,
  AlertCircle,
  Calendar,
  CalendarRange,
  Infinity,
  Search,
} from 'lucide-react'

const ROOF_MATERIALS: { value: RoofMaterial; title: string; description: string }[] = [
  { value: 'asphalt_shingle', title: 'Asphalt Shingle', description: 'Most common' },
  { value: 'metal', title: 'Metal', description: 'Durable' },
  { value: 'tile', title: 'Tile', description: 'Clay/concrete' },
  { value: 'slate', title: 'Slate', description: 'Premium' },
  { value: 'wood_shake', title: 'Wood Shake', description: 'Natural' },
  { value: 'flat_membrane', title: 'Flat/Membrane', description: 'Low slope' },
  { value: 'unknown', title: 'Not Sure', description: "We'll help" },
]

const ROOF_PITCHES: { value: RoofPitch; label: string }[] = [
  { value: 'flat', label: 'Flat (0-2/12)' },
  { value: 'low', label: 'Low (3-4/12)' },
  { value: 'medium', label: 'Medium (5-7/12)' },
  { value: 'steep', label: 'Steep (8-10/12)' },
  { value: 'very_steep', label: 'Very Steep (11+/12)' },
  { value: 'unknown', label: 'Not Sure' },
]

const STORIES_OPTIONS = [
  { value: '1', label: '1 Story' },
  { value: '2', label: '2 Stories' },
  { value: '3', label: '3+ Stories' },
]

const ISSUES: { value: RoofIssue; title: string; icon: React.ReactNode }[] = [
  { value: 'missing_shingles', title: 'Missing Shingles', icon: <Layers className="h-4 w-4" /> },
  { value: 'damaged_shingles', title: 'Damaged/Curling', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'leaks', title: 'Active Leaks', icon: <Droplets className="h-4 w-4" /> },
  { value: 'moss_algae', title: 'Moss/Algae', icon: <Leaf className="h-4 w-4" /> },
  { value: 'sagging', title: 'Sagging Areas', icon: <ArrowDown className="h-4 w-4" /> },
  { value: 'flashing', title: 'Flashing Damage', icon: <Shield className="h-4 w-4" /> },
  { value: 'gutter_damage', title: 'Gutter Issues', icon: <Wind className="h-4 w-4" /> },
  { value: 'storm_damage', title: 'Storm Damage', icon: <CloudLightning className="h-4 w-4" /> },
  { value: 'ice_dams', title: 'Ice Dams', icon: <Snowflake className="h-4 w-4" /> },
  { value: 'other', title: 'Other', icon: <CircleHelp className="h-4 w-4" /> },
]

const TIMELINE_OPTIONS: { value: TimelineUrgency; title: string; icon: React.ReactNode }[] = [
  { value: 'emergency', title: 'Emergency (24-48hrs)', icon: <AlertCircle className="h-4 w-4" /> },
  { value: 'asap', title: 'ASAP (1 week)', icon: <Clock className="h-4 w-4" /> },
  { value: 'within_month', title: 'Within a Month', icon: <Calendar className="h-4 w-4" /> },
  { value: 'within_3_months', title: 'Within 3 Months', icon: <CalendarRange className="h-4 w-4" /> },
  { value: 'flexible', title: 'Flexible', icon: <Infinity className="h-4 w-4" /> },
  { value: 'just_exploring', title: 'Just Exploring', icon: <Search className="h-4 w-4" /> },
]

const MAX_PHOTOS = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function DetailsPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string

  const {
    roofMaterial,
    roofAgeYears,
    roofSizeSqft,
    stories,
    roofPitch,
    hasSkylights,
    hasChimneys,
    hasSolarPanels,
    setRoofDetails,
    issues,
    issuesDescription,
    toggleIssue,
    setIssuesDescription,
    photos,
    addPhoto,
    removePhoto,
    updatePhoto,
    timelineUrgency,
    hasInsuranceClaim,
    insuranceCompany,
    claimNumber,
    setTimeline,
    setCurrentStep,
  } = useFunnelStore()

  const { showToast } = useToast()
  const { trackFunnelStep } = useAnalytics(leadId)

  useEffect(() => {
    trackFunnelStep(2, 'details_entered')
  }, [trackFunnelStep])

  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Photo upload handlers
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return
      const remainingSlots = MAX_PHOTOS - photos.length
      const filesToProcess = Array.from(files).slice(0, remainingSlots)

      for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE || !file.type.startsWith('image/')) continue

        const id = uuidv4()
        const previewUrl = URL.createObjectURL(file)
        const newPhoto: UploadedPhoto = {
          id,
          file,
          previewUrl,
          status: 'pending',
        }
        addPhoto(newPhoto)

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
            updatePhoto(id, { status: 'uploaded', storagePath: data.storagePath, progress: 100 })
          } else {
            updatePhoto(id, { status: 'failed' })
          }
        } catch {
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

  const handleNext = async () => {
    setIsLoading(true)
    try {
      // API save - proceed even if fails, but warn user
      try {
        const response = await fetch(`/api/leads/${leadId}/intake`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intake: {
              roof_material: roofMaterial,
              roof_age_years: roofAgeYears,
              roof_size_sqft: roofSizeSqft,
              stories,
              roof_pitch: roofPitch,
              has_skylights: hasSkylights,
              has_chimneys: hasChimneys,
              has_solar_panels: hasSolarPanels,
              issues,
              issues_description: issuesDescription || null,
              timeline_urgency: timelineUrgency,
              has_insurance_claim: hasInsuranceClaim,
              insurance_company: insuranceCompany || null,
              claim_number: claimNumber || null,
            },
            current_step: 3,
          }),
        })
        if (!response.ok) {
          showToast('Your data may not have saved. You can continue, but please double-check your info later.', 'info')
        }
      } catch (err) {
        console.error('Failed to save details data:', err)
        showToast('Your data may not have saved. You can continue, but please double-check your info later.', 'info')
      }

      trackFunnelStep(2, 'details_completed')
      setCurrentStep(3)
      router.push(`/${leadId}/contact`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${leadId}/property`)
  }

  const uploadingCount = photos.filter((p) => p.status === 'uploading').length

  // Count how many optional sections have data
  const optionalDataCount = [
    roofAgeYears || roofSizeSqft || roofPitch,
    issues.length > 0,
    photos.length > 0,
    timelineUrgency,
  ].filter(Boolean).length

  return (
    <StepContainer
      title="Tell us about your roof"
      description="Just select your roof type below. Add more details if you'd like a more accurate estimate."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!roofMaterial || uploadingCount > 0}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Required: Roof Material */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
            Roof Type <span className="text-red-400">*</span>
          </h3>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {ROOF_MATERIALS.map((material) => (
              <OptionCard
                key={material.value}
                title={material.title}
                description={material.description}
                selected={roofMaterial === material.value}
                onClick={() => setRoofDetails({ roofMaterial: material.value })}
                compact
              />
            ))}
          </div>
        </div>

        {/* Optional Details Badge */}
        {optionalDataCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#c9a25c]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a25c]/20 text-xs font-medium">
              {optionalDataCount}
            </span>
            <span>optional {optionalDataCount === 1 ? 'section' : 'sections'} completed</span>
          </div>
        )}

        {/* Optional: Roof Specifications */}
        <CollapsibleSection
          title="Roof Specifications"
          description="Size, age, pitch, and features"
          icon={<Ruler className="h-5 w-5" />}
          badge="Better estimate"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Roof age (years)"
                type="number"
                placeholder="e.g., 15"
                value={roofAgeYears?.toString() || ''}
                onChange={(e) =>
                  setRoofDetails({ roofAgeYears: e.target.value ? parseInt(e.target.value) : null })
                }
                min={0}
                max={100}
              />
              <Input
                label="Size (sq ft)"
                type="number"
                placeholder="e.g., 2000"
                value={roofSizeSqft?.toString() || ''}
                onChange={(e) =>
                  setRoofDetails({ roofSizeSqft: e.target.value ? parseInt(e.target.value) : null })
                }
                min={100}
                max={50000}
              />
              <Select
                label="Stories"
                options={STORIES_OPTIONS}
                value={stories.toString()}
                onChange={(value) => setRoofDetails({ stories: parseInt(value) })}
              />
              <Select
                label="Roof pitch"
                options={[{ value: '', label: 'Select pitch' }, ...ROOF_PITCHES]}
                value={roofPitch || ''}
                onChange={(value) => setRoofDetails({ roofPitch: value as RoofPitch })}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Skylights"
                checked={hasSkylights}
                onChange={(e) => setRoofDetails({ hasSkylights: e.target.checked })}
              />
              <Checkbox
                label="Chimneys"
                checked={hasChimneys}
                onChange={(e) => setRoofDetails({ hasChimneys: e.target.checked })}
              />
              <Checkbox
                label="Solar panels"
                checked={hasSolarPanels}
                onChange={(e) => setRoofDetails({ hasSolarPanels: e.target.checked })}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Optional: Issues */}
        <CollapsibleSection
          title="Current Issues"
          description="Any visible problems or damage"
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {ISSUES.map((issue) => (
                <MultiSelectCard
                  key={issue.value}
                  icon={issue.icon}
                  title={issue.title}
                  selected={issues.includes(issue.value)}
                  onClick={() => toggleIssue(issue.value)}
                  compact
                />
              ))}
            </div>
            {issues.length > 0 && (
              <Textarea
                label="Additional details (optional)"
                placeholder="Describe any issues in more detail..."
                value={issuesDescription}
                onChange={(e) => setIssuesDescription(e.target.value)}
                rows={2}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Optional: Photos */}
        <CollapsibleSection
          title="Photos"
          description="Upload roof photos for better accuracy"
          icon={<Camera className="h-5 w-5" />}
          badge="Recommended"
        >
          <div className="space-y-4">
            <div
              className={cn(
                'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragging ? 'border-[#c9a25c] bg-[#c9a25c]/10' : 'border-slate-600 hover:border-slate-500',
                photos.length >= MAX_PHOTOS && 'pointer-events-none opacity-50'
              )}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
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
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 text-slate-500" />
                <div className="text-sm text-slate-400">
                  Drag photos here or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#c9a25c] hover:underline"
                  >
                    browse
                  </button>
                </div>
                <p className="text-xs text-slate-500">{photos.length}/{MAX_PHOTOS} photos</p>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-800">
                    <img src={photo.previewUrl} alt="Roof" className="h-full w-full object-cover" />
                    {photo.status === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    {photo.status === 'failed' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <span className="mt-1 text-xs text-red-400">Failed</span>
                        {photo.file && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const retryFile = photo.file!
                              updatePhoto(photo.id, { status: 'uploading', progress: 0 })
                              const formData = new FormData()
                              formData.append('file', retryFile)
                              formData.append('leadId', leadId)
                              fetch('/api/uploads/complete', { method: 'POST', body: formData })
                                .then((res) => {
                                  if (res.ok) return res.json()
                                  throw new Error('Upload failed')
                                })
                                .then((data) => updatePhoto(photo.id, { status: 'uploaded', storagePath: data.storagePath, progress: 100 }))
                                .catch(() => updatePhoto(photo.id, { status: 'failed' }))
                            }}
                            className="mt-1.5 rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30 transition-colors"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(photo.id)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Optional: Timeline */}
        <CollapsibleSection
          title="Timeline & Urgency"
          description="When do you need this done?"
          icon={<Clock className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {TIMELINE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  icon={option.icon}
                  title={option.title}
                  selected={timelineUrgency === option.value}
                  onClick={() => setTimeline({ timelineUrgency: option.value })}
                  compact
                />
              ))}
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <Checkbox
                label="This is related to an insurance claim"
                checked={hasInsuranceClaim}
                onChange={(e) => setTimeline({ hasInsuranceClaim: e.target.checked })}
              />
              {hasInsuranceClaim && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 animate-slide-up">
                  <Input
                    label="Insurance Company"
                    placeholder="e.g., State Farm"
                    value={insuranceCompany}
                    onChange={(e) => setTimeline({ insuranceCompany: e.target.value })}
                  />
                  <Input
                    label="Claim Number (optional)"
                    placeholder="Claim number"
                    value={claimNumber}
                    onChange={(e) => setTimeline({ claimNumber: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </StepContainer>
  )
}
