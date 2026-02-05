import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Like an article
router.post('/', async (req, res) => {
  try {
    const { user_id, article_id } = req.body;

    if (!user_id || !article_id) {
      return res.status(400).json({ error: 'user_id and article_id are required' });
    }

    const { data, error } = await supabase
      .from('likes')
      .insert([{ user_id, article_id }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Article liked successfully', likeId: data.id });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ error: 'Failed to like article' });
  }
});

// Unlike an article
router.delete('/', async (req, res) => {
  try {
    const { user_id, article_id } = req.body;

    if (!user_id || !article_id) {
      return res.status(400).json({ error: 'user_id and article_id are required' });
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user_id)
      .eq('article_id', article_id);

    if (error) throw error;
    res.json({ message: 'Article unliked successfully' });
  } catch (error) {
    console.error('Error unliking article:', error);
    res.status(500).json({ error: 'Failed to unlike article' });
  }
});

export default router;
