create table if not exists public.translations (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  target_language text not null,
  translation text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(text, target_language)
);

-- Set up RLS policies
alter table public.translations enable row level security;

-- Allow public read access
create policy "Translations are viewable by everyone"
  on public.translations for select
  using (true);

-- Only allow service role to insert/update
create policy "Only service role can insert translations"
  on public.translations for insert
  with check (auth.role() = 'service_role');

create policy "Only service role can update translations"
  on public.translations for update
  using (auth.role() = 'service_role');