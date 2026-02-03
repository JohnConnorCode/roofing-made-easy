-- ============================================
-- Phase 1: Team & User Management, Tasks, Activity Logging
-- Enterprise-grade admin enhancements
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'sales', 'crew_lead', 'crew');

-- Task type enum
CREATE TYPE task_type AS ENUM ('call', 'email', 'site_visit', 'follow_up', 'internal', 'meeting', 'inspection');

-- Task status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Activity action categories
CREATE TYPE user_action_category AS ENUM (
  'auth',           -- login, logout, password change
  'lead',           -- lead CRUD, status changes
  'estimate',       -- estimate generation, sending
  'task',           -- task CRUD
  'team',           -- user/team management
  'settings',       -- system settings changes
  'customer',       -- customer interactions
  'communication'   -- emails, SMS sent
);

-- ============================================
-- Table: user_profiles
-- Extends auth.users with business data
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role user_role NOT NULL DEFAULT 'crew',
  permissions JSONB NOT NULL DEFAULT '{
    "leads": {"view": true, "edit": false, "delete": false},
    "estimates": {"view": true, "edit": false, "delete": false},
    "customers": {"view": true, "edit": false, "delete": false},
    "tasks": {"view": true, "edit": true, "delete": false},
    "team": {"view": false, "edit": false, "delete": false},
    "settings": {"view": false, "edit": false, "delete": false},
    "reports": {"view": false, "export": false}
  }'::jsonb,

  -- Profile info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  job_title VARCHAR(100),

  -- Employment
  hired_at DATE,
  terminated_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Notifications
  notification_preferences JSONB NOT NULL DEFAULT '{
    "email": {"tasks": true, "leads": true, "system": true},
    "sms": {"tasks": false, "leads": false, "system": false},
    "push": {"tasks": true, "leads": true, "system": true}
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- ============================================
-- Table: teams
-- Groups of users for crew assignment
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Display
  color VARCHAR(7) DEFAULT '#6366f1', -- hex color
  icon VARCHAR(50) DEFAULT 'users',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: team_members
-- Many-to-many: users in teams
-- ============================================
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Role within the team
  is_team_lead BOOLEAN NOT NULL DEFAULT FALSE,

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (team_id, user_id)
);

-- Index for querying teams by user
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- ============================================
-- Table: tasks
-- Task and activity management
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type task_type NOT NULL DEFAULT 'follow_up',

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Related entities
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Scheduling
  due_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,

  -- Status
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',

  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  completion_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_at ON tasks(due_at);
CREATE INDEX idx_tasks_priority_status ON tasks(priority, status);

-- Composite index for "my tasks" queries
CREATE INDEX idx_tasks_assignee_status_due ON tasks(assigned_to, status, due_at);

-- ============================================
-- Table: user_activity_log
-- Comprehensive audit trail for user actions
-- ============================================
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role user_role,

  -- What
  action VARCHAR(100) NOT NULL,
  category user_action_category NOT NULL,

  -- Target entity
  entity_type VARCHAR(50),
  entity_id UUID,
  entity_name VARCHAR(200),

  -- Change details (for updates)
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_category ON user_activity_log(category);
CREATE INDEX idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX idx_user_activity_log_entity ON user_activity_log(entity_type, entity_id);

-- Partition by month for performance (optional - can enable later)
-- CREATE INDEX idx_user_activity_log_created_month ON user_activity_log(date_trunc('month', created_at));

-- ============================================
-- Table: user_invitations
-- Track pending user invitations
-- ============================================
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'crew',
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Invitation details
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  token VARCHAR(100) NOT NULL UNIQUE,
  message TEXT,

  -- Status
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(token);
CREATE INDEX idx_user_invitations_expires ON user_invitations(expires_at) WHERE accepted_at IS NULL;

-- ============================================
-- Default Permission Templates by Role
-- ============================================

