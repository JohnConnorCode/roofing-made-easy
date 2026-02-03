-- ============================================
-- Quote Acceptance Enhancement Migration
-- Adds quote status enum and rejection tracking
-- ============================================

-- Quote status enum for detailed_estimates
-- (Table already has status column as VARCHAR, we'll use consistent values)
CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'rejected',
  'expired',
  'superseded'
);

-- Add rejection reason to detailed_estimates (if not exists)
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS rejected_by_email VARCHAR(255);

-- Add viewed tracking
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- Add expiration notification tracking
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS expiration_reminder_sent_at TIMESTAMPTZ;

-- ============================================
-- Add similar fields to basic estimates table
-- (for legacy/simple estimates)
-- ============================================
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS quote_status VARCHAR(50) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES customers(id),
  ADD COLUMN IF NOT EXISTS acceptance_signature TEXT,
  ADD COLUMN IF NOT EXISTS accepted_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS accepted_by_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS accepted_by_ip INET,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS rejected_by_email VARCHAR(255);

-- ============================================
-- Create quote_events table for audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS quote_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the quote (can be either estimate type)
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  detailed_estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL, -- created, sent, viewed, accepted, rejected, expired, resent
  event_data JSONB DEFAULT '{}',

  -- Actor info
  actor_type VARCHAR(20) NOT NULL DEFAULT 'system', -- system, admin, customer
  actor_id UUID,
  actor_name VARCHAR(255),
  actor_email VARCHAR(255),
  actor_ip INET,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: must reference one estimate type
  CONSTRAINT quote_events_estimate_check CHECK (
    (estimate_id IS NOT NULL AND detailed_estimate_id IS NULL) OR
    (estimate_id IS NULL AND detailed_estimate_id IS NOT NULL)
  )
);

-- ============================================
-- Function to log quote events
-- ============================================
CREATE OR REPLACE FUNCTION log_quote_event(
  p_estimate_id UUID,
  p_detailed_estimate_id UUID,
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_actor_type VARCHAR(20) DEFAULT 'system',
  p_actor_id UUID DEFAULT NULL,
  p_actor_name VARCHAR(255) DEFAULT NULL,
  p_actor_email VARCHAR(255) DEFAULT NULL,
  p_actor_ip INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO quote_events (
    estimate_id,
    detailed_estimate_id,
    event_type,
    event_data,
    actor_type,
    actor_id,
    actor_name,
    actor_email,
    actor_ip
  ) VALUES (
    p_estimate_id,
    p_detailed_estimate_id,
    p_event_type,
    p_event_data,
    p_actor_type,
    p_actor_id,
    p_actor_name,
    p_actor_email,
    p_actor_ip
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_estimates_quote_status ON estimates(quote_status);
CREATE INDEX idx_estimates_accepted_at ON estimates(accepted_at);
CREATE INDEX idx_detailed_estimates_accepted_at ON detailed_estimates(accepted_at);
CREATE INDEX idx_detailed_estimates_rejected_at ON detailed_estimates(rejected_at);

CREATE INDEX idx_quote_events_estimate_id ON quote_events(estimate_id);
CREATE INDEX idx_quote_events_detailed_estimate_id ON quote_events(detailed_estimate_id);
CREATE INDEX idx_quote_events_event_type ON quote_events(event_type);
CREATE INDEX idx_quote_events_created_at ON quote_events(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE quote_events ENABLE ROW LEVEL SECURITY;

-- Admins can manage all quote events
CREATE POLICY "quote_events_admin" ON quote_events FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Customers can view events for their quotes
CREATE POLICY "quote_events_customer_read" ON quote_events FOR SELECT USING (
  -- For basic estimates
  estimate_id IN (
    SELECT e.id FROM estimates e
    JOIN customer_leads cl ON cl.lead_id = e.lead_id
    JOIN customers c ON c.id = cl.customer_id
    WHERE c.auth_user_id = auth.uid()
  )
  OR
  -- For detailed estimates
  detailed_estimate_id IN (
    SELECT de.id FROM detailed_estimates de
    JOIN customer_leads cl ON cl.lead_id = de.lead_id
    JOIN customers c ON c.id = cl.customer_id
    WHERE c.auth_user_id = auth.uid()
  )
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE quote_events IS 'Audit trail for quote lifecycle events';
COMMENT ON COLUMN estimates.quote_status IS 'Current status of the quote: draft, sent, viewed, accepted, rejected, expired';
COMMENT ON COLUMN detailed_estimates.rejection_reason IS 'Customer-provided reason for rejecting the quote';
COMMENT ON FUNCTION log_quote_event IS 'Helper function to log quote lifecycle events';
