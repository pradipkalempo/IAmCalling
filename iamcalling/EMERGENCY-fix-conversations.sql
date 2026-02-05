-- EMERGENCY FIX: Create missing conversations table
-- This is blocking message saves - run immediately in Supabase SQL Editor

-- Create the missing conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Disable RLS on conversations
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL PRIVILEGES ON public.conversations TO anon;
GRANT ALL PRIVILEGES ON public.conversations TO authenticated;
GRANT ALL PRIVILEGES ON public.conversations TO public;

-- Grant sequence permissions
GRANT ALL PRIVILEGES ON SEQUENCE public.conversations_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE public.conversations_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE public.conversations_id_seq TO public;

-- Now ensure messages table exists and has permissions
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on messages
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to messages
GRANT ALL PRIVILEGES ON public.messages TO anon;
GRANT ALL PRIVILEGES ON public.messages TO authenticated;
GRANT ALL PRIVILEGES ON public.messages TO public;

-- Grant sequence permissions for messages
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO public;

-- Test insert to verify it works
INSERT INTO public.messages (sender_id, receiver_id, content) 
VALUES (999, 888, 'EMERGENCY TEST MESSAGE') 
ON CONFLICT DO NOTHING;

-- Verify the test worked
SELECT 'SUCCESS: Messages table working' as status, count(*) as test_messages 
FROM public.messages WHERE content = 'EMERGENCY TEST MESSAGE';