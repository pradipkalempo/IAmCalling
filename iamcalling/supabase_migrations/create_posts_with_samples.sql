-- Run this in Supabase SQL Editor to add sample posts

-- Create posts table if not exists
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_name TEXT DEFAULT 'Admin',
  thumbnail_url TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Allow public read" ON posts;
CREATE POLICY "Allow public read" ON posts FOR SELECT USING (true);

-- Allow authenticated insert
DROP POLICY IF EXISTS "Allow authenticated insert" ON posts;
CREATE POLICY "Allow authenticated insert" ON posts FOR INSERT WITH CHECK (true);

-- Insert sample posts
INSERT INTO posts (title, content, author_name, thumbnail_url) VALUES
('Welcome to IAMCALLING', 'Develop your critical thinking skills with our interactive platform. Challenge your beliefs and grow intellectually.', 'Pradip Kale', 'https://picsum.photos/seed/welcome/400/250'),
('The Power of Critical Thinking', 'Learn how to analyze information objectively and make better decisions in your daily life.', 'Admin', 'https://picsum.photos/seed/thinking/400/250'),
('Understanding Cognitive Biases', 'Discover the common mental shortcuts that can lead to flawed reasoning and how to overcome them.', 'Admin', 'https://picsum.photos/seed/biases/400/250')
ON CONFLICT DO NOTHING;

-- Verify
SELECT id, title, author_name, created_at FROM posts ORDER BY created_at DESC;
