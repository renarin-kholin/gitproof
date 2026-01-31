-- Create a table for public profiles if it doesn't exist
create table if not exists public.profiles (
  username text not null,
  full_name text,
  avatar_url text,
  score numeric,
  grade text,
  search_count int default 1,
  raw_data jsonb,
  updated_at timestamp with time zone,
  
  primary key (username)
);

-- Set up Row Level Security (RLS)
-- For now, we'll allow public everything since this is a demo/tool.
-- In a real app, you'd want restrictive policies.
alter table public.profiles enable row level security;

create policy "Allow public read access"
  on public.profiles for select
  using ( true );

create policy "Allow public insert/update access"
  on public.profiles for insert
  with check ( true );

create policy "Allow public update access"
  on public.profiles for update
  using ( true );
