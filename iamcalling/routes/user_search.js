import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import UserSearchService from '../services/userSearchService.js';
const router = express.Router();

const searchService = new UserSearchService();
searchService.initializeCollection().catch(console.error);

// Search users endpoint
router.get('/search', async (req, res) => {
    try {
        const { q: query, limit = 20 } = req.query;
        const users = await searchService.searchUsers(query, parseInt(limit));
        res.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        // Fallback to direct Supabase search
        try {
            const { data: users } = await supabase
                .from('users')
                .select('id, full_name, first_name, last_name, created_at')
                .ilike('full_name', `%${req.query.q || ''}%`)
                .order('created_at', { ascending: false })
                .limit(parseInt(req.query.limit) || 20);
            
            res.json({ users: users || [] });
        } catch (fallbackError) {
            res.status(500).json({ error: 'Search failed' });
        }
    }
});

// Get recent users
router.get('/recent', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const users = await searchService.getRecentUsers(parseInt(limit));
        res.json({ users });
    } catch (error) {
        console.error('Recent users error:', error);
        // Fallback to Supabase
        try {
            const { data: users } = await supabase
                .from('users')
                .select('id, full_name, first_name, last_name, created_at')
                .order('created_at', { ascending: false })
                .limit(parseInt(req.query.limit) || 20);
            
            res.json({ users: users || [] });
        } catch (fallbackError) {
            res.status(500).json({ error: 'Failed to get recent users' });
        }
    }
});

// Index all users (admin endpoint)
router.post('/index-all', async (req, res) => {
    try {
        const { data: users } = await supabase
            .from('users')
            .select('id, full_name, first_name, last_name, created_at');
        
        for (const user of users || []) {
            await searchService.indexUser(user);
        }
        
        res.json({ success: true, indexed: users?.length || 0 });
    } catch (error) {
        console.error('Index users error:', error);
        res.status(500).json({ error: 'Failed to index users' });
    }
});

export default router;