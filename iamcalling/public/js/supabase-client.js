// Supabase client configuration for IAMCALLING
// Credentials loaded from server endpoint for security
let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;

// Load configuration from server or injected config.js
async function loadConfig() {
    if (window.APP_CONFIG?.supabaseUrl && window.APP_CONFIG?.supabaseAnonKey) {
        SUPABASE_URL = window.APP_CONFIG.supabaseUrl;
        SUPABASE_ANON_KEY = window.APP_CONFIG.supabaseAnonKey;
        return;
    }

    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const cfg = await response.json();
            SUPABASE_URL = cfg.supabaseUrl || '';
            SUPABASE_ANON_KEY = cfg.supabaseAnonKey || '';
            window.APP_CONFIG = Object.assign(window.APP_CONFIG || {}, cfg);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load config from server:', error);
    }
}

function isSupabaseConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Initialize Supabase client - optimized for speed
async function initializeSupabase() {
    if (window.supabaseClient) return true; // Already initialized
    
    // Load config first
    await loadConfig();
    
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient && isSupabaseConfigured()) {
        try {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to create Supabase client:', error);
            return false;
        }
    }
    return false;
}

// Initialize with error handling
(async () => {
    try {
        await initializeSupabase();
    } catch (e) {
        console.log('Supabase init failed');
    }
})();

// Database operations for posts and articles
class PostsAPI {
    // Create new post using REST API
    static async createPost(postData) {
        try {
            const mappedData = {
                title: postData.title,
                content: postData.content,
                plain_text: postData.content ? postData.content.replace(/<[^>]*>/g, '') : '',
                category: postData.category || null,
                author_name: postData.author || 'Anonymous',
                author_verified: postData.authorVerified || false,
                is_official: postData.isOfficial || false,
                challenge_enabled: postData.challengeEnabled || false,
                challenge_post_id: postData.challengeId || postData.challenge_id || null,
                published: true,
                is_draft: false
            };

            console.log('Creating post with challenge_post_id:', mappedData.challenge_post_id);

            const response = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(mappedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Post created:', data);
            return data[0];
        } catch (error) {
            console.error('Supabase REST API failed:', error);
            throw error;
        }
    }

    // Create new article (user articles go to 'articles' table)
    static async createArticle(articleData) {
        // Ensure supabase is initialized
        if (!window.supabaseClient) initializeSupabase();
        
        // Check if Supabase is properly configured
        if (window.supabaseClient && isSupabaseConfigured()) {
            // Get current authenticated user
            const { data: { user }, error: authErr } = await window.supabaseClient.auth.getUser();
            if (authErr) console.warn('auth.getUser error', authErr);
            
            // Map the articleData to match the articles table schema
            const mappedData = {
                title: articleData.title,
                content: articleData.content,
                plain_text: articleData.plainText || (articleData.content ? articleData.content.replace(/<[^>]*>/g, '') : ''),
                category: articleData.category || null,
                tags: articleData.tags ? (Array.isArray(articleData.tags) ? articleData.tags : articleData.tags.split(',')) : [],
                visibility: articleData.visibility || 'public',
                author_name: articleData.author_name || articleData.author || 'Anonymous',
                author_verified: articleData.authorVerified || false,
                author_role: articleData.authorRole || 'user',
                challenge_post_id: articleData.challengePostId || null,  // Add challenge_post_id column
                published: articleData.published !== undefined ? articleData.published : false,
                is_draft: !articleData.published
            };
            
            // Only set user_id if we have a valid UUID
            if (user && typeof user.id === 'string' && user.id.includes('-')) {
                mappedData.user_id = user.id;
            } else {
                console.warn('No valid auth user id, inserting article without user_id');
            }

            // Fetch and set author_id from users table
            if (user && user.email) {
                try {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('author_id')
                        .eq('email', user.email)
                        .single();
                    
                    if (!userError && userData && userData.author_id) {
                        mappedData.author_id = userData.author_id;
                        console.log('✅ Set author_id:', userData.author_id);
                    } else {
                        console.warn('⚠️ Could not fetch author_id for user:', user.email);
                    }
                } catch (err) {
                    console.warn('⚠️ Error fetching author_id:', err);
                }
            } else if (window.globalAuth && window.globalAuth.isLoggedIn()) {
                // Fallback: try to get author_id from globalAuth
                try {
                    const currentUser = window.globalAuth.getCurrentUser();
                    if (currentUser && currentUser.email) {
                        const { data: userData, error: userError } = await supabase
                            .from('users')
                            .select('author_id')
                            .eq('email', currentUser.email)
                            .single();
                        
                        if (!userError && userData && userData.author_id) {
                            mappedData.author_id = userData.author_id;
                            console.log('✅ Set author_id from globalAuth:', userData.author_id);
                        }
                    }
                } catch (err) {
                    console.warn('⚠️ Error fetching author_id from globalAuth:', err);
                }
            }

            // Remove any undefined values
            Object.keys(mappedData).forEach(key => {
                if (mappedData[key] === undefined) {
                    delete mappedData[key];
                }
            });

            console.log('Inserting article with data:', JSON.stringify(mappedData, null, 2));

            // Use Supabase when configured - save to 'articles' table for user articles
            const { data, error } = await supabase
                .from('articles')
                .insert([mappedData])
                .select()
            if (error) {
                console.error('Supabase insert error:', JSON.stringify(error, null, 2));
                throw error;
            }
            return data[0];
        }
        throw new Error('Supabase not configured. Project uses Supabase storage only.');
    }

    // Get all posts (including unpublished) for admin purposes
    static async getAllPosts(limit = 50, offset = 0) {
        // Ensure supabase is initialized
        if (!window.supabaseClient) initializeSupabase();
        
        if (window.supabaseClient && isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                
                if (error) throw error;
                return data.map(post => ({ ...post, isOfficial: true, postType: 'admin' }));
            } catch (error) {
                console.error('Error fetching all posts from Supabase:', error);
                throw error;
            }
        }
        throw new Error('Supabase not configured. Project uses Supabase storage only.');
    }
    
