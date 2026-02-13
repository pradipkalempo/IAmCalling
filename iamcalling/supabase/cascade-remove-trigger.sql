-- Remove trigger and function with CASCADE
-- Run this in Supabase SQL Editor

-- Drop the specific trigger first
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;

-- Now drop the function with CASCADE to remove all dependencies
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- Ensure messages table is clean
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
GRANT ALL ON messages TO anon;
GRANT ALL ON SEQUENCE messages_id_seq TO anon;

-- Test insert should work now
INSERT INTO messages (sender_id, receiver_id, content) VALUES (157, 161, 'SUCCESS - Trigger removed!') ON CONFLICT DO NOTHING;