-- Function to get default permissions for a role
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
        "reports": {"view": true, "export": true}
      }'::jsonb;
    WHEN 'manager' THEN
      RETURN '{
        "leads": {"view": true, "edit": true, "delete": false, "assign": true},
        "estimates": {"view": true, "edit": true, "delete": false, "send": true},
        "customers": {"view": true, "edit": true, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": true, "assign": true},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": true, "edit": false, "delete": false},
        "reports": {"view": true, "export": true}
      }'::jsonb;
    WHEN 'sales' THEN
      RETURN '{
        "leads": {"view": true, "edit": true, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": true, "delete": false, "send": true},
        "customers": {"view": true, "edit": true, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": true, "export": false}
      }'::jsonb;
    WHEN 'crew_lead' THEN
      RETURN '{
        "leads": {"view": true, "edit": false, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": false, "delete": false, "send": false},
        "customers": {"view": true, "edit": false, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": true, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": false, "export": false}
      }'::jsonb;
    ELSE -- 'crew'
      RETURN '{
        "leads": {"view": true, "edit": false, "delete": false, "assign": false},
        "estimates": {"view": true, "edit": false, "delete": false, "send": false},
        "customers": {"view": true, "edit": false, "delete": false},
        "tasks": {"view": true, "edit": true, "delete": false, "assign": false},
        "team": {"view": false, "edit": false, "delete": false, "invite": false},
        "settings": {"view": false, "edit": false, "delete": false},
        "reports": {"view": false, "export": false}
      }'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Trigger: Auto-create user_profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is marked as admin in metadata
  v_is_admin := COALESCE(
    (NEW.raw_user_meta_data->>'is_admin')::boolean,
    (NEW.raw_user_meta_data->>'role') = 'admin',
    FALSE
  );

  -- Set role based on metadata
  IF v_is_admin THEN
    v_role := 'admin';
  ELSE
    v_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'crew'
    );
  END IF;

  -- Create profile with default permissions for role
  INSERT INTO user_profiles (
    id,
    role,
    permissions,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    v_role,
    get_default_permissions(v_role),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Trigger: Log task completion
-- ============================================
CREATE OR REPLACE FUNCTION log_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    NEW.completed_at := NOW();
    -- completed_by should be set by the API
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_completion
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_completion();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if current user is manager or above
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- user_profiles policies
-- ============================================

-- Everyone authenticated can view all profiles (for displaying names, etc.)
CREATE POLICY "Authenticated users can view profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (TRUE);

-- Users can update their own profile (limited fields via API)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Only admins can insert/delete profiles
CREATE POLICY "Admins can manage profiles"
ON user_profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Service role full access
CREATE POLICY "Service role full access to profiles"
ON user_profiles FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- teams policies
-- ============================================

-- All authenticated can view teams
CREATE POLICY "Authenticated users can view teams"
ON teams FOR SELECT
TO authenticated
USING (TRUE);

-- Only managers+ can manage teams
CREATE POLICY "Managers can manage teams"
ON teams FOR ALL
TO authenticated
USING (is_manager_or_above())
WITH CHECK (is_manager_or_above());

-- Service role full access
CREATE POLICY "Service role full access to teams"
ON teams FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- team_members policies
-- ============================================

-- All authenticated can view team memberships
CREATE POLICY "Authenticated users can view team members"
ON team_members FOR SELECT
TO authenticated
USING (TRUE);

-- Only managers+ can manage team membership
CREATE POLICY "Managers can manage team members"
ON team_members FOR ALL
TO authenticated
USING (is_manager_or_above())
WITH CHECK (is_manager_or_above());

-- Service role full access
CREATE POLICY "Service role full access to team members"
ON team_members FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- tasks policies
-- ============================================

-- Users can view tasks assigned to them or that they created
CREATE POLICY "Users can view relevant tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  OR assigned_by = auth.uid()
  OR is_manager_or_above()
);

-- Users can create tasks
CREATE POLICY "Authenticated users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- Users can update tasks assigned to them
CREATE POLICY "Users can update assigned tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR assigned_by = auth.uid()
  OR is_manager_or_above()
);

-- Only managers+ can delete tasks
CREATE POLICY "Managers can delete tasks"
ON tasks FOR DELETE
TO authenticated
USING (is_manager_or_above());

-- Service role full access
CREATE POLICY "Service role full access to tasks"
ON tasks FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- user_activity_log policies
-- ============================================

-- Only managers+ can view activity logs
CREATE POLICY "Managers can view activity logs"
ON user_activity_log FOR SELECT
TO authenticated
USING (is_manager_or_above());

-- Only service role can insert logs (from API)
CREATE POLICY "Service role can insert activity logs"
ON user_activity_log FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- No one can update/delete logs
-- (immutable audit trail)

-- ============================================
-- user_invitations policies
-- ============================================

-- Only admins can view invitations
CREATE POLICY "Admins can view invitations"
ON user_invitations FOR SELECT
TO authenticated
USING (is_admin());

-- Only admins can create invitations
CREATE POLICY "Admins can create invitations"
ON user_invitations FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update/delete invitations
CREATE POLICY "Admins can manage invitations"
ON user_invitations FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Service role full access
CREATE POLICY "Service role full access to invitations"
ON user_invitations FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Views for common queries
-- ============================================

-- View: Team with member count
CREATE OR REPLACE VIEW team_summary AS
SELECT
  t.*,
  COUNT(tm.user_id) AS member_count,
  ARRAY_AGG(up.first_name || ' ' || up.last_name) FILTER (WHERE up.id IS NOT NULL) AS member_names
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN user_profiles up ON tm.user_id = up.id
GROUP BY t.id;

-- View: User with team info
CREATE OR REPLACE VIEW user_with_teams AS
SELECT
  up.*,
  au.email,
  ARRAY_AGG(t.name) FILTER (WHERE t.id IS NOT NULL) AS team_names,
  ARRAY_AGG(t.id) FILTER (WHERE t.id IS NOT NULL) AS team_ids
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN team_members tm ON up.id = tm.user_id
LEFT JOIN teams t ON tm.team_id = t.id
GROUP BY up.id, au.email;

-- ============================================
-- Seed existing admin users into user_profiles
-- ============================================

-- Create profiles for existing auth users who don't have one
INSERT INTO user_profiles (id, role, permissions)
SELECT
  au.id,
  CASE
    WHEN (au.raw_user_meta_data->>'role') = 'admin'
      OR (au.raw_user_meta_data->>'is_admin')::boolean = true
    THEN 'admin'::user_role
    ELSE 'crew'::user_role
  END,
  get_default_permissions(
    CASE
      WHEN (au.raw_user_meta_data->>'role') = 'admin'
        OR (au.raw_user_meta_data->>'is_admin')::boolean = true
      THEN 'admin'::user_role
      ELSE 'crew'::user_role
    END
  )
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE user_profiles IS 'Extended user profiles with roles, permissions, and business data. Links to auth.users.';
COMMENT ON TABLE teams IS 'Crew teams for scheduling and assignment.';
COMMENT ON TABLE team_members IS 'Many-to-many relationship between users and teams.';
COMMENT ON TABLE tasks IS 'Task management for leads and general activities.';
COMMENT ON TABLE user_activity_log IS 'Immutable audit trail of all user actions.';
COMMENT ON TABLE user_invitations IS 'Pending user invitations with tokens.';

COMMENT ON FUNCTION get_default_permissions IS 'Returns default permission set for a given role.';
COMMENT ON FUNCTION is_admin IS 'Checks if current user has admin privileges.';
COMMENT ON FUNCTION is_manager_or_above IS 'Checks if current user is manager or admin.';
