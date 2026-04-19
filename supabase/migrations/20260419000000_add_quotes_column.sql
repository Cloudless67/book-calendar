ALTER TABLE public.readings
ADD COLUMN IF NOT EXISTS quotes jsonb DEFAULT '[]'::jsonb;
