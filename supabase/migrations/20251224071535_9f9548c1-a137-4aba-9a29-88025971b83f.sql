-- GDPR Compliance: Add user right to delete their own profile (Right to Erasure/Right to be Forgotten)
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- GDPR Compliance: Enable profile access logging for accountability
-- Update the profile_access_log table to support INSERT for audit trail
CREATE POLICY "Users can log profile access" 
ON public.profile_access_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- GDPR Compliance: Allow users to delete their own access logs
CREATE POLICY "Users can delete own access logs" 
ON public.profile_access_log 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add GDPR data retention: Function to anonymize old data (can be called by scheduled job)
CREATE OR REPLACE FUNCTION public.anonymize_deleted_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow users to anonymize their own data or admins to run this
  IF auth.uid() != target_user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Can only anonymize own data';
  END IF;

  -- Anonymize profile data instead of hard delete (preserves referential integrity)
  UPDATE profiles
  SET 
    email = 'deleted_' || id::text || '@anonymized.local',
    full_name = 'Deleted User',
    avatar_url = NULL,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log the anonymization
  INSERT INTO user_activity_logs (user_id, action, page, metadata)
  VALUES (target_user_id, 'gdpr_data_anonymized', 'profile', jsonb_build_object('anonymized_at', now()));
END;
$$;