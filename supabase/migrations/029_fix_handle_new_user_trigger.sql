-- =============================================================================
-- Migration: 029_fix_handle_new_user_trigger.sql
-- Purpose: Fix handle_new_user trigger to use schema-qualified references
-- Bug: GoTrue auth service runs with different search_path, causing
--      "type user_role does not exist" when creating auth users
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
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
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'crew'
    );
  END IF;

  -- Create profile with default permissions for role
  INSERT INTO public.user_profiles (
    id,
    role,
    permissions,
    first_name,
    last_name,
    phone
  ) VALUES (
    NEW.id,
    v_role,
    public.get_default_permissions(v_role),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure supabase_auth_admin can insert into user_profiles
GRANT INSERT ON public.user_profiles TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.get_default_permissions(public.user_role) TO supabase_auth_admin;
