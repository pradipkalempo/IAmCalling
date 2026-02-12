-- Remove unnecessary columns from posts table
ALTER TABLE public.posts 
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS allow_comments,
DROP COLUMN IF EXISTS comments_count,
DROP COLUMN IF EXISTS user_id;

