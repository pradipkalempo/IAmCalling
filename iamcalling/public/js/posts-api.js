// Posts API - Supabase Integration
if (!window.PostsAPI) {
    class PostsAPI {
        static supabaseUrl = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
        static supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';

        static async getOfficialPosts(limit = 10, offset = 0) {
            try {
                const response = await fetch(`${this.supabaseUrl}/rest/v1/posts?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching posts:', error);
                return [];
            }
        }

        static async getPost(id) {
            try {
                const response = await fetch(`${this.supabaseUrl}/rest/v1/posts?select=*&id=eq.${id}`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                return data[0] || null;
            } catch (error) {
                console.error('Error fetching post:', error);
                return null;
            }
        }

        static async createPost(postData) {
            try {
                const response = await fetch(`${this.supabaseUrl}/rest/v1/posts`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating post:', error);
                throw error;
            }
        }
    }

    // Make PostsAPI globally available
    window.PostsAPI = PostsAPI;
}