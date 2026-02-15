-- ============================================
-- Time Tracking System
-- Clock in/out, break tracking, and hours reporting
-- ============================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN clock_out IS NOT NULL
      THEN EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0 - break_minutes / 60.0
      ELSE NULL
    END
  ) STORED,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'voided')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_clock_in ON time_entries(clock_in DESC);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_job_user ON time_entries(job_id, user_id);

-- Updated_at trigger
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "time_entries_admin" ON time_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Users can view and manage their own entries
CREATE POLICY "time_entries_own" ON time_entries FOR ALL USING (
  user_id = auth.uid()
);

COMMENT ON TABLE time_entries IS 'Time tracking entries for job labor hours with clock in/out';
