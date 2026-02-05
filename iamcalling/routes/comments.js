import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Add a comment
router.post('/', async (req, res) => {
  try {
    const { user_id, post_id, content } = req.body;

    if (!user_id || !post_id || !content) {
      return res.status(400).json({ error: 'user_id, post_id, and content are required' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ user_id, post_id, content }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Comment added successfully', commentId: data.id });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
