-- Create a function to get public user statistics without exposing personal data
CREATE OR REPLACE FUNCTION public.get_public_user_stats()
RETURNS TABLE(
  total_users integer,
  recent_signups integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_users,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::integer as recent_signups
  FROM profiles;
END;
$$;

-- Grant execute to anon users
GRANT EXECUTE ON FUNCTION public.get_public_user_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_user_stats() TO authenticated;