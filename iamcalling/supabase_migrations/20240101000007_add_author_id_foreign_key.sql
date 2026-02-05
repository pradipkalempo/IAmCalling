-- Add foreign key constraint between articles.author_id and users.author_id
-- This ensures referential integrity and enables proper article-author relationships

-- First, ensure all existing articles have valid author_id values
-- Update articles with null or invalid author_id to match users.author_id where possible
UPDATE public.articles a
SET author_id = (
    SELECT u.author_id 
    FROM public.users u 
    WHERE u.email = a.author_name 
    LIMIT 1
)
WHERE a.author_id IS NULL OR a.author_id NOT IN (SELECT author_id FROM public.users WHERE author_id IS NOT NULL);

-- Add foreign key constraint
-- This will fail if there are articles with author_id values that don't exist in users.author_id
ALTER TABLE public.articles
ADD CONSTRAINT fk_articles_author_id 
FOREIGN KEY (author_id) 
REFERENCES public.users(author_id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT fk_articles_author_id ON public.articles IS 
'Foreign key linking articles to users via author_id. Both columns use the same author_id value from users table.';
