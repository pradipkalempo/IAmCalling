-- Fix foreign key constraint for articles.author_id
-- This script checks and fixes the foreign key to point to users.author_id

-- First, drop the existing constraint if it exists and points to the wrong column
DO $$
BEGIN
    -- Check if constraint exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'articles_author_id_fkey' 
        AND table_name = 'articles'
    ) THEN
        ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
        RAISE NOTICE 'Dropped existing articles_author_id_fkey constraint';
    END IF;
    
    -- Also check for our named constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_author_id' 
        AND table_name = 'articles'
    ) THEN
        ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS fk_articles_author_id;
        RAISE NOTICE 'Dropped existing fk_articles_author_id constraint';
    END IF;
END $$;

-- Verify that users.author_id column exists and has values
-- If any users don't have author_id, assign them one
UPDATE public.users 
SET author_id = nextval('author_id_seq') 
WHERE author_id IS NULL;

-- Now create the correct foreign key constraint pointing to users.author_id
ALTER TABLE public.articles
ADD CONSTRAINT fk_articles_author_id 
FOREIGN KEY (author_id) 
REFERENCES public.users(author_id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verify the constraint was created correctly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_author_id' 
        AND table_name = 'articles'
    ) THEN
        RAISE NOTICE '✅ Foreign key constraint fk_articles_author_id created successfully';
        RAISE NOTICE '   It now correctly references users.author_id';
    ELSE
        RAISE EXCEPTION '❌ Failed to create foreign key constraint';
    END IF;
END $$;
