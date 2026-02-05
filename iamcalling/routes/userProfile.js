import express from 'express';
import UserProfileService from '../services/userProfileService.js';

const router = express.Router();

// Initialize with Supabase client (will be injected)
let profileService;

// Middleware to initialize service with Supabase client
router.use((req, res, next) => {
    if (!profileService && req.supabase) {
        profileService = new UserProfileService(req.supabase);
    }
    next();
});

// Get user's articles and posts
router.get('/articles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userContent = await profileService.getUserArticles(userId);
        res.json({ success: true, data: userContent });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await profileService.getUserStats(userId);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user profile
router.put('/update/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const result = await profileService.updateUserProfile(userId, updates);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;