-- Add project_limit column to subscription_tiers
ALTER TABLE subscription_tiers ADD COLUMN IF NOT EXISTS project_limit integer NOT NULL DEFAULT 1;

-- Update the Free tier to allow 50 projects
UPDATE subscription_tiers 
SET project_limit = 50, 
    features = jsonb_build_array(
      '50 Projects',
      '3 Team Members per Project',
      'Basic AI Features',
      'Community Support',
      'Core Agile Ceremonies'
    )
WHERE name = 'Free';

-- Update Professional tier
UPDATE subscription_tiers 
SET project_limit = 200
WHERE name = 'Professional';

-- Update Enterprise tier (unlimited)
UPDATE subscription_tiers 
SET project_limit = 9999
WHERE name = 'Enterprise';

-- Create a function to check if user can create more projects
CREATE OR REPLACE FUNCTION can_create_project(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_project_count integer;
  user_project_limit integer;
BEGIN
  -- Count user's current projects
  SELECT COUNT(*) INTO user_project_count
  FROM projects p
  JOIN project_members pm ON p.id = pm.project_id
  WHERE pm.user_id = user_id_param;
  
  -- Get user's subscription tier limit (default to Free tier if no subscription)
  SELECT COALESCE(
    (SELECT st.project_limit 
     FROM user_subscriptions us
     JOIN subscription_tiers st ON us.tier_id = st.id
     WHERE us.user_id = user_id_param 
     AND us.status IN ('active', 'trialing')
     LIMIT 1),
    (SELECT project_limit FROM subscription_tiers WHERE name = 'Free' LIMIT 1)
  ) INTO user_project_limit;
  
  RETURN user_project_count < user_project_limit;
END;
$$;

-- Create a function to get user's project limit info
CREATE OR REPLACE FUNCTION get_project_limit_info(user_id_param uuid)
RETURNS TABLE(
  current_count integer,
  limit_count integer,
  can_create boolean,
  tier_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = user_id_param) as current_count,
    COALESCE(
      (SELECT st.project_limit 
       FROM user_subscriptions us
       JOIN subscription_tiers st ON us.tier_id = st.id
       WHERE us.user_id = user_id_param 
       AND us.status IN ('active', 'trialing')
       LIMIT 1),
      (SELECT project_limit FROM subscription_tiers WHERE name = 'Free' LIMIT 1)
    ) as limit_count,
    can_create_project(user_id_param) as can_create,
    COALESCE(
      (SELECT st.name 
       FROM user_subscriptions us
       JOIN subscription_tiers st ON us.tier_id = st.id
       WHERE us.user_id = user_id_param 
       AND us.status IN ('active', 'trialing')
       LIMIT 1),
      'Free'
    ) as tier_name;
END;
$$;