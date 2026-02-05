-- ============================================
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS fk_articles_author_id;

-- Step 2: Create the CORRECT foreign key pointing to users.author_id (not users.id!)
ALTER TABLE public.articles
ADD CONSTRAINT fk_articles_author_id 
FOREIGN KEY (author_id) 
REFERENCES public.users(author_id)  -- This is the key: references author_id, NOT id!
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 3: Verify it worked (check the output)
SELECT 
    'Foreign Key Status' as check_type,
    tc.constraint_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column,
    CASE 
        WHEN ccu.column_name = 'author_id' THEN '✅ CORRECT!'
        ELSE '❌ WRONG - Points to ' || ccu.column_name
    END as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'fk_articles_author_id'
    AND tc.table_name = 'articles';

-- If you see "✅ CORRECT!" in the status column, you're done!
-- Now try creating an article again.
