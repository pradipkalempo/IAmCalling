-- Messages table already exists - checking and fixing permissions

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- Grant permissions to anonymous users
GRANT SELECT, INSERT, UPDATE ON messages TO anon;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- If using RLS, create policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid()::text = sender_id::text OR 
        auth.uid()::text = receiver_id::text
    );

-- Policy to allow users to insert messages they send
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- Policy to allow users to update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON messages
    FOR UPDATE USING (auth.uid()::text = receiver_id::text);

-- For anonymous access (if needed)
CREATE POLICY "Anonymous can access messages" ON messages
    FOR ALL USING (true);