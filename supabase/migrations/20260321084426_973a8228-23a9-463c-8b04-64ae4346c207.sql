ALTER TABLE public.smart_nudges 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'process',
ADD COLUMN IF NOT EXISTS suggested_action TEXT;