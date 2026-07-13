// Load Current User Profile Photo
(function() {
    'use strict';
    
    function loadCurrentUserPhoto() {
        // Get user from localStorage (set by profile page)
        const userData = localStorage.getItem('currentUser') || localStorage.getItem('userData');
        if (!userData) {
            setTimeout(loadCurrentUserPhoto, 500);
            return;
        }
        
        const currentUser = JSON.parse(userData);
        const photoImg = document.getElementById('current-user-photo');
        const initialDiv = document.getElementById('current-user-initial');
        const nameDiv = document.querySelector('.current-user-name');
        
        if (!photoImg || !initialDiv || !currentUser) return;
        
        // Update name
        if (nameDiv && currentUser.full_name) {
            nameDiv.textContent = currentUser.full_name;
        }
        
        // Load profile photo
        if (currentUser.profile_photo) {
            photoImg.src = currentUser.profile_photo;
            photoImg.style.display = 'block';
            initialDiv.style.display = 'none';
        } else {
            // Use generated avatar
            photoImg.src = `https://i.pravatar.cc/150?u=${currentUser.id}`;
            photoImg.style.display = 'block';
            initialDiv.style.display = 'none';
        }
    }
    
    // Load immediately and retry
    loadCurrentUserPhoto();
    setTimeout(loadCurrentUserPhoto, 1000);
})();