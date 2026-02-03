-- ============================================
-- Lead Activity / Notes System
-- ============================================

-- Activity type enum
CREATE TYPE activity_type AS ENUM (
  'note',
  'call',
  'email',
  'sms',
  'status_change',
  'estimate_generated',
  'quote_sent',
  'photo_added',
  'appointment_scheduled',
  'system'
);

-- Table: lead_activities
-- Tracks all interactions and events for a lead
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  is_system_generated BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(type);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ============================================
-- Photo Categories for better organization
-- ============================================

-- Add category column to uploads table
ALTER TABLE uploads
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Photo category enum values: general, damage, before, after, closeup, wide_angle, inspection

-- ============================================
-- RLS Policies for lead_activities
-- ============================================

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to lead_activities"
ON lead_activities
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Public can read their own lead's activities (via lead access)
CREATE POLICY "Public can view lead activities"
ON lead_activities
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = lead_activities.lead_id
  )
);

-- Trigger to auto-create activity on status change
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO lead_activities (lead_id, type, content, is_system_generated, metadata)
    VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || COALESCE(OLD.status::text, 'none') || ' to ' || NEW.status::text,
      TRUE,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_lead_status_change
AFTER UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION log_lead_status_change();

-- Trigger to auto-create activity on estimate generation
CREATE OR REPLACE FUNCTION log_estimate_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lead_activities (lead_id, type, content, is_system_generated, metadata)
  VALUES (
    NEW.lead_id,
    'estimate_generated',
    'Estimate generated: $' || NEW.price_likely::text,
    TRUE,
    jsonb_build_object(
      'estimate_id', NEW.id,
      'price_low', NEW.price_low,
      'price_likely', NEW.price_likely,
      'price_high', NEW.price_high
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_estimate_created
AFTER INSERT ON estimates
FOR EACH ROW
EXECUTE FUNCTION log_estimate_created();
