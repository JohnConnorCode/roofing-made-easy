-- ============================================
-- Progress Billing, Change Orders & Lien Waivers
-- Adds milestone billing, change order tracking,
-- manual payment recording, and lien waivers
-- ============================================

-- ============================================
-- 1. Add job_id to invoices
-- ============================================
ALTER TABLE invoices ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;
CREATE INDEX idx_invoices_job_id ON invoices(job_id);

-- ============================================
-- 2. Add manual payment tracking fields
-- ============================================
ALTER TABLE invoice_payments ADD COLUMN reference_number VARCHAR(100);
ALTER TABLE invoice_payments ADD COLUMN recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================
-- 3. Change order status enum
-- ============================================
CREATE TYPE change_order_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- 4. Lien waiver type enum
-- ============================================
CREATE TYPE lien_waiver_type AS ENUM ('conditional', 'unconditional');

-- ============================================
-- 5. Lien waiver status enum
-- ============================================
CREATE TYPE lien_waiver_status AS ENUM ('draft', 'sent', 'signed');

-- ============================================
-- Table: job_billing_schedules
-- Milestone-based billing plans for jobs
-- ============================================
CREATE TABLE job_billing_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  milestone_name VARCHAR(255) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  trigger_status job_status NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: change_orders
-- Track scope and cost changes to jobs
-- ============================================
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  change_order_number VARCHAR(20) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  reason TEXT,
  cost_delta DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status change_order_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  customer_approved BOOLEAN NOT NULL DEFAULT false,
  customer_approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: lien_waivers
-- Lien waiver documents for payments
-- ============================================
CREATE TABLE lien_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  invoice_payment_id UUID REFERENCES invoice_payments(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  waiver_type lien_waiver_type NOT NULL DEFAULT 'conditional',
  status lien_waiver_status NOT NULL DEFAULT 'draft',
  through_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  claimant_name VARCHAR(255),
  owner_name VARCHAR(255),
  property_description TEXT,
  pdf_path TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Sequence for change order numbers
-- ============================================
CREATE SEQUENCE IF NOT EXISTS change_order_number_seq START WITH 1;

-- ============================================
-- Trigger: auto-generate change_order_number
-- ============================================
CREATE OR REPLACE FUNCTION trigger_set_change_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.change_order_number IS NULL THEN
    NEW.change_order_number := 'CO-' || LPAD(nextval('change_order_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_change_order_number
  BEFORE INSERT ON change_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_change_order_number();

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER update_job_billing_schedules_updated_at
  BEFORE UPDATE ON job_billing_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_orders_updated_at
  BEFORE UPDATE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lien_waivers_updated_at
  BEFORE UPDATE ON lien_waivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_job_billing_schedules_job_id ON job_billing_schedules(job_id);
CREATE INDEX idx_job_billing_schedules_trigger ON job_billing_schedules(trigger_status);
CREATE INDEX idx_change_orders_job_id ON change_orders(job_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_lien_waivers_job_id ON lien_waivers(job_id);
CREATE INDEX idx_lien_waivers_invoice_id ON lien_waivers(invoice_id);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE job_billing_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lien_waivers ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "job_billing_schedules_admin" ON job_billing_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "change_orders_admin" ON change_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "lien_waivers_admin" ON lien_waivers FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Manager: read access
CREATE POLICY "job_billing_schedules_manager_read" ON job_billing_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "change_orders_manager_read" ON change_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

CREATE POLICY "lien_waivers_manager_read" ON lien_waivers FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'manager')
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE job_billing_schedules IS 'Milestone-based billing schedules for jobs (30/50/20, 50/50, etc.)';
COMMENT ON TABLE change_orders IS 'Scope and cost change orders for jobs';
COMMENT ON TABLE lien_waivers IS 'Lien waiver documents tied to job payments';
