class UserProfileService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }

    async getUserArticles(userId) {
        try {
            // Get articles from articles table
            const { data: articles, error: articlesError } = await this.supabase
                .from('articles')
                .select('id, title, content, created_at, likes_count, comments_count, views_count, category, published')
                .eq('author_id', userId)
                .order('created_at', { ascending: false });

            if (articlesError) throw articlesError;

            // Get posts from posts table
            const { data: posts, error: postsError } = await this.supabase
                .from('posts')
                .select('id, title, content, created_at, likes_count, comments_count, views_count, category, published, is_official, challenge_id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (postsError) throw postsError;

            return {
                articles: articles || [],
                posts: posts || [],
                totalCount: (articles?.length || 0) + (posts?.length || 0)
            };
        } catch (error) {
            console.error('Error fetching user articles:', error);
            return { articles: [], posts: [], totalCount: 0 };
        }
    }

    async getUserStats(userId) {
        try {
            const userContent = await this.getUserArticles(userId);
            
            const totalLikes = [...userContent.articles, ...userContent.posts]
                .reduce((sum, item) => sum + (item.likes_count || 0), 0);
            
            const totalViews = [...userContent.articles, ...userContent.posts]
                .reduce((sum, item) => sum + (item.views_count || 0), 0);

            return {
                totalArticles: userContent.totalCount,
                totalLikes,
                totalViews,
                publishedArticles: [...userContent.articles, ...userContent.posts]
                    .filter(item => item.published).length
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return { totalArticles: 0, totalLikes: 0, totalViews: 0, publishedArticles: 0 };
        }
    }

    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }
}

export default UserProfileService;