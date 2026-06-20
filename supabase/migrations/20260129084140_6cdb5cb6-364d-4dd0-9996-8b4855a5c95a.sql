-- =====================================================
-- GDPR-Compliant Project Members Access Control
-- =====================================================
-- This migration restricts project_members visibility based on role:
-- - Owners/Admins: Full roster visibility
-- - Regular members: Only see their own membership + limited info about others
-- - Creates audit logging for access

-- 1. Create a security definer function to check if user can view full roster
CREATE OR REPLACE FUNCTION public.can_view_project_roster(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = p_project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
  ) OR public.is_admin(auth.uid());
$$;

-- 2. Create audit log table for project member access
CREATE TABLE IF NOT EXISTS public.project_member_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  access_type text NOT NULL,
  members_accessed integer NOT NULL DEFAULT 0,
  ip_address text,
  accessed_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on access log
ALTER TABLE public.project_member_access_log ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_project_member_access_log_user_id 
  ON public.project_member_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_project_member_access_log_project_id 
  ON public.project_member_access_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_member_access_log_accessed_at 
  ON public.project_member_access_log(accessed_at);

-- 4. RLS policies for audit log (immutable)
CREATE POLICY "Admins can view member access logs"
  ON public.project_member_access_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()) OR is_platform_owner(auth.uid()));

CREATE POLICY "No modifications to member access logs"
  ON public.project_member_access_log
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 5. Create security definer function to log and retrieve project members
CREATE OR REPLACE FUNCTION public.get_project_members_gdpr(p_project_id uuid)
RETURNS TABLE(
  id uuid,
  project_id uuid,
  user_id uuid,
  role text,
  created_at timestamptz,
  member_name text,
  member_avatar text,
  is_full_access boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_full_access boolean;
BEGIN
  -- Check if user has access to the project at all
  IF NOT can_access_workspace_project(p_project_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Not a project member';
  END IF;
  
  -- Check if user can see full roster (owner/admin)
  has_full_access := can_view_project_roster(p_project_id);
  
  -- Log the access (security definer bypasses RLS for insert)
  INSERT INTO project_member_access_log (
    user_id, 
    project_id, 
    access_type,
    members_accessed,
    ip_address
  )
  SELECT 
    auth.uid(),
    p_project_id,
    CASE WHEN has_full_access THEN 'full_roster' ELSE 'limited_view' END,
    (SELECT COUNT(*) FROM project_members WHERE project_members.project_id = p_project_id),
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      'internal'
    );
  
  -- Return appropriate data based on access level
  IF has_full_access THEN
    -- Full access: return all members with full details
    RETURN QUERY
    SELECT 
      pm.id,
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.created_at,
      COALESCE(p.full_name, 'Team Member')::text as member_name,
      p.avatar_url::text as member_avatar,
      true as is_full_access
    FROM project_members pm
    LEFT JOIN profiles p ON p.id = pm.user_id
    WHERE pm.project_id = p_project_id
    ORDER BY pm.created_at;
  ELSE
    -- Limited access: only return self + project leadership (owners/admins)
    RETURN QUERY
    SELECT 
      pm.id,
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.created_at,
      CASE 
        WHEN pm.user_id = auth.uid() THEN COALESCE(p.full_name, 'Team Member')::text
        ELSE 'Team Member'::text
      END as member_name,
      CASE 
        WHEN pm.user_id = auth.uid() THEN p.avatar_url::text
        ELSE NULL::text
      END as member_avatar,
      false as is_full_access
    FROM project_members pm
    LEFT JOIN profiles p ON p.id = pm.user_id
    WHERE pm.project_id = p_project_id
      AND (pm.user_id = auth.uid() OR pm.role IN ('owner', 'admin'))
    ORDER BY pm.created_at;
  END IF;
END;
$$;

-- 6. Create function to get member count without exposing identities
CREATE OR REPLACE FUNCTION public.get_project_member_count(p_project_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM project_members
  WHERE project_id = p_project_id
    AND can_access_workspace_project(p_project_id, auth.uid());
$$;

-- 7. Update RLS policies for project_members to restrict direct access
-- Drop existing broad SELECT policy
DROP POLICY IF EXISTS "Users can view workspace project memberships" ON public.project_members;

-- Create more restrictive policies
-- Policy 1: Users can always see their own membership
CREATE POLICY "Users can view own project membership"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Project owners/admins can see full roster
CREATE POLICY "Project owners and admins can view full roster"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (can_view_project_roster(project_id));

-- Policy 3: Regular members can only see owners/admins (for escalation purposes)
CREATE POLICY "Members can see project leadership"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    role IN ('owner', 'admin')
    AND can_access_workspace_project(project_id, auth.uid())
  );

-- 8. Add retention policy function for access logs
CREATE OR REPLACE FUNCTION public.cleanup_project_member_access_logs(days_to_keep integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  WITH deleted AS (
    DELETE FROM project_member_access_log
    WHERE accessed_at < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

-- 9. Add comment for GDPR documentation
COMMENT ON TABLE public.project_member_access_log IS 
'GDPR-compliant audit log for project member access. Tracks who accessed team rosters and when. Retention: 90 days.';

COMMENT ON FUNCTION public.get_project_members_gdpr IS 
'GDPR-compliant function to retrieve project members with role-based access control. Regular members see limited info; owners/admins see full roster.';