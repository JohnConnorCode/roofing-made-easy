-- ============================================
-- Calendar & Scheduling System
-- Event management, crew availability, and
-- team scheduling for jobs and appointments
-- ============================================

-- Calendar event type enum
CREATE TYPE calendar_event_type AS ENUM (
  'appointment',
  'job_work',
  'inspection',
  'material_delivery',
  'crew_meeting',
  'other'
);

-- Calendar event status enum
CREATE TYPE calendar_event_status AS ENUM (
  'scheduled',
  'confirmed',
  'cancelled',
  'completed'
);

-- ============================================
-- Table: calendar_events
-- All calendar entries linked to jobs, leads, etc.
-- ============================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type calendar_event_type NOT NULL DEFAULT 'other',
  status calendar_event_status NOT NULL DEFAULT 'scheduled',

  -- Timing
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,

  -- Location
  location TEXT,

  -- References (all optional)
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Display
  color VARCHAR(20),

  -- Reminders (array of minutes before event)
  reminder_minutes INTEGER[] DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: crew_availability
-- Track crew time-off and availability
-- ============================================
CREATE TABLE crew_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One entry per user per date
  UNIQUE(user_id, date)
);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_availability_updated_at
  BEFORE UPDATE ON crew_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_calendar_events_start_at ON calendar_events(start_at);
CREATE INDEX idx_calendar_events_end_at ON calendar_events(end_at);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_job_id ON calendar_events(job_id);
CREATE INDEX idx_calendar_events_lead_id ON calendar_events(lead_id);
CREATE INDEX idx_calendar_events_assigned_to ON calendar_events(assigned_to);
CREATE INDEX idx_calendar_events_assigned_team_id ON calendar_events(assigned_team_id);
CREATE INDEX idx_calendar_events_created_at ON calendar_events(created_at DESC);

CREATE INDEX idx_crew_availability_user_id ON crew_availability(user_id);
CREATE INDEX idx_crew_availability_date ON crew_availability(date);
CREATE INDEX idx_crew_availability_user_date ON crew_availability(user_id, date);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "calendar_events_admin" ON calendar_events FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "crew_availability_admin" ON crew_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Manager: full read, can create/update
CREATE POLICY "calendar_events_manager" ON calendar_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "crew_availability_manager_read" ON crew_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

-- Users can see events assigned to them or their team
CREATE POLICY "calendar_events_user_read" ON calendar_events FOR SELECT USING (
  assigned_to = auth.uid()
  OR assigned_team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Users can manage their own availability
CREATE POLICY "crew_availability_own" ON crew_availability FOR ALL USING (
  user_id = auth.uid()
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE calendar_events IS 'Calendar events for scheduling jobs, appointments, inspections, and meetings';
COMMENT ON TABLE crew_availability IS 'Crew member availability and time-off tracking';
