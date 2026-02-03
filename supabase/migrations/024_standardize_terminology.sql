-- =============================================================================
-- Migration: 023_standardize_terminology.sql
-- Purpose: Standardize "estimate" vs "quote" terminology across the database
-- Decision: Use "estimate" internally, keep PDF output as "QUOTE" for professional appearance
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Rename quote_events table to estimate_events (if it exists)
-- This table tracks acceptance/rejection/viewing events for estimates
-- -----------------------------------------------------------------------------

-- Check if quote_events exists and rename it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quote_events') THEN
    ALTER TABLE quote_events RENAME TO estimate_events;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Step 2: Recreate policies on estimate_events (if table exists)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimate_events') THEN
    -- Drop old policies (may not exist)
    DROP POLICY IF EXISTS "quote_events_admin_all" ON estimate_events;
    DROP POLICY IF EXISTS "quote_events_customer_read" ON estimate_events;
    DROP POLICY IF EXISTS "estimate_events_admin_all" ON estimate_events;
    DROP POLICY IF EXISTS "estimate_events_customer_read" ON estimate_events;

    -- Recreate admin policy
    CREATE POLICY "estimate_events_admin_all" ON estimate_events
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
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Step 3: Rename quote_status column in estimates table (if exists)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'quote_status'
  ) THEN
    ALTER TABLE estimates RENAME COLUMN quote_status TO estimate_status;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Step 4: Add estimate_sent and quote_created to lead_status enum (if not exists)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    -- Add estimate_sent if it doesn't exist
    BEGIN
      ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'estimate_sent';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, ignore
    END;

    -- Add quote_created if it doesn't exist
    BEGIN
      ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'quote_created';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, ignore
    END;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Step 5: Update comments for documentation
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimate_events') THEN
    COMMENT ON TABLE estimate_events IS 'Tracks lifecycle events (sent, viewed, accepted, rejected, expired) for estimates';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'estimates' AND column_name = 'estimate_status'
  ) THEN
    COMMENT ON COLUMN estimates.estimate_status IS 'Current status of the estimate: draft, sent, viewed, accepted, rejected, expired';
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Step 6: Create backward compatibility view for quote_events (if needed)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimate_events') THEN
    -- Create view only if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'quote_events') THEN
      CREATE VIEW quote_events AS SELECT * FROM estimate_events;
      COMMENT ON VIEW quote_events IS 'DEPRECATED: Use estimate_events table instead. This view exists for backward compatibility.';
    END IF;
  END IF;
END
$$;
