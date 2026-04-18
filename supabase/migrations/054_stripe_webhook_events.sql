-- Migration 054: Stripe Webhook Events — idempotency tracking
-- Records every processed Stripe event.id so retried deliveries become no-ops.

CREATE TABLE stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB,
  result TEXT NOT NULL CHECK (result IN ('success', 'skipped', 'error')),
  error_message TEXT
);

CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events (event_type);
CREATE INDEX idx_stripe_webhook_events_processed_at ON stripe_webhook_events (processed_at DESC);

-- RLS: only service role reads/writes this table
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON stripe_webhook_events
  FOR ALL
  USING (false);

COMMENT ON TABLE stripe_webhook_events IS 'Idempotency record for Stripe webhook events. Inserted at start of processing; duplicate event.id = no-op.';
