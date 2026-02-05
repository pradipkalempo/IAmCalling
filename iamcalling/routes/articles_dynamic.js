import express from 'express';
import { supabase, query } from '../database/supabaseClient.js';

const router = express.Router();

// Get all articles with real counts
router.get('/', async (req, res) => {
    try {
        // Get articles with author info and real counts
        const { data: articles, error } = await supabase
            .from('articles')
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    email,
                    ideology
                ),
                article_likes (count),
                article_comments (count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Process articles to add real counts
        const processedArticles = articles.map(article => ({
            ...article,
            like_count: article.article_likes?.length || 0,
            comment_count: article.article_comments?.length || 0,
            author: article.users
        }));

        res.json(processedArticles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Create new article
router.post('/', async (req, res) => {
    try {
        const { title, content, category, user_id } = req.body;

        if (!title || !content || !user_id) {
            return res.status(400).json({ error: 'Title, content, and user_id are required' });
        }

        const { data, error } = await supabase
            .from('articles')
            .insert([{
                title,
                content,
                category: category || 'general',
                user_id,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ 
            message: 'Article created successfully', 
            article: data 
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// Get single article with comments
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get article with author info
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    email,
                    ideology
                )
            `)
            .eq('id', id)
            .single();

        if (articleError) throw articleError;

        // Get comments for this article
        const { data: comments, error: commentsError } = await supabase
            .from('article_comments')
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    ideology
                )
            `)
            .eq('article_id', id)
            .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        // Get like count
        const { count: likeCount, error: likeError } = await supabase
            .from('article_likes')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', id);

        if (likeError) throw likeError;

        res.json({
            ...article,
            author: article.users,
            comments: comments || [],
            like_count: likeCount || 0,
            comment_count: comments?.length || 0
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Like an article
router.post('/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if already liked
        const { data: existingLike } = await supabase
            .from('article_likes')
            .select('id')
            .eq('article_id', id)
            .eq('user_id', user_id)
            .single();

        if (existingLike) {
            // Unlike
            await supabase
                .from('article_likes')
                .delete()
                .eq('article_id', id)
                .eq('user_id', user_id);

            res.json({ message: 'Article unliked', liked: false });
        } else {
            // Like
            await supabase
                .from('article_likes')
                .insert([{
                    article_id: id,
                    user_id,
                    created_at: new Date().toISOString()
                }]);

            res.json({ message: 'Article liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Add comment to article
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, user_id } = req.body;

        if (!content || !user_id) {
            return res.status(400).json({ error: 'Content and user_id are required' });
        }

        const { data, error } = await supabase
            .from('article_comments')
            .insert([{
                article_id: id,
                user_id,
                content,
                created_at: new Date().toISOString()
            }])
            .select(`
                *,
                users:user_id (
                    id,
                    full_name,
                    ideology
                )
            `)
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Comment added successfully',
            comment: data
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Get article statistics
router.get('/stats/overview', async (req, res) => {
    try {
        // Get total articles count
        const { count: totalArticles } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true });

        // Get total likes count
        const { count: totalLikes } = await supabase
            .from('article_likes')
            .select('*', { count: 'exact', head: true });

        // Get total comments count
        const { count: totalComments } = await supabase
            .from('article_comments')
            .select('*', { count: 'exact', head: true });

        res.json({
            total_articles: totalArticles || 0,
            total_likes: totalLikes || 0,
            total_comments: totalComments || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;