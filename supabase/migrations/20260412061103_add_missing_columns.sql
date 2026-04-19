ALTER TABLE public.readings 
ADD COLUMN IF NOT EXISTS memo text,
ADD COLUMN IF NOT EXISTS "readingTime" integer default 0;
