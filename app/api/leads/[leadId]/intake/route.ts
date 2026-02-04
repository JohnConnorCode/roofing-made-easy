import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyNewLead } from '@/lib/email'
import { triggerWorkflows } from '@/lib/communication/workflow-engine'
import { z } from 'zod'

// Validation schemas
const propertySchema = z.object({
  street_address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  county: z.string().max(100).optional(),
  formatted_address: z.string().max(300).optional(),
  place_id: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).optional()

const intakeSchema = z.object({
  job_type: z.enum(['full_replacement', 'repair', 'inspection', 'maintenance', 'gutter', 'commercial', 'solar_installation', 'other']).optional(),
  job_description: z.string().max(2000).optional().nullable(),
  roof_material: z.enum(['asphalt_shingle', 'metal', 'tile', 'slate', 'wood_shake', 'flat_membrane', 'unknown']).optional(),
  roof_age_years: z.number().int().min(0).max(100).optional().nullable(),
  roof_size_sqft: z.number().int().min(0).max(100000).optional().nullable(),
  stories: z.number().int().min(1).max(5).optional(),
  roof_pitch: z.enum(['flat', 'low', 'medium', 'steep', 'very_steep', 'unknown']).optional().nullable(),
  has_skylights: z.boolean().optional(),
  has_chimneys: z.boolean().optional(),
  has_solar_panels: z.boolean().optional(),
  issues: z.array(z.string().max(100)).max(20).optional(),
  issues_description: z.string().max(2000).optional().nullable(),
  timeline_urgency: z.enum(['emergency', 'asap', 'within_month', 'within_3_months', 'flexible', 'just_exploring']).optional().nullable(),
  has_insurance_claim: z.boolean().optional(),
  insurance_company: z.string().max(200).optional().nullable(),
  claim_number: z.string().max(100).optional().nullable(),
  additional_notes: z.string().max(5000).optional().nullable(),
}).optional()

const contactSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().regex(/^[+]?[\d\s()-]{7,20}$/).optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'text']).optional(),
  consent_marketing: z.boolean().optional(),
  consent_sms: z.boolean().optional(),
  consent_terms: z.boolean().optional(),
}).optional()

