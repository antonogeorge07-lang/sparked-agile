-- Ensure platform-wide analytics data is admin-only

-- ============================================================================
-- AI_USAGE_LOGS - Strengthen admin-only platform analytics
-- ============================================================================

-- Users can only view their own AI usage
-- Admins can view all AI usage for platform analytics
-- No changes needed here as existing policies are correct

-- ============================================================================
-- USER_ACTIVITY_LOGS - Ensure only admins can see platform-wide data
-- ============================================================================

-- The existing policies already correctly restrict:
-- - Users can only insert their own activity
-- - Users can only view their own activity
-- - Admins can view all activity

-- ============================================================================
-- PROJECT_USAGE_STATS - Platform-level project statistics
-- ============================================================================

-- Add RLS if not already enabled
ALTER TABLE public.project_usage_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Only admins can view project usage stats" ON public.project_usage_stats;
DROP POLICY IF EXISTS "Users can view their project stats" ON public.project_usage_stats;
DROP POLICY IF EXISTS "Project members can view stats" ON public.project_usage_stats;

-- Only admins can view platform-wide usage statistics
CREATE POLICY "Only admins can view project usage stats"
ON public.project_usage_stats
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can manage project usage stats
CREATE POLICY "Only admins can manage project usage stats"
ON public.project_usage_stats
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- ============================================================================
-- Verify admin function exists and works correctly
-- ============================================================================

-- Ensure is_admin function is working
-- This function should already exist from earlier migrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin'
  ) THEN
    RAISE EXCEPTION 'is_admin function does not exist. Please ensure it is created first.';
  END IF;
END $$;