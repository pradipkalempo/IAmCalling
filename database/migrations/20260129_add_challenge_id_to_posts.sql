-- Add challenge_id column to posts table for custom challenge IDs like PK01, PK02
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS challenge_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_challenge_id ON public.posts(challenge_id);

-- Add comment for documentation
COMMENT ON COLUMN public.posts.challenge_id IS 'Custom challenge ID (e.g., PK01, PK02) for challenge posts';

-- Update existing posts with challenge IDs (optional - you can manually set these)
-- Example: UPDATE posts SET challenge_id = 'PK01' WHERE id = 1;
