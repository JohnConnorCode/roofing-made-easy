-- Fix split-brain: estimates table has both 'status' and 'estimate_status' columns.
-- The estimates list API filters on 'status', accept/reject routes update 'estimate_status'.
-- They are never synced, so the admin sees 'draft' forever.
--
-- Solution: Create a trigger to keep them in sync, and copy existing data.

-- Step 1: Sync existing data (estimate_status -> status)
UPDATE estimates SET status = estimate_status WHERE status != estimate_status;

-- Step 2: Create trigger function to keep them in sync
CREATE OR REPLACE FUNCTION sync_estimate_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If estimate_status changed, sync to status
  IF NEW.estimate_status IS DISTINCT FROM OLD.estimate_status THEN
    NEW.status = NEW.estimate_status;
  -- If status changed, sync to estimate_status
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.estimate_status = NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
DROP TRIGGER IF EXISTS sync_estimate_status_trigger ON estimates;
CREATE TRIGGER sync_estimate_status_trigger
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION sync_estimate_status();
