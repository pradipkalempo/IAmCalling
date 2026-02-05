// Simple article publishing
document.getElementById('articleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('articleTitle').value.trim();
    const htmlContent = quill.root.innerHTML;
    const plainTextContent = quill.getText().trim();
    const challengePostId = document.getElementById('challengePostId').value.trim();
    
    if (!title || plainTextContent.length < 50) {
        alert('Please enter a title and at least 50 characters of content');
        return;
    }
    
    const publishBtn = document.getElementById('publishBtn');
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    
    try {
        const articleData = {
            title: title,
            content: htmlContent,
            plain_text: plainTextContent,
            author_name: 'Narendra Modi',
            category: challengePostId ? 'response' : 'general',
            challenge_post_id: challengePostId || null,
            published: true,
            is_draft: false,
            visibility: 'public'
        };
        
        console.log('📝 Saving article:', articleData);
        
        const response = await fetch('https://gkckyyyaoqsaouemjnxl.supabase.co/rest/v1/articles', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(articleData)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Article saved successfully:', result);
        
        alert('✅ Article published successfully!');
        window.location.href = '01-response-index.html';
        
    } catch (error) {
        console.error('❌ Publishing error:', error);
        alert('❌ Error publishing article: ' + error.message);
        
        publishBtn.disabled = false;
        publishBtn.innerHTML = 'Publish Article <i class="fas fa-paper-plane"></i>';
    }
});