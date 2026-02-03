-- ============================================
-- Admin Data & Pipeline Enhancements
-- Migration 017
-- ============================================

-- ============================================
-- Table: admin_preferences
-- Store per-user admin UI preferences
-- ============================================
CREATE TABLE admin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_columns JSONB DEFAULT '[]',
  pipeline_card_fields JSONB DEFAULT '["name","estimate","location","job_type","urgency"]',
  dashboard_widgets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- Table: custom_pipeline_stages
-- Configurable pipeline stages (system + custom)
-- ============================================
CREATE TABLE custom_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(20) DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed system stages matching the lead_status enum
INSERT INTO custom_pipeline_stages (name, slug, color, position, is_system) VALUES
  ('New', 'new', '#D4A853', 0, true),
  ('Intake Started', 'intake_started', '#94A3B8', 1, true),
  ('Intake Complete', 'intake_complete', '#64748B', 2, true),
  ('Estimate Generated', 'estimate_generated', '#22C55E', 3, true),
  ('Consultation', 'consultation_scheduled', '#3B82F6', 4, true),
  ('Quote Sent', 'quote_sent', '#A855F7', 5, true),
  ('Won', 'won', '#10B981', 6, true),
  ('Lost', 'lost', '#EF4444', 7, true),
  ('Archived', 'archived', '#CBD5E1', 8, true);

-- ============================================
-- Table: lead_stage_history
-- Track time spent in each stage for velocity analytics
-- ============================================
CREATE TABLE lead_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage VARCHAR(50),
  to_stage VARCHAR(50) NOT NULL,
  duration_minutes INTEGER,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lead_stage_history
CREATE INDEX idx_lead_stage_history_lead_id ON lead_stage_history(lead_id);
CREATE INDEX idx_lead_stage_history_to_stage ON lead_stage_history(to_stage);
CREATE INDEX idx_lead_stage_history_created_at ON lead_stage_history(created_at DESC);

-- ============================================
-- Trigger: Auto-log stage changes for velocity tracking
-- ============================================
CREATE OR REPLACE FUNCTION log_lead_stage_change()
RETURNS TRIGGER AS $$
DECLARE
  last_change_time TIMESTAMPTZ;
  duration_mins INTEGER;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get the last stage change time
    SELECT created_at INTO last_change_time
    FROM lead_stage_history
    WHERE lead_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    -- If no history, use the lead's updated_at as baseline
    IF last_change_time IS NULL THEN
      last_change_time := OLD.updated_at;
    END IF;

    -- Calculate duration in minutes
    duration_mins := EXTRACT(EPOCH FROM (NOW() - last_change_time)) / 60;

    INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, duration_minutes)
    VALUES (
      NEW.id,
      OLD.status::text,
      NEW.status::text,
      duration_mins
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists (from migration 012)
DROP TRIGGER IF EXISTS trigger_lead_stage_history ON leads;

CREATE TRIGGER trigger_lead_stage_history
AFTER UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION log_lead_stage_change();

-- ============================================
-- Add estimate status tracking columns
-- ============================================
DO $$
BEGIN
  -- Add status column to estimates if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'status'
  ) THEN
    ALTER TABLE estimates ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
  END IF;

  -- Add sent_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE estimates ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;

  -- Add accepted_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE estimates ADD COLUMN accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Index for estimate status queries
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE admin_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stage_history ENABLE ROW LEVEL SECURITY;

-- Admin preferences: users can only access their own
CREATE POLICY "Users can manage own preferences"
ON admin_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pipeline stages: anyone can read, only admins can modify
CREATE POLICY "Anyone can read pipeline stages"
ON custom_pipeline_stages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert pipeline stages"
ON custom_pipeline_stages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

CREATE POLICY "Admins can update pipeline stages"
ON custom_pipeline_stages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

CREATE POLICY "Admins can delete custom pipeline stages"
ON custom_pipeline_stages
FOR DELETE
TO authenticated
USING (
  is_system = false AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

-- Lead stage history: admins can read
CREATE POLICY "Admins can read stage history"
ON lead_stage_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

-- System can insert stage history (via trigger)
CREATE POLICY "System can insert stage history"
ON lead_stage_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- Updated_at triggers for new tables
-- ============================================
CREATE TRIGGER update_admin_preferences_updated_at
BEFORE UPDATE ON admin_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_pipeline_stages_updated_at
BEFORE UPDATE ON custom_pipeline_stages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
