-- Add thumbnail_url column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.thumbnail_url IS 'URL of the post thumbnail image';