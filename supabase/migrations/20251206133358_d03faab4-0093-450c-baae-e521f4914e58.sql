-- Create a secure function to get user subscription limits without exposing Stripe IDs
CREATE OR REPLACE FUNCTION public.get_user_subscription_limits(user_id_param uuid)
RETURNS TABLE(
  project_limit integer,
  team_member_limit integer,
  tier_name text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(st.project_limit, 5) as project_limit,
    COALESCE(st.team_member_limit, 15) as team_member_limit,
    COALESCE(st.name, 'Free') as tier_name,
    COALESCE(us.status, 'trial') as status
  FROM user_subscriptions us
  LEFT JOIN subscription_tiers st ON st.id = us.tier_id
  WHERE us.user_id = user_id_param
  LIMIT 1;
$$;