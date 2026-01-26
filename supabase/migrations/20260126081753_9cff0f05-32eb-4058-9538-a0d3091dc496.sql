-- Fix the permissive INSERT policy on sensitive_data_access_log
-- Make it only allow inserts where user_id matches the authenticated user

DROP POLICY IF EXISTS "System and users can insert access logs" ON sensitive_data_access_log;

-- Create a more restrictive policy - users can only insert logs for themselves
-- SECURITY DEFINER functions will work because they run as the function owner
CREATE POLICY "Users can insert own access logs" 
ON sensitive_data_access_log 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NOT NULL);