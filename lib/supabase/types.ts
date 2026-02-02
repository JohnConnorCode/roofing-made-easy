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
      // ============================================
      // CUSTOMER HUB TABLES (Migration 005)
      // ============================================
      customers: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: CustomerRole
          email_verified: boolean
          phone_verified: boolean
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: CustomerRole
          email_verified?: boolean
          phone_verified?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: CustomerRole
          email_verified?: boolean
          phone_verified?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customer_leads: {
        Row: {
          id: string
          customer_id: string
          lead_id: string
          is_primary: boolean
          nickname: string | null
          linked_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          lead_id: string
          is_primary?: boolean
          nickname?: string | null
          linked_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          lead_id?: string
          is_primary?: boolean
          nickname?: string | null
          linked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      financing_applications: {
        Row: {
          id: string
          customer_id: string
          lead_id: string
          amount_requested: number
          credit_range: CreditRange
          income_range: IncomeRange
          employment_status: EmploymentStatus
          monthly_housing_payment: number | null
          co_applicant: boolean
          status: FinancingStatus
          status_updated_at: string
          admin_notes: string | null
          assigned_to: string | null
          lender_name: string | null
          lender_contact: string | null
          lender_notes: string | null
          pre_approved_amount: number | null
          approved_rate: number | null
          approved_term_months: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          lead_id: string
          amount_requested: number
          credit_range: CreditRange
          income_range: IncomeRange
          employment_status: EmploymentStatus
          monthly_housing_payment?: number | null
          co_applicant?: boolean
          status?: FinancingStatus
          status_updated_at?: string
          admin_notes?: string | null
          assigned_to?: string | null
          lender_name?: string | null
          lender_contact?: string | null
          lender_notes?: string | null
          pre_approved_amount?: number | null
          approved_rate?: number | null
          approved_term_months?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          lead_id?: string
          amount_requested?: number
          credit_range?: CreditRange
          income_range?: IncomeRange
          employment_status?: EmploymentStatus
          monthly_housing_payment?: number | null
          co_applicant?: boolean
          status?: FinancingStatus
          status_updated_at?: string
          admin_notes?: string | null
          assigned_to?: string | null
          lender_name?: string | null
          lender_contact?: string | null
          lender_notes?: string | null
          pre_approved_amount?: number | null
          approved_rate?: number | null
          approved_term_months?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      insurance_claims: {
        Row: {
          id: string
          customer_id: string
          lead_id: string
          insurance_company: string | null
          policy_number: string | null
          claim_number: string | null
          date_of_loss: string | null
          cause_of_loss: string | null
          status: InsuranceClaimStatus
          status_updated_at: string
          timeline: Json
          adjuster_name: string | null
          adjuster_phone: string | null
          adjuster_email: string | null
          adjuster_visit_date: string | null
          claim_amount_approved: number | null
          deductible: number | null
          documents: Json
          customer_notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          lead_id: string
          insurance_company?: string | null
          policy_number?: string | null
          claim_number?: string | null
          date_of_loss?: string | null
          cause_of_loss?: string | null
          status?: InsuranceClaimStatus
          status_updated_at?: string
          timeline?: Json
          adjuster_name?: string | null
          adjuster_phone?: string | null
          adjuster_email?: string | null
          adjuster_visit_date?: string | null
          claim_amount_approved?: number | null
          deductible?: number | null
          documents?: Json
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          lead_id?: string
          insurance_company?: string | null
          policy_number?: string | null
          claim_number?: string | null
          date_of_loss?: string | null
          cause_of_loss?: string | null
          status?: InsuranceClaimStatus
          status_updated_at?: string
          timeline?: Json
          adjuster_name?: string | null
          adjuster_phone?: string | null
          adjuster_email?: string | null
          adjuster_visit_date?: string | null
          claim_amount_approved?: number | null
          deductible?: number | null
          documents?: Json
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assistance_programs: {
        Row: {
          id: string
          name: string
          program_code: string | null
          program_type: ProgramType
          state: string | null
          counties: Json
          zip_codes: Json
          description: string | null
          benefits: string | null
          max_benefit_amount: number | null
          eligibility_criteria: Json
          application_url: string | null
          application_deadline: string | null
          contact_phone: string | null
          contact_email: string | null
          required_documents: Json
          is_active: boolean
          last_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          program_code?: string | null
          program_type: ProgramType
          state?: string | null
          counties?: Json
          zip_codes?: Json
          description?: string | null
          benefits?: string | null
          max_benefit_amount?: number | null
          eligibility_criteria?: Json
          application_url?: string | null
          application_deadline?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          required_documents?: Json
          is_active?: boolean
          last_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          program_code?: string | null
          program_type?: ProgramType
          state?: string | null
          counties?: Json
          zip_codes?: Json
          description?: string | null
          benefits?: string | null
          max_benefit_amount?: number | null
          eligibility_criteria?: Json
          application_url?: string | null
          application_deadline?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          required_documents?: Json
          is_active?: boolean
          last_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_program_applications: {
        Row: {
          id: string
          customer_id: string
          lead_id: string
          program_id: string
          status: ApplicationStatus
          status_updated_at: string
          application_date: string | null
          application_reference: string | null
          approved_amount: number | null
          denial_reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          lead_id: string
          program_id: string
          status?: ApplicationStatus
          status_updated_at?: string
          application_date?: string | null
          application_reference?: string | null
          approved_amount?: number | null
          denial_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          lead_id?: string
          program_id?: string
          status?: ApplicationStatus
          status_updated_at?: string
          application_date?: string | null
          application_reference?: string | null
          approved_amount?: number | null
          denial_reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ============================================
      // ADVANCED ESTIMATION TABLES (Migration 006)
      // ============================================
      line_items: {
        Row: {
          id: string
          item_code: string
          name: string
          description: string | null
          category: LineItemCategory
          unit_type: UnitType
          base_material_cost: number
          base_labor_cost: number
          base_equipment_cost: number
          quantity_formula: string | null
          default_waste_factor: number
          min_quantity: number | null
          max_quantity: number | null
          is_active: boolean
          is_taxable: boolean
          sort_order: number
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          item_code: string
          name: string
          description?: string | null
          category: LineItemCategory
          unit_type?: UnitType
          base_material_cost?: number
          base_labor_cost?: number
          base_equipment_cost?: number
          quantity_formula?: string | null
          default_waste_factor?: number
          min_quantity?: number | null
          max_quantity?: number | null
          is_active?: boolean
          is_taxable?: boolean
          sort_order?: number
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          item_code?: string
          name?: string
          description?: string | null
          category?: LineItemCategory
          unit_type?: UnitType
          base_material_cost?: number
          base_labor_cost?: number
          base_equipment_cost?: number
          quantity_formula?: string | null
          default_waste_factor?: number
          min_quantity?: number | null
          max_quantity?: number | null
          is_active?: boolean
          is_taxable?: boolean
          sort_order?: number
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      geographic_pricing: {
        Row: {
          id: string
          state: string | null
          county: string | null
          zip_codes: string[]
          name: string
          description: string | null
          material_multiplier: number
          labor_multiplier: number
          equipment_multiplier: number
          is_active: boolean
          effective_from: string
          effective_until: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          state?: string | null
          county?: string | null
          zip_codes?: string[]
          name: string
          description?: string | null
          material_multiplier?: number
          labor_multiplier?: number
          equipment_multiplier?: number
          is_active?: boolean
          effective_from?: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          state?: string | null
          county?: string | null
          zip_codes?: string[]
          name?: string
          description?: string | null
          material_multiplier?: number
          labor_multiplier?: number
          equipment_multiplier?: number
          is_active?: boolean
          effective_from?: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      roof_sketches: {
        Row: {
          id: string
          lead_id: string
          total_squares: number
          total_sqft: number
          total_perimeter_lf: number
          total_eave_lf: number
          total_ridge_lf: number
          total_valley_lf: number
          total_hip_lf: number
          total_rake_lf: number
          skylight_count: number
          chimney_count: number
          pipe_boot_count: number
          vent_count: number
          total_drip_edge_lf: number
          total_fascia_lf: number
          gutter_lf: number
          downspout_count: number
          existing_layers: number
          sketch_data: Json
          ai_generated: boolean
          ai_confidence: number | null
          ai_analysis_notes: string | null
          measurement_source: string
          measurement_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          total_squares?: number
          total_sqft?: number
          total_perimeter_lf?: number
          total_eave_lf?: number
          total_ridge_lf?: number
          total_valley_lf?: number
          total_hip_lf?: number
          total_rake_lf?: number
          skylight_count?: number
          chimney_count?: number
          pipe_boot_count?: number
          vent_count?: number
          total_drip_edge_lf?: number
          total_fascia_lf?: number
          gutter_lf?: number
          downspout_count?: number
          existing_layers?: number
          sketch_data?: Json
          ai_generated?: boolean
          ai_confidence?: number | null
          ai_analysis_notes?: string | null
          measurement_source?: string
          measurement_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          total_squares?: number
          total_sqft?: number
          total_perimeter_lf?: number
          total_eave_lf?: number
          total_ridge_lf?: number
          total_valley_lf?: number
          total_hip_lf?: number
          total_rake_lf?: number
          skylight_count?: number
          chimney_count?: number
          pipe_boot_count?: number
          vent_count?: number
          total_drip_edge_lf?: number
          total_fascia_lf?: number
          gutter_lf?: number
          downspout_count?: number
          existing_layers?: number
          sketch_data?: Json
          ai_generated?: boolean
          ai_confidence?: number | null
          ai_analysis_notes?: string | null
          measurement_source?: string
          measurement_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roof_slopes: {
        Row: {
          id: string
          sketch_id: string
          name: string
          slope_number: number
          squares: number
          sqft: number
          pitch: number
          pitch_multiplier: number
          eave_lf: number
          ridge_lf: number
          valley_lf: number
          hip_lf: number
          rake_lf: number
          length_ft: number | null
          width_ft: number | null
          is_walkable: boolean
          has_steep_charge: boolean
          has_limited_access: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sketch_id: string
          name?: string
          slope_number?: number
          squares?: number
          sqft?: number
          pitch?: number
          pitch_multiplier?: number
          eave_lf?: number
          ridge_lf?: number
          valley_lf?: number
          hip_lf?: number
          rake_lf?: number
          length_ft?: number | null
          width_ft?: number | null
          is_walkable?: boolean
          has_steep_charge?: boolean
          has_limited_access?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sketch_id?: string
          name?: string
          slope_number?: number
          squares?: number
          sqft?: number
          pitch?: number
          pitch_multiplier?: number
          eave_lf?: number
          ridge_lf?: number
          valley_lf?: number
          hip_lf?: number
          rake_lf?: number
          length_ft?: number | null
          width_ft?: number | null
          is_walkable?: boolean
          has_steep_charge?: boolean
          has_limited_access?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      estimate_macros: {
        Row: {
          id: string
          name: string
          description: string | null
          roof_type: MacroRoofType
          job_type: MacroJobType
          is_default: boolean
          is_system: boolean
          usage_count: number
          last_used_at: string | null
          is_active: boolean
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          roof_type?: MacroRoofType
          job_type?: MacroJobType
          is_default?: boolean
          is_system?: boolean
          usage_count?: number
          last_used_at?: string | null
          is_active?: boolean
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          roof_type?: MacroRoofType
          job_type?: MacroJobType
          is_default?: boolean
          is_system?: boolean
          usage_count?: number
          last_used_at?: string | null
          is_active?: boolean
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      macro_line_items: {
        Row: {
          id: string
          macro_id: string
          line_item_id: string
          quantity_formula: string | null
          waste_factor: number | null
          is_optional: boolean
          is_selected_by_default: boolean
          material_cost_override: number | null
          labor_cost_override: number | null
          equipment_cost_override: number | null
          sort_order: number
          group_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          macro_id: string
          line_item_id: string
          quantity_formula?: string | null
          waste_factor?: number | null
          is_optional?: boolean
          is_selected_by_default?: boolean
          material_cost_override?: number | null
          labor_cost_override?: number | null
          equipment_cost_override?: number | null
          sort_order?: number
          group_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          macro_id?: string
          line_item_id?: string
          quantity_formula?: string | null
          waste_factor?: number | null
          is_optional?: boolean
          is_selected_by_default?: boolean
          material_cost_override?: number | null
          labor_cost_override?: number | null
          equipment_cost_override?: number | null
          sort_order?: number
          group_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      detailed_estimates: {
        Row: {
          id: string
          lead_id: string
          sketch_id: string | null
          name: string
          version: number
          variables: Json
          total_material: number
          total_labor: number
          total_equipment: number
          subtotal: number
          overhead_percent: number
          overhead_amount: number
          profit_percent: number
          profit_amount: number
          tax_percent: number
          tax_amount: number
          taxable_amount: number
          price_low: number
          price_likely: number
          price_high: number
          geographic_pricing_id: string | null
          geographic_adjustment: number
          source_macro_id: string | null
          valid_until: string | null
          is_superseded: boolean
          superseded_by: string | null
          status: string
          sent_at: string | null
          accepted_at: string | null
          declined_at: string | null
          ai_optimized: boolean
          ai_suggestions: Json
          ai_explanation: string | null
          internal_notes: string | null
          customer_notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          sketch_id?: string | null
          name?: string
          version?: number
          variables?: Json
          total_material?: number
          total_labor?: number
          total_equipment?: number
          subtotal?: number
          overhead_percent?: number
          overhead_amount?: number
          profit_percent?: number
          profit_amount?: number
          tax_percent?: number
          tax_amount?: number
          taxable_amount?: number
          price_low?: number
          price_likely?: number
          price_high?: number
          geographic_pricing_id?: string | null
          geographic_adjustment?: number
          source_macro_id?: string | null
          valid_until?: string | null
          is_superseded?: boolean
          superseded_by?: string | null
          status?: string
          sent_at?: string | null
          accepted_at?: string | null
          declined_at?: string | null
          ai_optimized?: boolean
          ai_suggestions?: Json
          ai_explanation?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          sketch_id?: string | null
          name?: string
          version?: number
          variables?: Json
          total_material?: number
          total_labor?: number
          total_equipment?: number
          subtotal?: number
          overhead_percent?: number
          overhead_amount?: number
          profit_percent?: number
          profit_amount?: number
          tax_percent?: number
          tax_amount?: number
          taxable_amount?: number
          price_low?: number
          price_likely?: number
          price_high?: number
          geographic_pricing_id?: string | null
          geographic_adjustment?: number
          source_macro_id?: string | null
          valid_until?: string | null
          is_superseded?: boolean
          superseded_by?: string | null
          status?: string
          sent_at?: string | null
          accepted_at?: string | null
          declined_at?: string | null
          ai_optimized?: boolean
          ai_suggestions?: Json
          ai_explanation?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      estimate_line_items: {
        Row: {
          id: string
          detailed_estimate_id: string
          line_item_id: string
          item_code: string
          name: string
          category: LineItemCategory
          unit_type: UnitType
          quantity: number
          quantity_formula: string | null
          waste_factor: number
          quantity_with_waste: number
          material_unit_cost: number
          labor_unit_cost: number
          equipment_unit_cost: number
          material_total: number
          labor_total: number
          equipment_total: number
          line_total: number
          is_included: boolean
          is_optional: boolean
          is_taxable: boolean
          sort_order: number
          group_name: string | null
          notes: string | null
          quantity_override: boolean
          cost_override: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          detailed_estimate_id: string
          line_item_id: string
          item_code: string
          name: string
          category: LineItemCategory
          unit_type: UnitType
          quantity?: number
          quantity_formula?: string | null
          waste_factor?: number
          quantity_with_waste?: number
          material_unit_cost?: number
          labor_unit_cost?: number
          equipment_unit_cost?: number
          material_total?: number
          labor_total?: number
          equipment_total?: number
          line_total?: number
          is_included?: boolean
          is_optional?: boolean
          is_taxable?: boolean
          sort_order?: number
          group_name?: string | null
          notes?: string | null
          quantity_override?: boolean
          cost_override?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          detailed_estimate_id?: string
          line_item_id?: string
          item_code?: string
          name?: string
          category?: LineItemCategory
          unit_type?: UnitType
          quantity?: number
          quantity_formula?: string | null
          waste_factor?: number
          quantity_with_waste?: number
          material_unit_cost?: number
          labor_unit_cost?: number
          equipment_unit_cost?: number
          material_total?: number
          labor_total?: number
          equipment_total?: number
          line_total?: number
          is_included?: boolean
          is_optional?: boolean
          is_taxable?: boolean
          sort_order?: number
          group_name?: string | null
          notes?: string | null
          quantity_override?: boolean
          cost_override?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // ============================================
      // CORE TABLES (Migration 001-003)
      // ============================================
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
      // ============================================
      // ADMIN DATA & PIPELINE TABLES (Migration 017)
      // ============================================
      admin_preferences: {
        Row: {
          id: string
          user_id: string
          pipeline_columns: Json
          pipeline_card_fields: Json
          dashboard_widgets: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pipeline_columns?: Json
          pipeline_card_fields?: Json
          dashboard_widgets?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pipeline_columns?: Json
          pipeline_card_fields?: Json
          dashboard_widgets?: Json
          created_at?: string
          updated_at?: string
        }
      }
      custom_pipeline_stages: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          position: number
          is_system: boolean
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          position?: number
          is_system?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          position?: number
          is_system?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lead_stage_history: {
        Row: {
          id: string
          lead_id: string
          from_stage: string | null
          to_stage: string
          duration_minutes: number | null
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          from_stage?: string | null
          to_stage: string
          duration_minutes?: number | null
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          from_stage?: string | null
          to_stage?: string
          duration_minutes?: number | null
          changed_by?: string | null
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
      // Customer Hub Enums (Migration 005)
      customer_role: CustomerRole
      financing_status: FinancingStatus
      credit_range: CreditRange
      income_range: IncomeRange
      employment_status: EmploymentStatus
      insurance_claim_status: InsuranceClaimStatus
      program_type: ProgramType
      application_status: ApplicationStatus
      // Advanced Estimation Enums (Migration 006)
      unit_type: UnitType
      line_item_category: LineItemCategory
      macro_roof_type: MacroRoofType
      macro_job_type: MacroJobType
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

// ============================================
// Customer Hub Enums (Migration 005)
// ============================================
export type CustomerRole = 'customer' | 'admin'

export type FinancingStatus =
  | 'interested'
  | 'contacted'
  | 'pre_qualified'
  | 'applied'
  | 'approved'
  | 'denied'
  | 'withdrawn'

export type CreditRange =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'very_poor'

export type IncomeRange =
  | 'under_30k'
  | '30k_50k'
  | '50k_75k'
  | '75k_100k'
  | '100k_150k'
  | 'over_150k'

export type EmploymentStatus =
  | 'employed_full_time'
  | 'employed_part_time'
  | 'self_employed'
  | 'retired'
  | 'unemployed'
  | 'other'

export type InsuranceClaimStatus =
  | 'not_started'
  | 'filed'
  | 'adjuster_scheduled'
  | 'adjuster_visited'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'appealing'
  | 'settled'

export type ProgramType =
  | 'federal'
  | 'state'
  | 'local'
  | 'utility'
  | 'nonprofit'

export type ApplicationStatus =
  | 'researching'
  | 'eligible'
  | 'not_eligible'
  | 'applied'
  | 'approved'
  | 'denied'

// ============================================
// Advanced Estimation Enums (Migration 006)
// ============================================
export type UnitType =
  | 'SQ'
  | 'SF'
  | 'LF'
  | 'EA'
  | 'HR'
  | 'DAY'
  | 'TON'
  | 'GAL'
  | 'BDL'
  | 'RL'

export type LineItemCategory =
  | 'tear_off'
  | 'underlayment'
  | 'shingles'
  | 'metal_roofing'
  | 'tile_roofing'
  | 'flat_roofing'
  | 'flashing'
  | 'ventilation'
  | 'gutters'
  | 'skylights'
  | 'chimneys'
  | 'decking'
  | 'insulation'
  | 'labor'
  | 'equipment'
  | 'disposal'
  | 'permits'
  | 'miscellaneous'

export type MacroRoofType =
  | 'asphalt_shingle'
  | 'metal_standing_seam'
  | 'metal_corrugated'
  | 'tile_concrete'
  | 'tile_clay'
  | 'slate'
  | 'wood_shake'
  | 'flat_tpo'
  | 'flat_epdm'
  | 'flat_modified_bitumen'
  | 'any'

export type MacroJobType =
  | 'full_replacement'
  | 'repair'
  | 'overlay'
  | 'partial_replacement'
  | 'storm_damage'
  | 'insurance_claim'
  | 'maintenance'
  | 'gutter_only'
  | 'any'

// ============================================
// Helper types - Core Tables
// ============================================
export type Lead = Database['public']['Tables']['leads']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Intake = Database['public']['Tables']['intakes']['Row']
export type Upload = Database['public']['Tables']['uploads']['Row']
export type Estimate = Database['public']['Tables']['estimates']['Row']
export type PricingRule = Database['public']['Tables']['pricing_rules']['Row']
export type AiOutput = Database['public']['Tables']['ai_outputs']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// ============================================
// Helper types - Customer Hub (Migration 005)
// ============================================

// Insurance claim timeline event structure (stored as JSONB array in timeline column)
export interface InsuranceClaimTimelineEvent {
  date: string
  status: InsuranceClaimStatus
  notes?: string
  updated_by?: string
}

// Notification preferences structure (stored as JSONB in notification_preferences column)
export interface NotificationPreferences {
  email: boolean
  sms: boolean
}

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerLead = Database['public']['Tables']['customer_leads']['Row']
export type FinancingApplication = Database['public']['Tables']['financing_applications']['Row']
export type InsuranceClaim = Database['public']['Tables']['insurance_claims']['Row']
export type AssistanceProgram = Database['public']['Tables']['assistance_programs']['Row']
export type CustomerProgramApplication = Database['public']['Tables']['customer_program_applications']['Row']

// ============================================
// Helper types - Advanced Estimation (Migration 006)
// ============================================

// Slope-level variables for individual roof faces
export interface SlopeVariables {
  SQ: number          // Squares (100 sq ft)
  SF: number          // Square feet
  PITCH: number       // Pitch (rise/12)
  EAVE: number        // Eave length (LF)
  RIDGE: number       // Ridge length (LF)
  VALLEY: number      // Valley length (LF)
  HIP: number         // Hip length (LF)
  RAKE: number        // Rake length (LF)
}

// Complete roof variables for estimation calculations
export interface RoofVariables {
  SQ: number          // Total squares
  SF: number          // Total square feet
  P: number           // Total perimeter (LF)
  EAVE: number        // Total eave length (LF)
  R: number           // Total ridge length (LF)
  VAL: number         // Total valley length (LF)
  HIP: number         // Total hip length (LF)
  RAKE: number        // Total rake length (LF)
  SKYLIGHT_COUNT: number
  CHIMNEY_COUNT: number
  PIPE_COUNT: number
  VENT_COUNT: number
  GUTTER_LF: number   // Gutter length (LF)
  DS_COUNT: number    // Downspout count
  slopes?: Record<string, SlopeVariables>  // Per-slope variables (F1, F2, etc.)
}

// AI suggestion for estimate line items (used in detailed_estimates.ai_suggestions)
export interface AiSuggestion {
  type: 'missing_item' | 'upgrade' | 'warning' | 'cost_saving'
  title: string
  description: string
  confidence: number
  line_item_code?: string
  category?: string
  impact?: number  // Cost impact in dollars
}

export type LineItem = Database['public']['Tables']['line_items']['Row']

// MacroLineItem with expanded line_item relation (from Supabase joins)
export interface MacroLineItemWithLineItem extends MacroLineItem {
  line_item?: LineItem
}
export type GeographicPricing = Database['public']['Tables']['geographic_pricing']['Row']
export type RoofSketch = Database['public']['Tables']['roof_sketches']['Row']
export type RoofSlope = Database['public']['Tables']['roof_slopes']['Row']
export type EstimateMacro = Database['public']['Tables']['estimate_macros']['Row']
export type MacroLineItem = Database['public']['Tables']['macro_line_items']['Row']
export type DetailedEstimate = Database['public']['Tables']['detailed_estimates']['Row']
export type EstimateLineItem = Database['public']['Tables']['estimate_line_items']['Row']

// ============================================
// Helper types - Admin Data & Pipeline (Migration 017)
// ============================================
export type AdminPreferences = Database['public']['Tables']['admin_preferences']['Row']
export type CustomPipelineStage = Database['public']['Tables']['custom_pipeline_stages']['Row']
export type LeadStageHistory = Database['public']['Tables']['lead_stage_history']['Row']
