-- Migration 058: Realtime publications
-- Adds the tables the customer portal subscribes to so state changes (payment
-- received → job flips to pending_start) appear in the UI without a refresh.
--
-- RLS policies on these tables already restrict customers to their own rows,
-- and realtime inherits those policies — so subscribing to the full table is
-- safe. The client only receives events for rows it could already read.

ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE job_status_history;
