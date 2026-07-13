import express from 'express';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

function getSB() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

async function loadSub() {
    const { data } = await getSB()
        .from('admin_push_subscriptions')
        .select('subscription')
        .eq('id', 1)
        .single();
    return data?.subscription || null;
}

async function saveSub(subscription) {
    await getSB()
        .from('admin_push_subscriptions')
        .upsert({ id: 1, subscription, updated_at: new Date().toISOString() });
}

// Admin subscribes
router.post('/subscribe', async (req, res) => {
    const { subscription, role } = req.body;
    if (!subscription) return res.status(400).json({ error: 'No subscription' });
    if (role === 'admin') await saveSub(subscription);
    res.json({ ok: true });
});

// Notify admin on purchase
router.post('/notify-admin', async (req, res) => {
    const adminSubscription = await loadSub();
    if (!adminSubscription) return res.json({ ok: false, reason: 'Admin not subscribed' });

    const { planName, userName, price } = req.body;
    const payload = JSON.stringify({
        title: '🛒 New Purchase Request!',
        body: `${userName} wants to buy "${planName}" — ₹${price}`,
        tag: 'purchase',
        icon: '/images/dread-emperor.png',
        data: { url: '/43-purchase-admin.html' }
    });

    try {
        await webpush.sendNotification(adminSubscription, payload);
        res.json({ ok: true });
    } catch (err) {
        if (err.statusCode === 410) await saveSub(null); // subscription expired
        res.status(500).json({ error: err.message });
    }
});

// Expose VAPID public key
router.get('/vapid-public-key', (req, res) => {
    res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

export default router;
