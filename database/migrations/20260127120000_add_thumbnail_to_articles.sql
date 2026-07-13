-- Add thumbnail_url column to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.thumbnail_url IS 'URL of the article thumbnail image';