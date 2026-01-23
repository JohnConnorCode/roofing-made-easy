export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          status: LeadStatus
          source: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          referrer_url: string | null
          current_step: number
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          status?: LeadStatus
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer_url?: string | null
          current_step?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          status?: LeadStatus
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer_url?: string | null
          current_step?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          lead_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          preferred_contact_method: string
          consent_marketing: boolean
          consent_sms: boolean
          consent_terms: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          preferred_contact_method?: string
          consent_marketing?: boolean
          consent_sms?: boolean
          consent_terms?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          preferred_contact_method?: string
          consent_marketing?: boolean
          consent_sms?: boolean
          consent_terms?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          lead_id: string
          street_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          county: string | null
          country: string
          formatted_address: string | null
          place_id: string | null
          latitude: number | null
          longitude: number | null
          in_service_area: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          county?: string | null
          country?: string
          formatted_address?: string | null
          place_id?: string | null
          latitude?: number | null
          longitude?: number | null
          in_service_area?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          street_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          county?: string | null
          country?: string
          formatted_address?: string | null
          place_id?: string | null
          latitude?: number | null
          longitude?: number | null
          in_service_area?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      intakes: {
        Row: {
          id: string
          lead_id: string
          job_type: JobType | null
          job_description: string | null
          roof_material: RoofMaterial | null
          roof_age_years: number | null
          roof_size_sqft: number | null
          stories: number
          roof_pitch: RoofPitch | null
          has_skylights: boolean
          has_chimneys: boolean
          has_solar_panels: boolean
          issues: Json
          issues_description: string | null
          timeline_urgency: TimelineUrgency | null
          has_insurance_claim: boolean
          insurance_company: string | null
          claim_number: string | null
          additional_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          job_type?: JobType | null
          job_description?: string | null
          roof_material?: RoofMaterial | null
          roof_age_years?: number | null
          roof_size_sqft?: number | null
          stories?: number
          roof_pitch?: RoofPitch | null
          has_skylights?: boolean
          has_chimneys?: boolean
          has_solar_panels?: boolean
          issues?: Json
          issues_description?: string | null
          timeline_urgency?: TimelineUrgency | null
          has_insurance_claim?: boolean
          insurance_company?: string | null
          claim_number?: string | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          job_type?: JobType | null
          job_description?: string | null
          roof_material?: RoofMaterial | null
          roof_age_years?: number | null
          roof_size_sqft?: number | null
          stories?: number
          roof_pitch?: RoofPitch | null
          has_skylights?: boolean
          has_chimneys?: boolean
          has_solar_panels?: boolean
          issues?: Json
          issues_description?: string | null
          timeline_urgency?: TimelineUrgency | null
          has_insurance_claim?: boolean
          insurance_company?: string | null
          claim_number?: string | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          lead_id: string
          storage_path: string
          original_filename: string | null
          content_type: string | null
          file_size: number | null
          status: UploadStatus
          ai_analyzed: boolean
          ai_analysis_result: Json | null
          ai_detected_issues: Json
          ai_confidence_score: number | null
          ai_provider: AiProvider | null
          ai_analyzed_at: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          storage_path: string
          original_filename?: string | null
          content_type?: string | null
          file_size?: number | null
          status?: UploadStatus
          ai_analyzed?: boolean
          ai_analysis_result?: Json | null
          ai_detected_issues?: Json
          ai_confidence_score?: number | null
          ai_provider?: AiProvider | null
          ai_analyzed_at?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          storage_path?: string
          original_filename?: string | null
          content_type?: string | null
          file_size?: number | null
          status?: UploadStatus
          ai_analyzed?: boolean
          ai_analysis_result?: Json | null
          ai_detected_issues?: Json
          ai_confidence_score?: number | null
          ai_provider?: AiProvider | null
          ai_analyzed_at?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          lead_id: string
          price_low: number
          price_likely: number
          price_high: number
          base_cost: number | null
          material_cost: number | null
          labor_cost: number | null
          adjustments: Json
          input_snapshot: Json
          pricing_rules_snapshot: Json
          ai_explanation: string | null
          ai_explanation_provider: AiProvider | null
          valid_until: string | null
          is_superseded: boolean
          superseded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          price_low: number
          price_likely: number
          price_high: number
          base_cost?: number | null
          material_cost?: number | null
          labor_cost?: number | null
          adjustments?: Json
          input_snapshot: Json
          pricing_rules_snapshot: Json
          ai_explanation?: string | null
          ai_explanation_provider?: AiProvider | null
          valid_until?: string | null
          is_superseded?: boolean
          superseded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          price_low?: number
          price_likely?: number
          price_high?: number
          base_cost?: number | null
          material_cost?: number | null
          labor_cost?: number | null
          adjustments?: Json
          input_snapshot?: Json
          pricing_rules_snapshot?: Json
          ai_explanation?: string | null
          ai_explanation_provider?: AiProvider | null
          valid_until?: string | null
          is_superseded?: boolean
          superseded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          rule_key: string
          rule_category: string
          display_name: string
          description: string | null
          base_rate: number | null
          unit: string
          multiplier: number
          flat_fee: number
          min_charge: number | null
          max_charge: number | null
          conditions: Json
          is_active: boolean
          effective_from: string
          effective_until: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          rule_key: string
          rule_category: string
          display_name: string
          description?: string | null
          base_rate?: number | null
          unit?: string
          multiplier?: number
          flat_fee?: number
          min_charge?: number | null
          max_charge?: number | null
          conditions?: Json
          is_active?: boolean
          effective_from?: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          rule_key?: string
          rule_category?: string
          display_name?: string
          description?: string | null
          base_rate?: number | null
          unit?: string
          multiplier?: number
          flat_fee?: number
          min_charge?: number | null
          max_charge?: number | null
          conditions?: Json
          is_active?: boolean
          effective_from?: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      ai_outputs: {
        Row: {
          id: string
          lead_id: string | null
          upload_id: string | null
          estimate_id: string | null
          provider: AiProvider
          operation: string
          model: string | null
          input_data: Json
          output_data: Json | null
          error_message: string | null
          latency_ms: number | null
          token_count_input: number | null
          token_count_output: number | null
          success: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          upload_id?: string | null
          estimate_id?: string | null
          provider: AiProvider
          operation: string
          model?: string | null
          input_data: Json
          output_data?: Json | null
          error_message?: string | null
          latency_ms?: number | null
          token_count_input?: number | null
          token_count_output?: number | null
          success?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          upload_id?: string | null
          estimate_id?: string | null
          provider?: AiProvider
          operation?: string
          model?: string | null
          input_data?: Json
          output_data?: Json | null
          error_message?: string | null
          latency_ms?: number | null
          token_count_input?: number | null
          token_count_output?: number | null
          success?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_data: Json | null
          new_data: Json | null
          changed_fields: string[] | null
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          changed_fields?: string[] | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_data?: Json | null
          new_data?: Json | null
          changed_fields?: string[] | null
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Enums: {
      lead_status: LeadStatus
      job_type: JobType
      roof_material: RoofMaterial
      roof_pitch: RoofPitch
      timeline_urgency: TimelineUrgency
      upload_status: UploadStatus
      ai_provider: AiProvider
    }
  }
}

export type LeadStatus =
  | 'new'
  | 'intake_started'
  | 'intake_complete'
  | 'estimate_generated'
  | 'consultation_scheduled'
  | 'quote_sent'
  | 'won'
  | 'lost'
  | 'archived'

export type JobType =
  | 'full_replacement'
  | 'repair'
  | 'inspection'
  | 'maintenance'
  | 'gutter'
  | 'commercial'
  | 'solar_installation'
  | 'other'

export type RoofMaterial =
  | 'asphalt_shingle'
  | 'metal'
  | 'tile'
  | 'slate'
  | 'wood_shake'
  | 'flat_membrane'
  | 'unknown'

export type RoofPitch =
  | 'flat'
  | 'low'
  | 'medium'
  | 'steep'
  | 'very_steep'
  | 'unknown'

export type TimelineUrgency =
  | 'emergency'
  | 'asap'
  | 'within_month'
  | 'within_3_months'
  | 'flexible'
  | 'just_exploring'

export type UploadStatus =
  | 'pending'
  | 'uploaded'
  | 'analyzed'
  | 'failed'

export type AiProvider =
  | 'openai'
  | 'anthropic'
  | 'fallback'
  | 'mock'

// Helper types
export type Lead = Database['public']['Tables']['leads']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Intake = Database['public']['Tables']['intakes']['Row']
export type Upload = Database['public']['Tables']['uploads']['Row']
export type Estimate = Database['public']['Tables']['estimates']['Row']
export type PricingRule = Database['public']['Tables']['pricing_rules']['Row']
export type AiOutput = Database['public']['Tables']['ai_outputs']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
