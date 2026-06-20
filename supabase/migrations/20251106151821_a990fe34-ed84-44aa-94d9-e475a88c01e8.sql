-- Create feedback table for landing page
CREATE TABLE public.landing_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  feedback TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.landing_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved feedback
CREATE POLICY "Anyone can read approved feedback"
ON public.landing_feedback
FOR SELECT
USING (is_approved = true);

-- Anyone can insert feedback
CREATE POLICY "Anyone can insert feedback"
ON public.landing_feedback
FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_landing_feedback_approved ON public.landing_feedback(is_approved, created_at DESC);