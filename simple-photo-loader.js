// Simple photo loader for write article page
async function updateUserDisplay() {
    const nameElement = document.getElementById('currentUserName');
    const avatarElement = document.getElementById('currentUserAvatar');
    
    // Hard-code for testing - replace with your actual user email
    const userEmail = 'modi@pmo.com'; // Change this to your user's email
    
    if (nameElement) {
        nameElement.textContent = 'Narendra Modi'; // Change this to your user's name
    }
    
    if (avatarElement) {
        try {
            const response = await fetch(`https://gkckyyyaoqsaouemjnxl.supabase.co/rest/v1/users?select=profile_photo&email=eq.${userEmail}`, {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk'
                }
            });
            
            const users = await response.json();
            if (users && users.length > 0 && users[0].profile_photo) {
                const photo = users[0].profile_photo;
                if (photo.startsWith('data:image/')) {
                    avatarElement.src = photo;
                    avatarElement.style.display = 'block';
                    console.log('✅ Profile photo loaded from Supabase');
                } else {
                    avatarElement.style.display = 'none';
                    console.log('❌ No valid photo in database');
                }
            } else {
                avatarElement.style.display = 'none';
                console.log('❌ No user found or no photo');
            }
        } catch (error) {
            console.error('Error loading photo:', error);
            avatarElement.style.display = 'none';
        }
    }
}