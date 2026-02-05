// Test creating a post and checking content
const postData = {
    title: 'Test Post for Debugging',
    content: '<div class="admin-code-executable" style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;"><h1>Debug Test Content</h1><p>This is content to test the article detail page</p><script>console.log("Debug script executed");</script></div>',
    category: 'test',
    author_name: 'Debug Admin'
};

console.log('Creating test post...');
console.log('Post data:', postData);

fetch('http://localhost:1000/api/admin/posts', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(postData)
})
.then(res => res.json())
.then(data => {
    console.log('Created post successfully:', data);
    if (data.post && data.post.id) {
        console.log(`Test post created with ID: ${data.post.id}`);
        console.log('You can now test the article detail page with:');
        console.log(`http://localhost:1000/07-article-detail.html?id=${data.post.id}`);
    }
})
.catch(err => console.error('Error creating post:', err));