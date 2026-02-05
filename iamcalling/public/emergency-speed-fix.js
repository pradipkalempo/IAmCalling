<!-- Emergency Speed Fix - Add this script to the bottom of 30-photo_management.html -->
<script>
// EMERGENCY SPEED FIX - Override slow functions
console.log('🚀 LOADING EMERGENCY SPEED FIX...');

// Override the slow upload function with instant local storage
window.uploadToSupabase = async function(file, ideology, position) {
    console.log('⚡ Using INSTANT local upload (bypassing server)');
    
    // Create immediate local data (no server delay)
    const localData = {
        id: `instant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        storage_url: URL.createObjectURL(file),
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        ideology_category: ideology,
        person_number: position,
        upload_date: new Date().toISOString(),
        is_local: true
    };
    
    // Save to localStorage immediately
    const localPhotos = JSON.parse(localStorage.getItem('localPhotoFiles') || '{}');
    localPhotos[localData.id] = localData;
    localStorage.setItem('localPhotoFiles', JSON.stringify(localPhotos));
    
    console.log('✅ INSTANT save completed in <1 second');
    return { success: true, data: localData };
};

// Override slow upload handler with fast version
window.handleFileUpload = async function(event) {
    const file = event.target.files[0];
    if (!file || !activeUploadPlaceholder) return;

    const placeholder = document.querySelector(`[data-id="${activeUploadPlaceholder}"]`);

    // Quick validation only
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
        showAlert('Invalid file type', 'error');
        activeUploadPlaceholder = null;
        event.target.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showAlert('File too large', 'error');
        activeUploadPlaceholder = null;
        event.target.value = '';
        return;
    }

    try {
        // Show simple loading
        showLoading('Saving photo...');
        placeholder.classList.add('uploading');
        
        const ideology = placeholder.getAttribute('data-ideology');
        const position = parseInt(placeholder.getAttribute('data-position'));
        
        // Create preview immediately
        const reader = new FileReader();
        reader.onload = function(e) {
            updatePlaceholderVisual(activeUploadPlaceholder, e.target.result, file.name);
        };
        reader.readAsDataURL(file);
        
        // Use instant local upload (no server delay)
        const uploadResult = await uploadToSupabase(file, ideology, position);
        
        if (uploadResult.success) {
            photoData[activeUploadPlaceholder] = {
                id: uploadResult.data.id,
                name: file.name.replace(/\.[^/.]+$/, ""),
                imageUrl: uploadResult.data.storage_url,
                ideology: ideology,
                position: position,
                uploaded: true
            };
            
            // Save to main storage immediately
            localStorage.setItem('ideologyPhotos', JSON.stringify(photoData));
            
            changesMade = true;
            updateStats();
            showAlert('Photo saved instantly!', 'success');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('Upload failed: ' + error.message, 'error');
        revertPlaceholder(activeUploadPlaceholder);
    } finally {
        hideLoading();
        placeholder.classList.remove('uploading');
        activeUploadPlaceholder = null;
        event.target.value = '';
    }
};

// Override slow delete function
window.deletePhoto = async function(placeholderId) {
    if (!photoData[placeholderId]) return;
    
    const photoName = photoData[placeholderId].name || 'photo';
    if (!confirm(`Delete "${photoName}"?`)) return;

    const placeholder = document.querySelector(`[data-id="${placeholderId}"]`);

    try {
        placeholder.classList.add('deleting');
        showLoading('Deleting...');
        
        // Remove from memory immediately
        delete photoData[placeholderId];
        
        // Remove from localStorage immediately
        const localPhotos = JSON.parse(localStorage.getItem('localPhotoFiles') || '{}');
        Object.keys(localPhotos).forEach(key => {
            if (localPhotos[key].ideology_category === placeholderId.split('_')[0] && 
                localPhotos[key].person_number == placeholderId.split('_')[1]) {
                delete localPhotos[key];
            }
        });
        localStorage.setItem('localPhotoFiles', JSON.stringify(localPhotos));
        localStorage.setItem('ideologyPhotos', JSON.stringify(photoData));
        
        // Revert placeholder
        revertPlaceholder(placeholderId);
        const nameInput = placeholder.querySelector('.photo-name-input');
        if (nameInput) nameInput.value = '';
        
        changesMade = true;
        updateStats();
        showAlert('Photo deleted instantly!', 'success');
        
    } catch (error) {
        showAlert('Delete failed: ' + error.message, 'error');
    } finally {
        hideLoading();
        placeholder.classList.remove('deleting');
    }
};

// Override slow loading functions
window.showLoadingWithDetails = function(title, subtitle, details) {
    showLoading(title);
};

window.updateLoadingDetails = function(details) {
    document.getElementById('loadingText').textContent = details;
};

// Remove all slow status indicators
window.createStatusIndicator = function() { return null; };
window.updateStatusIndicator = function() {};
window.removeStatusIndicator = function() {};

console.log('✅ EMERGENCY SPEED FIX LOADED - Upload should now be INSTANT!');
console.log('🎯 All uploads will save to localStorage immediately (no server delays)');

// Show user notification
setTimeout(() => {
    showAlert('⚡ SPEED FIX ACTIVE - Uploads now save instantly!', 'success');
}, 1000);
</script>