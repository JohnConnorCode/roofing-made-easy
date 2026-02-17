-- =============================================================================
-- Migration: 049_add_jobs_calendar_permissions.sql
-- Purpose: Add missing jobs and calendar keys to get_default_permissions()
--          and backfill all existing user_profiles that have stored permissions
-- Bug: get_default_permissions() was created before the jobs/calendar modules,
--      so all profiles created by handle_new_user trigger are missing these keys.
--      This causes 403 Forbidden on /jobs and /calendar pages.
-- =============================================================================

-- 1) Update the get_default_permissions function to include jobs and calendar
CREATE OR REPLACE FUNCTION get_default_permissions(p_role user_role)
RETURNS JSONB AS $$
BEGIN
  CASE p_role
    WHEN 'admin' THEN
      RETURN '{
        "leads": {"view": true, "edit": true, "delete": true, "assign": true},
        "estimates": {"view": true, "edit": true, "delete": true, "send": true},
        "customers": {"view": true, "edit": true, "delete": true},
        "tasks": {"view": true, "edit": true, "delete": true, "assign": true},
        "team": {"view": true, "edit": true, "delete": true, "invite": true},
        "settings": {"view": true, "edit": true, "delete": true},
        "reports": {"view": true, "export": true},
        "jobs": {"view": true, "edit": true, "delete": true, "assign": true},
        "calendar": {"view": true, "edit": true, "delete": true}
      }'::jsonb;
    WHEN 'manager' THEN
      RETURN '{
        "leads": {"view": true, "edit": true, "delete": false, "assign": true},
        "estimates": {"view": true, "edit": true, "delete": false, "send": true},
        "customers": {"view": true, "edit": true, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": true, "assign": true},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": true, "edit": false, "delete": false},
        "reports": {"view": true, "export": true},
        "jobs": {"view": true, "edit": true, "delete": false, "assign": true},
        "calendar": {"view": true, "edit": true, "delete": false}
      }'::jsonb;
    WHEN 'sales' THEN
      RETURN '{
        "leads": {"view": true, "edit": true, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": true, "delete": false, "send": true},
        "customers": {"view": true, "edit": true, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": true, "export": false},
        "jobs": {"view": true, "edit": false, "delete": false, "assign": false},
        "calendar": {"view": true, "edit": false, "delete": false}
      }'::jsonb;
    WHEN 'crew_lead' THEN
      RETURN '{
        "leads": {"view": true, "edit": false, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": false, "delete": false, "send": false},
        "customers": {"view": true, "edit": false, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": false, "export": false},
        "jobs": {"view": true, "edit": true, "delete": false, "assign": false},
        "calendar": {"view": true, "edit": true, "delete": false}
      }'::jsonb;
    ELSE -- 'crew'
      RETURN '{
        "leads": {"view": true, "edit": false, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": false, "delete": false, "send": false},
        "customers": {"view": true, "edit": false, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": false, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": false, "export": false},
        "jobs": {"view": true, "edit": false, "delete": false, "assign": false},
        "calendar": {"view": true, "edit": false, "delete": false}
      }'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2) Backfill all existing profiles: merge in jobs + calendar from role defaults
UPDATE user_profiles
SET permissions = permissions || jsonb_build_object(
  'jobs', (get_default_permissions(role))->'jobs',
  'calendar', (get_default_permissions(role))->'calendar'
)
WHERE permissions IS NOT NULL
  AND (NOT permissions ? 'jobs' OR NOT permissions ? 'calendar');
