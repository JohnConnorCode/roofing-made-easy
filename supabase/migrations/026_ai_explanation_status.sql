-- Add AI explanation status tracking to estimates table
-- Tracks whether AI explanation generation succeeded, failed, or fell back to a different provider

ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS ai_explanation_status text DEFAULT 'success';

COMMENT ON COLUMN estimates.ai_explanation_status IS
  'Tracks AI provider outcome: success, failed, fallback';
