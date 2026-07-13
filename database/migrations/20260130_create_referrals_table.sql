-- Referrals table for tracking personal referral earnings
-- users.id is integer (not uuid) — foreign keys must match

create table if not exists public.referrals (
  id           bigserial primary key,
  referrer_id  integer references public.users(id) on delete cascade not null,
  project_name text not null,
  project_page text not null,
  commission   integer not null default 0,
  status       text not null default 'pending' check (status in ('pending','processing','paid')),
  ref_code     text not null,
  created_at   timestamp with time zone default now()
);

create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_referrals_status      on public.referrals(status);
create index if not exists idx_referrals_created_at  on public.referrals(created_at desc);

alter table public.referrals enable row level security;

-- owner can read their own referrals
drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own on public.referrals
  for select using (referrer_id::text = auth.uid()::text);

-- owner can insert their own referrals
drop policy if exists referrals_insert_own on public.referrals;
create policy referrals_insert_own on public.referrals
  for insert with check (referrer_id::text = auth.uid()::text);

-- service role full access (for admin updates)
drop policy if exists referrals_service_all on public.referrals;
create policy referrals_service_all on public.referrals
  for all using (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- ── Payout requests ──────────────────────────────────────────────────────────

create table if not exists public.payout_requests (
  id         bigserial primary key,
  user_id    integer references public.users(id) on delete cascade not null,
  amount     integer not null,
  method     text not null check (method in ('upi','bank')),
  details    jsonb not null default '{}',
  status     text not null default 'pending' check (status in ('pending','processing','paid','rejected')),
  created_at timestamp with time zone default now()
);

create index if not exists idx_payout_user_id    on public.payout_requests(user_id);
create index if not exists idx_payout_created_at on public.payout_requests(created_at desc);

alter table public.payout_requests enable row level security;

drop policy if exists payout_select_own on public.payout_requests;
create policy payout_select_own on public.payout_requests
  for select using (user_id::text = auth.uid()::text);

drop policy if exists payout_insert_own on public.payout_requests;
create policy payout_insert_own on public.payout_requests
  for insert with check (user_id::text = auth.uid()::text);

drop policy if exists payout_service_all on public.payout_requests;
create policy payout_service_all on public.payout_requests
  for all using (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
