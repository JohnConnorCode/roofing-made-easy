import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  JobType,
  RoofMaterial,
  RoofPitch,
  TimelineUrgency,
  RoofVariables,
  DetailedEstimate,
} from '@/lib/supabase/types'

export type RoofIssue =
  | 'missing_shingles'
  | 'damaged_shingles'
  | 'leaks'
  | 'moss_algae'
  | 'sagging'
  | 'flashing'
  | 'gutter_damage'
  | 'ventilation'
  | 'ice_dams'
  | 'storm_damage'
  | 'other'

export interface UploadedPhoto {
  id: string
  file?: File
  previewUrl: string
  storagePath?: string
  status: 'pending' | 'uploading' | 'uploaded' | 'analyzed' | 'failed'
  progress?: number
  aiAnalysis?: {
    isRoofPhoto: boolean
    detectedIssues: string[]
    confidence: number
  }
}

export interface FunnelState {
  // Meta
  leadId: string | null
  shareToken: string | null
  currentStep: number
  isLoading: boolean
  error: string | null

  // Step 1: Address
  address: {
    streetAddress: string
    city: string
    state: string
    zipCode: string
    county?: string
    formattedAddress?: string
    placeId?: string
    latitude?: number
    longitude?: number
  } | null

  // Step 2: Job Type
  jobType: JobType | null
  jobDescription: string

  // Step 3: Roof Details
  roofMaterial: RoofMaterial | null
  roofAgeYears: number | null
  roofSizeSqft: number | null
  stories: number
  roofPitch: RoofPitch | null
  hasSkylights: boolean
  hasChimneys: boolean
  hasSolarPanels: boolean

  // Step 4: Issues
  issues: RoofIssue[]
  issuesDescription: string

  // Step 5: Photos
  photos: UploadedPhoto[]

  // Step 6: Timeline
  timelineUrgency: TimelineUrgency | null
  hasInsuranceClaim: boolean
  insuranceCompany: string
  claimNumber: string

  // Step 7: Contact
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactMethod: 'phone' | 'email' | 'text'
  consentMarketing: boolean
  consentSms: boolean
  consentTerms: boolean

  // Step 8: Estimate
  estimate: {
    priceLow: number
    priceLikely: number
    priceHigh: number
    explanation?: string
    factors: Array<{
      name: string
      impact: number
      description: string
    }>
  } | null

  // Advanced Estimation (Xactimate-style)
  roofVariables: RoofVariables | null
  detailedEstimate: DetailedEstimate | null
  sketchId: string | null
}

export interface FunnelActions {
  // Navigation
  setLeadId: (leadId: string) => void
  setShareToken: (token: string) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Loading state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Step 1
  setAddress: (address: FunnelState['address']) => void

  // Step 2
  setJobType: (jobType: JobType) => void
  setJobDescription: (description: string) => void

  // Step 3
  setRoofDetails: (details: Partial<{
    roofMaterial: RoofMaterial
    roofAgeYears: number | null
    roofSizeSqft: number | null
    stories: number
    roofPitch: RoofPitch
    hasSkylights: boolean
    hasChimneys: boolean
    hasSolarPanels: boolean
  }>) => void

  // Step 4
  setIssues: (issues: RoofIssue[]) => void
  toggleIssue: (issue: RoofIssue) => void
  setIssuesDescription: (description: string) => void

  // Step 5
  addPhoto: (photo: UploadedPhoto) => void
  updatePhoto: (id: string, updates: Partial<UploadedPhoto>) => void
  removePhoto: (id: string) => void
  reorderPhotos: (photos: UploadedPhoto[]) => void

  // Step 6
  setTimeline: (timeline: Partial<{
    timelineUrgency: TimelineUrgency
    hasInsuranceClaim: boolean
    insuranceCompany: string
    claimNumber: string
  }>) => void

  // Step 7
  setContact: (contact: Partial<{
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredContactMethod: 'phone' | 'email' | 'text'
    consentMarketing: boolean
    consentSms: boolean
    consentTerms: boolean
  }>) => void

