-- COMPREHENSIVE MESSAGES TABLE FIX
-- Run this entire script in Supabase SQL Editor

-- Step 1: Check if table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'messages';

-- Step 2: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Completely disable RLS
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.messages;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
    DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 5: Grant ALL permissions to everyone
GRANT ALL PRIVILEGES ON public.messages TO anon;
GRANT ALL PRIVILEGES ON public.messages TO authenticated;
GRANT ALL PRIVILEGES ON public.messages TO public;

-- Step 6: Grant sequence permissions
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE public.messages_id_seq TO public;

-- Step 7: Test insert
INSERT INTO public.messages (sender_id, receiver_id, content) 
VALUES (999, 888, 'Test message from SQL') 
ON CONFLICT DO NOTHING;

-- Step 8: Verify the insert worked
SELECT * FROM public.messages WHERE content = 'Test message from SQL';

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);

-- Step 10: Show final table structure
\d public.messages;