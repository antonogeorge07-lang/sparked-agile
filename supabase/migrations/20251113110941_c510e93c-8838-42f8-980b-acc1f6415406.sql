-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step TEXT DEFAULT 'welcome',
  onboarding_completed BOOLEAN DEFAULT false,
  first_project_id UUID,
  first_value_stream_id UUID,
  first_epic_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding progress
CREATE POLICY "Users can view own onboarding progress"
  ON public.onboarding_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own onboarding progress
CREATE POLICY "Users can insert own onboarding progress"
  ON public.onboarding_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own onboarding progress
CREATE POLICY "Users can update own onboarding progress"
  ON public.onboarding_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to initialize onboarding for new users
CREATE OR REPLACE FUNCTION public.initialize_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  INSERT INTO public.onboarding_progress (user_id, current_step)
  VALUES (NEW.id, 'welcome')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to initialize onboarding on user signup
CREATE TRIGGER on_user_created_initialize_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_onboarding();

-- Create index for faster lookups
CREATE INDEX idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.onboarding_progress IS 'Tracks user onboarding progress and completed steps';
COMMENT ON COLUMN public.onboarding_progress.completed_steps IS 'Array of completed step IDs';
COMMENT ON COLUMN public.onboarding_progress.current_step IS 'Current step in the onboarding flow';
COMMENT ON COLUMN public.onboarding_progress.first_project_id IS 'Reference to first project created during onboarding';
COMMENT ON COLUMN public.onboarding_progress.first_value_stream_id IS 'Reference to first value stream created during onboarding';
COMMENT ON COLUMN public.onboarding_progress.first_epic_id IS 'Reference to first epic created during onboarding';