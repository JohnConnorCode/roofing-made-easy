-- Migration 057: invoices.job_id
-- Link invoices to their parent job. Needed so auto-created deposit invoices
-- can be resolved back to the job whose pending_deposit gate they unlock, and
-- so reports can compute per-job A/R without three joins.

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- Index for the common "list invoices for a job" query and for the deposit
-- lookup on webhook receipt.
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices (job_id) WHERE job_id IS NOT NULL;

COMMENT ON COLUMN invoices.job_id IS 'Parent job. Set by auto-created deposit invoices and by manual invoicing against a job. ON DELETE SET NULL so invoice history survives job hard-delete.';