  // Step 8
  setEstimate: (estimate: FunnelState['estimate']) => void

  // Advanced Estimation
  setRoofVariables: (variables: RoofVariables) => void
  setDetailedEstimate: (estimate: DetailedEstimate | null) => void
  setSketchId: (sketchId: string | null) => void

  // Reset
  resetFunnel: () => void
}

const initialState: FunnelState = {
  leadId: null,
  shareToken: null,
  currentStep: 1,
  isLoading: false,
  error: null,
  address: null,
  jobType: null,
  jobDescription: '',
  roofMaterial: null,
  roofAgeYears: null,
  roofSizeSqft: null,
  stories: 1,
  roofPitch: null,
  hasSkylights: false,
  hasChimneys: false,
  hasSolarPanels: false,
  issues: [],
  issuesDescription: '',
  photos: [],
  timelineUrgency: null,
  hasInsuranceClaim: false,
  insuranceCompany: '',
  claimNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredContactMethod: 'phone',
  consentMarketing: false,
  consentSms: false,
  consentTerms: false,
  estimate: null,
  roofVariables: null,
  detailedEstimate: null,
  sketchId: null,
}

export const useFunnelStore = create<FunnelState & FunnelActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      // New 3-step funnel: 1=Property, 2=Details, 3=Contact, 4=Estimate (view only)
      setLeadId: (leadId) => set({ leadId }),
      setShareToken: (shareToken) => set({ shareToken }),
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      // Loading state
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Step 1
      setAddress: (address) => set({ address }),

      // Step 2
      setJobType: (jobType) => set({ jobType }),
      setJobDescription: (jobDescription) => set({ jobDescription }),

      // Step 3
      setRoofDetails: (details) => set((state) => ({
        roofMaterial: details.roofMaterial ?? state.roofMaterial,
        roofAgeYears: details.roofAgeYears !== undefined ? details.roofAgeYears : state.roofAgeYears,
        roofSizeSqft: details.roofSizeSqft !== undefined ? details.roofSizeSqft : state.roofSizeSqft,
        stories: details.stories ?? state.stories,
        roofPitch: details.roofPitch ?? state.roofPitch,
        hasSkylights: details.hasSkylights ?? state.hasSkylights,
        hasChimneys: details.hasChimneys ?? state.hasChimneys,
        hasSolarPanels: details.hasSolarPanels ?? state.hasSolarPanels,
      })),

      // Step 4
      setIssues: (issues) => set({ issues }),
      toggleIssue: (issue) => set((state) => ({
        issues: state.issues.includes(issue)
          ? state.issues.filter((i) => i !== issue)
          : [...state.issues, issue],
      })),
      setIssuesDescription: (issuesDescription) => set({ issuesDescription }),

      // Step 5
      addPhoto: (photo) => set((state) => ({
        photos: [...state.photos, photo].slice(0, 10), // Max 10 photos
      })),
      updatePhoto: (id, updates) => set((state) => ({
        photos: state.photos.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
      removePhoto: (id) => set((state) => {
        const photo = state.photos.find((p) => p.id === id)
        if (photo?.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(photo.previewUrl)
        }
        return { photos: state.photos.filter((p) => p.id !== id) }
      }),
      reorderPhotos: (photos) => set({ photos }),

      // Step 6
      setTimeline: (timeline) => set((state) => ({
        timelineUrgency: timeline.timelineUrgency ?? state.timelineUrgency,
        hasInsuranceClaim: timeline.hasInsuranceClaim ?? state.hasInsuranceClaim,
        insuranceCompany: timeline.insuranceCompany ?? state.insuranceCompany,
        claimNumber: timeline.claimNumber ?? state.claimNumber,
      })),

      // Step 7
      setContact: (contact) => set((state) => ({
        firstName: contact.firstName ?? state.firstName,
        lastName: contact.lastName ?? state.lastName,
        email: contact.email ?? state.email,
        phone: contact.phone ?? state.phone,
        preferredContactMethod: contact.preferredContactMethod ?? state.preferredContactMethod,
        consentMarketing: contact.consentMarketing ?? state.consentMarketing,
        consentSms: contact.consentSms ?? state.consentSms,
        consentTerms: contact.consentTerms ?? state.consentTerms,
      })),

      // Step 8
      setEstimate: (estimate) => set({ estimate }),

      // Advanced Estimation
      setRoofVariables: (roofVariables) => set({ roofVariables }),
      setDetailedEstimate: (detailedEstimate) => set({ detailedEstimate }),
      setSketchId: (sketchId) => set({ sketchId }),

      // Reset
      resetFunnel: () => set(initialState),
    }),
    {
      name: 'funnel-storage',
      partialize: (state) => ({
        leadId: state.leadId,
        currentStep: state.currentStep,
        address: state.address,
        jobType: state.jobType,
        jobDescription: state.jobDescription,
        roofMaterial: state.roofMaterial,
        roofAgeYears: state.roofAgeYears,
        roofSizeSqft: state.roofSizeSqft,
        stories: state.stories,
        roofPitch: state.roofPitch,
        hasSkylights: state.hasSkylights,
        hasChimneys: state.hasChimneys,
        hasSolarPanels: state.hasSolarPanels,
        issues: state.issues,
        issuesDescription: state.issuesDescription,
        // Persist photo metadata (exclude File objects which can't be serialized)
        photos: state.photos.map((p) => ({
          id: p.id,
          previewUrl: p.previewUrl,
          storagePath: p.storagePath,
          status: p.status,
          aiAnalysis: p.aiAnalysis,
        })),
        timelineUrgency: state.timelineUrgency,
        hasInsuranceClaim: state.hasInsuranceClaim,
        insuranceCompany: state.insuranceCompany,
        claimNumber: state.claimNumber,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        preferredContactMethod: state.preferredContactMethod,
        consentMarketing: state.consentMarketing,
        consentSms: state.consentSms,
        consentTerms: state.consentTerms,
        roofVariables: state.roofVariables,
        sketchId: state.sketchId,
      }),
    }
  )
)

