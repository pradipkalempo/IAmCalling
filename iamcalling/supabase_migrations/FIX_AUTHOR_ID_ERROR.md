# Fix: Foreign Key Constraint Error When Publishing Articles

## Error Message
```
Key (author_id)=(5) is not present in table "users"
insert or update on table "articles" violates foreign key constraint "articles_author_id_fkey"
```

## Problem
The foreign key constraint exists but either:
1. It's pointing to the wrong column (`users.id` instead of `users.author_id`)
2. The `author_id` value fetched doesn't match what's in the database
3. The user doesn't have an `author_id` set in the `users` table

## Solution Steps

### Step 1: Diagnose the Issue
Run the diagnostic script in Supabase SQL Editor:
```sql
-- Run: DIAGNOSE_AUTHOR_ID.sql
```
This will show you:
- Which users have/don't have `author_id`
- What the foreign key constraint is pointing to
- Any invalid `author_id` values in articles

### Step 2: Fix the Foreign Key Constraint
Run the fix script in Supabase SQL Editor:
```sql
-- Run: 20240101000008_fix_author_id_foreign_key.sql
```
This will:
- Drop the incorrect foreign key constraint
- Ensure all users have `author_id` values
- Create the correct foreign key pointing to `users.author_id`

### Step 3: Verify Your User's author_id
Run this query to check your user's `author_id`:
```sql
SELECT id, email, author_id, full_name 
FROM public.users 
WHERE email = 'your-email@example.com';
```

### Step 4: Test Article Creation
After running the fix script, try creating an article again. The code will now:
- Fetch your `author_id` from the users table
- Verify it exists before inserting
- Show a better error message if something is still wrong

## Quick Fix (If You Know Your Email)

If you want to quickly check and fix your user's `author_id`:

```sql
-- Check your user
SELECT id, email, author_id 
FROM public.users 
WHERE email = 'your-email@example.com';

-- If author_id is NULL, assign one
UPDATE public.users 
SET author_id = nextval('author_id_seq') 
WHERE email = 'your-email@example.com' 
AND author_id IS NULL;

-- Verify it was set
SELECT id, email, author_id 
FROM public.users 
WHERE email = 'your-email@example.com';
```

## Alternative: Temporarily Disable Foreign Key (Not Recommended)

If you need to publish articles immediately while fixing the database:

```sql
-- Drop the constraint temporarily
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS fk_articles_author_id;

-- Create articles (they won't have author_id validation)
-- Then re-add the constraint after fixing data
```

## After Fixing

Once the foreign key is correctly set up:
1. All new articles will automatically get the correct `author_id`
2. The profile page will show all articles by that author
3. Data integrity will be maintained

## Still Having Issues?

If the error persists after running the fix script:
1. Check the diagnostic script output
2. Verify your user has an `author_id` in the users table
3. Make sure the foreign key points to `users.author_id` (not `users.id`)
4. Check browser console for the actual `author_id` value being used
