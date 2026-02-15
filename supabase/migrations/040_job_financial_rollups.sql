-- ============================================
-- Job Financial Rollup Triggers
-- Keeps jobs.total_invoiced and jobs.total_paid
-- in sync via triggers on invoices and invoice_payments
-- ============================================

-- ============================================
-- 1. Trigger: recalculate jobs.total_invoiced
-- Fires AFTER INSERT/UPDATE/DELETE on invoices
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_job_total_invoiced()
RETURNS TRIGGER AS $$
DECLARE
  affected_job_id UUID;
BEGIN
  -- Determine affected job_id(s)
  -- On UPDATE, job_id might change — recalculate both old and new
  IF TG_OP = 'UPDATE' AND OLD.job_id IS DISTINCT FROM NEW.job_id THEN
    -- Recalculate old job
    IF OLD.job_id IS NOT NULL THEN
      UPDATE jobs SET total_invoiced = COALESCE((
        SELECT SUM(total) FROM invoices
        WHERE job_id = OLD.job_id AND status NOT IN ('cancelled', 'refunded')
      ), 0)
      WHERE id = OLD.job_id;
    END IF;
    -- Recalculate new job
    IF NEW.job_id IS NOT NULL THEN
      UPDATE jobs SET total_invoiced = COALESCE((
        SELECT SUM(total) FROM invoices
        WHERE job_id = NEW.job_id AND status NOT IN ('cancelled', 'refunded')
      ), 0)
      WHERE id = NEW.job_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Single job_id affected
  affected_job_id := COALESCE(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.job_id ELSE NEW.job_id END
  );

  IF affected_job_id IS NOT NULL THEN
    UPDATE jobs SET total_invoiced = COALESCE((
      SELECT SUM(total) FROM invoices
      WHERE job_id = affected_job_id AND status NOT IN ('cancelled', 'refunded')
    ), 0)
    WHERE id = affected_job_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_job_invoiced
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_job_total_invoiced();

-- ============================================
-- 2. Trigger: recalculate jobs.total_paid
-- Fires AFTER INSERT/UPDATE/DELETE on invoice_payments
-- JOINs through invoices to find job_id
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_job_total_paid()
RETURNS TRIGGER AS $$
DECLARE
  affected_job_id UUID;
  old_job_id UUID;
  new_job_id UUID;
BEGIN
  -- Find job_id through invoice
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    SELECT job_id INTO old_job_id FROM invoices WHERE id = OLD.invoice_id;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT job_id INTO new_job_id FROM invoices WHERE id = NEW.invoice_id;
  END IF;

  -- If invoice changed (rare), recalculate both jobs
  IF TG_OP = 'UPDATE' AND old_job_id IS DISTINCT FROM new_job_id THEN
    IF old_job_id IS NOT NULL THEN
      UPDATE jobs SET total_paid = COALESCE((
        SELECT SUM(ip.amount)
        FROM invoice_payments ip
        JOIN invoices i ON i.id = ip.invoice_id
        WHERE i.job_id = old_job_id AND ip.status = 'succeeded'
      ), 0)
      WHERE id = old_job_id;
    END IF;
    IF new_job_id IS NOT NULL THEN
      UPDATE jobs SET total_paid = COALESCE((
        SELECT SUM(ip.amount)
        FROM invoice_payments ip
        JOIN invoices i ON i.id = ip.invoice_id
        WHERE i.job_id = new_job_id AND ip.status = 'succeeded'
      ), 0)
      WHERE id = new_job_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Single job affected
  affected_job_id := COALESCE(new_job_id, old_job_id);

  IF affected_job_id IS NOT NULL THEN
    UPDATE jobs SET total_paid = COALESCE((
      SELECT SUM(ip.amount)
      FROM invoice_payments ip
      JOIN invoices i ON i.id = ip.invoice_id
      WHERE i.job_id = affected_job_id AND ip.status = 'succeeded'
    ), 0)
    WHERE id = affected_job_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_job_paid
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_job_total_paid();

-- ============================================
-- 3. Partial unique index to prevent duplicate
-- un-invoiced milestones per trigger status
-- ============================================
CREATE UNIQUE INDEX idx_billing_schedule_one_pending_per_trigger
  ON job_billing_schedules(job_id, trigger_status)
  WHERE invoice_id IS NULL;

-- ============================================
-- 4. Backfill existing data
-- ============================================
UPDATE jobs SET total_invoiced = COALESCE((
  SELECT SUM(i.total)
  FROM invoices i
  WHERE i.job_id = jobs.id AND i.status NOT IN ('cancelled', 'refunded')
), 0)
WHERE id IN (SELECT DISTINCT job_id FROM invoices WHERE job_id IS NOT NULL);

UPDATE jobs SET total_paid = COALESCE((
  SELECT SUM(ip.amount)
  FROM invoice_payments ip
  JOIN invoices i ON i.id = ip.invoice_id
  WHERE i.job_id = jobs.id AND ip.status = 'succeeded'
), 0)
WHERE id IN (
  SELECT DISTINCT i.job_id
  FROM invoice_payments ip
  JOIN invoices i ON i.id = ip.invoice_id
  WHERE i.job_id IS NOT NULL
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON FUNCTION recalculate_job_total_invoiced() IS 'Trigger function that recalculates jobs.total_invoiced when invoices change';
COMMENT ON FUNCTION recalculate_job_total_paid() IS 'Trigger function that recalculates jobs.total_paid when invoice_payments change';