    // Verify challenge post ID exists (Supabase only)
    static async verifyChallengePostId(challengeId) {
        try {
            if (!window.supabaseClient || !isSupabaseConfigured()) {
                return { valid: false, error: 'Supabase not configured' };
            }
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('challenge_post_id', challengeId)
                .single();
            if (error && error.code !== 'PGRST116') {
                return { valid: false, error: error.message };
            }
            if (data) return { valid: true, post: data };
            return { valid: false, error: 'Challenge post not found' };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Get all published posts from both posts and articles tables - optimized
    static async getPosts(limit = 20, offset = 0) {
        console.log('🚀 getPosts called - optimized combined query');
        
        // Check cache first
        const cacheKey = `combined_posts_${limit}_${offset}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            // Cache for 2 minutes
            if (Date.now() - timestamp < 120000) {
                console.log('📦 Using cached combined posts');
                return data;
            }
        }
        
        // Ensure supabase is initialized
        if (!window.supabaseClient) initializeSupabase();
        
        // Check if Supabase is properly configured
        if (window.supabaseClient && isSupabaseConfigured()) {
            try {
                // Optimized queries - select only needed fields
                const postFields = 'id,title,content,author_name,created_at,challenge_post_id,is_official';
                const articleFields = 'id,title,content,author_name,created_at,category,challenge_post_id';
                
                // Fetch from both tables with limits
                const [postsResult, articlesResult] = await Promise.all([
                    supabase.from('posts').select(postFields).eq('published', true).order('created_at', { ascending: false }).limit(Math.ceil(limit/2)),
                    supabase.from('articles').select(articleFields).eq('published', true).order('created_at', { ascending: false }).limit(Math.ceil(limit/2))
                ]);
                
                const posts = postsResult.data || [];
                const articles = articlesResult.data || [];
                
                // Mark posts as official and articles as user responses
                const officialPosts = posts.map(post => ({ 
                    ...post, 
                    isOfficial: true, 
                    postType: 'official',
                    author: post.author_name,
                    challengeId: post.challenge_post_id
                }));
                const userArticles = articles.map(article => ({ 
                    ...article, 
                    isOfficial: false, 
                    postType: 'user',
                    author: article.author_name,
                    challengeResponseId: article.challenge_post_id
                }));
                
                // Combine and sort by created_at
                const allContent = [...officialPosts, ...userArticles]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, limit);
                
                // Cache the result
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    data: allContent,
                    timestamp: Date.now()
                }));
                
                console.log(`✅ Loaded ${allContent.length} combined posts`);
                return allContent;
            } catch (error) {
                console.error('Error fetching from Supabase:', error);
                throw error;
            }
        }
        throw new Error('Supabase not configured. Project uses Supabase storage only.');
    }
    
    // Ultra-fast official posts with content for thumbnails
    static async getOfficialPosts(limit = 3, offset = 0) {
        const cacheKey = `fast_posts_${limit}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const { data, time } = JSON.parse(cached);
            if (Date.now() - time < 60000) return data; // 1 min cache
        }
        
        // Ensure supabase is initialized
        if (!window.supabaseClient) await initializeSupabase();
        
        // Check if Supabase is properly configured
        if (window.supabaseClient && isSupabaseConfigured()) {
            try {
                // Use the Supabase client for consistency with other methods
                const { data, error } = await window.supabaseClient
                    .from('posts')
                    .select('id,title,author_name,created_at,challenge_post_id,content,thumbnail_url,is_pinned,priority,allow_comments,published,views_count')
                    .eq('published', true)
                    .order('id', { ascending: false })
                    .limit(limit);
            
            if (error) throw error;
            
            const posts = data.map(post => ({ 
                id: post.id,
                title: post.title,
                author: post.author_name || 'Admin',
                created_at: post.created_at,
                challengeId: post.challenge_post_id,
                content: post.content || '',
                thumbnail_url: post.thumbnail_url,
                is_pinned: post.is_pinned,
                priority: post.priority,
                allow_comments: post.allow_comments,
                isOfficial: true,
                views_count: post.views_count || 0
            }));
            
            sessionStorage.setItem(cacheKey, JSON.stringify({ data: posts, time: Date.now() }));
            return posts;
        } catch (error) {
            console.error('Error fetching official posts:', error);
            throw error;
        }
        } else {
            throw new Error('Supabase not configured. Project uses Supabase storage only.');
        }
    }
    
    // Ultra-fast user articles with content for thumbnails
    static async getUserArticles(limit = 3, offset = 0) {
        const cacheKey = `fast_articles_${limit}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const { data, time } = JSON.parse(cached);
            if (Date.now() - time < 60000) return data; // 1 min cache
        }
        
        // Ensure config is loaded
        if (!SUPABASE_URL) await loadConfig();
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,author_name,created_at,challenge_post_id,content,published&published=eq.true&order=created_at.desc&limit=${limit}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const articles = data.map(article => ({ 
                id: article.id,
                title: article.title,
                author: article.author_name || 'User',
                created_at: article.created_at,
                challengeResponseId: article.challenge_post_id,
                content: article.content || '',
                isOfficial: false
            }));
            
            sessionStorage.setItem(cacheKey, JSON.stringify({ data: articles, time: Date.now() }));
            return articles;
        } catch (error) {
            throw error;
        }
    }

    // Ultra-fast single post loading with aggressive timeout (2 seconds) and comprehensive fallback
    static async getPost(id) {
        // Ensure config is loaded
        if (!SUPABASE_URL) await loadConfig();
        
        try {
            const postId = parseInt(id);
            
            // Aggressive timeout - 2 seconds max
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            // Try posts table first with aggressive timeout
            let response = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&id=eq.${postId}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                let data = await response.json();
                if (data && data.length > 0) {
                    return {
                        ...data[0],
                        content_type: 'post',
                        author: data[0].author_name || 'Admin'
                    };
                }
            }
            
            // Try articles table with aggressive timeout
            const articleController = new AbortController();
            const articleTimeoutId = setTimeout(() => articleController.abort(), 2000);
            
            response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=*&id=eq.${postId}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                signal: articleController.signal
            });
            
            clearTimeout(articleTimeoutId);
            
            if (response.ok) {
                let data = await response.json();
                if (data && data.length > 0) {
                    return {
                        ...data[0],
                        content_type: 'article',
                        author: data[0].author_name || 'User'
                    };
                }
            }
            
            throw new Error(`Content not found`);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`⚠️ Supabase request timeout for post ${id} (2s limit)`);
            } else {
                console.warn(`⚠️ Supabase request failed for post ${id}:`, error.message);
            }
            
            // Return comprehensive fallback data with loading indicator
            return {
                id: parseInt(id),
                title: 'Content Loading...',
                content: `
                    <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin: 20px 0;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                        <h2 style="margin: 0 0 15px 0; font-size: 24px;">Content Loading</h2>
                        <p style="margin: 0 0 20px 0; opacity: 0.9;">Please wait while we load this content...</p>
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite;"></div>
                    </div>
                    <style>
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    </style>
                `,
                author: 'System',
                created_at: new Date().toISOString(),
                content_type: 'post',
                views_count: 0,
                allow_comments: true,
                is_official: true
            };
        }
    }

    // Like/unlike post or article (universal)
    static async toggleLike(contentId, userId, contentType = 'post') {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('article_likes')
            .select('id')
            .eq('content_id', contentId)
            .eq('user_id', userId)
            .eq('content_type', contentType)
            .single()

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('article_likes')
                .delete()
                .eq('content_id', contentId)
                .eq('user_id', userId)
                .eq('content_type', contentType)
            
            if (error) throw error
            return { liked: false }
        } else {
            // Like
            const { error } = await supabase
                .from('article_likes')
                .insert([{ content_id: contentId, user_id: userId, content_type: contentType }])
            
            if (error) throw error
            return { liked: true }
        }
    }

    // Add comment to post or article (universal)
    static async addComment(contentId, userId, content, contentType = 'post') {
        const { data, error } = await supabase
            .from('comments')
            .insert([{
                content_id: contentId,
                user_id: userId,
                content: content,
                content_type: contentType
            }])
            .select()
        
        if (error) throw error
        return data[0]
    }

    // Track view for post or article (universal)
    static async trackView(contentId, userId = null, ipAddress = null, contentType = 'post') {
        const { error } = await supabase
            .from('article_views')
            .insert([{
                content_id: contentId,
                user_id: userId,
                ip_address: ipAddress,
                content_type: contentType
            }])
        
        // Don't throw error for views tracking
        if (error) console.warn('View tracking failed:', error)
    }

    // Submit challenge response
    static async submitChallengeResponse(originalPostId, responsePostId, userId) {
        const { data, error } = await supabase
            .from('challenge_responses')
            .insert([{
                original_post_id: originalPostId,
                response_post_id: responsePostId,
                user_id: userId
            }])
            .select()
        
        if (error) throw error
        return data[0]
    }

    // Delete post by ID (admin functionality) – Supabase only
    static async deletePost(postId) {
        if (!window.supabaseClient || !isSupabaseConfigured()) {
            throw new Error('Supabase not configured. Project uses Supabase storage only.');
        }
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) throw error;
        return true;
    }

    // Update post by ID (admin functionality)
    static async updatePost(postId, postData) {
        // Check if Supabase is properly configured
        if (window.supabaseClient && isSupabaseConfigured()) {
            // Map the postData to match the enhanced posts table schema
            const mappedData = {
                title: postData.title,
                content: postData.content,
                plain_text: postData.content ? postData.content.replace(/<[^>]*>/g, '') : '', // Extract plain text from HTML
                category: postData.category || null,
                tags: postData.tags ? (Array.isArray(postData.tags) ? postData.tags : postData.tags.split(',')) : [],
                visibility: postData.visibility || 'public',
                allow_comments: postData.allowComments !== undefined ? postData.allowComments : true,
                user_id: postData.user_id || null,
                author_name: postData.author || 'Anonymous',
                author_verified: postData.authorVerified || false,
                author_role: postData.authorRole || 'user',
                is_official: postData.isOfficial || false,
                challenge_enabled: postData.challengeEnabled || false,
                post_type: postData.postType || 'user',
                published: postData.published !== undefined ? postData.published : false,
                is_draft: !postData.published,
                likes_count: postData.likes_count || 0,
                comments_count: postData.comments_count || 0,
                views_count: postData.views_count || 0
                // created_at and updated_at are auto-generated by the database
                // id is auto-generated by the database
            };

            // Remove any undefined values
            Object.keys(mappedData).forEach(key => {
                if (mappedData[key] === undefined) {
                    delete mappedData[key];
                }
            });

            const { data, error } = await supabase
                .from('posts')
                .update(mappedData)
                .eq('id', postId)
                .select();
            if (error) throw error;
            return data[0];
        }
        throw new Error('Supabase not configured. Project uses Supabase storage only.');
    }
}

// Export for use in other files
// Add ArticlesAPI as alias for backward compatibility
window.ArticlesAPI = {
    createArticle: PostsAPI.createArticle,
    getUserArticles: PostsAPI.getUserArticles
};

window.PostsAPI = PostsAPI;

// Ensure supabase is globally available
if (window.supabaseClient) {
    window.supabase = window.supabaseClient;
}
