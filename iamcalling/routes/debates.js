import express from 'express';
import { createClient } from '@supabase/supabase-js';
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all debate topics
router.get('/topics', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('debates_ai')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching debate topics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start a new debate session
router.post('/sessions', async (req, res) => {
    try {
        const { user_id, debate_id } = req.body;

        const { data, error } = await supabase
            .from('user_debate_sessions')
            .insert([{
                user_id,
                debate_id,
                total_score: 100,
                contradictions_count: 0,
                consistency_level: 'medium'
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error creating debate session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save user response
router.post('/responses', async (req, res) => {
    try {
        const { user_id, debate_id, question_id, answer, contradiction_flag, score } = req.body;

        const { data, error } = await supabase
            .from('user_debate_responses')
            .insert([{
                user_id,
                debate_id,
                question_id,
                answer,
                contradiction_flag,
                score
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error saving debate response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Complete debate session
router.put('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { total_score, contradictions_count, consistency_level, ai_feedback } = req.body;

        const { data, error } = await supabase
            .from('user_debate_sessions')
            .update({
                total_score,
                contradictions_count,
                consistency_level,
                ai_feedback,
                completed: true,
                completed_at: new Date()
            })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error updating debate session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's debate history
router.get('/sessions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('user_debate_sessions')
            .select(`
                *,
                debates_ai (
                    topic,
                    category,
                    difficulty
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching user debate history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;