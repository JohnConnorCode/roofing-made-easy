import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Update lead step if provided
    if (body.current_step) {
      const newStatus = body.current_step >= 8 ? 'intake_complete' : 'intake_started'
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
        console.error('Error updating property:', propertyError)
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
        console.error('Error updating intake:', intakeError)
      }
    }

    // Update contact if provided
    if (body.contact) {
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

      if (contactError) {
        console.error('Error updating contact:', contactError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[leadId]/intake:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
