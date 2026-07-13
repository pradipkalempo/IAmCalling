-- Users table for authentication and user management
-- This should be run in your Supabase SQL editor

-- UUID extension (for Postgres)
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (first_name || ' ' || last_name) stored,
  profile_photo text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_created_at on public.users(created_at desc);

-- RLS (Row Level Security)
alter table public.users enable row level security;

-- Users can read their own data
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (auth.uid()::text = id::text);

-- Users can update their own data
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid()::text = id::text);

-- Service role can do everything (for registration)
drop policy if exists users_service_all on public.users;
create policy users_service_all on public.users
  for all using (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at_column();