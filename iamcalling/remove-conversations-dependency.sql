-- Check and remove conversations dependencies from messages table
-- Run this in Supabase SQL Editor

-- Check for triggers on messages table
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'messages';

-- Check for foreign key constraints
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'messages' AND referenced_table_name IS NOT NULL;

-- Drop any triggers that might reference conversations
DROP TRIGGER IF EXISTS update_conversations_on_message_insert ON messages;
DROP TRIGGER IF EXISTS sync_conversations ON messages;
DROP TRIGGER IF EXISTS messages_conversation_update ON messages;

-- Drop any foreign key constraints to conversations
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_conversations;

-- Ensure messages table is clean and simple
ALTER TABLE messages DROP COLUMN IF EXISTS conversation_id;

-- Grant full permissions again
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
GRANT ALL ON messages TO anon;
GRANT ALL ON SEQUENCE messages_id_seq TO anon;

-- Test direct insert
INSERT INTO messages (sender_id, receiver_id, content) VALUES (999, 888, 'Direct test') ON CONFLICT DO NOTHING;