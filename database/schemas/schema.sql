-- Supabase schema for ideology photos and game results

-- UUID extension (for Postgres)
create extension if not exists "uuid-ossp";

-- Ideology photos (publicly readable gallery)
create table if not exists public.ideology_photos (
  id uuid primary key default uuid_generate_v4(),
  name text,
  category text not null, -- fascist | rightist | neutral | leftist | communist
  image_url text not null,
  cloudinary_public_id text,
  created_at timestamp with time zone default now()
);

-- Helpful index
create index if not exists idx_ideology_photos_category on public.ideology_photos(category);
create index if not exists idx_ideology_photos_created_at on public.ideology_photos(created_at desc);

-- Game results (per session)
create table if not exists public.game_results (
  session_id text primary key,
  game_data jsonb not null,
  saved_at timestamp with time zone default now()
);

-- RLS (adjust as desired; these are safe defaults)
alter table public.ideology_photos enable row level security;
alter table public.game_results enable row level security;

-- Photos: public can read, only service role (or future owners) should write
drop policy if exists ideology_photos_select_public on public.ideology_photos;
create policy ideology_photos_select_public on public.ideology_photos
  for select using (true);

-- Game results: read/write by service role only (via service key) unless you add auth-based ownership
drop policy if exists game_results_service_rw on public.game_results;
create policy game_results_service_rw on public.game_results
  for all using (current_setting('request.jwt.claims', true)::jsonb ? 'role')
  with check (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- Note:
-- If you later attach results to users, add a user_id uuid column, and replace policy with auth.uid() checks.

