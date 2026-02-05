-- Step 1: Add author_id column to users table
ALTER TABLE public.users ADD COLUMN author_id integer;

-- Step 2: Create sequence for auto-generation
CREATE SEQUENCE author_id_seq START 1;

-- Step 3: Update existing users with unique author_id
UPDATE public.users SET author_id = nextval('author_id_seq') WHERE author_id IS NULL;

-- Step 4: Set constraints and default
ALTER TABLE public.users ALTER COLUMN author_id SET DEFAULT nextval('author_id_seq');
ALTER TABLE public.users ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_author_id_unique UNIQUE (author_id);

-- Step 5: Create function to get user articles by author_id
CREATE OR REPLACE FUNCTION get_user_articles(p_author_id integer)
RETURNS TABLE (
  id integer,
  title character varying,
  content text,
  created_at timestamp without time zone,
  likes_count integer,
  comments_count integer,
  views_count integer,
  category text,
  tags text[],
  published boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.content,
    a.created_at,
    a.likes_count,
    a.comments_count,
    a.views_count,
    a.category,
    a.tags,
    a.published
  FROM public.articles a
  WHERE a.author_id = p_author_id 
    AND a.published = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;