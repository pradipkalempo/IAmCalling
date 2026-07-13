-- Add bio, location, and website fields to users table
-- Run this in your Supabase SQL editor

-- Add bio column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add website column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add display_name column (if not exists)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index on display_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);

-- Comments for documentation
COMMENT ON COLUMN public.users.bio IS 'User biography/description';
COMMENT ON COLUMN public.users.location IS 'User location (e.g., "New York, USA")';
COMMENT ON COLUMN public.users.website IS 'User website URL';
COMMENT ON COLUMN public.users.display_name IS 'User display name (can be different from full_name)';
