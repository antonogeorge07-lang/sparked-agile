
-- =====================================================
-- GDPR-COMPLIANT SECURITY HARDENING MIGRATION
-- =====================================================

-- 1. Add data retention tracking for GDPR compliance
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_retention_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS deletion_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS anonymized boolean DEFAULT false;

-- 2. Create GDPR data export function for Right to Data Portability
CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow users to export their own data or admins
  IF auth.uid() != target_user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only export your own data';
  END IF;

  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = target_user_id),
    'projects', (SELECT COALESCE(jsonb_agg(row_to_json(pr.*)), '[]'::jsonb) FROM projects pr WHERE pr.user_id = target_user_id),
    'project_memberships', (SELECT COALESCE(jsonb_agg(row_to_json(pm.*)), '[]'::jsonb) FROM project_members pm WHERE pm.user_id = target_user_id),
    'chat_messages', (SELECT COALESCE(jsonb_agg(row_to_json(cm.*)), '[]'::jsonb) FROM chat_messages cm WHERE cm.user_id = target_user_id),
    'onboarding_progress', (SELECT row_to_json(op.*) FROM onboarding_progress op WHERE op.user_id = target_user_id),
    'export_timestamp', now(),
    'data_format_version', '1.0'
  ) INTO result;

  -- Log the export for audit
  INSERT INTO sensitive_data_access_log (user_id, accessed_data_type, action, accessed_user_id)
  VALUES (auth.uid(), 'full_data_export', 'EXPORT', target_user_id);

  RETURN result;
END;
$$;

-- 3. Create GDPR Right to Erasure (Right to be Forgotten) function
CREATE OR REPLACE FUNCTION public.anonymize_user_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to anonymize their own data or admins
  IF auth.uid() != target_user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You can only anonymize your own data';
  END IF;

  -- Anonymize profile data (keep record but remove PII)
  UPDATE profiles 
  SET 
    email = 'anonymized_' || id::text || '@deleted.local',
    full_name = 'Deleted User',
    avatar_url = NULL,
    preferences = NULL,
    anonymized = true,
    updated_at = now()
  WHERE id = target_user_id;

  -- Remove Microsoft tokens completely (sensitive)
  DELETE FROM user_microsoft_tokens WHERE user_id = target_user_id;
  
  -- Remove Slack tokens completely (sensitive)
  DELETE FROM user_slack_tokens WHERE user_id = target_user_id;

  -- Anonymize chat messages (keep for system integrity but remove content)
  UPDATE chat_messages 
  SET content = '[Message deleted per GDPR request]'
  WHERE user_id = target_user_id;

  -- Log the anonymization for audit
  INSERT INTO sensitive_data_access_log (user_id, accessed_data_type, action, accessed_user_id)
  VALUES (auth.uid(), 'full_profile', 'ANONYMIZE', target_user_id);

  RETURN true;
END;
$$;

-- 4. Create function to mask email in SELECT queries for non-owners
CREATE OR REPLACE FUNCTION public.mask_email(email_value text, owner_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return full email for owner or admin
  IF auth.uid() = owner_id OR is_admin(auth.uid()) THEN
    RETURN email_value;
  END IF;
  
  -- Mask email for others (show only domain)
  IF email_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN '***@' || split_part(email_value, '@', 2);
END;
$$;

-- 5. Add column for tracking token encryption version (for key rotation)
ALTER TABLE public.user_microsoft_tokens
ADD COLUMN IF NOT EXISTS encryption_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS key_rotation_required boolean DEFAULT false;

-- 6. Create a view for profiles that masks sensitive data
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id,
  CASE 
    WHEN auth.uid() = id OR is_admin(auth.uid()) THEN email
    ELSE '***@' || split_part(email, '@', 2)
  END as email,
  CASE 
    WHEN auth.uid() = id OR is_admin(auth.uid()) THEN full_name
    ELSE COALESCE(split_part(full_name, ' ', 1), 'User')
  END as full_name,
  avatar_url,
  role,
  created_at,
  updated_at,
  anonymized
FROM profiles
WHERE anonymized = false OR auth.uid() = id;

-- 7. Grant access to the safe view
GRANT SELECT ON public.profiles_safe TO authenticated;

-- 8. Add GDPR consent tracking table
CREATE TABLE IF NOT EXISTS public.gdpr_consent_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL,
  consent_text text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  withdrawn_at timestamp with time zone
);

-- Enable RLS on consent records
ALTER TABLE public.gdpr_consent_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view own consent records"
  ON public.gdpr_consent_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can insert own consent records"
  ON public.gdpr_consent_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can withdraw consent (update)
CREATE POLICY "Users can withdraw consent"
  ON public.gdpr_consent_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Create data breach notification log (GDPR Article 33 compliance)
CREATE TABLE IF NOT EXISTS public.data_breach_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  detected_at timestamp with time zone DEFAULT now(),
  breach_type text NOT NULL,
  affected_data_types text[],
  affected_user_count integer,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text,
  containment_actions text[],
  notification_sent_at timestamp with time zone,
  supervisory_authority_notified boolean DEFAULT false,
  created_by uuid,
  resolved_at timestamp with time zone
);

-- Only admins can access breach log
ALTER TABLE public.data_breach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage breach log"
  ON public.data_breach_log
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- 10. Update sensitive_data_access_log to track more GDPR-relevant info
ALTER TABLE public.sensitive_data_access_log
ADD COLUMN IF NOT EXISTS accessed_user_id uuid,
ADD COLUMN IF NOT EXISTS action text DEFAULT 'VIEW',
ADD COLUMN IF NOT EXISTS legal_basis text;

-- 11. Create index for faster audit queries
CREATE INDEX IF NOT EXISTS idx_sensitive_data_access_log_user 
  ON public.sensitive_data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_data_access_log_accessed_user 
  ON public.sensitive_data_access_log(accessed_user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_records_user 
  ON public.gdpr_consent_records(user_id);

-- 12. Add comment explaining GDPR compliance
COMMENT ON TABLE public.profiles IS 'User profiles with GDPR compliance: supports data export, anonymization, and consent tracking';
COMMENT ON TABLE public.gdpr_consent_records IS 'GDPR Article 7 - Records of user consent for data processing';
COMMENT ON TABLE public.data_breach_log IS 'GDPR Article 33 - Data breach notification records';
COMMENT ON FUNCTION public.export_user_data IS 'GDPR Article 20 - Right to data portability';
COMMENT ON FUNCTION public.anonymize_user_data IS 'GDPR Article 17 - Right to erasure (right to be forgotten)';
