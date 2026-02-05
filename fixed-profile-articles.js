// Fixed user articles loader using author_id relationship
async function loadUserArticles() {
    const articlesContainer = document.getElementById('userArticlesList');
    
    try {
        // Get current user data
        let currentUser = null;
        const sources = ['topbarUserData', 'iamcalling_current_user', 'registeredUser', 'currentUser'];
        
        for (const key of sources) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.email) {
                        currentUser = parsed;
                        break;
                    }
                }
            } catch (e) {}
        }
        
        if (!currentUser || !currentUser.email) {
            articlesContainer.innerHTML = '<div class="no-articles-message">Please login to view your articles</div>';
            return;
        }
        
        console.log('🔍 Looking for user:', currentUser.email);
        
        // First, get user's author_id from users table
        const userResponse = await fetch(`https://gkckyyyaoqsaouemjnxl.supabase.co/rest/v1/users?select=author_id&email=eq.${encodeURIComponent(currentUser.email)}`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk'
            }
        });
        
        const userData = await userResponse.json();
        console.log('👤 User data:', userData);
        
        if (!userData || userData.length === 0 || !userData[0].author_id) {
            articlesContainer.innerHTML = '<div class="no-articles-message">User not found in database. Please contact support.</div>';
            return;
        }
        
        const authorId = userData[0].author_id;
        console.log('🔍 Looking for articles by author_id:', authorId);
        
        // Now get articles by author_id
        const articlesResponse = await fetch(`https://gkckyyyaoqsaouemjnxl.supabase.co/rest/v1/articles?select=*&author_id=eq.${authorId}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk'
            }
        });
        
        const userArticles = await articlesResponse.json();
        console.log('✅ User articles found:', userArticles);
        
        // Update count
        document.getElementById('articles-count').textContent = userArticles.length;
        
        if (userArticles.length === 0) {
            articlesContainer.innerHTML = '<div class="no-articles-message">No articles found. <a href="22-write_article.html" style="color: var(--light-blue);">Write your first article</a></div>';
            return;
        }
        
        // Display articles
        articlesContainer.innerHTML = userArticles.map(article => `
            <div class="article-card" data-article-id="${article.id}">
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">
                    <span class="article-date">${new Date(article.created_at).toLocaleDateString()}</span>
                    <span class="article-status">${article.published ? '✅ Published' : '⏳ Draft'}</span>
                </div>
                <div class="article-content">${article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No content'}</div>
                <div class="article-actions">
                    <button class="delete-btn" onclick="deleteArticle(${article.id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesContainer.innerHTML = '<div class="no-articles-message">Error loading articles.</div>';
    }
}