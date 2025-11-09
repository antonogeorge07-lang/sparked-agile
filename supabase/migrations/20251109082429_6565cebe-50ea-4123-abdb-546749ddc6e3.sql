-- Create user consent management table
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  functional_consent BOOLEAN DEFAULT true,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create data export log table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  export_data JSONB
);

-- Enable RLS
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own export requests"
  ON public.data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
  ON public.data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_data_export_user_id ON public.data_export_requests(user_id);