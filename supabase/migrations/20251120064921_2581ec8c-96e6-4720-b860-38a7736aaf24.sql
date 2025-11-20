-- Create visitor tracking table for device fingerprinting
CREATE TABLE IF NOT EXISTS public.visitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint TEXT UNIQUE NOT NULL,
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  has_seen_onboarding BOOLEAN DEFAULT false,
  has_dismissed_signup_reminder BOOLEAN DEFAULT false,
  total_time_on_site INTEGER DEFAULT 0, -- in seconds
  pages_visited INTEGER DEFAULT 0,
  ip_address_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write their own visitor data (fingerprint-based, no auth required)
CREATE POLICY "Anyone can manage visitor tracking"
ON public.visitor_tracking
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index on fingerprint for faster lookups
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_fingerprint 
ON public.visitor_tracking(device_fingerprint);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_visitor_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_visitor_tracking_updated_at
  BEFORE UPDATE ON public.visitor_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_visitor_tracking_updated_at();