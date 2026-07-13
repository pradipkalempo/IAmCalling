-- CRITICAL FIX: Foreign key constraint is pointing to users.id instead of users.author_id
-- This script fixes the constraint to correctly reference users.author_id

-- Step 1: Drop ALL existing foreign key constraints on articles.author_id
DO $$
BEGIN
    -- Drop constraint if it exists (regardless of name)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'articles_author_id_fkey' 
        AND table_name = 'articles'
    ) THEN
        ALTER TABLE public.articles DROP CONSTRAINT articles_author_id_fkey;
        RAISE NOTICE 'Dropped articles_author_id_fkey constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_articles_author_id' 
        AND table_name = 'articles'
    ) THEN
        ALTER TABLE public.articles DROP CONSTRAINT fk_articles_author_id;
        RAISE NOTICE 'Dropped fk_articles_author_id constraint';
    END IF;
    
    -- Drop any other foreign key constraints on author_id
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'articles'
            AND kcu.column_name = 'author_id'
            AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Step 2: Ensure all users have author_id values
UPDATE public.users 
SET author_id = nextval('author_id_seq') 
WHERE author_id IS NULL;

-- Step 3: Verify users.author_id has unique values (required for foreign key)
-- If there are duplicates, we need to fix them first
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT author_id, COUNT(*) as cnt
        FROM public.users
        WHERE author_id IS NOT NULL
        GROUP BY author_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Warning: Found % duplicate author_id values. Fixing...', duplicate_count;
        -- Assign new author_id to duplicates
        UPDATE public.users u1
        SET author_id = nextval('author_id_seq')
        WHERE u1.author_id IN (
            SELECT author_id
            FROM public.users
            WHERE author_id IS NOT NULL
            GROUP BY author_id
            HAVING COUNT(*) > 1
        )
        AND u1.id NOT IN (
            SELECT MIN(id)
            FROM public.users
            GROUP BY author_id
        );
    END IF;
END $$;

-- Step 4: Create the CORRECT foreign key constraint pointing to users.author_id
ALTER TABLE public.articles
ADD CONSTRAINT fk_articles_author_id 
FOREIGN KEY (author_id) 
REFERENCES public.users(author_id)  -- IMPORTANT: references author_id, not id!
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 5: Verify the constraint was created correctly
DO $$
DECLARE
    ref_table TEXT;
    ref_column TEXT;
BEGIN
    SELECT 
        ccu.table_name,
        ccu.column_name
    INTO ref_table, ref_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_name = 'fk_articles_author_id'
        AND tc.table_name = 'articles';
    
    IF ref_table = 'users' AND ref_column = 'author_id' THEN
        RAISE NOTICE '✅ SUCCESS: Foreign key correctly points to users.author_id';
    ELSE
        RAISE EXCEPTION '❌ ERROR: Foreign key points to %.% instead of users.author_id', ref_table, ref_column;
    END IF;
END $$;

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);

-- Step 7: Final verification message
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraint fixed successfully!';
    RAISE NOTICE '   articles.author_id now correctly references users.author_id';
END $$;
