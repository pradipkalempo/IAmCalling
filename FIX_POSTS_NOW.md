# 🔧 Quick Fix: Posts Not Loading

## Issue
Homepage shows "Unable to Load Posts" - HTTP 502 error

## Root Cause
The `posts` table is empty or doesn't exist in Supabase

## Fix (2 minutes)

### Step 1: Go to Supabase
1. Visit https://supabase.com
2. Open your project
3. Click **SQL Editor** (left sidebar)

### Step 2: Run This SQL
Copy and paste this into SQL Editor:

```sql
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_name TEXT DEFAULT 'Admin',
  thumbnail_url TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read access
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON posts 
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON posts 
  FOR INSERT WITH CHECK (true);

-- Add sample posts
INSERT INTO posts (title, content, author_name) VALUES
('Welcome to IAMCALLING', 'Develop your critical thinking skills with our interactive platform.', 'Pradip Kale'),
('The Power of Critical Thinking', 'Learn how to analyze information objectively.', 'Admin'),
('Understanding Cognitive Biases', 'Discover common mental shortcuts.', 'Admin');
```

### Step 3: Click "Run"

### Step 4: Refresh Your Site
Visit: https://iamcalling.onrender.com

✅ Posts should now load!

---

## Alternative: Check Existing Table

If table exists but is empty:

```sql
-- Check if posts exist
SELECT * FROM posts;

-- If empty, add sample posts
INSERT INTO posts (title, content, author_name) VALUES
('Welcome to IAMCALLING', 'Your first post', 'Admin');
```

---

## Verify

Test these URLs:
- https://iamcalling.onrender.com/api/posts (should return JSON)
- https://iamcalling.onrender.com (should show posts)

---

**File location:** `supabase_migrations/create_posts_with_samples.sql`
