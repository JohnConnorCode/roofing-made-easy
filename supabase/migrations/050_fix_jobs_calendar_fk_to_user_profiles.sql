-- =============================================================================
-- Migration: 050_fix_jobs_calendar_fk_to_user_profiles.sql
-- Purpose: Change FK references from auth.users to user_profiles for columns
--          used in PostgREST joins (project_manager_id, assigned_to).
-- Bug: PostgREST can't resolve cross-schema FKs (public -> auth), so
--      joins like project_manager:project_manager_id(id, first_name, last_name)
--      fail with PGRST200. Pointing to user_profiles fixes the join and gives
--      access to first_name/last_name which don't exist on auth.users.
-- =============================================================================

-- 1) jobs.project_manager_id: auth.users -> user_profiles
ALTER TABLE jobs DROP CONSTRAINT jobs_project_manager_id_fkey;
ALTER TABLE jobs ADD CONSTRAINT jobs_project_manager_id_fkey
  FOREIGN KEY (project_manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- 2) calendar_events.assigned_to: auth.users -> user_profiles
ALTER TABLE calendar_events DROP CONSTRAINT calendar_events_assigned_to_fkey;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES user_profiles(id) ON DELETE SET NULL;
