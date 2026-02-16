-- Analytics events table for first-party funnel tracking
-- Stores page views, funnel steps, conversions, and engagement events

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  referrer VARCHAR(1000),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  funnel_step INTEGER,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  entry_source VARCHAR(100),
  time_on_page_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  device_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_timestamp TIMESTAMPTZ
);

-- Index for funnel analytics queries (date range + event type)
CREATE INDEX idx_analytics_events_created_type
  ON analytics_events (created_at DESC, event_type);

-- Index for session-based queries
CREATE INDEX idx_analytics_events_session
  ON analytics_events (session_id, created_at);

-- Index for funnel step analysis
CREATE INDEX idx_analytics_events_funnel
  ON analytics_events (funnel_step, created_at DESC)
  WHERE funnel_step IS NOT NULL;

-- Index for source attribution
CREATE INDEX idx_analytics_events_source
  ON analytics_events (utm_source, created_at DESC)
  WHERE utm_source IS NOT NULL;

-- Index for lead-linked events
CREATE INDEX idx_analytics_events_lead
  ON analytics_events (lead_id)
  WHERE lead_id IS NOT NULL;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anon users can insert events (public tracking endpoint)
CREATE POLICY "anon_insert_analytics"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);

-- Service role can insert (API route uses admin client)
CREATE POLICY "service_insert_analytics"
  ON analytics_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can read analytics data
CREATE POLICY "admin_select_analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Auto-cleanup function: delete events older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup via pg_cron (runs daily at 3 AM UTC)
-- Note: pg_cron must be enabled in Supabase dashboard
-- If pg_cron is not enabled, run cleanup_old_analytics_events() manually or via a cron API route
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
    PERFORM cron.schedule(
      'cleanup-analytics-events',
      '0 3 * * *',
      'SELECT cleanup_old_analytics_events()'
    );
  END IF;
END $$;
