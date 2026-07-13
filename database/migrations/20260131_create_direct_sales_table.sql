-- Direct sales table
-- Tracks when a client buys a project directly from the marketplace
-- seller_id references the project owner (Pradip = user id in users table)

create table if not exists public.direct_sales (
  id           bigserial primary key,
  seller_id    integer references public.users(id) on delete cascade not null,
  buyer_name   text not null,
  buyer_email  text not null,
  buyer_phone  text,
  project_name text not null,
  project_slug text not null,
  sale_amount  integer not null default 0,
  ref_code     text,                          -- if buyer came via referral link
  referrer_id  integer references public.users(id) on delete set null,
  referral_commission integer not null default 0,  -- amount referrer earns from this sale
  payment_method text check (payment_method in ('upi','bank','cash','online')) default 'upi',
  payment_ref  text,                          -- UPI txn id / bank ref number
  status       text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  notes        text,
  created_at   timestamp with time zone default now()
);

create index if not exists idx_sales_seller_id   on public.direct_sales(seller_id);
create index if not exists idx_sales_status       on public.direct_sales(status);
create index if not exists idx_sales_project_slug on public.direct_sales(project_slug);
create index if not exists idx_sales_created_at   on public.direct_sales(created_at desc);
create index if not exists idx_sales_ref_code      on public.direct_sales(ref_code);

alter table public.direct_sales enable row level security;

-- Seller can read their own sales
drop policy if exists sales_select_seller on public.direct_sales;
create policy sales_select_seller on public.direct_sales
  for select using (seller_id::text = auth.uid()::text);

-- Anyone can insert (buyer submits purchase form — anon insert)
drop policy if exists sales_insert_anon on public.direct_sales;
create policy sales_insert_anon on public.direct_sales
  for insert with check (true);

-- Service role full access (admin dashboard)
drop policy if exists sales_service_all on public.direct_sales;
create policy sales_service_all on public.direct_sales
  for all using (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');


-- ── Projects catalogue table ────────────────────────────────────────────────
-- Stores the projects you sell. Managed by admin, read by everyone.

create table if not exists public.projects_catalogue (
  id           bigserial primary key,
  slug         text unique not null,           -- e.g. 'iamcalling-platform'
  title        text not null,
  category     text not null,                  -- e.g. 'fullstack', 'fintech', 'ai'
  short_desc   text not null,
  full_desc    text,
  emoji        text default '🚀',
  demo_url     text,
  market_price integer not null default 0,     -- original market price ₹
  sell_price   integer not null default 0,     -- your selling price ₹
  referral_earn integer not null default 0,    -- referrer earns ₹ per sale
  tech_tags    text[] default '{}',
  status       text not null default 'active' check (status in ('active','draft','sold_out')),
  featured     boolean default false,
  sort_order   integer default 0,
  created_at   timestamp with time zone default now()
);

create index if not exists idx_catalogue_slug   on public.projects_catalogue(slug);
create index if not exists idx_catalogue_status on public.projects_catalogue(status);

alter table public.projects_catalogue enable row level security;

-- Everyone can read active projects
drop policy if exists catalogue_select_all on public.projects_catalogue;
create policy catalogue_select_all on public.projects_catalogue
  for select using (status = 'active');

-- Service role full access
drop policy if exists catalogue_service_all on public.projects_catalogue;
create policy catalogue_service_all on public.projects_catalogue
  for all using (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');


-- ── Seed: insert the 6 known projects ───────────────────────────────────────
insert into public.projects_catalogue
  (slug, title, category, short_desc, emoji, demo_url, market_price, sell_price, referral_earn, tech_tags, featured, sort_order)
values
  ('iamcalling-platform',  'IAMCALLING — Debate & Article Platform',        'fullstack', 'Full-featured social platform with real-time chat, user profiles, admin dashboard, and ideology analysis.', '🧠', '22-write_article.html',        500000, 4999,  500,  ARRAY['Node.js','Express','Supabase','JavaScript','Real-time'], true,  1),
  ('aksh-finance',         'Aksh Finance — Loan & Banking System',          'fintech',   'Professional loan management dashboard with EMI calculator, repayment schedule, KYC, bilingual support.',    '🏦', 'Banking.html',                  35000,  1499,  100,  ARRAY['HTML','Tailwind CSS','JavaScript','EMI Logic'],           false, 2),
  ('admin-dashboard',      'Admin Dashboard — Content & User Management',   'admin',     'Secure admin panel with post creation, content moderation, user analytics, and real-time stats.',             '📊', '40-admin-dashboard-simple.html', 45000,  1999,  250,  ARRAY['Node.js','Supabase','Auth','Analytics'],                  false, 3),
  ('icall-messenger',      'iCall Messenger — Real-Time Chat App',          'realtime',  'Fully functional real-time messaging with online/offline presence, notifications, and Supabase Realtime.',    '💬', '34-icalluser-messenger.html',    80000,  2499,  300,  ARRAY['Supabase Realtime','WebSockets','JavaScript'],            true,  4),
  ('analytics-dashboard',  'Analytics Dashboard — Views & Engagement',      'analytics', 'Post and article analytics showing view counts, engagement trends, top content, and platform-wide stats.',   '📈', '29-analytics_dashboard.html',    50000,  1799,  200,  ARRAY['Charts','Supabase','JavaScript','Data Viz'],              false, 5),
  ('cockroach-ai',         'Cockroach AI — Interactive Chatbot',            'ai',        'AI-powered chatbot with custom personality, 3D shader rendering, and real-time conversation.',               '🤖', '42-robo.html',                  120000, 3499,  400,  ARRAY['AI','GLSL Shaders','JavaScript','WebGL'],                 true,  6)
on conflict (slug) do nothing;
