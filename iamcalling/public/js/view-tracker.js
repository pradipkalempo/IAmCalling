// Industry-level View Tracking Utility - Supabase Integration
// Provides consistent view counting across the entire application

class ViewTracker {
    constructor() {
        this.supabaseUrl = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
        this.sessionId = this.getSessionId();
        this.trackedContent = new Set();
    }

    // Generate or retrieve session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('view_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            sessionStorage.setItem('view_session_id', sessionId);
        }
        return sessionId;
    }

    // Get current user ID (if logged in)
    getCurrentUserId() {
        if (window.globalAuth && window.globalAuth.getCurrentUser) {
            const user = window.globalAuth.getCurrentUser();
            return user ? user.id : null;
        }
        return null;
    }

    // Track view for content (posts or articles) - Direct Supabase
    async trackView(contentId, contentType) {
        const trackKey = `${contentType}:${contentId}`;
        if (this.trackedContent.has(trackKey)) {
            console.log(`⏭️ View already tracked for ${contentType} ${contentId} in this session`);
            return { alreadyTracked: true };
        }

        try {
            const tableName = contentType === 'post' ? 'posts' : 'articles';
            
            // Get current count first
            const currentResponse = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?select=views_count&id=eq.${contentId}`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            
            let currentCount = 0;
            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                currentCount = currentData && currentData[0] ? (currentData[0].views_count || 0) : 0;
            }
            
            // Increment count
            const newCount = currentCount + 1;
            
            // Update with new count
            const updateResponse = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?id=eq.${contentId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    views_count: newCount
                })
            });
            
            if (!updateResponse.ok) {
                throw new Error(`Failed to update view count: ${updateResponse.status}`);
            }
            
            this.trackedContent.add(trackKey);
            
            const result = {
                view_counts: {
                    total_views: newCount,
                    unique_views: newCount,
                    recently_viewed: true
                }
            };
            
            console.log(`📊 View tracked: ${contentType} ${contentId}`, result.view_counts);
            return result;
        } catch (error) {
            console.error('Error tracking view:', error);
            return { error: error.message };
        }
    }

    // Get view counts for single content - Direct Supabase
    async getViewCounts(contentId, contentType) {
        try {
            const tableName = contentType === 'post' ? 'posts' : 'articles';
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?select=views_count&id=eq.${contentId}`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const count = data && data[0] ? data[0].views_count : 0;
            
            return {
                total_views: count,
                unique_views: count,
                last_viewed_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching view counts:', error);
            return { total_views: 0, unique_views: 0, last_viewed_at: null };
        }
    }

    // Get view counts for multiple contents (batch) - Direct Supabase
    async getBatchViewCounts(contentList) {
        try {
            const results = [];
            
            // Group by content type
            const postIds = contentList.filter(item => item.content_type === 'post').map(item => item.content_id);
            const articleIds = contentList.filter(item => item.content_type === 'article').map(item => item.content_id);
            
            // Fetch posts
            if (postIds.length > 0) {
                const postsResponse = await fetch(`${this.supabaseUrl}/rest/v1/posts?select=id,views_count&id=in.(${postIds.join(',')})`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                });
                
                if (postsResponse.ok) {
                    const posts = await postsResponse.json();
                    posts.forEach(post => {
                        results.push({
                            content_id: post.id,
                            content_type: 'post',
                            view_counts: {
                                total_views: post.views_count || 0,
                                unique_views: post.views_count || 0
                            }
                        });
                    });
                }
            }
            
            // Fetch articles
            if (articleIds.length > 0) {
                const articlesResponse = await fetch(`${this.supabaseUrl}/rest/v1/articles?select=id,views_count&id=in.(${articleIds.join(',')})`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                });
                
                if (articlesResponse.ok) {
                    const articles = await articlesResponse.json();
                    articles.forEach(article => {
                        results.push({
                            content_id: article.id,
                            content_type: 'article',
                            view_counts: {
                                total_views: article.views_count || 0,
                                unique_views: article.views_count || 0
                            }
                        });
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.error('Error fetching batch view counts:', error);
            return contentList.map(item => ({
                content_id: item.content_id,
                content_type: item.content_type,
                view_counts: { total_views: 0, unique_views: 0 }
            }));
        }
    }

    // Get trending content - Direct Supabase
    async getTrendingContent(contentType, limit = 10, timeWindow = '7 days') {
        try {
            const tableName = contentType === 'post' ? 'posts' : 'articles';
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?select=id,title,views_count&order=views_count.desc&limit=${limit}`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching trending content:', error);
            return [];
        }
    }

    // Update view count display in UI elements
    updateViewDisplay(contentId, contentType, viewCounts) {
        // Update all elements with matching data attributes
        const viewElements = document.querySelectorAll(`[data-${contentType}-id="${contentId}"][data-view-count]`);
        
        viewElements.forEach(element => {
            const displayType = element.dataset.viewDisplay || 'total'; // 'total' or 'unique'
            const count = displayType === 'unique' ? viewCounts.unique_views : viewCounts.total_views;
            
            // Update the text content while preserving eye icon
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = count;
            } else {
                // Look for span with data-view-count to update only the number
                const countSpan = element.querySelector('span[data-view-count]');
                if (countSpan) {
                    countSpan.textContent = count;
                } else {
                    // Fallback: preserve existing eye icon if present
                    const eyeIcon = element.querySelector('.fa-eye');
                    if (eyeIcon) {
                        element.innerHTML = `${eyeIcon.outerHTML} <span data-view-count>${count}</span> views`;
                    } else {
                        element.textContent = count;
                    }
                }
            }
            
            // Add visual feedback for updates
            this.addUpdateAnimation(element);
        });
    }

    // Add subtle animation when view count updates
    addUpdateAnimation(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.color = '#28a745';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }

    // Auto-track views when content is viewed
    autoTrackContentView(contentId, contentType, triggerElement = null) {
        // Track view immediately
        this.trackView(contentId, contentType).then(result => {
            if (result.view_counts && !result.alreadyTracked) {
                // Update display with new counts
                this.updateViewDisplay(contentId, contentType, result.view_counts);
            }
        });

        // Also track when content becomes visible in viewport (Intersection Observer)
        if (triggerElement) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackView(contentId, contentType);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5 // Trigger when 50% of element is visible
            });
            
            observer.observe(triggerElement);
        }
    }

    // Initialize view tracking for all content on page
    initPageTracking() {
        // Track all content cards/articles when they become visible
        const initTracking = () => {
            // Find all content elements with data attributes
            const contentElements = document.querySelectorAll('[data-post-id], [data-article-id]');
            
            // Collect content for batch loading
            const contentList = [];
            contentElements.forEach(element => {
                const postId = element.dataset.postId;
                const articleId = element.dataset.articleId;
                const contentType = postId ? 'post' : 'article';
                const contentId = postId || articleId;
                
                if (contentId) {
                    contentList.push({
                        content_id: contentId,
                        content_type: contentType
                    });
                    
                    // Auto-track when element becomes visible
                    this.autoTrackContentView(contentId, contentType, element);
                }
            });
            
            // Load initial view counts in batch
            if (contentList.length > 0) {
                this.loadInitialViewCounts(contentList);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTracking);
        } else {
            initTracking();
        }
    }
    
    // Load initial view counts for all content on page
    async loadInitialViewCounts(contentList) {
        try {
            const results = await this.getBatchViewCounts(contentList);
            
            results.forEach(result => {
                this.updateViewDisplay(result.content_id, result.content_type, result.view_counts);
            });
            
            console.log(`📊 Loaded initial view counts for ${results.length} items`);
        } catch (error) {
            console.error('Error loading initial view counts:', error);
        }
    }
    
    // Refresh view counts for currently visible content
    async refreshVisibleViewCounts() {
        const visibleElements = document.querySelectorAll('[data-post-id], [data-article-id]');
        const contentList = [];
        
        visibleElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            // Check if element is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const postId = element.dataset.postId;
                const articleId = element.dataset.articleId;
                const contentType = postId ? 'post' : 'article';
                const contentId = postId || articleId;
                
                if (contentId) {
                    contentList.push({
                        content_id: contentId,
                        content_type: contentType
                    });
                }
            }
        });
        
        if (contentList.length > 0) {
            try {
                const results = await this.getBatchViewCounts(contentList);
                results.forEach(result => {
                    this.updateViewDisplay(result.content_id, result.content_type, result.view_counts);
                });
                console.log(`🔄 Refreshed view counts for ${results.length} visible items`);
            } catch (error) {
                console.error('Error refreshing view counts:', error);
            }
        }
    }
}

// Create global instance and initialize
(function() {
    if (typeof window !== "undefined") {
        // Create the global instance
        window.ViewTracker = new ViewTracker();
        
        // Initialize tracking when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.ViewTracker.initPageTracking();
            });
        } else {
            window.ViewTracker.initPageTracking();
        }
        
        // Periodically update view counts (every 30 seconds)
        setInterval(() => {
            window.ViewTracker.refreshVisibleViewCounts();
        }, 30000);
    }
})();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
    module.exports = ViewTracker;
}