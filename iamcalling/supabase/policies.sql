-- Enable RLS on core tables and add basic policies

-- users (managed by Supabase Auth, usually in auth schema)

alter table if exists public.user_profiles enable row level security;
create policy if not exists user_profiles_select_public on public.user_profiles
  for select using (true);
create policy if not exists user_profiles_modify_own on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

alter table if exists public.articles enable row level security;
create policy if not exists articles_select_public on public.articles
  for select using (true);
create policy if not exists articles_insert_own on public.articles
  for insert with check (user_id = auth.uid());
create policy if not exists articles_update_delete_own on public.articles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists articles_delete_own on public.articles
  for delete using (user_id = auth.uid());

alter table if exists public.comments enable row level security;
create policy if not exists comments_select_public on public.comments
  for select using (true);
create policy if not exists comments_insert_own on public.comments
  for insert with check (user_id = auth.uid());
create policy if not exists comments_update_delete_own on public.comments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists comments_delete_own on public.comments
  for delete using (user_id = auth.uid());

alter table if exists public.political_test_answers enable row level security;
create policy if not exists pta_select_own on public.political_test_answers
  for select using (user_id = auth.uid());
create policy if not exists pta_insert_own on public.political_test_answers
  for insert with check (user_id = auth.uid());
create policy if not exists pta_update_delete_own on public.political_test_answers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists pta_delete_own on public.political_test_answers
  for delete using (user_id = auth.uid());

alter table if exists public.call_logs enable row level security;
create policy if not exists call_logs_select_own on public.call_logs
  for select using (user_id = auth.uid());
create policy if not exists call_logs_insert_own on public.call_logs
  for insert with check (user_id = auth.uid());
create policy if not exists call_logs_update_delete_own on public.call_logs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists call_logs_delete_own on public.call_logs
  for delete using (user_id = auth.uid());

alter table if exists public.ideology_photos enable row level security;
create policy if not exists ideology_photos_select_public on public.ideology_photos
  for select using (true);
create policy if not exists ideology_photos_insert_own on public.ideology_photos
  for insert with check (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists ideology_photos_update_delete_own on public.ideology_photos
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists ideology_photos_delete_own on public.ideology_photos
  for delete using (user_id = auth.uid());


