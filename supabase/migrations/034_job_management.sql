-- ============================================
-- Job/Project Management System
-- Tracks work after a lead is won through
-- completion and warranty
-- ============================================

-- Job status enum
CREATE TYPE job_status AS ENUM (
  'pending_start',
  'materials_ordered',
  'scheduled',
  'in_progress',
  'inspection_pending',
  'punch_list',
  'completed',
  'warranty_active',
  'closed'
);

-- Job document type enum
CREATE TYPE job_document_type AS ENUM (
  'contract',
  'permit',
  'insurance_cert',
  'inspection_report',
  'photo',
  'warranty_cert',
  'other'
);

-- Job expense category enum
CREATE TYPE job_expense_category AS ENUM (
  'materials',
  'labor',
  'subcontractor',
  'permit',
  'equipment',
  'disposal',
  'other'
);

-- ============================================
-- Table: jobs
-- Central post-sale project tracking entity
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auto-generated job number
  job_number TEXT UNIQUE NOT NULL,

  -- References
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE SET NULL,

  -- Status
  status job_status NOT NULL DEFAULT 'pending_start',

  -- Scheduling
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start DATE,
  actual_end DATE,

  -- Team assignment
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  project_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Financials
  contract_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_invoiced DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  material_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  labor_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Property (denormalized for quick access)
  property_address TEXT,
  property_city VARCHAR(100),
  property_state VARCHAR(2),
  property_zip VARCHAR(10),

  -- Warranty
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_type VARCHAR(100),

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: job_status_history
-- Audit trail for job status transitions
-- ============================================
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_status job_status,
  new_status job_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: job_documents
-- Contracts, permits, photos, certificates
-- ============================================
CREATE TABLE job_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  document_type job_document_type NOT NULL DEFAULT 'other',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  permit_number VARCHAR(100),
  expiration_date DATE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: job_daily_logs
-- Crew daily work reports
-- ============================================
CREATE TABLE job_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  crew_members TEXT[] DEFAULT '{}',
  work_performed TEXT,
  hours_worked DECIMAL(5, 2),
  weather_conditions VARCHAR(100),
  work_delayed BOOLEAN NOT NULL DEFAULT false,
  delay_reason TEXT,
  materials_used TEXT,
  safety_incidents TEXT,
  notes TEXT,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: job_expenses
-- Material, labor, and subcontractor costs
-- ============================================
CREATE TABLE job_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category job_expense_category NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  vendor VARCHAR(255),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  receipt_path TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Sequence for job numbers
-- ============================================
CREATE SEQUENCE IF NOT EXISTS job_number_seq START WITH 1001;

-- ============================================
-- Function to generate job number
-- ============================================
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'JOB-' || LPAD(nextval('job_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger to auto-generate job number
-- ============================================
CREATE OR REPLACE FUNCTION trigger_set_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_job_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_job_number();

-- ============================================
-- Trigger to auto-log status changes
-- ============================================
CREATE OR REPLACE FUNCTION trigger_log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO job_status_history (job_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.project_manager_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_job_status_change
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_job_status_change();

-- ============================================
-- Trigger to recalculate job expense totals
-- ============================================
CREATE OR REPLACE FUNCTION trigger_recalculate_job_costs()
RETURNS TRIGGER AS $$
DECLARE
  v_job_id UUID;
  v_material_cost DECIMAL(12, 2);
  v_labor_cost DECIMAL(12, 2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_job_id := OLD.job_id;
  ELSE
    v_job_id := NEW.job_id;
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN category = 'materials' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN category = 'labor' THEN amount ELSE 0 END), 0)
  INTO v_material_cost, v_labor_cost
  FROM job_expenses
  WHERE job_id = v_job_id;

  UPDATE jobs
  SET material_cost = v_material_cost,
      labor_cost = v_labor_cost,
      updated_at = NOW()
  WHERE id = v_job_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_job_costs_on_expense_change
  AFTER INSERT OR UPDATE OR DELETE ON job_expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_job_costs();

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_documents_updated_at
  BEFORE UPDATE ON job_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_daily_logs_updated_at
  BEFORE UPDATE ON job_daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_expenses_updated_at
  BEFORE UPDATE ON job_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_jobs_lead_id ON jobs(lead_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_estimate_id ON jobs(estimate_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_assigned_team_id ON jobs(assigned_team_id);
CREATE INDEX idx_jobs_project_manager_id ON jobs(project_manager_id);
CREATE INDEX idx_jobs_scheduled_start ON jobs(scheduled_start);
CREATE INDEX idx_jobs_job_number ON jobs(job_number);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX idx_job_status_history_job_id ON job_status_history(job_id);
CREATE INDEX idx_job_status_history_created_at ON job_status_history(created_at DESC);

CREATE INDEX idx_job_documents_job_id ON job_documents(job_id);
CREATE INDEX idx_job_documents_type ON job_documents(document_type);

CREATE INDEX idx_job_daily_logs_job_id ON job_daily_logs(job_id);
CREATE INDEX idx_job_daily_logs_log_date ON job_daily_logs(log_date DESC);

CREATE INDEX idx_job_expenses_job_id ON job_expenses(job_id);
CREATE INDEX idx_job_expenses_category ON job_expenses(category);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_expenses ENABLE ROW LEVEL SECURITY;

-- Admin: full access to all job tables
CREATE POLICY "jobs_admin" ON jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "job_status_history_admin" ON job_status_history FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "job_documents_admin" ON job_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "job_daily_logs_admin" ON job_daily_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "job_expenses_admin" ON job_expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Manager: read access to all jobs
CREATE POLICY "jobs_manager_read" ON jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "job_status_history_manager_read" ON job_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "job_documents_manager_read" ON job_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "job_daily_logs_manager_read" ON job_daily_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "job_expenses_manager_read" ON job_expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

-- Crew: read access to assigned team's jobs
CREATE POLICY "jobs_crew_read" ON jobs FOR SELECT USING (
  assigned_team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "job_daily_logs_crew_read" ON job_daily_logs FOR SELECT USING (
  job_id IN (
    SELECT id FROM jobs WHERE assigned_team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  )
);

-- Crew can insert daily logs for their team's jobs
CREATE POLICY "job_daily_logs_crew_insert" ON job_daily_logs FOR INSERT WITH CHECK (
  job_id IN (
    SELECT id FROM jobs WHERE assigned_team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE jobs IS 'Post-sale project tracking from pending start through warranty';
COMMENT ON TABLE job_status_history IS 'Audit trail for job status transitions';
COMMENT ON TABLE job_documents IS 'Documents attached to jobs: contracts, permits, photos, certificates';
COMMENT ON TABLE job_daily_logs IS 'Daily crew work reports for jobs';
COMMENT ON TABLE job_expenses IS 'Material, labor, and subcontractor expenses for jobs';
COMMENT ON FUNCTION generate_job_number() IS 'Auto-generates job numbers in format JOB-XXXXXX';
