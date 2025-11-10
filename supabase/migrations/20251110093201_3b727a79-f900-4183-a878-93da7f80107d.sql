-- Update subscription tiers with new pricing and features

-- Update Free tier
UPDATE subscription_tiers 
SET 
  project_limit = 50,
  team_member_limit = 3,
  workspace_limit = 1,
  price_monthly = 0,
  price_yearly = 0,
  features = jsonb_build_array(
    'Up to 50 Projects',
    '3 Members per Project',
    'Core Agile Ceremonies (Scrum, Kanban, Retrospectives)',
    'Basic AI Features (task suggestions, sprint reminders)',
    'AI Chatbot (Limited Access) – 20 questions/month',
    'Community Support'
  )
WHERE LOWER(name) = 'free';

-- Update Professional tier
UPDATE subscription_tiers 
SET 
  project_limit = 200,
  team_member_limit = 15,
  workspace_limit = 5,
  price_monthly = 29,
  price_yearly = 290,
  features = jsonb_build_array(
    'Up to 200 Projects',
    '5 Workspaces',
    '15 Team Members',
    'Advanced AI Features (AI Story Writing, Sprint Forecasts, Retrospective Summaries)',
    'AI Scrum Assistant (Full Access) – Real-time agile guidance',
    'Backlog Automation',
    'Jira & GitHub Integrations',
    'Priority Support'
  )
WHERE LOWER(name) = 'professional';

-- Update Enterprise tier
UPDATE subscription_tiers 
SET 
  project_limit = 999999,
  team_member_limit = 999999,
  workspace_limit = 999999,
  price_monthly = 99,
  price_yearly = 990,
  features = jsonb_build_array(
    'Unlimited Projects & Workspaces',
    'Unlimited Team Members',
    'Premium AI Suite – Predictive sprint insights, risk detection, auto-reporting',
    'Dedicated AI Agile Coach – Tailored to your organization',
    'All Integrations (Jira, GitHub, Notion, Slack & more)',
    'Custom Features & Private Deployment Options',
    'Dedicated Account Manager',
    '24/7 Enterprise Support'
  )
WHERE LOWER(name) = 'enterprise';