-- Add phone column to users table for phone authentication
-- Run this migration in your Supabase SQL Editor

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE;
        CREATE INDEX idx_users_phone ON users(phone);
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN users.phone IS 'User phone number for authentication (format: +1234567890)';
