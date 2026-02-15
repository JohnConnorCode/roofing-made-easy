-- ============================================
-- Notifications System
-- In-app notifications with read/dismiss tracking
-- ============================================

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'lead_new',
  'task_assigned',
  'task_overdue',
  'job_status_changed',
  'calendar_reminder',
  'invoice_paid',
  'invoice_overdue',
  'estimate_accepted',
  'message_received',
  'system_alert'
);

-- Notification priority enum
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- ============================================
-- Table: notifications
-- In-app notification records
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  priority notification_priority NOT NULL DEFAULT 'normal',

  -- Action
  action_url TEXT,
  action_label VARCHAR(100),

  -- Related entity
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Status
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_own" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);

-- Users can update their own notifications (mark read/dismissed)
CREATE POLICY "notifications_own_update" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- Admin can insert notifications for any user (for system notifications)
CREATE POLICY "notifications_admin_insert" ON notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Service role can insert for any user (for automated notifications)
CREATE POLICY "notifications_service_insert" ON notifications FOR ALL USING (
  auth.role() = 'service_role'
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE notifications IS 'In-app notifications with read/dismiss tracking per user';
