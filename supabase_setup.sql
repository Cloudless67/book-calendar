-- 1. Create the 'books' table for caching book metadata
CREATE TABLE IF NOT EXISTS public.books (
    isbn text PRIMARY KEY,
    title text NOT NULL,
    author text,
    cover_url text,
    total_pages integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) on books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow public read access on books" 
ON public.books FOR SELECT USING (true);

-- Allow insert/update access to authenticated users or public (adjust depending on auth setup)
CREATE POLICY "Allow public insert on books" 
ON public.books FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on books" 
ON public.books FOR UPDATE USING (true);


-- 2. Create the Storage Bucket for book covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'book-covers' bucket
CREATE POLICY "Allow public read access on book-covers"
ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "Allow public insert on book-covers"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Allow public update on book-covers"
ON storage.objects FOR UPDATE USING (bucket_id = 'book-covers');
