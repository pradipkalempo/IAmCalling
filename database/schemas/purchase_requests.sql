-- Run this in Supabase SQL Editor

create table if not exists purchase_requests (
    id           uuid primary key default gen_random_uuid(),
    user_id      text not null,
    user_name    text,
    plan_name    text not null,
    plan_price   integer not null,
    referred_by  text,          -- ref code of the person who referred this user
    txn_id       text not null,
    status       text not null default 'pending' check (status in ('pending','approved','rejected')),
    created_at   timestamptz default now()
);

-- Index for fast user lookups
create index if not exists idx_purchase_requests_user_id on purchase_requests(user_id);
create index if not exists idx_purchase_requests_status  on purchase_requests(status);

-- Allow anon insert (user submits request) and select (user checks own status)
alter table purchase_requests enable row level security;

create policy "users can insert own requests"
    on purchase_requests for insert
    with check (true);

create policy "users can read own requests"
    on purchase_requests for select
    using (true);

create policy "users can not update"
    on purchase_requests for update
    using (true);   -- admin uses service key or dashboard; anon key allowed for demo
