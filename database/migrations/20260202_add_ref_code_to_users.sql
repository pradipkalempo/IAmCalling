-- Add permanent ref_code to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ref_code TEXT UNIQUE;

-- Backfill existing users who don't have a ref_code yet
UPDATE public.users
SET ref_code = 'IAM-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 6))
WHERE ref_code IS NULL;
