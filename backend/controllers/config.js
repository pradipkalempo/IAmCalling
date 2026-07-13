import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Secure config endpoint - only expose public keys
router.get('/config', (req, res) => {
    try {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
        res.json({ supabaseUrl, supabaseAnonKey });
    } catch (error) {
        res.status(500).json({ error: 'Configuration error' });
    }
});

export default router;
