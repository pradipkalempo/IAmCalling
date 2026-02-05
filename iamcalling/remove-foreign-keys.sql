-- Remove foreign key constraints blocking message inserts
-- Run this in Supabase SQL Editor

-- Drop foreign key constraints
ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_sender;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_receiver;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Ensure no RLS
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON SEQUENCE messages_id_seq TO anon;

-- Test with real user IDs that exist
INSERT INTO messages (sender_id, receiver_id, content) VALUES (157, 161, 'Test message') ON CONFLICT DO NOTHING;