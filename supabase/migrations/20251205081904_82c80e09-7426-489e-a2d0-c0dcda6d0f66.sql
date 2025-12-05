-- Fix the security definer view issue by recreating as regular view
DROP VIEW IF EXISTS public.user_subscription_info;

-- Create view without security definer - it will inherit RLS from underlying table
CREATE VIEW public.user_subscription_info 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  tier_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM public.user_subscriptions;

-- Grant access to the view
GRANT SELECT ON public.user_subscription_info TO authenticated;