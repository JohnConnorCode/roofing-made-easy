-- =============================================================================
-- Migration: 022_production_improvements.sql
-- Purpose: Production optimizations including performance indexes, unique
--          constraints for Stripe IDs, soft delete columns, and tightened RLS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Performance indexes for invoice and quote-related tables
-- -----------------------------------------------------------------------------

-- Index for filtering invoices by creator (admin who created it)
CREATE INDEX IF NOT EXISTS idx_invoices_created_by
  ON invoices(created_by);

-- Index for filtering invoice payments by status
CREATE INDEX IF NOT EXISTS idx_invoice_payments_status
  ON invoice_payments(status);

-- Index for filtering quote events by actor
CREATE INDEX IF NOT EXISTS idx_quote_events_actor_id
  ON quote_events(actor_id);

-- Composite index for efficiently fetching quote events by estimate with ordering
CREATE INDEX IF NOT EXISTS idx_quote_events_estimate_created
  ON quote_events(estimate_id, created_at DESC);

-- Index for price adjustments lookup by estimate
CREATE INDEX IF NOT EXISTS idx_price_adjustments_estimate_id
  ON price_adjustments(estimate_id);

-- -----------------------------------------------------------------------------
-- Unique constraints for Stripe IDs to prevent duplicate records
-- These use partial indexes to only apply when the ID is not null
-- -----------------------------------------------------------------------------

-- Prevent duplicate Stripe invoice IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_unique
  ON invoices(stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL;

-- Prevent duplicate Stripe payment intent IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_payments_stripe_intent_unique
  ON invoice_payments(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Soft delete columns for financial audit trail
-- Financial records should never be hard deleted - mark as deleted instead
-- -----------------------------------------------------------------------------

-- Add deleted_at column to invoices for soft delete
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to invoice_payments for soft delete
ALTER TABLE invoice_payments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index for filtering out soft-deleted records efficiently
CREATE INDEX IF NOT EXISTS idx_invoices_not_deleted
  ON invoices(id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_payments_not_deleted
  ON invoice_payments(id)
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- Tightened RLS policy for customer invoice access
-- Ensures customers can only see invoices for their own leads
-- -----------------------------------------------------------------------------

-- Drop existing policy if it exists (may have been created differently)
DROP POLICY IF EXISTS "invoices_customer_read" ON invoices;

-- Create new policy that properly validates customer ownership through customer_leads
CREATE POLICY "invoices_customer_read" ON invoices
  FOR SELECT
  USING (
    -- Allow access if:
    -- 1. The user is an admin (checked separately in other policies), OR
    -- 2. The user is a customer who owns the lead associated with this invoice
    EXISTS (
      SELECT 1
      FROM customer_leads cl
      JOIN customers c ON c.id = cl.customer_id
      WHERE cl.lead_id = invoices.lead_id
        AND c.auth_user_id = auth.uid()
    )
    -- Also exclude soft-deleted invoices from customer view
    AND invoices.deleted_at IS NULL
  );

-- -----------------------------------------------------------------------------
-- Create price_adjustments table if it doesn't exist
-- This supports the new price adjustment feature for estimates
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS price_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES detailed_estimates(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('discount_percent', 'discount_fixed', 'price_override')),
  adjustment_value DECIMAL(10, 2) NOT NULL,
  adjustment_amount DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  internal_reason TEXT,
  applied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup by estimate
CREATE INDEX IF NOT EXISTS idx_price_adjustments_estimate_created
  ON price_adjustments(estimate_id, created_at DESC);

-- Enable RLS on price_adjustments
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;

-- Admin full access to price adjustments
CREATE POLICY "price_adjustments_admin_all" ON price_adjustments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND (
          raw_user_meta_data->>'role' = 'admin'
          OR raw_app_meta_data->>'role' = 'admin'
        )
    )
  );

-- Add adjusted_price column to detailed_estimates if it doesn't exist
ALTER TABLE detailed_estimates
  ADD COLUMN IF NOT EXISTS adjusted_price DECIMAL(12, 2);

-- -----------------------------------------------------------------------------
-- Comments for documentation
-- -----------------------------------------------------------------------------

COMMENT ON INDEX idx_invoices_stripe_invoice_unique IS 'Ensures no duplicate Stripe invoice IDs are stored';
COMMENT ON INDEX idx_invoice_payments_stripe_intent_unique IS 'Ensures no duplicate Stripe payment intent IDs are stored';
COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp - records with non-null values are considered deleted';
COMMENT ON COLUMN invoice_payments.deleted_at IS 'Soft delete timestamp - records with non-null values are considered deleted';
COMMENT ON TABLE price_adjustments IS 'Stores price adjustments (discounts, overrides) applied to detailed estimates';
