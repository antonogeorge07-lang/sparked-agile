-- Create security_incidents table
CREATE TABLE public.security_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('SEV-1', 'SEV-2', 'SEV-3', 'SEV-4')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  affected_users TEXT[],
  affected_systems TEXT[],
  detection_method TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_bot BOOLEAN DEFAULT false,
  bot_status TEXT,
  response_actions JSONB DEFAULT '[]'::jsonb,
  evidence_collected JSONB DEFAULT '{}'::jsonb,
  root_cause TEXT,
  lessons_learned TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

-- Only admins can view incidents
CREATE POLICY "Admins can view all incidents"
ON public.security_incidents
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can create incidents
CREATE POLICY "Admins can create incidents"
ON public.security_incidents
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update incidents
CREATE POLICY "Admins can update incidents"
ON public.security_incidents
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can delete incidents
CREATE POLICY "Admins can delete incidents"
ON public.security_incidents
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX idx_security_incidents_detected_at ON public.security_incidents(detected_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_security_incidents_updated_at
BEFORE UPDATE ON public.security_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.security_incidents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_incidents;