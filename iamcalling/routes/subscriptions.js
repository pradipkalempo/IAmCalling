import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { user_id, type, status } = req.body;

    if (!user_id || !type) {
      return res.status(400).json({ error: 'user_id and type are required' });
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ user_id, type, status: status !== undefined ? status : true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Subscription successful', subscriptionId: data.id });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { user_id, type } = req.body;

    if (!user_id || !type) {
      return res.status(400).json({ error: 'user_id and type are required' });
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user_id)
      .eq('type', type);

    if (error) throw error;
    res.json({ message: 'Unsubscribe successful' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Send notification (mock implementation)
router.post('/notify', async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // In a real implementation, you would send push notifications here
    // For now, we'll just return success
    console.log('Notification would be sent:', { title, body });

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;
