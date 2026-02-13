-- Remove trigger function blocking message inserts
-- Run this in Supabase SQL Editor

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
DROP TRIGGER IF EXISTS conversation_update_trigger ON messages;
DROP TRIGGER IF EXISTS messages_conversation_trigger ON messages;

-- Drop the function
DROP FUNCTION IF EXISTS update_conversation_timestamp();

-- Now messages table is completely independent
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
GRANT ALL ON messages TO anon;
GRANT ALL ON SEQUENCE messages_id_seq TO anon;

-- Test insert should work now
INSERT INTO messages (sender_id, receiver_id, content) VALUES (157, 161, 'Test after trigger removal') ON CONFLICT DO NOTHING;