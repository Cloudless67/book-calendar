CREATE TABLE IF NOT EXISTS public.readings (
  id bigint generated always as identity primary key,
  "bookTitle" text not null,
  author text,
  "coverUrl" text,
  date date,
  "pagesRead" integer default 0,
  "totalPages" integer,
  status text,
  rating integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS(Row Level Security) 설정 (이 프로젝트 특성상 현재는 모두 열어둠. 만약 유저 인증을 붙일 경우 변경 필요)
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON public.readings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.readings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.readings FOR DELETE USING (true);
