-- Fix: Allow SECURITY DEFINER functions to write to audit tables by updating policies
-- The issue is that RLS still applies to SECURITY DEFINER functions

-- Drop conflicting policies and create proper ones for sensitive_data_access_log
DROP POLICY IF EXISTS "Users can insert own access logs" ON sensitive_data_access_log;
DROP POLICY IF EXISTS "Users can log own access" ON sensitive_data_access_log;

-- Create a single unified INSERT policy that allows system/trigger inserts
CREATE POLICY "System and users can insert access logs" 
ON sensitive_data_access_log 
FOR INSERT 
WITH CHECK (true);

-- For aggregation_access_limits, add proper user self-insert policy
DROP POLICY IF EXISTS "System can manage limits" ON aggregation_access_limits;

CREATE POLICY "Users can manage own rate limits" 
ON aggregation_access_limits 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also fix the slack_api_rate_limits table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'slack_api_rate_limits') THEN
    -- Enable RLS if not enabled
    ALTER TABLE public.slack_api_rate_limits ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can manage own rate limits" ON slack_api_rate_limits;
    
    -- Create policy for users to manage their own rate limits
    CREATE POLICY "Users can manage own rate limits" 
    ON slack_api_rate_limits 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Fix profiles policy - ensure users can always view their own profile
DROP POLICY IF EXISTS "Users can view own profile and teammates" ON profiles;

CREATE POLICY "Users can view own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view teammate profiles" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
  )
);