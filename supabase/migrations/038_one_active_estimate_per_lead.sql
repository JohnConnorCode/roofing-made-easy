-- Prevent race condition: only one active (non-superseded) estimate per lead
-- If a concurrent request tries to insert a second active estimate, it will fail
-- with a unique violation that the application catches gracefully.
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_estimate_per_lead
  ON estimates (lead_id) WHERE is_superseded = false;
