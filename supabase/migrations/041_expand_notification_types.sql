-- Expand notification_type enum with new business event types
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'invoice_created';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'customer_registered';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'change_order';

-- Add attendee and reminder tracking columns to calendar_events
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS attendee_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS attendee_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS attendee_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_calendar_events_reminder
  ON calendar_events(start_at) WHERE reminder_sent = false;
