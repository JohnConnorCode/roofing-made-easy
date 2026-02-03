-- ============================================
-- Table: api_credentials
-- Stores encrypted API keys for external services
-- Allows admin to configure integrations via UI
-- ============================================

-- Create enum for service types
CREATE TYPE api_service_type AS ENUM ('resend', 'stripe', 'twilio', 'openai');

-- Create the api_credentials table
CREATE TABLE api_credentials (
  service_id api_service_type PRIMARY KEY,

  -- Encrypted credentials (AES-256-GCM encrypted JSON blob)
  encrypted_key TEXT NOT NULL DEFAULT '',

  -- Last 4 characters of the primary key for display (e.g., "****abc1")
  key_hint VARCHAR(8) DEFAULT '',

  -- Connection test tracking
  last_tested_at TIMESTAMPTZ,
  last_test_success BOOLEAN,
  last_test_error TEXT,

  -- Audit fields
  configured_by UUID REFERENCES auth.users(id),
  configured_at TIMESTAMPTZ,

  -- Standard timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apply updated_at trigger
CREATE TRIGGER update_api_credentials_updated_at
  BEFORE UPDATE ON api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed rows for each service (so they appear in UI immediately)
INSERT INTO api_credentials (service_id) VALUES
  ('resend'),
  ('stripe'),
  ('twilio'),
  ('openai');

-- Enable Row Level Security
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
-- Check admin role via JWT claims (user_metadata or app_metadata)
CREATE POLICY api_credentials_admin_select ON api_credentials
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY api_credentials_admin_update ON api_credentials
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- For service role key access (server-side operations)
CREATE POLICY api_credentials_service_role ON api_credentials
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- Table: audit_logs
-- Generic audit log for sensitive operations
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What happened
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id TEXT,

  -- Details
  details JSONB DEFAULT '{}',

  -- Who did it
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,

  -- When/where
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_table_record_idx ON audit_logs(table_name, record_id);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs: Admin can read, only service role can write
CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

CREATE POLICY audit_logs_service_role_all ON audit_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Add comment for documentation
COMMENT ON TABLE api_credentials IS 'Encrypted storage for third-party API credentials. Keys are encrypted with AES-256-GCM. Admin-only access.';
COMMENT ON COLUMN api_credentials.encrypted_key IS 'AES-256-GCM encrypted JSON blob containing service-specific credentials';
COMMENT ON COLUMN api_credentials.key_hint IS 'Last 4 characters of primary key for UI display, e.g., ****abc1';
