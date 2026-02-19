import { z } from 'zod'

// Enum schemas matching database types
export const leadStatusSchema = z.enum([
  'new',
  'intake_started',
  'intake_complete',
  'estimate_generated',
  'consultation_scheduled',
  'quote_sent',
  'won',
  'lost',
  'archived',
])

export const jobTypeSchema = z.enum([
  'full_replacement',
  'repair',
  'inspection',
  'maintenance',
  'gutter',
  'other',
])

export const roofMaterialSchema = z.enum([
  'asphalt_shingle',
  'metal',
  'tile',
  'slate',
  'wood_shake',
  'flat_membrane',
  'unknown',
])

export const roofPitchSchema = z.enum([
  'flat',
  'low',
  'medium',
  'steep',
  'very_steep',
  'unknown',
])

export const timelineUrgencySchema = z.enum([
  'emergency',
  'asap',
  'within_month',
  'within_3_months',
  'flexible',
  'just_exploring',
])

export const uploadStatusSchema = z.enum([
  'pending',
  'uploaded',
  'analyzed',
  'failed',
])

export const aiProviderSchema = z.enum([
  'openai',
  'anthropic',
  'fallback',
])

// Issue types for the issues multi-select
export const roofIssueSchema = z.enum([
  'missing_shingles',
  'damaged_shingles',
  'leaks',
  'moss_algae',
  'sagging',
  'flashing',
  'gutter_damage',
  'ventilation',
  'ice_dams',
  'storm_damage',
  'other',
])

// Step 1: Address validation
export const addressSchema = z.object({
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  county: z.string().optional(),
  formattedAddress: z.string().optional(),
  placeId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

// Step 2: Job type validation
export const jobTypeStepSchema = z.object({
  jobType: jobTypeSchema,
  jobDescription: z.string().max(1000).optional(),
})

// Step 3: Roof details validation
export const roofDetailsSchema = z.object({
  roofMaterial: roofMaterialSchema,
  roofAgeYears: z.number().int().min(0).max(100).optional(),
  roofSizeSqft: z.number().int().min(100).max(50000).optional(),
  stories: z.number().int().min(1).max(5).default(1),
  roofPitch: roofPitchSchema,
  hasSkylights: z.boolean().default(false),
  hasChimneys: z.boolean().default(false),
  hasSolarPanels: z.boolean().default(false),
})

// Step 4: Issues validation
export const issuesSchema = z.object({
  issues: z.array(roofIssueSchema).default([]),
  issuesDescription: z.string().max(2000).optional(),
})

// Step 5: Photos - handled separately via file upload

// Step 6: Timeline validation
export const timelineSchema = z.object({
  timelineUrgency: timelineUrgencySchema,
  hasInsuranceClaim: z.boolean().default(false),
  insuranceCompany: z.string().max(100).optional(),
  claimNumber: z.string().max(100).optional(),
})

// Step 7: Contact validation
export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  preferredContactMethod: z.enum(['phone', 'email', 'text']).default('phone'),
  consentMarketing: z.boolean().default(false),
  consentSms: z.boolean().default(false),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

// Combined intake schema
export const intakeSchema = z.object({
  // Step 2
  jobType: jobTypeSchema.optional(),
  jobDescription: z.string().max(1000).optional(),
  // Step 3
  roofMaterial: roofMaterialSchema.optional(),
  roofAgeYears: z.number().int().min(0).max(100).optional(),
  roofSizeSqft: z.number().int().min(100).max(50000).optional(),
  stories: z.number().int().min(1).max(5).optional(),
  roofPitch: roofPitchSchema.optional(),
  hasSkylights: z.boolean().optional(),
  hasChimneys: z.boolean().optional(),
  hasSolarPanels: z.boolean().optional(),
  // Step 4
  issues: z.array(roofIssueSchema).optional(),
  issuesDescription: z.string().max(2000).optional(),
  // Step 6
  timelineUrgency: timelineUrgencySchema.optional(),
  hasInsuranceClaim: z.boolean().optional(),
  insuranceCompany: z.string().max(100).optional(),
  claimNumber: z.string().max(100).optional(),
  // Notes
  additionalNotes: z.string().max(2000).optional(),
})

// API request schemas
export const createLeadSchema = z.object({
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  referrerUrl: z.union([z.string().url(), z.literal('')]).optional(),
})

export const updateLeadSchema = z.object({
  status: leadStatusSchema.optional(),
  currentStep: z.number().int().min(1).max(8).optional(),
})

// Upload schema
export const uploadSchema = z.object({
  leadId: z.string().uuid(),
  filename: z.string(),
  contentType: z.string(),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
})

// AI analysis result schema
export const aiPhotoAnalysisSchema = z.object({
  isRoofPhoto: z.boolean(),
  confidence: z.number().min(0).max(1),
  detectedMaterial: roofMaterialSchema.optional(),
  detectedIssues: z.array(z.object({
    issue: roofIssueSchema,
    confidence: z.number().min(0).max(1),
    description: z.string().optional(),
  })).optional(),
  estimatedCondition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']).optional(),
  notes: z.string().optional(),
})

// Type exports
export type AddressInput = z.infer<typeof addressSchema>
export type JobTypeStepInput = z.infer<typeof jobTypeStepSchema>
export type RoofDetailsInput = z.infer<typeof roofDetailsSchema>
export type IssuesInput = z.infer<typeof issuesSchema>
export type TimelineInput = z.infer<typeof timelineSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type IntakeInput = z.infer<typeof intakeSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type UploadInput = z.infer<typeof uploadSchema>
export type AiPhotoAnalysisResult = z.infer<typeof aiPhotoAnalysisSchema>