const intakeRequestSchema = z.object({
  current_step: z.number().int().min(1).max(10).optional(),
  property: propertySchema,
  intake: intakeSchema,
  contact: contactSchema,
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const rawBody = await request.json()

    // Validate request body
    const parseResult = intakeRequestSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }
    const body = parseResult.data

    const supabase = await createClient()

    // Security: Verify lead exists and is in a valid status for updates
    const { data: existingLead, error: leadError } = await supabase
      .from('leads')
      .select('id, status')
      .eq('id', leadId)
      .single()

    if (leadError || !existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Only allow intake updates for leads in appropriate statuses
    const allowedStatuses = ['new', 'intake_started']
    const leadStatus = (existingLead as { status?: string }).status
    if (leadStatus && !allowedStatuses.includes(leadStatus)) {
      return NextResponse.json(
        { error: 'Lead intake already completed' },
        { status: 400 }
      )
    }

    // Update lead step if provided
    let intakeJustCompleted = false
    if (body.current_step) {
      const newStatus = body.current_step >= 8 ? 'intake_complete' : 'intake_started'
      intakeJustCompleted = body.current_step >= 8
      await supabase
        .from('leads')
        .update({
          current_step: body.current_step,
          status: newStatus,
          ...(body.current_step >= 8 ? { completed_at: new Date().toISOString() } : {}),
        } as never)
        .eq('id', leadId)
    }

    // Update property if provided
    if (body.property) {
      const { error: propertyError } = await supabase
        .from('properties')
        .upsert(
          {
            lead_id: leadId,
            street_address: body.property.street_address,
            city: body.property.city,
            state: body.property.state,
            zip_code: body.property.zip_code,
            county: body.property.county,
            formatted_address: body.property.formatted_address,
            place_id: body.property.place_id,
            latitude: body.property.latitude,
            longitude: body.property.longitude,
          } as never,
          { onConflict: 'lead_id' }
        )

      if (propertyError) {
        console.error('Property update failed:', propertyError)
      }
    }

    // Update intake if provided
    if (body.intake) {
      const { error: intakeError } = await supabase
        .from('intakes')
        .upsert(
          {
            lead_id: leadId,
            job_type: body.intake.job_type,
            job_description: body.intake.job_description,
            roof_material: body.intake.roof_material,
            roof_age_years: body.intake.roof_age_years,
            roof_size_sqft: body.intake.roof_size_sqft,
            stories: body.intake.stories,
            roof_pitch: body.intake.roof_pitch,
            has_skylights: body.intake.has_skylights,
            has_chimneys: body.intake.has_chimneys,
            has_solar_panels: body.intake.has_solar_panels,
            issues: body.intake.issues,
            issues_description: body.intake.issues_description,
            timeline_urgency: body.intake.timeline_urgency,
            has_insurance_claim: body.intake.has_insurance_claim,
            insurance_company: body.intake.insurance_company,
            claim_number: body.intake.claim_number,
            additional_notes: body.intake.additional_notes,
          } as never,
          { onConflict: 'lead_id' }
        )

      if (intakeError) {
        console.error('Intake update failed:', intakeError)
      }
    }

    // Update contact if provided
    let shouldSendNewLeadNotification = false
    if (body.contact) {
      // Check if contact already exists with an email (to avoid duplicate notifications)
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('email')
        .eq('lead_id', leadId)
        .single()

      const existingEmail = existingContact ? (existingContact as { email: string | null }).email : null
      const isNewContactWithEmail = !existingEmail && body.contact.email

      const { error: contactError } = await supabase
        .from('contacts')
        .upsert(
          {
            lead_id: leadId,
            first_name: body.contact.first_name,
            last_name: body.contact.last_name,
            email: body.contact.email,
            phone: body.contact.phone,
            preferred_contact_method: body.contact.preferred_contact_method,
            consent_marketing: body.contact.consent_marketing,
            consent_sms: body.contact.consent_sms,
            consent_terms: body.contact.consent_terms,
          } as never,
          { onConflict: 'lead_id' }
        )

      if (!contactError && isNewContactWithEmail) {
        shouldSendNewLeadNotification = true
      }
    }

    // Send new lead notification if contact was just submitted
    if (shouldSendNewLeadNotification && body.contact) {
      // Fetch current property and intake data for the notification
      const [{ data: propertyData }, { data: intakeData }, { data: leadData }] = await Promise.all([
        supabase.from('properties').select('street_address, city, state').eq('lead_id', leadId).single(),
        supabase.from('intakes').select('job_type, timeline_urgency').eq('lead_id', leadId).single(),
        supabase.from('leads').select('source, created_at').eq('id', leadId).single(),
      ])

      const property = propertyData as { street_address: string | null; city: string | null; state: string | null } | null
      const intake = intakeData as { job_type: string | null; timeline_urgency: string | null } | null
      const lead = leadData as { source: string | null; created_at: string | null } | null

      notifyNewLead({
        leadId,
        source: lead?.source || undefined,
        createdAt: lead?.created_at || new Date().toISOString(),
        contactName: body.contact.first_name && body.contact.last_name
          ? `${body.contact.first_name} ${body.contact.last_name}`
          : body.contact.first_name || undefined,
        email: body.contact.email || undefined,
        phone: body.contact.phone || undefined,
        address: property?.street_address || undefined,
        city: property?.city || undefined,
        state: property?.state || undefined,
        jobType: intake?.job_type || undefined,
        urgency: intake?.timeline_urgency || undefined,
      }).catch((err) => {
        console.error('[Intake] Failed to send new lead notification:', {
          leadId,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      })
    }

    // Trigger intake_completed workflows if intake was just completed
    if (intakeJustCompleted) {
      triggerWorkflows('intake_completed', {
        leadId,
        data: {
          email: body.contact?.email,
          phone: body.contact?.phone,
        },
      }).catch(err => console.error('Failed to trigger intake_completed workflows:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Intake PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
