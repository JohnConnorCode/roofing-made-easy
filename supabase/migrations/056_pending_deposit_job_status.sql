-- Migration 056: pending_deposit job state
-- Enforces the deposit gate — a job created from an accepted estimate starts
-- in pending_deposit and cannot progress to pending_start until money has
-- been received. The payment webhook is the only thing that transitions it
-- (via deposit_received_at).

-- 1. Add 'pending_deposit' to the job_status enum.
-- Must be placed BEFORE 'pending_start' since that's the next logical step.
-- Postgres enums have no "before" directive in older versions — ADD VALUE
-- appends to the end. That's fine; ordering is cosmetic for the DB itself,
-- and TS code controls the ordering shown in UIs.
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'pending_deposit';

-- 2. Deposit tracking columns on jobs.
-- deposit_required = false keeps existing jobs unaffected (no retroactive
-- deposit gate). New jobs created from estimate acceptance set it to true.
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS deposit_received_at TIMESTAMPTZ;

COMMENT ON COLUMN jobs.deposit_required IS 'If true, job stays in pending_deposit until deposit_received_at is set.';
COMMENT ON COLUMN jobs.deposit_amount IS 'Expected deposit (typically 50% of contract). Informational for the customer-facing invoice.';
COMMENT ON COLUMN jobs.deposit_received_at IS 'Timestamp of the first successful deposit payment. Set by the payments webhook.';

-- 3. Index for the pending_deposit + deposit_required query the webhook
-- runs on every payment success.
CREATE INDEX IF NOT EXISTS idx_jobs_deposit_pending
  ON jobs (lead_id)
  WHERE status = 'pending_deposit' AND deposit_required = true;
