export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_preferences: {
        Row: {
          created_at: string | null
          dashboard_widgets: Json | null
          id: string
          pipeline_card_fields: Json | null
          pipeline_columns: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          pipeline_card_fields?: Json | null
          pipeline_columns?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          pipeline_card_fields?: Json | null
          pipeline_columns?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_outputs: {
        Row: {
          created_at: string
          error_message: string | null
          estimate_id: string | null
          id: string
          input_data: Json
          latency_ms: number | null
          lead_id: string | null
          model: string | null
          operation: string
          output_data: Json | null
          provider: Database["public"]["Enums"]["ai_provider"]
          success: boolean | null
          token_count_input: number | null
          token_count_output: number | null
          upload_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          estimate_id?: string | null
          id?: string
          input_data: Json
          latency_ms?: number | null
          lead_id?: string | null
          model?: string | null
          operation: string
          output_data?: Json | null
          provider: Database["public"]["Enums"]["ai_provider"]
          success?: boolean | null
          token_count_input?: number | null
          token_count_output?: number | null
          upload_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          estimate_id?: string | null
          id?: string
          input_data?: Json
          latency_ms?: number | null
          lead_id?: string | null
          model?: string | null
          operation?: string
          output_data?: Json | null
          provider?: Database["public"]["Enums"]["ai_provider"]
          success?: boolean | null
          token_count_input?: number | null
          token_count_output?: number | null
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_outputs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_outputs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_outputs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_outputs_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials: {
        Row: {
          configured_at: string | null
          configured_by: string | null
          created_at: string
          encrypted_key: string
          key_hint: string | null
          last_test_error: string | null
          last_test_success: boolean | null
          last_tested_at: string | null
          service_id: Database["public"]["Enums"]["api_service_type"]
          updated_at: string
        }
        Insert: {
          configured_at?: string | null
          configured_by?: string | null
          created_at?: string
          encrypted_key?: string
          key_hint?: string | null
          last_test_error?: string | null
          last_test_success?: boolean | null
          last_tested_at?: string | null
          service_id: Database["public"]["Enums"]["api_service_type"]
          updated_at?: string
        }
        Update: {
          configured_at?: string | null
          configured_by?: string | null
          created_at?: string
          encrypted_key?: string
          key_hint?: string | null
          last_test_error?: string | null
          last_test_success?: boolean | null
          last_tested_at?: string | null
          service_id?: Database["public"]["Enums"]["api_service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      assistance_programs: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          benefits: string | null
          contact_email: string | null
          contact_phone: string | null
          counties: Json | null
          created_at: string
          description: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          last_verified_at: string | null
          max_benefit_amount: number | null
          name: string
          program_code: string | null
          program_type: Database["public"]["Enums"]["program_type"]
          required_documents: Json | null
          state: string | null
          updated_at: string
          zip_codes: Json | null
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          counties?: Json | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          max_benefit_amount?: number | null
          name: string
          program_code?: string | null
          program_type: Database["public"]["Enums"]["program_type"]
          required_documents?: Json | null
          state?: string | null
          updated_at?: string
          zip_codes?: Json | null
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          counties?: Json | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          max_benefit_amount?: number | null
          name?: string
          program_code?: string | null
          program_type?: Database["public"]["Enums"]["program_type"]
          required_documents?: Json | null
          state?: string | null
          updated_at?: string
          zip_codes?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          business_days: number[] | null
          business_hours_end: string | null
          business_hours_start: string | null
          channel: Database["public"]["Enums"]["message_channel"] | null
          conditions: Json | null
          cooldown_hours: number | null
          created_at: string
          created_by: string | null
          delay_minutes: number
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          max_sends_per_lead: number | null
          name: string
          priority: number | null
          respect_business_hours: boolean | null
          template_id: string
          trigger_event: Database["public"]["Enums"]["workflow_trigger"]
          updated_at: string
        }
        Insert: {
          business_days?: number[] | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          channel?: Database["public"]["Enums"]["message_channel"] | null
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string
          created_by?: string | null
          delay_minutes?: number
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_sends_per_lead?: number | null
          name: string
          priority?: number | null
          respect_business_hours?: boolean | null
          template_id: string
          trigger_event: Database["public"]["Enums"]["workflow_trigger"]
          updated_at?: string
        }
        Update: {
          business_days?: number[] | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          channel?: Database["public"]["Enums"]["message_channel"] | null
          conditions?: Json | null
          cooldown_hours?: number | null
          created_at?: string
          created_by?: string | null
          delay_minutes?: number
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_sends_per_lead?: number | null
          name?: string
          priority?: number | null
          respect_business_hours?: boolean | null
          template_id?: string
          trigger_event?: Database["public"]["Enums"]["workflow_trigger"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          assigned_team_id: string | null
          assigned_to: string | null
          attendee_email: string | null
          attendee_name: string | null
          attendee_phone: string | null
          color: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_at: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          id: string
          job_id: string | null
          lead_id: string | null
          location: string | null
          reminder_minutes: number[] | null
          reminder_sent: boolean
          start_at: string
          status: Database["public"]["Enums"]["calendar_event_status"]
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          assigned_team_id?: string | null
          assigned_to?: string | null
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_at: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          job_id?: string | null
          lead_id?: string | null
          location?: string | null
          reminder_minutes?: number[] | null
          reminder_sent?: boolean
          start_at: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          assigned_team_id?: string | null
          assigned_to?: string | null
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_at?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          job_id?: string | null
          lead_id?: string | null
          location?: string | null
          reminder_minutes?: number[] | null
          reminder_sent?: boolean
          start_at?: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          change_order_number: string
          cost_delta: number
          created_at: string
          created_by: string | null
          customer_approved: boolean
          customer_approved_at: string | null
          description: string
          id: string
          job_id: string
          reason: string | null
          status: Database["public"]["Enums"]["change_order_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          change_order_number: string
          cost_delta?: number
          created_at?: string
          created_by?: string | null
          customer_approved?: boolean
          customer_approved_at?: string | null
          description: string
          id?: string
          job_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["change_order_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          change_order_number?: string
          cost_delta?: number
          created_at?: string
          created_by?: string | null
          customer_approved?: boolean
          customer_approved_at?: string | null
          description?: string
          id?: string
          job_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["change_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          body: string
          body_html: string | null
          bounced_at: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          clicked_at: string | null
          created_at: string
          customer_id: string | null
          direction: string
          external_id: string | null
          external_status: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          opened_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          replied_to_id: string | null
          scheduled_message_id: string | null
          sender_email: string | null
          sender_phone: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          template_id: string | null
          unsubscribed_at: string | null
          workflow_id: string | null
        }
        Insert: {
          body: string
          body_html?: string | null
          bounced_at?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          clicked_at?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          external_id?: string | null
          external_status?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          replied_to_id?: string | null
          scheduled_message_id?: string | null
          sender_email?: string | null
          sender_phone?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          unsubscribed_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          body?: string
          body_html?: string | null
          bounced_at?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          clicked_at?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          external_id?: string | null
          external_status?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          replied_to_id?: string | null
          scheduled_message_id?: string | null
          sender_email?: string | null
          sender_phone?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          unsubscribed_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "communication_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "scheduled_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          converted_to_lead_id: string | null
          created_at: string
          email: string
          id: string
          ip_address: unknown
          is_read: boolean
          is_responded: boolean
          message: string
          name: string
          phone: string | null
          read_at: string | null
          read_by: string | null
          responded_at: string | null
          responded_by: string | null
          response_notes: string | null
          source: string | null
          subject: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          converted_to_lead_id?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          is_responded?: boolean
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          read_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          source?: string | null
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          converted_to_lead_id?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          is_responded?: boolean
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          read_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          source?: string | null
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_converted_to_lead_id_fkey"
            columns: ["converted_to_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          consent_marketing: boolean | null
          consent_sms: boolean | null
          consent_terms: boolean | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          lead_id: string
          phone: string | null
          preferred_contact_method: string | null
          updated_at: string
        }
        Insert: {
          consent_marketing?: boolean | null
          consent_sms?: boolean | null
          consent_terms?: boolean | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_id: string
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Update: {
          consent_marketing?: boolean | null
          consent_sms?: boolean | null
          consent_terms?: boolean | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_id?: string
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_availability: {
        Row: {
          available: boolean
          created_at: string
          date: string
          end_time: string | null
          id: string
          reason: string | null
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_system: boolean | null
          is_visible: boolean | null
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          is_visible?: boolean | null
          name: string
          position?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          is_visible?: boolean | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_ai_content: {
        Row: {
          content: Json
          content_type: string
          created_at: string
          customer_id: string
          id: string
          input_context: Json | null
          lead_id: string | null
          provider: string | null
          topic: string | null
        }
        Insert: {
          content?: Json
          content_type: string
          created_at?: string
          customer_id: string
          id?: string
          input_context?: Json | null
          lead_id?: string | null
          provider?: string | null
          topic?: string | null
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string
          customer_id?: string
          id?: string
          input_context?: Json | null
          lead_id?: string | null
          provider?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_ai_content_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ai_content_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_leads: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_primary: boolean | null
          lead_id: string
          linked_at: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_primary?: boolean | null
          lead_id: string
          linked_at?: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_primary?: boolean | null
          lead_id?: string
          linked_at?: string
          nickname?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_program_applications: {
        Row: {
          application_date: string | null
          application_reference: string | null
          approved_amount: number | null
          created_at: string
          customer_id: string
          denial_reason: string | null
          id: string
          lead_id: string
          notes: string | null
          program_id: string
          status: Database["public"]["Enums"]["application_status"] | null
          status_updated_at: string | null
          updated_at: string
        }
        Insert: {
          application_date?: string | null
          application_reference?: string | null
          approved_amount?: number | null
          created_at?: string
          customer_id: string
          denial_reason?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          program_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
          status_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          application_date?: string | null
          application_reference?: string | null
          approved_amount?: number | null
          created_at?: string
          customer_id?: string
          denial_reason?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          program_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          status_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_program_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_program_applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_program_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "assistance_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["customer_role"] | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["customer_role"] | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["customer_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      detailed_estimates: {
        Row: {
          acceptance_signature: string | null
          accepted_at: string | null
          accepted_by_email: string | null
          accepted_by_ip: unknown
          accepted_by_name: string | null
          accepted_terms_version: string | null
          adjusted_price: number | null
          adjusted_price_high: number | null
          adjusted_price_likely: number | null
          adjusted_price_low: number | null
          ai_explanation: string | null
          ai_optimized: boolean
          ai_suggestions: Json | null
          created_at: string
          created_by: string | null
          customer_notes: string | null
          declined_at: string | null
          expiration_reminder_sent_at: string | null
          geographic_adjustment: number
          geographic_pricing_id: string | null
          has_adjustments: boolean
          id: string
          internal_notes: string | null
          is_superseded: boolean
          lead_id: string
          name: string
          overhead_amount: number
          overhead_percent: number
          price_high: number
          price_likely: number
          price_low: number
          profit_amount: number
          profit_percent: number
          rejected_at: string | null
          rejected_by_email: string | null
          rejected_by_name: string | null
          rejection_reason: string | null
          sent_at: string | null
          sketch_id: string | null
          source_macro_id: string | null
          status: string
          subtotal: number
          superseded_by: string | null
          tax_amount: number
          tax_percent: number
          taxable_amount: number
          total_discount_amount: number | null
          total_discount_percent: number | null
          total_equipment: number
          total_labor: number
          total_material: number
          updated_at: string
          valid_until: string | null
          variables: Json
          version: number
          view_count: number
          viewed_at: string | null
        }
        Insert: {
          acceptance_signature?: string | null
          accepted_at?: string | null
          accepted_by_email?: string | null
          accepted_by_ip?: unknown
          accepted_by_name?: string | null
          accepted_terms_version?: string | null
          adjusted_price?: number | null
          adjusted_price_high?: number | null
          adjusted_price_likely?: number | null
          adjusted_price_low?: number | null
          ai_explanation?: string | null
          ai_optimized?: boolean
          ai_suggestions?: Json | null
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          declined_at?: string | null
          expiration_reminder_sent_at?: string | null
          geographic_adjustment?: number
          geographic_pricing_id?: string | null
          has_adjustments?: boolean
          id?: string
          internal_notes?: string | null
          is_superseded?: boolean
          lead_id: string
          name?: string
          overhead_amount?: number
          overhead_percent?: number
          price_high?: number
          price_likely?: number
          price_low?: number
          profit_amount?: number
          profit_percent?: number
          rejected_at?: string | null
          rejected_by_email?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          sketch_id?: string | null
          source_macro_id?: string | null
          status?: string
          subtotal?: number
          superseded_by?: string | null
          tax_amount?: number
          tax_percent?: number
          taxable_amount?: number
          total_discount_amount?: number | null
          total_discount_percent?: number | null
          total_equipment?: number
          total_labor?: number
          total_material?: number
          updated_at?: string
          valid_until?: string | null
          variables?: Json
          version?: number
          view_count?: number
          viewed_at?: string | null
        }
        Update: {
          acceptance_signature?: string | null
          accepted_at?: string | null
          accepted_by_email?: string | null
          accepted_by_ip?: unknown
          accepted_by_name?: string | null
          accepted_terms_version?: string | null
          adjusted_price?: number | null
          adjusted_price_high?: number | null
          adjusted_price_likely?: number | null
          adjusted_price_low?: number | null
          ai_explanation?: string | null
          ai_optimized?: boolean
          ai_suggestions?: Json | null
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          declined_at?: string | null
          expiration_reminder_sent_at?: string | null
          geographic_adjustment?: number
          geographic_pricing_id?: string | null
          has_adjustments?: boolean
          id?: string
          internal_notes?: string | null
          is_superseded?: boolean
          lead_id?: string
          name?: string
          overhead_amount?: number
          overhead_percent?: number
          price_high?: number
          price_likely?: number
          price_low?: number
          profit_amount?: number
          profit_percent?: number
          rejected_at?: string | null
          rejected_by_email?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          sketch_id?: string | null
          source_macro_id?: string | null
          status?: string
          subtotal?: number
          superseded_by?: string | null
          tax_amount?: number
          tax_percent?: number
          taxable_amount?: number
          total_discount_amount?: number | null
          total_discount_percent?: number | null
          total_equipment?: number
          total_labor?: number
          total_material?: number
          updated_at?: string
          valid_until?: string | null
          variables?: Json
          version?: number
          view_count?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_estimates_geographic_pricing_id_fkey"
            columns: ["geographic_pricing_id"]
            isOneToOne: false
            referencedRelation: "geographic_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_estimates_sketch_id_fkey"
            columns: ["sketch_id"]
            isOneToOne: false
            referencedRelation: "roof_sketches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_estimates_source_macro_id_fkey"
            columns: ["source_macro_id"]
            isOneToOne: false
            referencedRelation: "estimate_macros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_estimates_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_code_uses: {
        Row: {
          applied_at: string
          customer_id: string | null
          detailed_estimate_id: string | null
          discount_amount: number
          discount_code_id: string
          estimate_id: string | null
          id: string
          lead_id: string
        }
        Insert: {
          applied_at?: string
          customer_id?: string | null
          detailed_estimate_id?: string | null
          discount_amount: number
          discount_code_id: string
          estimate_id?: string | null
          id?: string
          lead_id: string
        }
        Update: {
          applied_at?: string
          customer_id?: string | null
          detailed_estimate_id?: string | null
          discount_amount?: number
          discount_code_id?: string
          estimate_id?: string | null
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_uses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_uses_detailed_estimate_id_fkey"
            columns: ["detailed_estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_uses_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_uses_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_uses_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_uses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_job_types: string[] | null
          applicable_regions: string[] | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount_amount: number | null
          max_uses: number | null
          max_uses_per_customer: number | null
          min_order_amount: number | null
          name: string
          total_discount_given: number
          updated_at: string
          use_count: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_job_types?: string[] | null
          applicable_regions?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_amount?: number | null
          name: string
          total_discount_given?: number
          updated_at?: string
          use_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_job_types?: string[] | null
          applicable_regions?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_amount?: number | null
          name?: string
          total_discount_given?: number
          updated_at?: string
          use_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      estimate_content: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          default_content: string
          display_order: number | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          default_content: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          default_content?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      estimate_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          actor_ip: unknown
          actor_name: string | null
          actor_type: string
          created_at: string
          detailed_estimate_id: string | null
          estimate_id: string | null
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_name?: string | null
          actor_type?: string
          created_at?: string
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_name?: string | null
          actor_type?: string
          created_at?: string
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_events_detailed_estimate_id_fkey"
            columns: ["detailed_estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_events_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_events_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          category: Database["public"]["Enums"]["line_item_category"]
          cost_override: boolean
          created_at: string
          detailed_estimate_id: string
          equipment_total: number
          equipment_unit_cost: number
          group_name: string | null
          id: string
          is_included: boolean
          is_optional: boolean
          is_taxable: boolean
          item_code: string
          labor_total: number
          labor_unit_cost: number
          line_item_id: string
          line_total: number
          material_total: number
          material_unit_cost: number
          name: string
          notes: string | null
          quantity: number
          quantity_formula: string | null
          quantity_override: boolean
          quantity_with_waste: number
          sort_order: number
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
          waste_factor: number
        }
        Insert: {
          category: Database["public"]["Enums"]["line_item_category"]
          cost_override?: boolean
          created_at?: string
          detailed_estimate_id: string
          equipment_total?: number
          equipment_unit_cost?: number
          group_name?: string | null
          id?: string
          is_included?: boolean
          is_optional?: boolean
          is_taxable?: boolean
          item_code: string
          labor_total?: number
          labor_unit_cost?: number
          line_item_id: string
          line_total?: number
          material_total?: number
          material_unit_cost?: number
          name: string
          notes?: string | null
          quantity?: number
          quantity_formula?: string | null
          quantity_override?: boolean
          quantity_with_waste?: number
          sort_order?: number
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          waste_factor?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["line_item_category"]
          cost_override?: boolean
          created_at?: string
          detailed_estimate_id?: string
          equipment_total?: number
          equipment_unit_cost?: number
          group_name?: string | null
          id?: string
          is_included?: boolean
          is_optional?: boolean
          is_taxable?: boolean
          item_code?: string
          labor_total?: number
          labor_unit_cost?: number
          line_item_id?: string
          line_total?: number
          material_total?: number
          material_unit_cost?: number
          name?: string
          notes?: string | null
          quantity?: number
          quantity_formula?: string | null
          quantity_override?: boolean
          quantity_with_waste?: number
          sort_order?: number
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          waste_factor?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_detailed_estimate_id_fkey"
            columns: ["detailed_estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_macros: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          is_system: boolean
          job_type: Database["public"]["Enums"]["macro_job_type"]
          last_used_at: string | null
          name: string
          notes: string | null
          roof_type: Database["public"]["Enums"]["macro_roof_type"]
          tags: string[] | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_system?: boolean
          job_type?: Database["public"]["Enums"]["macro_job_type"]
          last_used_at?: string | null
          name: string
          notes?: string | null
          roof_type?: Database["public"]["Enums"]["macro_roof_type"]
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_system?: boolean
          job_type?: Database["public"]["Enums"]["macro_job_type"]
          last_used_at?: string | null
          name?: string
          notes?: string | null
          roof_type?: Database["public"]["Enums"]["macro_roof_type"]
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      estimates: {
        Row: {
          acceptance_signature: string | null
          accepted_at: string | null
          accepted_by: string | null
          accepted_by_email: string | null
          accepted_by_ip: unknown
          accepted_by_name: string | null
          adjusted_price_high: number | null
          adjusted_price_likely: number | null
          adjusted_price_low: number | null
          adjustments: Json | null
          ai_explanation: string | null
          ai_explanation_provider:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          ai_explanation_status: string | null
          base_cost: number | null
          created_at: string
          estimate_status: string | null
          has_adjustments: boolean
          id: string
          input_snapshot: Json
          is_superseded: boolean | null
          labor_cost: number | null
          lead_id: string
          material_cost: number | null
          price_high: number
          price_likely: number
          price_low: number
          pricing_rules_snapshot: Json
          rejected_at: string | null
          rejected_by_email: string | null
          rejected_by_name: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: string | null
          superseded_by: string | null
          total_discount_amount: number | null
          total_discount_percent: number | null
          updated_at: string
          valid_until: string | null
          view_count: number
          viewed_at: string | null
        }
        Insert: {
          acceptance_signature?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          accepted_by_email?: string | null
          accepted_by_ip?: unknown
          accepted_by_name?: string | null
          adjusted_price_high?: number | null
          adjusted_price_likely?: number | null
          adjusted_price_low?: number | null
          adjustments?: Json | null
          ai_explanation?: string | null
          ai_explanation_provider?:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          ai_explanation_status?: string | null
          base_cost?: number | null
          created_at?: string
          estimate_status?: string | null
          has_adjustments?: boolean
          id?: string
          input_snapshot: Json
          is_superseded?: boolean | null
          labor_cost?: number | null
          lead_id: string
          material_cost?: number | null
          price_high: number
          price_likely: number
          price_low: number
          pricing_rules_snapshot: Json
          rejected_at?: string | null
          rejected_by_email?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string | null
          superseded_by?: string | null
          total_discount_amount?: number | null
          total_discount_percent?: number | null
          updated_at?: string
          valid_until?: string | null
          view_count?: number
          viewed_at?: string | null
        }
        Update: {
          acceptance_signature?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          accepted_by_email?: string | null
          accepted_by_ip?: unknown
          accepted_by_name?: string | null
          adjusted_price_high?: number | null
          adjusted_price_likely?: number | null
          adjusted_price_low?: number | null
          adjustments?: Json | null
          ai_explanation?: string | null
          ai_explanation_provider?:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          ai_explanation_status?: string | null
          base_cost?: number | null
          created_at?: string
          estimate_status?: string | null
          has_adjustments?: boolean
          id?: string
          input_snapshot?: Json
          is_superseded?: boolean | null
          labor_cost?: number | null
          lead_id?: string
          material_cost?: number | null
          price_high?: number
          price_likely?: number
          price_low?: number
          pricing_rules_snapshot?: Json
          rejected_at?: string | null
          rejected_by_email?: string | null
          rejected_by_name?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string | null
          superseded_by?: string | null
          total_discount_amount?: number | null
          total_discount_percent?: number | null
          updated_at?: string
          valid_until?: string | null
          view_count?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_applications: {
        Row: {
          admin_notes: string | null
          amount_requested: number
          approved_rate: number | null
          approved_term_months: number | null
          assigned_to: string | null
          co_applicant: boolean | null
          created_at: string
          credit_range: Database["public"]["Enums"]["credit_range"]
          customer_id: string
          employment_status: Database["public"]["Enums"]["employment_status"]
          id: string
          income_range: Database["public"]["Enums"]["income_range"]
          lead_id: string
          lender_contact: string | null
          lender_name: string | null
          lender_notes: string | null
          monthly_housing_payment: number | null
          pre_approved_amount: number | null
          status: Database["public"]["Enums"]["financing_status"] | null
          status_updated_at: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_requested: number
          approved_rate?: number | null
          approved_term_months?: number | null
          assigned_to?: string | null
          co_applicant?: boolean | null
          created_at?: string
          credit_range: Database["public"]["Enums"]["credit_range"]
          customer_id: string
          employment_status: Database["public"]["Enums"]["employment_status"]
          id?: string
          income_range: Database["public"]["Enums"]["income_range"]
          lead_id: string
          lender_contact?: string | null
          lender_name?: string | null
          lender_notes?: string | null
          monthly_housing_payment?: number | null
          pre_approved_amount?: number | null
          status?: Database["public"]["Enums"]["financing_status"] | null
          status_updated_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_requested?: number
          approved_rate?: number | null
          approved_term_months?: number | null
          assigned_to?: string | null
          co_applicant?: boolean | null
          created_at?: string
          credit_range?: Database["public"]["Enums"]["credit_range"]
          customer_id?: string
          employment_status?: Database["public"]["Enums"]["employment_status"]
          id?: string
          income_range?: Database["public"]["Enums"]["income_range"]
          lead_id?: string
          lender_contact?: string | null
          lender_name?: string | null
          lender_notes?: string | null
          monthly_housing_payment?: number | null
          pre_approved_amount?: number | null
          status?: Database["public"]["Enums"]["financing_status"] | null
          status_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financing_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financing_applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_pricing: {
        Row: {
          county: string | null
          created_at: string
          created_by: string | null
          description: string | null
          effective_from: string
          effective_until: string | null
          equipment_multiplier: number
          id: string
          is_active: boolean
          labor_multiplier: number
          material_multiplier: number
          name: string
          state: string | null
          updated_at: string
          zip_codes: string[] | null
        }
        Insert: {
          county?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          equipment_multiplier?: number
          id?: string
          is_active?: boolean
          labor_multiplier?: number
          material_multiplier?: number
          name: string
          state?: string | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Update: {
          county?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          equipment_multiplier?: number
          id?: string
          is_active?: boolean
          labor_multiplier?: number
          material_multiplier?: number
          name?: string
          state?: string | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          adjuster_email: string | null
          adjuster_name: string | null
          adjuster_phone: string | null
          adjuster_visit_date: string | null
          admin_notes: string | null
          cause_of_loss: string | null
          claim_amount_approved: number | null
          claim_number: string | null
          created_at: string
          customer_id: string
          customer_notes: string | null
          date_of_loss: string | null
          deductible: number | null
          documents: Json | null
          id: string
          insurance_company: string | null
          lead_id: string
          policy_number: string | null
          status: Database["public"]["Enums"]["insurance_claim_status"] | null
          status_updated_at: string | null
          timeline: Json | null
          updated_at: string
        }
        Insert: {
          adjuster_email?: string | null
          adjuster_name?: string | null
          adjuster_phone?: string | null
          adjuster_visit_date?: string | null
          admin_notes?: string | null
          cause_of_loss?: string | null
          claim_amount_approved?: number | null
          claim_number?: string | null
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          date_of_loss?: string | null
          deductible?: number | null
          documents?: Json | null
          id?: string
          insurance_company?: string | null
          lead_id: string
          policy_number?: string | null
          status?: Database["public"]["Enums"]["insurance_claim_status"] | null
          status_updated_at?: string | null
          timeline?: Json | null
          updated_at?: string
        }
        Update: {
          adjuster_email?: string | null
          adjuster_name?: string | null
          adjuster_phone?: string | null
          adjuster_visit_date?: string | null
          admin_notes?: string | null
          cause_of_loss?: string | null
          claim_amount_approved?: number | null
          claim_number?: string | null
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          date_of_loss?: string | null
          deductible?: number | null
          documents?: Json | null
          id?: string
          insurance_company?: string | null
          lead_id?: string
          policy_number?: string | null
          status?: Database["public"]["Enums"]["insurance_claim_status"] | null
          status_updated_at?: string | null
          timeline?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          additional_notes: string | null
          claim_number: string | null
          created_at: string
          has_chimneys: boolean | null
          has_insurance_claim: boolean | null
          has_skylights: boolean | null
          has_solar_panels: boolean | null
          id: string
          insurance_company: string | null
          issues: Json | null
          issues_description: string | null
          job_description: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          lead_id: string
          roof_age_years: number | null
          roof_material: Database["public"]["Enums"]["roof_material"] | null
          roof_pitch: Database["public"]["Enums"]["roof_pitch"] | null
          roof_size_sqft: number | null
          stories: number | null
          timeline_urgency:
            | Database["public"]["Enums"]["timeline_urgency"]
            | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          claim_number?: string | null
          created_at?: string
          has_chimneys?: boolean | null
          has_insurance_claim?: boolean | null
          has_skylights?: boolean | null
          has_solar_panels?: boolean | null
          id?: string
          insurance_company?: string | null
          issues?: Json | null
          issues_description?: string | null
          job_description?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          lead_id: string
          roof_age_years?: number | null
          roof_material?: Database["public"]["Enums"]["roof_material"] | null
          roof_pitch?: Database["public"]["Enums"]["roof_pitch"] | null
          roof_size_sqft?: number | null
          stories?: number | null
          timeline_urgency?:
            | Database["public"]["Enums"]["timeline_urgency"]
            | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          claim_number?: string | null
          created_at?: string
          has_chimneys?: boolean | null
          has_insurance_claim?: boolean | null
          has_skylights?: boolean | null
          has_solar_panels?: boolean | null
          id?: string
          insurance_company?: string | null
          issues?: Json | null
          issues_description?: string | null
          job_description?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          lead_id?: string
          roof_age_years?: number | null
          roof_material?: Database["public"]["Enums"]["roof_material"] | null
          roof_pitch?: Database["public"]["Enums"]["roof_pitch"] | null
          roof_size_sqft?: number | null
          stories?: number | null
          timeline_urgency?:
            | Database["public"]["Enums"]["timeline_urgency"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intakes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          is_taxable: boolean
          quantity: number
          sort_order: number
          total: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          is_taxable?: boolean
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          is_taxable?: boolean
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          paid_at: string | null
          payer_email: string | null
          payer_name: string | null
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string | null
          reference_number: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          paid_at?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          paid_at?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          bill_to_address: string | null
          bill_to_email: string | null
          bill_to_name: string | null
          bill_to_phone: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          discount_amount: number
          discount_percent: number
          due_date: string | null
          estimate_id: string | null
          id: string
          internal_notes: string | null
          invoice_number: string
          issue_date: string
          job_id: string | null
          lead_id: string
          notes: string | null
          paid_at: string | null
          payment_type: Database["public"]["Enums"]["invoice_payment_type"]
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          total: number
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          bill_to_address?: string | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          bill_to_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          discount_percent?: number
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number: string
          issue_date?: string
          job_id?: string | null
          lead_id: string
          notes?: string | null
          paid_at?: string | null
          payment_type?: Database["public"]["Enums"]["invoice_payment_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          bill_to_address?: string | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          bill_to_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          discount_percent?: number
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string
          issue_date?: string
          job_id?: string | null
          lead_id?: string
          notes?: string | null
          paid_at?: string | null
          payment_type?: Database["public"]["Enums"]["invoice_payment_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      job_billing_schedules: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          job_id: string
          milestone_name: string
          percentage: number
          sort_order: number
          trigger_status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          job_id: string
          milestone_name: string
          percentage: number
          sort_order?: number
          trigger_status: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          job_id?: string
          milestone_name?: string
          percentage?: number
          sort_order?: number
          trigger_status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_billing_schedules_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "job_billing_schedules_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_billing_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_daily_logs: {
        Row: {
          created_at: string
          crew_members: string[] | null
          delay_reason: string | null
          hours_worked: number | null
          id: string
          job_id: string
          log_date: string
          logged_by: string | null
          materials_used: string | null
          notes: string | null
          safety_incidents: string | null
          updated_at: string
          weather_conditions: string | null
          work_delayed: boolean
          work_performed: string | null
        }
        Insert: {
          created_at?: string
          crew_members?: string[] | null
          delay_reason?: string | null
          hours_worked?: number | null
          id?: string
          job_id: string
          log_date?: string
          logged_by?: string | null
          materials_used?: string | null
          notes?: string | null
          safety_incidents?: string | null
          updated_at?: string
          weather_conditions?: string | null
          work_delayed?: boolean
          work_performed?: string | null
        }
        Update: {
          created_at?: string
          crew_members?: string[] | null
          delay_reason?: string | null
          hours_worked?: number | null
          id?: string
          job_id?: string
          log_date?: string
          logged_by?: string | null
          materials_used?: string | null
          notes?: string | null
          safety_incidents?: string | null
          updated_at?: string
          weather_conditions?: string | null
          work_delayed?: boolean
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_daily_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: Database["public"]["Enums"]["job_document_type"]
          expiration_date: string | null
          file_size: number | null
          id: string
          job_id: string
          mime_type: string | null
          permit_number: string | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["job_document_type"]
          expiration_date?: string | null
          file_size?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          permit_number?: string | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["job_document_type"]
          expiration_date?: string | null
          file_size?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          permit_number?: string | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["job_expense_category"]
          created_at: string
          description: string
          expense_date: string
          id: string
          job_id: string
          receipt_path: string | null
          submitted_by: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["job_expense_category"]
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          job_id: string
          receipt_path?: string | null
          submitted_by?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["job_expense_category"]
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          job_id?: string
          receipt_path?: string | null
          submitted_by?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_expenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          job_id: string
          new_status: Database["public"]["Enums"]["job_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["job_status"] | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          job_id: string
          new_status: Database["public"]["Enums"]["job_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["job_status"] | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          job_id?: string
          new_status?: Database["public"]["Enums"]["job_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["job_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "job_status_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_team_id: string | null
          contract_amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          estimate_id: string | null
          id: string
          internal_notes: string | null
          job_number: string
          labor_cost: number
          lead_id: string | null
          material_cost: number
          notes: string | null
          project_manager_id: string | null
          property_address: string | null
          property_city: string | null
          property_state: string | null
          property_zip: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: Database["public"]["Enums"]["job_status"]
          total_invoiced: number
          total_paid: number
          updated_at: string
          warranty_end_date: string | null
          warranty_start_date: string | null
          warranty_type: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_team_id?: string | null
          contract_amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          job_number: string
          labor_cost?: number
          lead_id?: string | null
          material_cost?: number
          notes?: string | null
          project_manager_id?: string | null
          property_address?: string | null
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_invoiced?: number
          total_paid?: number
          updated_at?: string
          warranty_end_date?: string | null
          warranty_start_date?: string | null
          warranty_type?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_team_id?: string | null
          contract_amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimate_id?: string | null
          id?: string
          internal_notes?: string | null
          job_number?: string
          labor_cost?: number
          lead_id?: string | null
          material_cost?: number
          notes?: string | null
          project_manager_id?: string | null
          property_address?: string | null
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          total_invoiced?: number
          total_paid?: number
          updated_at?: string
          warranty_end_date?: string | null
          warranty_start_date?: string | null
          warranty_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_system_generated: boolean | null
          lead_id: string
          metadata: Json | null
          pinned: boolean | null
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_system_generated?: boolean | null
          lead_id: string
          metadata?: Json | null
          pinned?: boolean | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_system_generated?: boolean | null
          lead_id?: string
          metadata?: Json | null
          pinned?: boolean | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          duration_minutes: number | null
          from_stage: string | null
          id: string
          lead_id: string
          to_stage: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          from_stage?: string | null
          id?: string
          lead_id: string
          to_stage: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          from_stage?: string | null
          id?: string
          lead_id?: string
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number | null
          id: string
          ip_address: unknown
          referrer_url: string | null
          share_token: string | null
          share_token_expires_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          ip_address?: unknown
          referrer_url?: string | null
          share_token?: string | null
          share_token_expires_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          ip_address?: unknown
          referrer_url?: string | null
          share_token?: string | null
          share_token_expires_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      lien_waivers: {
        Row: {
          amount: number
          claimant_name: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          invoice_payment_id: string | null
          job_id: string
          owner_name: string | null
          pdf_path: string | null
          property_description: string | null
          status: Database["public"]["Enums"]["lien_waiver_status"]
          through_date: string
          updated_at: string
          waiver_type: Database["public"]["Enums"]["lien_waiver_type"]
        }
        Insert: {
          amount?: number
          claimant_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          invoice_payment_id?: string | null
          job_id: string
          owner_name?: string | null
          pdf_path?: string | null
          property_description?: string | null
          status?: Database["public"]["Enums"]["lien_waiver_status"]
          through_date?: string
          updated_at?: string
          waiver_type?: Database["public"]["Enums"]["lien_waiver_type"]
        }
        Update: {
          amount?: number
          claimant_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          invoice_payment_id?: string | null
          job_id?: string
          owner_name?: string | null
          pdf_path?: string | null
          property_description?: string | null
          status?: Database["public"]["Enums"]["lien_waiver_status"]
          through_date?: string
          updated_at?: string
          waiver_type?: Database["public"]["Enums"]["lien_waiver_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lien_waivers_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ar_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "lien_waivers_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waivers_invoice_payment_id_fkey"
            columns: ["invoice_payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lien_waivers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          base_equipment_cost: number
          base_labor_cost: number
          base_material_cost: number
          category: Database["public"]["Enums"]["line_item_category"]
          created_at: string
          created_by: string | null
          default_waste_factor: number
          description: string | null
          id: string
          is_active: boolean
          is_taxable: boolean
          item_code: string
          max_quantity: number | null
          min_quantity: number | null
          name: string
          notes: string | null
          quantity_formula: string | null
          sort_order: number
          tags: string[] | null
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          base_equipment_cost?: number
          base_labor_cost?: number
          base_material_cost?: number
          category: Database["public"]["Enums"]["line_item_category"]
          created_at?: string
          created_by?: string | null
          default_waste_factor?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          item_code: string
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          notes?: string | null
          quantity_formula?: string | null
          sort_order?: number
          tags?: string[] | null
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          base_equipment_cost?: number
          base_labor_cost?: number
          base_material_cost?: number
          category?: Database["public"]["Enums"]["line_item_category"]
          created_at?: string
          created_by?: string | null
          default_waste_factor?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_taxable?: boolean
          item_code?: string
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          notes?: string | null
          quantity_formula?: string | null
          sort_order?: number
          tags?: string[] | null
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: []
      }
      macro_line_items: {
        Row: {
          created_at: string
          equipment_cost_override: number | null
          group_name: string | null
          id: string
          is_optional: boolean
          is_selected_by_default: boolean
          labor_cost_override: number | null
          line_item_id: string
          macro_id: string
          material_cost_override: number | null
          notes: string | null
          quantity_formula: string | null
          sort_order: number
          updated_at: string
          waste_factor: number | null
        }
        Insert: {
          created_at?: string
          equipment_cost_override?: number | null
          group_name?: string | null
          id?: string
          is_optional?: boolean
          is_selected_by_default?: boolean
          labor_cost_override?: number | null
          line_item_id: string
          macro_id: string
          material_cost_override?: number | null
          notes?: string | null
          quantity_formula?: string | null
          sort_order?: number
          updated_at?: string
          waste_factor?: number | null
        }
        Update: {
          created_at?: string
          equipment_cost_override?: number | null
          group_name?: string | null
          id?: string
          is_optional?: boolean
          is_selected_by_default?: boolean
          labor_cost_override?: number | null
          line_item_id?: string
          macro_id?: string
          material_cost_override?: number | null
          notes?: string | null
          quantity_formula?: string | null
          sort_order?: number
          updated_at?: string
          waste_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "macro_line_items_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "macro_line_items_macro_id_fkey"
            columns: ["macro_id"]
            isOneToOne: false
            referencedRelation: "estimate_macros"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          default_body: string | null
          default_subject: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          last_used_at: string | null
          name: string
          slug: string | null
          subject: string | null
          tags: string[] | null
          type: Database["public"]["Enums"]["message_channel"]
          updated_at: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_body?: string | null
          default_subject?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          name: string
          slug?: string | null
          subject?: string | null
          tags?: string[] | null
          type: Database["public"]["Enums"]["message_channel"]
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_body?: string | null
          default_subject?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          name?: string
          slug?: string | null
          subject?: string | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["message_channel"]
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          estimate_id: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown
          is_deleted: boolean
          lead_id: string
          paid_at: string | null
          payer_email: string | null
          payer_name: string | null
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          estimate_id?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          is_deleted?: boolean
          lead_id: string
          paid_at?: string | null
          payer_email?: string | null
          payer_name?: string | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          estimate_id?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          is_deleted?: boolean
          lead_id?: string
          paid_at?: string | null
          payer_email?: string | null
          payer_name?: string | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      price_adjustments: {
        Row: {
          adjustment_amount: number | null
          adjustment_type: Database["public"]["Enums"]["price_adjustment_type"]
          amount_after: number | null
          amount_before: number | null
          applied_by: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          detailed_estimate_id: string | null
          estimate_id: string | null
          estimate_line_item_id: string | null
          id: string
          is_active: boolean
          reason: string | null
          requires_approval: boolean
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          adjustment_amount?: number | null
          adjustment_type: Database["public"]["Enums"]["price_adjustment_type"]
          amount_after?: number | null
          amount_before?: number | null
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          estimate_line_item_id?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          requires_approval?: boolean
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          adjustment_amount?: number | null
          adjustment_type?: Database["public"]["Enums"]["price_adjustment_type"]
          amount_after?: number | null
          amount_before?: number | null
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          estimate_line_item_id?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          requires_approval?: boolean
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_adjustments_detailed_estimate_id_fkey"
            columns: ["detailed_estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_adjustments_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_adjustments_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_adjustments_estimate_line_item_id_fkey"
            columns: ["estimate_line_item_id"]
            isOneToOne: false
            referencedRelation: "estimate_line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_rate: number | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          effective_from: string | null
          effective_until: string | null
          flat_fee: number | null
          id: string
          is_active: boolean | null
          max_charge: number | null
          min_charge: number | null
          multiplier: number | null
          rule_category: string
          rule_key: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          base_rate?: number | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          effective_from?: string | null
          effective_until?: string | null
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_charge?: number | null
          min_charge?: number | null
          multiplier?: number | null
          rule_category: string
          rule_key: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          base_rate?: number | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          effective_from?: string | null
          effective_until?: string | null
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_charge?: number | null
          min_charge?: number | null
          multiplier?: number | null
          rule_category?: string
          rule_key?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          city: string | null
          country: string | null
          county: string | null
          created_at: string
          formatted_address: string | null
          id: string
          in_service_area: boolean | null
          latitude: number | null
          lead_id: string
          longitude: number | null
          place_id: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          formatted_address?: string | null
          id?: string
          in_service_area?: boolean | null
          latitude?: number | null
          lead_id: string
          longitude?: number | null
          place_id?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          formatted_address?: string | null
          id?: string
          in_service_area?: boolean | null
          latitude?: number | null
          lead_id?: string
          longitude?: number | null
          place_id?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      roof_sketches: {
        Row: {
          ai_analysis_notes: string | null
          ai_confidence: number | null
          ai_generated: boolean
          chimney_count: number
          created_at: string
          downspout_count: number
          existing_layers: number
          gutter_lf: number
          id: string
          lead_id: string
          measurement_date: string | null
          measurement_source: string | null
          pipe_boot_count: number
          sketch_data: Json | null
          skylight_count: number
          total_drip_edge_lf: number
          total_eave_lf: number
          total_fascia_lf: number
          total_hip_lf: number
          total_perimeter_lf: number
          total_rake_lf: number
          total_ridge_lf: number
          total_sqft: number
          total_squares: number
          total_valley_lf: number
          updated_at: string
          vent_count: number
        }
        Insert: {
          ai_analysis_notes?: string | null
          ai_confidence?: number | null
          ai_generated?: boolean
          chimney_count?: number
          created_at?: string
          downspout_count?: number
          existing_layers?: number
          gutter_lf?: number
          id?: string
          lead_id: string
          measurement_date?: string | null
          measurement_source?: string | null
          pipe_boot_count?: number
          sketch_data?: Json | null
          skylight_count?: number
          total_drip_edge_lf?: number
          total_eave_lf?: number
          total_fascia_lf?: number
          total_hip_lf?: number
          total_perimeter_lf?: number
          total_rake_lf?: number
          total_ridge_lf?: number
          total_sqft?: number
          total_squares?: number
          total_valley_lf?: number
          updated_at?: string
          vent_count?: number
        }
        Update: {
          ai_analysis_notes?: string | null
          ai_confidence?: number | null
          ai_generated?: boolean
          chimney_count?: number
          created_at?: string
          downspout_count?: number
          existing_layers?: number
          gutter_lf?: number
          id?: string
          lead_id?: string
          measurement_date?: string | null
          measurement_source?: string | null
          pipe_boot_count?: number
          sketch_data?: Json | null
          skylight_count?: number
          total_drip_edge_lf?: number
          total_eave_lf?: number
          total_fascia_lf?: number
          total_hip_lf?: number
          total_perimeter_lf?: number
          total_rake_lf?: number
          total_ridge_lf?: number
          total_sqft?: number
          total_squares?: number
          total_valley_lf?: number
          updated_at?: string
          vent_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "roof_sketches_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      roof_slopes: {
        Row: {
          created_at: string
          eave_lf: number
          has_limited_access: boolean
          has_steep_charge: boolean
          hip_lf: number
          id: string
          is_walkable: boolean
          length_ft: number | null
          name: string
          notes: string | null
          pitch: number
          pitch_multiplier: number
          rake_lf: number
          ridge_lf: number
          sketch_id: string
          slope_number: number
          sqft: number
          squares: number
          updated_at: string
          valley_lf: number
          width_ft: number | null
        }
        Insert: {
          created_at?: string
          eave_lf?: number
          has_limited_access?: boolean
          has_steep_charge?: boolean
          hip_lf?: number
          id?: string
          is_walkable?: boolean
          length_ft?: number | null
          name?: string
          notes?: string | null
          pitch?: number
          pitch_multiplier?: number
          rake_lf?: number
          ridge_lf?: number
          sketch_id: string
          slope_number?: number
          sqft?: number
          squares?: number
          updated_at?: string
          valley_lf?: number
          width_ft?: number | null
        }
        Update: {
          created_at?: string
          eave_lf?: number
          has_limited_access?: boolean
          has_steep_charge?: boolean
          hip_lf?: number
          id?: string
          is_walkable?: boolean
          length_ft?: number | null
          name?: string
          notes?: string | null
          pitch?: number
          pitch_multiplier?: number
          rake_lf?: number
          ridge_lf?: number
          sketch_id?: string
          slope_number?: number
          sqft?: number
          squares?: number
          updated_at?: string
          valley_lf?: number
          width_ft?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roof_slopes_sketch_id_fkey"
            columns: ["sketch_id"]
            isOneToOne: false
            referencedRelation: "roof_sketches"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          attempts: number | null
          body: string
          cancelled_at: string | null
          cancelled_by: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          external_id: string | null
          id: string
          lead_id: string | null
          max_attempts: number | null
          metadata: Json | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          template_id: string | null
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          attempts?: number | null
          body: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          lead_id?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          attempts?: number | null
          body?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          lead_id?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_country_code: string | null
          address_state: string | null
          address_state_code: string | null
          address_street: string | null
          address_zip: string | null
          company_email: string | null
          company_email_support: string | null
          company_founded_year: string | null
          company_legal_name: string | null
          company_name: string
          company_phone: string | null
          company_phone_raw: string | null
          company_tagline: string | null
          company_website: string | null
          coordinates_lat: number | null
          coordinates_lng: number | null
          created_at: string
          credentials: Json | null
          hours_emergency_available: boolean | null
          hours_saturday_close: string | null
          hours_saturday_open: string | null
          hours_sunday_close: string | null
          hours_sunday_open: string | null
          hours_weekdays_close: string | null
          hours_weekdays_open: string | null
          id: number
          lead_sources: Json | null
          notifications_daily_digest: boolean | null
          notifications_email_recipients: Json | null
          notifications_estimate_email: boolean | null
          notifications_new_lead_email: boolean | null
          pricing_overhead_percent: number | null
          pricing_profit_margin_percent: number | null
          pricing_ranges: Json | null
          pricing_tax_rate: number | null
          reviews_config: Json | null
          service_area: Json | null
          social_links: Json | null
          updated_at: string
          verification_codes: Json | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_country_code?: string | null
          address_state?: string | null
          address_state_code?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_email?: string | null
          company_email_support?: string | null
          company_founded_year?: string | null
          company_legal_name?: string | null
          company_name?: string
          company_phone?: string | null
          company_phone_raw?: string | null
          company_tagline?: string | null
          company_website?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          credentials?: Json | null
          hours_emergency_available?: boolean | null
          hours_saturday_close?: string | null
          hours_saturday_open?: string | null
          hours_sunday_close?: string | null
          hours_sunday_open?: string | null
          hours_weekdays_close?: string | null
          hours_weekdays_open?: string | null
          id?: number
          lead_sources?: Json | null
          notifications_daily_digest?: boolean | null
          notifications_email_recipients?: Json | null
          notifications_estimate_email?: boolean | null
          notifications_new_lead_email?: boolean | null
          pricing_overhead_percent?: number | null
          pricing_profit_margin_percent?: number | null
          pricing_ranges?: Json | null
          pricing_tax_rate?: number | null
          reviews_config?: Json | null
          service_area?: Json | null
          social_links?: Json | null
          updated_at?: string
          verification_codes?: Json | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_country_code?: string | null
          address_state?: string | null
          address_state_code?: string | null
          address_street?: string | null
          address_zip?: string | null
          company_email?: string | null
          company_email_support?: string | null
          company_founded_year?: string | null
          company_legal_name?: string | null
          company_name?: string
          company_phone?: string | null
          company_phone_raw?: string | null
          company_tagline?: string | null
          company_website?: string | null
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          credentials?: Json | null
          hours_emergency_available?: boolean | null
          hours_saturday_close?: string | null
          hours_saturday_open?: string | null
          hours_sunday_close?: string | null
          hours_sunday_open?: string | null
          hours_weekdays_close?: string | null
          hours_weekdays_open?: string | null
          id?: number
          lead_sources?: Json | null
          notifications_daily_digest?: boolean | null
          notifications_email_recipients?: Json | null
          notifications_estimate_email?: boolean | null
          notifications_new_lead_email?: boolean | null
          pricing_overhead_percent?: number | null
          pricing_profit_margin_percent?: number | null
          pricing_ranges?: Json | null
          pricing_tax_rate?: number | null
          reviews_config?: Json | null
          service_area?: Json | null
          social_links?: Json | null
          updated_at?: string
          verification_codes?: Json | null
        }
        Relationships: []
      }
      sms_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          id: string
          last_message_at: string | null
          last_message_direction: string | null
          last_message_preview: string | null
          lead_id: string | null
          phone_number: string
          status: string | null
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          phone_number: string
          status?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          phone_number?: string
          status?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          reminder_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          is_team_lead: boolean
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          is_team_lead?: boolean
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          is_team_lead?: boolean
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          break_minutes: number | null
          clock_in: string
          clock_out: string | null
          created_at: string | null
          id: string
          job_id: string
          notes: string | null
          status: string | null
          total_hours: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          break_minutes?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          break_minutes?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          ai_analysis_result: Json | null
          ai_analyzed: boolean | null
          ai_analyzed_at: string | null
          ai_confidence_score: number | null
          ai_detected_issues: Json | null
          ai_provider: Database["public"]["Enums"]["ai_provider"] | null
          category: string | null
          content_type: string | null
          created_at: string
          description: string | null
          file_size: number | null
          id: string
          lead_id: string
          original_filename: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["upload_status"] | null
          storage_path: string
          tags: Json | null
          updated_at: string
        }
        Insert: {
          ai_analysis_result?: Json | null
          ai_analyzed?: boolean | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_detected_issues?: Json | null
          ai_provider?: Database["public"]["Enums"]["ai_provider"] | null
          category?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          lead_id: string
          original_filename?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["upload_status"] | null
          storage_path: string
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          ai_analysis_result?: Json | null
          ai_analyzed?: boolean | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_detected_issues?: Json | null
          ai_provider?: Database["public"]["Enums"]["ai_provider"] | null
          category?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          lead_id?: string
          original_filename?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["upload_status"] | null
          storage_path?: string
          tags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action: string
          category: Database["public"]["Enums"]["user_action_category"]
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          session_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: string
          category: Database["public"]["Enums"]["user_action_category"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: string
          category?: Database["public"]["Enums"]["user_action_category"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          message: string | null
          role: Database["public"]["Enums"]["user_role"]
          team_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          message?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          message?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_accepted_user_id_fkey"
            columns: ["accepted_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_accepted_user_id_fkey"
            columns: ["accepted_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          hired_at: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_name: string | null
          notification_preferences: Json
          permissions: Json
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          terminated_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          hired_at?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          last_name?: string | null
          notification_preferences?: Json
          permissions?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          terminated_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          hired_at?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_name?: string | null
          notification_preferences?: Json
          permissions?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          terminated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          communication_log_id: string | null
          completed_at: string | null
          customer_id: string | null
          error_message: string | null
          executed_at: string
          id: string
          lead_id: string | null
          scheduled_message_id: string | null
          skip_reason: string | null
          status: string
          trigger_data: Json | null
          trigger_event: Database["public"]["Enums"]["workflow_trigger"]
          workflow_id: string
        }
        Insert: {
          communication_log_id?: string | null
          completed_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          lead_id?: string | null
          scheduled_message_id?: string | null
          skip_reason?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_event: Database["public"]["Enums"]["workflow_trigger"]
          workflow_id: string
        }
        Update: {
          communication_log_id?: string | null
          completed_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          executed_at?: string
          id?: string
          lead_id?: string | null
          scheduled_message_id?: string | null
          skip_reason?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_event?: Database["public"]["Enums"]["workflow_trigger"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_communication_log_id_fkey"
            columns: ["communication_log_id"]
            isOneToOne: false
            referencedRelation: "communication_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "scheduled_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_estimates: {
        Row: {
          adjustments: Json | null
          ai_explanation: string | null
          ai_explanation_provider:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          base_cost: number | null
          created_at: string | null
          id: string | null
          input_snapshot: Json | null
          is_superseded: boolean | null
          labor_cost: number | null
          lead_id: string | null
          material_cost: number | null
          price_high: number | null
          price_likely: number | null
          price_low: number | null
          pricing_rules_snapshot: Json | null
          share_token: string | null
          share_token_expires_at: string | null
          superseded_by: string | null
          updated_at: string | null
          valid_until: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_aging: {
        Row: {
          aging_bucket: string | null
          amount_paid: number | null
          balance_due: number | null
          bill_to_email: string | null
          bill_to_name: string | null
          customer_id: string | null
          days_overdue: number | null
          due_date: string | null
          invoice_id: string | null
          invoice_number: string | null
          issue_date: string | null
          lead_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          total: number | null
        }
        Insert: {
          aging_bucket?: never
          amount_paid?: number | null
          balance_due?: number | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          customer_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          lead_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total?: number | null
        }
        Update: {
          aging_bucket?: never
          amount_paid?: number | null
          balance_due?: number | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          customer_id?: string | null
          days_overdue?: never
          due_date?: string | null
          invoice_id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          lead_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_summary: {
        Row: {
          active_jobs: number | null
          completed_jobs: number | null
          gross_margin_pct: number | null
          gross_profit: number | null
          month: string | null
          outstanding_ar: number | null
          total_collected: number | null
          total_jobs: number | null
          total_labor_cost: number | null
          total_material_cost: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      quote_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          actor_ip: unknown
          actor_name: string | null
          actor_type: string | null
          created_at: string | null
          detailed_estimate_id: string | null
          estimate_id: string | null
          event_data: Json | null
          event_type: string | null
          id: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_name?: string | null
          actor_type?: string | null
          created_at?: string | null
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_name?: string | null
          actor_type?: string | null
          created_at?: string | null
          detailed_estimate_id?: string | null
          estimate_id?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_events_detailed_estimate_id_fkey"
            columns: ["detailed_estimate_id"]
            isOneToOne: false
            referencedRelation: "detailed_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_events_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "active_estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_events_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      team_summary: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          manager_id: string | null
          member_count: number | null
          member_names: string[] | null
          name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_with_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_with_teams: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          hired_at: string | null
          id: string | null
          is_active: boolean | null
          job_title: string | null
          last_name: string | null
          notification_preferences: Json | null
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_ids: string[] | null
          team_names: string[] | null
          terminated_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_discount_code: {
        Args: {
          p_code: string
          p_detailed_estimate_id?: string
          p_estimate_id?: string
          p_lead_id: string
        }
        Returns: {
          discount_amount: number
          message: string
          success: boolean
        }[]
      }
      calculate_estimate_line_totals: {
        Args: { p_line_item_id: string }
        Returns: undefined
      }
      generate_invoice_number: { Args: never; Returns: string }
      generate_job_number: { Args: never; Returns: string }
      get_default_permissions: {
        Args: { p_role: Database["public"]["Enums"]["user_role"] }
        Returns: Json
      }
      get_estimate_status_counts: { Args: never; Returns: Json }
      increment_macro_usage: {
        Args: { p_macro_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_jwt: { Args: never; Returns: boolean }
      is_manager_or_above: { Args: never; Returns: boolean }
      is_share_token_valid: { Args: { token: string }; Returns: boolean }
      log_quote_event: {
        Args: {
          p_actor_email?: string
          p_actor_id?: string
          p_actor_ip?: unknown
          p_actor_name?: string
          p_actor_type?: string
          p_detailed_estimate_id: string
          p_estimate_id: string
          p_event_data?: Json
          p_event_type: string
        }
        Returns: string
      }
      recalculate_adjusted_prices: {
        Args: { p_detailed_estimate_id?: string; p_estimate_id?: string }
        Returns: undefined
      }
      recalculate_estimate_totals: {
        Args: { p_estimate_id: string }
        Returns: undefined
      }
      recalculate_invoice_totals: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      recalculate_sketch_totals: {
        Args: { p_sketch_id: string }
        Returns: undefined
      }
      render_template: {
        Args: { p_template_body: string; p_variables: Json }
        Returns: string
      }
      should_execute_workflow: {
        Args: { p_lead_id: string; p_workflow_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "note"
        | "call"
        | "email"
        | "sms"
        | "status_change"
        | "estimate_generated"
        | "quote_sent"
        | "photo_added"
        | "appointment_scheduled"
        | "system"
      ai_provider: "openai" | "anthropic" | "fallback"
      api_service_type: "resend" | "stripe" | "twilio" | "openai"
      application_status:
        | "researching"
        | "eligible"
        | "not_eligible"
        | "applied"
        | "approved"
        | "denied"
      calendar_event_status:
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed"
      calendar_event_type:
        | "appointment"
        | "job_work"
        | "inspection"
        | "material_delivery"
        | "crew_meeting"
        | "other"
      change_order_status: "pending" | "approved" | "rejected"
      credit_range: "excellent" | "good" | "fair" | "poor" | "very_poor"
      customer_role: "customer" | "admin"
      employment_status:
        | "employed_full_time"
        | "employed_part_time"
        | "self_employed"
        | "retired"
        | "unemployed"
        | "other"
      estimate_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "expired"
        | "superseded"
      financing_status:
        | "interested"
        | "contacted"
        | "pre_qualified"
        | "applied"
        | "approved"
        | "denied"
        | "withdrawn"
      income_range:
        | "under_30k"
        | "30k_50k"
        | "50k_75k"
        | "75k_100k"
        | "100k_150k"
        | "over_150k"
      insurance_claim_status:
        | "not_started"
        | "filed"
        | "adjuster_scheduled"
        | "adjuster_visited"
        | "under_review"
        | "approved"
        | "denied"
        | "appealing"
        | "settled"
      invoice_payment_type: "deposit" | "progress" | "final" | "adjustment"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "partially_paid"
        | "overdue"
        | "cancelled"
        | "refunded"
      job_document_type:
        | "contract"
        | "permit"
        | "insurance_cert"
        | "inspection_report"
        | "photo"
        | "warranty_cert"
        | "other"
      job_expense_category:
        | "materials"
        | "labor"
        | "subcontractor"
        | "permit"
        | "equipment"
        | "disposal"
        | "other"
      job_status:
        | "pending_start"
        | "materials_ordered"
        | "scheduled"
        | "in_progress"
        | "inspection_pending"
        | "punch_list"
        | "completed"
        | "warranty_active"
        | "closed"
      job_type:
        | "full_replacement"
        | "repair"
        | "inspection"
        | "maintenance"
        | "gutter"
        | "other"
      lead_status:
        | "new"
        | "intake_started"
        | "intake_complete"
        | "estimate_generated"
        | "estimate_sent"
        | "quote_created"
        | "consultation_scheduled"
        | "quote_sent"
        | "won"
        | "lost"
        | "archived"
      lien_waiver_status: "draft" | "sent" | "signed"
      lien_waiver_type: "conditional" | "unconditional"
      line_item_category:
        | "tear_off"
        | "underlayment"
        | "shingles"
        | "metal_roofing"
        | "tile_roofing"
        | "flat_roofing"
        | "flashing"
        | "ventilation"
        | "gutters"
        | "skylights"
        | "chimneys"
        | "decking"
        | "insulation"
        | "labor"
        | "equipment"
        | "disposal"
        | "permits"
        | "miscellaneous"
      macro_job_type:
        | "full_replacement"
        | "repair"
        | "overlay"
        | "partial_replacement"
        | "storm_damage"
        | "insurance_claim"
        | "maintenance"
        | "gutter_only"
        | "any"
      macro_roof_type:
        | "asphalt_shingle"
        | "metal_standing_seam"
        | "metal_corrugated"
        | "tile_concrete"
        | "tile_clay"
        | "slate"
        | "wood_shake"
        | "flat_tpo"
        | "flat_epdm"
        | "flat_modified_bitumen"
        | "any"
      message_channel: "email" | "sms"
      message_status:
        | "pending"
        | "scheduled"
        | "sending"
        | "sent"
        | "delivered"
        | "failed"
        | "cancelled"
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_type:
        | "lead_new"
        | "task_assigned"
        | "task_overdue"
        | "job_status_changed"
        | "calendar_reminder"
        | "invoice_paid"
        | "invoice_overdue"
        | "estimate_accepted"
        | "message_received"
        | "system_alert"
        | "invoice_created"
        | "customer_registered"
        | "change_order"
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "cancelled"
      price_adjustment_type:
        | "discount_percent"
        | "discount_fixed"
        | "markup_percent"
        | "markup_fixed"
        | "price_override"
        | "line_item_override"
      program_type: "federal" | "state" | "local" | "utility" | "nonprofit"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
        | "superseded"
      roof_material:
        | "asphalt_shingle"
        | "metal"
        | "tile"
        | "slate"
        | "wood_shake"
        | "flat_membrane"
        | "unknown"
      roof_pitch: "flat" | "low" | "medium" | "steep" | "very_steep" | "unknown"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type:
        | "call"
        | "email"
        | "site_visit"
        | "follow_up"
        | "internal"
        | "meeting"
        | "inspection"
      timeline_urgency:
        | "emergency"
        | "asap"
        | "within_month"
        | "within_3_months"
        | "flexible"
        | "just_exploring"
      unit_type:
        | "SQ"
        | "SF"
        | "LF"
        | "EA"
        | "HR"
        | "DAY"
        | "TON"
        | "GAL"
        | "BDL"
        | "RL"
      upload_status: "pending" | "uploaded" | "analyzed" | "failed"
      user_action_category:
        | "auth"
        | "lead"
        | "estimate"
        | "task"
        | "team"
        | "settings"
        | "customer"
        | "communication"
      user_role: "admin" | "manager" | "sales" | "crew_lead" | "crew"
      workflow_trigger:
        | "lead_created"
        | "lead_status_changed"
        | "intake_completed"
        | "estimate_generated"
        | "quote_sent"
        | "quote_viewed"
        | "appointment_scheduled"
        | "appointment_reminder"
        | "payment_received"
        | "job_completed"
        | "review_request"
        | "manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "note",
        "call",
        "email",
        "sms",
        "status_change",
        "estimate_generated",
        "quote_sent",
        "photo_added",
        "appointment_scheduled",
        "system",
      ],
      ai_provider: ["openai", "anthropic", "fallback"],
      api_service_type: ["resend", "stripe", "twilio", "openai"],
      application_status: [
        "researching",
        "eligible",
        "not_eligible",
        "applied",
        "approved",
        "denied",
      ],
      calendar_event_status: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
      ],
      calendar_event_type: [
        "appointment",
        "job_work",
        "inspection",
        "material_delivery",
        "crew_meeting",
        "other",
      ],
      change_order_status: ["pending", "approved", "rejected"],
      credit_range: ["excellent", "good", "fair", "poor", "very_poor"],
      customer_role: ["customer", "admin"],
      employment_status: [
        "employed_full_time",
        "employed_part_time",
        "self_employed",
        "retired",
        "unemployed",
        "other",
      ],
      estimate_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "expired",
        "superseded",
      ],
      financing_status: [
        "interested",
        "contacted",
        "pre_qualified",
        "applied",
        "approved",
        "denied",
        "withdrawn",
      ],
      income_range: [
        "under_30k",
        "30k_50k",
        "50k_75k",
        "75k_100k",
        "100k_150k",
        "over_150k",
      ],
      insurance_claim_status: [
        "not_started",
        "filed",
        "adjuster_scheduled",
        "adjuster_visited",
        "under_review",
        "approved",
        "denied",
        "appealing",
        "settled",
      ],
      invoice_payment_type: ["deposit", "progress", "final", "adjustment"],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "partially_paid",
        "overdue",
        "cancelled",
        "refunded",
      ],
      job_document_type: [
        "contract",
        "permit",
        "insurance_cert",
        "inspection_report",
        "photo",
        "warranty_cert",
        "other",
      ],
      job_expense_category: [
        "materials",
        "labor",
        "subcontractor",
        "permit",
        "equipment",
        "disposal",
        "other",
      ],
      job_status: [
        "pending_start",
        "materials_ordered",
        "scheduled",
        "in_progress",
        "inspection_pending",
        "punch_list",
        "completed",
        "warranty_active",
        "closed",
      ],
      job_type: [
        "full_replacement",
        "repair",
        "inspection",
        "maintenance",
        "gutter",
        "other",
      ],
      lead_status: [
        "new",
        "intake_started",
        "intake_complete",
        "estimate_generated",
        "estimate_sent",
        "quote_created",
        "consultation_scheduled",
        "quote_sent",
        "won",
        "lost",
        "archived",
      ],
      lien_waiver_status: ["draft", "sent", "signed"],
      lien_waiver_type: ["conditional", "unconditional"],
      line_item_category: [
        "tear_off",
        "underlayment",
        "shingles",
        "metal_roofing",
        "tile_roofing",
        "flat_roofing",
        "flashing",
        "ventilation",
        "gutters",
        "skylights",
        "chimneys",
        "decking",
        "insulation",
        "labor",
        "equipment",
        "disposal",
        "permits",
        "miscellaneous",
      ],
      macro_job_type: [
        "full_replacement",
        "repair",
        "overlay",
        "partial_replacement",
        "storm_damage",
        "insurance_claim",
        "maintenance",
        "gutter_only",
        "any",
      ],
      macro_roof_type: [
        "asphalt_shingle",
        "metal_standing_seam",
        "metal_corrugated",
        "tile_concrete",
        "tile_clay",
        "slate",
        "wood_shake",
        "flat_tpo",
        "flat_epdm",
        "flat_modified_bitumen",
        "any",
      ],
      message_channel: ["email", "sms"],
      message_status: [
        "pending",
        "scheduled",
        "sending",
        "sent",
        "delivered",
        "failed",
        "cancelled",
      ],
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_type: [
        "lead_new",
        "task_assigned",
        "task_overdue",
        "job_status_changed",
        "calendar_reminder",
        "invoice_paid",
        "invoice_overdue",
        "estimate_accepted",
        "message_received",
        "system_alert",
        "invoice_created",
        "customer_registered",
        "change_order",
      ],
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      price_adjustment_type: [
        "discount_percent",
        "discount_fixed",
        "markup_percent",
        "markup_fixed",
        "price_override",
        "line_item_override",
      ],
      program_type: ["federal", "state", "local", "utility", "nonprofit"],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
        "superseded",
      ],
      roof_material: [
        "asphalt_shingle",
        "metal",
        "tile",
        "slate",
        "wood_shake",
        "flat_membrane",
        "unknown",
      ],
      roof_pitch: ["flat", "low", "medium", "steep", "very_steep", "unknown"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: [
        "call",
        "email",
        "site_visit",
        "follow_up",
        "internal",
        "meeting",
        "inspection",
      ],
      timeline_urgency: [
        "emergency",
        "asap",
        "within_month",
        "within_3_months",
        "flexible",
        "just_exploring",
      ],
      unit_type: [
        "SQ",
        "SF",
        "LF",
        "EA",
        "HR",
        "DAY",
        "TON",
        "GAL",
        "BDL",
        "RL",
      ],
      upload_status: ["pending", "uploaded", "analyzed", "failed"],
      user_action_category: [
        "auth",
        "lead",
        "estimate",
        "task",
        "team",
        "settings",
        "customer",
        "communication",
      ],
      user_role: ["admin", "manager", "sales", "crew_lead", "crew"],
      workflow_trigger: [
        "lead_created",
        "lead_status_changed",
        "intake_completed",
        "estimate_generated",
        "quote_sent",
        "quote_viewed",
        "appointment_scheduled",
        "appointment_reminder",
        "payment_received",
        "job_completed",
        "review_request",
        "manual",
      ],
    },
  },
} as const
