-- Add last_seen column to users table
ALTER TABLE users 
ADD COLUMN last_seen timestamptz DEFAULT NOW();

-- Update existing users with current timestamp
UPDATE users 
SET last_seen = NOW() 
WHERE last_seen IS NULL;