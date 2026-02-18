import express from 'express';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Configure web-push with VAPID keys (only if provided)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@iamcalling.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return res.status(503).json({ error: 'Push notifications not configured' });
    }
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Subscribe to push notifications
router.post('/push-subscribe', async (req, res) => {
    try {
        if (!process.env.VAPID_PUBLIC_KEY) {
            return res.status(503).json({ error: 'Push notifications not configured' });
        }

        const { subscription, userAgent } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }

        // Save subscription to database
        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert({
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                user_agent: userAgent,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'endpoint'
            });

        if (error) throw error;

        res.json({ success: true, message: 'Subscribed to push notifications' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

// Admin: Send push notification to all subscribers
router.post('/admin/send-push', async (req, res) => {
    try {
        if (!process.env.VAPID_PUBLIC_KEY) {
            return res.status(503).json({ error: 'Push notifications not configured' });
        }

        const { title, message, icon } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message required' });
        }

        // Get all subscriptions from database
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) throw error;

        if (!subscriptions || subscriptions.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No subscribers found',
                sent: 0 
            });
        }

        // Prepare notification payload
        const payload = JSON.stringify({
            title: title,
            message: message,
            icon: icon || '📢',
            url: '/'
        });

        // Send to all subscribers
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                try {
                    await webpush.sendNotification(pushSubscription, payload);
                    return { success: true, endpoint: sub.endpoint };
                } catch (error) {
                    // If subscription is invalid, remove it
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await supabase
                            .from('push_subscriptions')
                            .delete()
                            .eq('endpoint', sub.endpoint);
                    }
                    return { success: false, endpoint: sub.endpoint, error: error.message };
                }
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        res.json({
            success: true,
            message: `Push notifications sent`,
            sent: successful,
            failed: failed,
            total: subscriptions.length
        });

    } catch (error) {
        console.error('Error sending push notifications:', error);
        res.status(500).json({ error: 'Failed to send push notifications' });
    }
});

// Test endpoint - send test notification
router.post('/test-push', async (req, res) => {
    try {
        if (!process.env.VAPID_PUBLIC_KEY) {
            return res.status(503).json({ error: 'Push notifications not configured' });
        }

        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint required' });
        }

        // Get subscription from database
        const { data: sub, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('endpoint', endpoint)
            .single();

        if (error || !sub) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        const payload = JSON.stringify({
            title: 'Test Notification',
            message: 'This is a test push notification from IAMCALLING!',
            icon: '🔔',
            url: '/'
        });

        await webpush.sendNotification(pushSubscription, payload);

        res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
