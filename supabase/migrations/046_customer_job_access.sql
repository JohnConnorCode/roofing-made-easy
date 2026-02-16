-- ============================================
-- Customer RLS policies for job visibility
-- Allows customers to see their own jobs,
-- status history, and non-internal documents
-- ============================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "jobs_customer_read" ON jobs;
DROP POLICY IF EXISTS "job_status_history_customer_read" ON job_status_history;
DROP POLICY IF EXISTS "job_documents_customer_read" ON job_documents;

-- Customers can view their own jobs
CREATE POLICY "jobs_customer_read" ON jobs FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE auth_user_id = auth.uid()
  )
);

-- Customers can view status history for their jobs
CREATE POLICY "job_status_history_customer_read" ON job_status_history FOR SELECT USING (
  job_id IN (
    SELECT id FROM jobs WHERE customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
);

-- Customers can view non-internal documents for their jobs
-- Excludes internal document types that are admin-only
CREATE POLICY "job_documents_customer_read" ON job_documents FOR SELECT USING (
  job_id IN (
    SELECT id FROM jobs WHERE customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  AND document_type IN ('contract', 'permit', 'inspection_report', 'photo', 'warranty_cert')
);
