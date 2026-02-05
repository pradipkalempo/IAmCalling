# Quick Fix: Foreign Key Constraint Error

## The Problem
The foreign key constraint `articles_author_id_fkey` is pointing to `users.id` instead of `users.author_id`. 

- Your `users` table has `id` values: 152, 153, 154, 156, 157
- Your `users` table has `author_id` values: 1, 2, 3, 4, 5
- The code correctly fetches `author_id=5` from `users.author_id`
- But the constraint checks `users.id` (where 5 doesn't exist) ❌

## The Solution

### Step 1: Check Current Constraint (Optional)
Run this in Supabase SQL Editor to see what's wrong:
```sql
-- File: CHECK_FOREIGN_KEY.sql
```
This will show you that the constraint points to `users.id` instead of `users.author_id`.

### Step 2: Fix the Constraint
Run this script in Supabase SQL Editor:
```sql
-- File: 20240101000009_fix_foreign_key_to_author_id.sql
```

This script will:
1. ✅ Drop the incorrect foreign key constraint
2. ✅ Ensure all users have `author_id` values
3. ✅ Fix any duplicate `author_id` values
4. ✅ Create the correct foreign key pointing to `users.author_id`
5. ✅ Verify it was created correctly

### Step 3: Test Article Creation
After running the fix script:
1. Try creating an article again
2. The `author_id` should now be saved correctly
3. Check the `articles` table - `author_id` column should have values (not NULL)

## What Happens After Fix

✅ **Before Fix:**
- Code fetches `author_id=5` from `users.author_id` ✅
- Tries to insert article with `author_id=5` ✅
- Foreign key checks `users.id` for value 5 ❌
- Error: "Key (author_id)=(5) is not present in table users" ❌

✅ **After Fix:**
- Code fetches `author_id=5` from `users.author_id` ✅
- Tries to insert article with `author_id=5` ✅
- Foreign key checks `users.author_id` for value 5 ✅
- Success! Article created with `author_id=5` ✅

## Verification

After running the fix, verify it worked:

```sql
-- Check the constraint now points to author_id
SELECT 
    tc.constraint_name,
    ccu.column_name AS points_to_column
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'fk_articles_author_id'
    AND tc.table_name = 'articles';
```

Should show: `points_to_column = 'author_id'` ✅

## Still Having Issues?

If you still get errors after running the fix:
1. Make sure you ran the complete script (all steps)
2. Check that `users.author_id` has unique values
3. Verify your user has an `author_id` in the users table
4. Check browser console for the actual `author_id` value being used
