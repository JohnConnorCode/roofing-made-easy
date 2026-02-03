-- Add estimate_sent status to distinguish AI estimates from admin quotes
-- The flow becomes: estimate_generated -> estimate_sent -> quote_sent

-- Add the new value to the lead_status enum
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'estimate_sent' AFTER 'estimate_generated';

-- Add quote_created status for when admin creates a formal quote
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'quote_created' AFTER 'estimate_sent';

-- Add a comment to document the status flow
COMMENT ON TYPE lead_status IS 'Lead status progression:
  new -> intake_started -> intake_complete -> estimate_generated -> estimate_sent -> quote_created -> quote_sent -> won/lost/archived

  estimate_generated: AI has calculated a price range estimate
  estimate_sent: AI estimate email sent to customer (automated)
  quote_created: Admin has created a formal quote with fixed price
  quote_sent: Formal quote emailed to customer (admin action)
';
