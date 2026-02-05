-- Migration to create messenger tables for real-time communication between users

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  participant1 uuid references public.users(id) on delete cascade,
  participant2 uuid references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_participants unique (participant1, participant2)
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  content text not null,
  message_type text default 'text', -- text, image, etc.
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Calls table
create table if not exists public.calls (
  id uuid primary key default uuid_generate_v4(),
  caller_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  call_type text not null, -- audio, video
  status text default 'initiated', -- initiated, accepted, rejected, ended
  duration integer default 0, -- in seconds
  created_at timestamp with time zone default now(),
  ended_at timestamp with time zone
);

-- Indexes for performance
create index if not exists idx_conversations_participant1 on public.conversations(participant1);
create index if not exists idx_conversations_participant2 on public.conversations(participant2);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
create index if not exists idx_calls_caller_id on public.calls(caller_id);
create index if not exists idx_calls_receiver_id on public.calls(receiver_id);

-- RLS (Row Level Security) policies
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.calls enable row level security;

-- Conversations: users can read conversations they are part of
drop policy if exists conversations_select_participants on public.conversations;
create policy conversations_select_participants on public.conversations
  for select using (auth.uid()::text = participant1::text or auth.uid()::text = participant2::text);

-- Conversations: users can insert conversations they are part of
drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations
  for insert with check (auth.uid()::text = participant1::text or auth.uid()::text = participant2::text);

-- Messages: users can read messages in conversations they are part of
drop policy if exists messages_select_conversation_participants on public.messages;
create policy messages_select_conversation_participants on public.messages
  for select using (
    exists (
      select 1 from public.conversations 
      where conversations.id = messages.conversation_id 
      and (auth.uid()::text = conversations.participant1::text or auth.uid()::text = conversations.participant2::text)
    )
  );

-- Messages: users can insert messages in conversations they are part of
drop policy if exists messages_insert_conversation_participants on public.messages;
create policy messages_insert_conversation_participants on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations 
      where conversations.id = messages.conversation_id 
      and (auth.uid()::text = conversations.participant1::text or auth.uid()::text = conversations.participant2::text)
    )
  );

-- Calls: users can read calls they are part of
drop policy if exists calls_select_participants on public.calls;
create policy calls_select_participants on public.calls
  for select using (auth.uid()::text = caller_id::text or auth.uid()::text = receiver_id::text);

-- Calls: users can insert calls they initiate
drop policy if exists calls_insert_caller on public.calls;
create policy calls_insert_caller on public.calls
  for insert with check (auth.uid()::text = caller_id::text);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update conversations.updated_at
drop trigger if exists update_conversations_updated_at on public.conversations;
create trigger update_conversations_updated_at
  before update on public.conversations
  for each row execute function update_updated_at_column();