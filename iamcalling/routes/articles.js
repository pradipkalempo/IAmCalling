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

// Create an article
router.post('/', async (req, res) => {
  try {
    const { title, content, category = 'general', author_name = 'Anonymous' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    // Create article without user_id (set to null like existing articles)
    const { data, error } = await supabase
      .from('articles')
      .insert([{ 
        title, 
        content, 
        category,
        author_name,
        user_id: null,
        published: true,
        visibility: 'public'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Article created successfully', articleId: data.id });
  } catch (error) {
    console.error('Error creating article:', error.message, error);
    res.status(500).json({ error: 'Failed to create article', details: error.message });
  }
});

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

export default router;
