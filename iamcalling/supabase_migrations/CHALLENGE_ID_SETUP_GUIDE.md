# Challenge ID Setup Guide

## Problem
Users were entering challenge IDs like "PK01", "PK02" but the verification was failing because the posts table only had a numeric `id` column.

## Solution
Added a `challenge_id` TEXT column to the posts table for custom challenge identifiers.

## Steps to Fix

### 1. Run the Migration
Execute the migration file in Supabase SQL Editor:
```sql
-- File: 20260129_add_challenge_id_to_posts.sql
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS challenge_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_posts_challenge_id ON public.posts(challenge_id);
```

### 2. Assign Challenge IDs to Existing Posts
In Supabase SQL Editor, update your challenge posts with custom IDs:

```sql
-- Example: Assign challenge IDs to your posts
UPDATE posts SET challenge_id = 'PK01' WHERE id = 1;
UPDATE posts SET challenge_id = 'PK02' WHERE id = 2;
UPDATE posts SET challenge_id = 'PK03' WHERE id = 3;

-- Verify
SELECT id, challenge_id, title FROM posts WHERE challenge_id IS NOT NULL;
```

### 3. How It Works Now

**Before:**
- Posts table only had numeric `id` (1, 2, 3...)
- Users entered "PK01" → Query: `id=eq.PK01` → Failed (text vs number mismatch)

**After:**
- Posts table has both `id` (numeric) and `challenge_id` (text)
- Users enter "PK01" → Query: `challenge_id=eq.PK01` → Success ✅

### 4. Creating New Challenge Posts

When creating challenge posts in the admin panel or database:
1. Set a unique `challenge_id` (e.g., "PK04", "PK05")
2. Users can reference this ID when writing response articles
3. The system will verify and auto-categorize based on the challenge post

### 5. Verification Flow

1. User enters challenge ID (e.g., "PK01") in write article form
2. System queries: `posts?challenge_id=eq.PK01`
3. If found: Shows post title, category, author + auto-assigns category
4. If not found: Shows "Challenge ID not found" error

## Example Challenge Post Structure

```json
{
  "id": 1,
  "challenge_id": "PK01",
  "title": "Is Democracy the Best Form of Government?",
  "category": "politics",
  "author_name": "Pradip Kale",
  "content": "Challenge content...",
  "thumbnail_url": "..."
}
```

## Testing

1. Run the migration
2. Assign a challenge_id to a test post: `UPDATE posts SET challenge_id = 'TEST01' WHERE id = 1;`
3. Go to write article page
4. Enter "TEST01" in Challenge Response ID field
5. Click Verify
6. Should show: ✅ Challenge Verified with post details

## Notes

- `challenge_id` is UNIQUE - no duplicate IDs allowed
- `challenge_id` is optional - regular posts don't need it
- Only challenge posts that accept responses need a `challenge_id`
- Format is flexible: "PK01", "CHALLENGE-001", "TEST01", etc.
