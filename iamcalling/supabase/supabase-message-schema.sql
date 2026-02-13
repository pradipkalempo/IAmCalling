-- Supabase Messages Table Schema for Message Persistence and Isolation
-- Run this in Supabase SQL Editor to ensure proper table structure

-- Create messages table with proper isolation
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and isolation queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Row Level Security (RLS) for message isolation
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        auth.uid()::text = sender_id::text OR 
        auth.uid()::text = receiver_id::text
    );

-- Policy: Users can only insert messages as sender
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id::text
    );

-- Policy: Users can only update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read" ON messages
    FOR UPDATE USING (
        auth.uid()::text = receiver_id::text
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your auth setup)
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT USAGE ON SEQUENCE messages_id_seq TO authenticated;