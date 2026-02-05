-- Industry-level view tracking schema
-- This provides robust view counting with deduplication and analytics

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create views table for tracking individual view events
create table if not exists public.views (
    id uuid primary key default uuid_generate_v4(),
    content_id uuid not null,
    content_type text not null check (content_type in ('post', 'article')),
    user_id uuid, -- nullable for guest views
    ip_address inet,
    user_agent text,
    session_id text,
    created_at timestamp with time zone default now()
);

-- Create materialized view for fast aggregated counts
create table if not exists public.content_view_counts (
    content_id uuid primary key,
    content_type text not null,
    total_views bigint default 0,
    unique_views bigint default 0,
    last_viewed_at timestamp with time zone,
    updated_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_views_content on public.views(content_id, content_type);
create index if not exists idx_views_user on public.views(user_id);
create index if not exists idx_views_session on public.views(session_id);
create index if not exists idx_views_created_at on public.views(created_at);
create index if not exists idx_content_view_counts_type on public.content_view_counts(content_type);

-- Function to update view counts (called by trigger)
create or replace function update_content_view_counts()
returns trigger as $$
begin
    -- Insert or update the aggregated counts
    insert into public.content_view_counts (content_id, content_type, total_views, unique_views, last_viewed_at)
    values (
        coalesce(NEW.content_id, OLD.content_id),
        coalesce(NEW.content_type, OLD.content_type),
        -- Total views count
        (select count(*) from public.views where content_id = coalesce(NEW.content_id, OLD.content_id) and content_type = coalesce(NEW.content_type, OLD.content_type)),
        -- Unique views count (by user_id or session_id)
        (select count(distinct coalesce(user_id::text, session_id, ip_address::text)) 
         from public.views 
         where content_id = coalesce(NEW.content_id, OLD.content_id) and content_type = coalesce(NEW.content_type, OLD.content_type)),
        now()
    )
    on conflict (content_id) do update set
        total_views = excluded.total_views,
        unique_views = excluded.unique_views,
        last_viewed_at = excluded.last_viewed_at,
        updated_at = now();
    
    return NEW;
end;
$$ language plpgsql;

-- Trigger to automatically update counts when views are inserted/updated
create trigger update_view_counts_trigger
    after insert or update or delete on public.views
    for each row
    execute function update_content_view_counts();

-- Function to get view counts for content
create or replace function get_content_views(content_uuid uuid, content_type text)
returns table(
    total_views bigint,
    unique_views bigint,
    last_viewed_at timestamp with time zone
) as $$
begin
    return query
    select 
        cvc.total_views,
        cvc.unique_views,
        cvc.last_viewed_at
    from public.content_view_counts cvc
    where cvc.content_id = content_uuid 
    and cvc.content_type = content_type;
end;
$$ language plpgsql;

-- Function to increment view count with deduplication
create or replace function increment_view_count(
    content_uuid uuid,
    content_type text,
    user_uuid uuid default null,
    ip_addr inet default null,
    user_agent_text text default null,
    session_identifier text default null
)
returns json as $$
declare
    view_exists boolean;
    result json;
begin
    -- Check if this user/session has viewed this content recently (within 1 hour)
    select exists(
        select 1 from public.views 
        where content_id = content_uuid 
        and content_type = content_type
        and (
            (user_uuid is not null and user_id = user_uuid) or
            (session_identifier is not null and session_id = session_identifier) or
            (ip_addr is not null and ip_address = ip_addr and user_agent_text = user_agent)
        )
        and created_at > now() - interval '1 hour'
    ) into view_exists;
    
    -- Only insert if not recently viewed
    if not view_exists then
        insert into public.views (content_id, content_type, user_id, ip_address, user_agent, session_id)
        values (content_uuid, content_type, user_uuid, ip_addr, user_agent_text, session_identifier);
    end if;
    
    -- Return current counts
    select json_build_object(
        'total_views', cvc.total_views,
        'unique_views', cvc.unique_views,
        'recently_viewed', view_exists
    ) into result
    from public.content_view_counts cvc
    where cvc.content_id = content_uuid and cvc.content_type = content_type;
    
    return coalesce(result, json_build_object('total_views', 0, 'unique_views', 0, 'recently_viewed', false));
end;
$$ language plpgsql;

-- Grant necessary permissions
grant select, insert on public.views to anon, authenticated;
grant select on public.content_view_counts to anon, authenticated;
grant execute on function increment_view_count(uuid, text, uuid, inet, text, text) to anon, authenticated;
grant execute on function get_content_views(uuid, text) to anon, authenticated;

-- Add views_count column to existing posts and articles tables if not exists
alter table public.posts add column if not exists views_count integer default 0;
alter table public.articles add column if not exists views_count integer default 0;

-- Function to sync legacy views_count columns with new system
create or replace function sync_legacy_view_counts()
returns void as $$
begin
    -- Update posts table
    update public.posts p
    set views_count = coalesce(
        (select cvc.total_views 
         from public.content_view_counts cvc 
         where cvc.content_id = p.id and cvc.content_type = 'post'), 
        0
    );
    
    -- Update articles table
    update public.articles a
    set views_count = coalesce(
        (select cvc.total_views 
         from public.content_view_counts cvc 
         where cvc.content_id = a.id and cvc.content_type = 'article'), 
        0
    );
end;
$$ language plpgsql;

-- Initial sync
select sync_legacy_view_counts();