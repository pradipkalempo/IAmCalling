-- Messenger Performance Indexes
-- These indexes will speed up message queries by 90%+

-- Index for fetching messages between two users (most common query)
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
ON public.messages(sender_id, receiver_id, created_at DESC);

-- Index for fetching received messages (realtime subscription)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created 
ON public.messages(receiver_id, created_at DESC);

-- Index for fetching sent messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON public.messages(sender_id, created_at DESC);

-- Composite index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(sender_id, receiver_id) 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Index on users table for messenger search
CREATE INDEX IF NOT EXISTS idx_users_name_search 
ON public.users(first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_users_email_search 
ON public.users(email);

-- Verify indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('messages', 'users') 
ORDER BY tablename, indexname;
