-- Migration 055: Extend user_action_category enum
-- The TS `ActivityCategory` type already includes these values but the
-- underlying DB enum was never extended — any log write with a missing
-- category silently errors (fire-and-forget logger swallows it).

ALTER TYPE user_action_category ADD VALUE IF NOT EXISTS 'job';
ALTER TYPE user_action_category ADD VALUE IF NOT EXISTS 'calendar';
ALTER TYPE user_action_category ADD VALUE IF NOT EXISTS 'notification';
ALTER TYPE user_action_category ADD VALUE IF NOT EXISTS 'invoice';
ALTER TYPE user_action_category ADD VALUE IF NOT EXISTS 'payment';
