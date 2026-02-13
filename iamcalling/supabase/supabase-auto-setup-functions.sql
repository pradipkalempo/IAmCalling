-- SQL functions to auto-setup messaging database
-- Run these in Supabase SQL Editor to enable auto-setup

-- Function to create messages table
CREATE OR REPLACE FUNCTION create_messages_table()
RETURNS void AS $$
BEGIN
    -- Create messages table if not exists
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE
    );
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, is_read, sent_at DESC);
    
    -- Disable RLS for anonymous access
    ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON messages TO anon;
    GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
END;
$$ LANGUAGE plpgsql;

-- Function to fix messages table access
CREATE OR REPLACE FUNCTION fix_messages_access()
RETURNS void AS $$
BEGIN
    -- Disable RLS
    ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON messages TO anon;
    GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users can view their messages" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Users can update received messages" ON messages;
    DROP POLICY IF EXISTS "Anonymous can access messages" ON messages;
END;
$$ LANGUAGE plpgsql;

-- Function to setup conversations table
CREATE OR REPLACE FUNCTION create_conversations_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        last_message TEXT,
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user1_id, user2_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
    
    ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
    GRANT SELECT, INSERT, UPDATE ON conversations TO anon;
    GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
END;
$$ LANGUAGE plpgsql;