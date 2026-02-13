-- Fix messages table permissions and structure
-- Run this in Supabase SQL Editor

-- Ensure messages table exists with correct structure
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS completely
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO public;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_id, created_at DESC);

-- Test insert (remove after testing)
-- INSERT INTO messages (sender_id, receiver_id, content) VALUES (1, 2, 'Test message');