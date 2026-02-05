-- Grant permissions for existing messages table
-- Run this in Supabase SQL Editor

-- Disable RLS for anonymous access
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Grant full access to anonymous and authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;

-- Grant sequence usage
GRANT USAGE ON SEQUENCE messages_id_seq TO anon;
GRANT USAGE ON SEQUENCE messages_id_seq TO authenticated;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_receiver_time ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_time ON messages(sender_id, created_at DESC);