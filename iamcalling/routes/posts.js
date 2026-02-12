import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all posts with pagination and caching
router.get('/', async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('posts')
      .select('id, title, content, author_name, thumbnail_url, views_count, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
    
    // Add cache headers for better performance
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ posts: data || [], total: count, page, limit });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch posts' });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { title, content, author_name, category, challenge_post_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, author_name, category, challenge_post_id, published: true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Post created successfully', postId: data.id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get post by ID with specific columns
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, author_name, thumbnail_url, views_count, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Cache individual posts for longer
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;
