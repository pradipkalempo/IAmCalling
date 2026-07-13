-- Add author_id column to users table
ALTER TABLE public.users 
ADD COLUMN author_id integer UNIQUE;

-- Create sequence for author_id
CREATE SEQUENCE IF NOT EXISTS author_id_seq START 1;

-- Update existing users with auto-generated author_id
UPDATE public.users 
SET author_id = nextval('author_id_seq') 
WHERE author_id IS NULL;

-- Set default for new users
ALTER TABLE public.users 
ALTER COLUMN author_id SET DEFAULT nextval('author_id_seq');

-- Make author_id NOT NULL
ALTER TABLE public.users 
ALTER COLUMN author_id SET NOT NULL;

-- Update articles table to use users.author_id instead of users.id
UPDATE public.articles 
SET author_id = (
  SELECT u.author_id 
  FROM public.users u 
  WHERE u.id = articles.author_id
);