-- Performance optimization: Add index on created_at for faster sorting
-- Run this in Supabase SQL Editor

-- Add index on created_at column for faster ORDER BY queries
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Add index on views_count for potential future sorting/filtering
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON posts(views_count DESC);

-- Verify indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'posts'
ORDER BY indexname;