// Selector hooks for better performance
export const useLeadId = () => useFunnelStore((state) => state.leadId)
export const useCurrentStep = () => useFunnelStore((state) => state.currentStep)
export const useAddress = () => useFunnelStore((state) => state.address)
export const useJobType = () => useFunnelStore((state) => state.jobType)
export const useRoofDetails = () => useFunnelStore((state) => ({
  roofMaterial: state.roofMaterial,
  roofAgeYears: state.roofAgeYears,
  roofSizeSqft: state.roofSizeSqft,
  stories: state.stories,
  roofPitch: state.roofPitch,
  hasSkylights: state.hasSkylights,
  hasChimneys: state.hasChimneys,
  hasSolarPanels: state.hasSolarPanels,
}))
export const useIssues = () => useFunnelStore((state) => ({
  issues: state.issues,
  issuesDescription: state.issuesDescription,
}))
export const usePhotos = () => useFunnelStore((state) => state.photos)
export const useTimeline = () => useFunnelStore((state) => ({
  timelineUrgency: state.timelineUrgency,
  hasInsuranceClaim: state.hasInsuranceClaim,
  insuranceCompany: state.insuranceCompany,
  claimNumber: state.claimNumber,
}))
export const useContact = () => useFunnelStore((state) => ({
  firstName: state.firstName,
  lastName: state.lastName,
  email: state.email,
  phone: state.phone,
  preferredContactMethod: state.preferredContactMethod,
  consentMarketing: state.consentMarketing,
  consentSms: state.consentSms,
  consentTerms: state.consentTerms,
}))
export const useEstimate = () => useFunnelStore((state) => state.estimate)
export const useRoofVariables = () => useFunnelStore((state) => state.roofVariables)
export const useDetailedEstimate = () => useFunnelStore((state) => state.detailedEstimate)
export const useSketchId = () => useFunnelStore((state) => state.sketchId)
