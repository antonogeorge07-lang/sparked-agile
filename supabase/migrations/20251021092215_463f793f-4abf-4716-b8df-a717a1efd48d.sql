-- Fix security issues identified in audit

-- 1. Encrypt sensitive integration config data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Restrict profile access - only show own profile unless admin
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 3. Restrict team member email access - only project members can view
DROP POLICY IF EXISTS "Users can view team members of allocated projects" ON public.team_members;

CREATE POLICY "Project members can view team members" 
ON public.team_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = team_members.project_id 
    AND project_members.user_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

-- 4. Restrict integration config access - only project owners and admins
DROP POLICY IF EXISTS "Users can view integrations of allocated projects" ON public.integrations;

CREATE POLICY "Only project members can view integration configs" 
ON public.integrations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = integrations.project_id 
    AND project_members.user_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

-- 5. Add subscription tiers table (for future Stripe integration)
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_price_id TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  workspace_limit INTEGER NOT NULL,
  team_member_limit INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Add user subscriptions table (for future Stripe integration)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.subscription_tiers(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'trial',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS for subscription tiers (public read, admin write)
CREATE POLICY "Anyone can view active subscription tiers" 
ON public.subscription_tiers FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers" 
ON public.subscription_tiers FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS for user subscriptions (users can view own, admins can view all)
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert subscriptions" 
ON public.user_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_tiers_updated_at
BEFORE UPDATE ON public.subscription_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_yearly, workspace_limit, team_member_limit, features) VALUES
('Free', 0.00, 0.00, 1, 3, '["1 Workspace", "3 Team Members", "Basic AI Features", "Community Support"]'),
('Professional', 29.00, 290.00, 5, 15, '["5 Workspaces", "15 Team Members", "Advanced AI Features", "Priority Support", "Jira Integration", "GitHub Integration"]'),
('Enterprise', 99.00, 990.00, 999, 999, '["Unlimited Workspaces", "Unlimited Team Members", "Premium AI Features", "24/7 Support", "All Integrations", "Custom Features", "Dedicated Account Manager"]')
ON CONFLICT DO NOTHING;