// Profile Photo Upload Handler with Cloudinary Integration

async function uploadProfilePhoto(file, userId) {
    try {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                try {
                    const base64Image = e.target.result;
                    
                    const response = await fetch('/api/upload/upload-profile-photo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            image: base64Image,
                            userId: userId
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        resolve(data.photoUrl);
                    } else {
                        console.error('Upload failed:', data.error);
                        reject(new Error(data.error || 'Upload failed'));
                    }
                } catch (error) {
                    console.error('Upload request error:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('profilePicture');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (err) {
        currentUser = window.globalAuth?.getCurrentUser() || {};
    }
    
    if (!currentUser || !currentUser.id) {
        alert('Please login first');
        return;
    }
    
    try {
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        let photoUrl = null;
        
        if (fileInput.files && fileInput.files[0]) {
            submitBtn.textContent = 'Uploading photo...';
            photoUrl = await uploadProfilePhoto(fileInput.files[0], currentUser.id);
        }
        
        const formData = {
            bio: document.getElementById('bio').value,
            location: document.getElementById('location').value,
            website: document.getElementById('website').value
        };
        
        if (photoUrl) {
            formData.profile_photo = photoUrl;
        }
        
        const SUPABASE_URL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update profile');
        
        if (photoUrl) {
            currentUser.profile_photo = photoUrl;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        window.location.href = '18-profile.html';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update profile: ' + error.message);
        submitBtn.textContent = 'Save Profile';
        submitBtn.disabled = false;
    }
});

(function loadUserData() {
    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (err) {
        currentUser = window.globalAuth?.getCurrentUser() || {};
    }
    
    if (!currentUser || !currentUser.id) return;
    
    const SUPABASE_URL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
    
    fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${currentUser.id}`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    })
    .then(res => res.json())
    .then(users => {
        if (users && users.length > 0) {
            const user = users[0];
            document.getElementById('firstName').value = user.first_name || '';
            document.getElementById('lastName').value = user.last_name || '';
            document.getElementById('bio').value = user.bio || '';
            document.getElementById('location').value = user.location || '';
            document.getElementById('website').value = user.website || '';
        }
    })
    .catch(err => console.error('Error loading user data:', err));
})();
