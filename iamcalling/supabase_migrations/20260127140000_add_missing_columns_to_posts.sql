-- Add missing columns to posts table for admin functionality
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'user';

-- Add comments for documentation
COMMENT ON COLUMN public.posts.is_pinned IS 'Whether the post is pinned to the top';
COMMENT ON COLUMN public.posts.priority IS 'Priority level of the post (normal, high, urgent)';
COMMENT ON COLUMN public.posts.allow_comments IS 'Whether comments are allowed on this post';
COMMENT ON COLUMN public.posts.author_role IS 'Role of the author (user, admin, moderator)';