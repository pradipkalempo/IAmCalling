// Profile Settings Sync Manager - Updated for Supabase
class ProfileSettingsSync {
    constructor() {
        this.supabase = null;
        this.init();
    }

    async init() {
        // Wait for Supabase to initialize
        await this.waitForSupabase();
        await this.loadCurrentProfile();
        this.setupEventListeners();
    }

    async waitForSupabase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
                if (!window.supabaseClient) {
                    try {
                        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || 'https://gkckyyyaoqsaouemjnxl.supabase.co';
                        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
                        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    } catch (error) {
                        console.error('Error initializing Supabase:', error);
                    }
                }
                
                if (window.supabaseClient) {
                    this.supabase = window.supabaseClient;
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    async loadCurrentProfile() {
        // Get current user from localStorage
        const topbarUserData = localStorage.getItem('topbarUserData');
        const currentUser = localStorage.getItem('currentUser');
        const registeredUser = localStorage.getItem('registeredUser');
        
        let userData = null;
        
        // Try to get user data from localStorage
        if (topbarUserData) {
            try {
                userData = JSON.parse(topbarUserData);
            } catch (e) {
                console.error('Error parsing topbar user data:', e);
            }
        }
        
        if (!userData && currentUser) {
            try {
                userData = JSON.parse(currentUser);
            } catch (e) {
                console.error('Error parsing current user data:', e);
            }
        }
        
        if (!userData && registeredUser) {
            try {
                userData = JSON.parse(registeredUser);
            } catch (e) {
                console.error('Error parsing registered user data:', e);
            }
        }

        // If we have user data, try to load from Supabase
        if (userData && userData.email && this.supabase) {
            try {
                const { data: supabaseUser, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('email', userData.email)
                    .single();
                
                if (!error && supabaseUser) {
                    // Merge Supabase data with local data
                    userData = {
                        ...userData,
                        ...supabaseUser,
                        bio: supabaseUser.bio || userData.bio || '',
                        location: supabaseUser.location || userData.location || '',
                        website: supabaseUser.website || userData.website || ''
                    };
                }
            } catch (error) {
                console.error('Error loading from Supabase:', error);
            }
        }
        
        if (userData) {
            // Populate form fields
            const firstNameField = document.getElementById('firstName');
            const lastNameField = document.getElementById('lastName');
            const displayNameField = document.getElementById('displayName');
            const bioField = document.getElementById('bio');
            const locationField = document.getElementById('location');
            const websiteField = document.getElementById('website');
            
            if (firstNameField) {
                firstNameField.value = userData.first_name || userData.firstName || '';
            }
            
            if (lastNameField) {
                lastNameField.value = userData.last_name || userData.lastName || '';
            }
            
            if (displayNameField) {
                displayNameField.value = userData.display_name || userData.name || userData.full_name || '';
            }
            
            if (bioField) {
                bioField.value = userData.bio || '';
            }
            
            if (locationField) {
                locationField.value = userData.location || '';
            }
            
            if (websiteField) {
                websiteField.value = userData.website || '';
            }
        }
    }

    setupEventListeners() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
    }

    async saveProfile() {
        const displayName = document.getElementById('displayName').value;
        const bio = document.getElementById('bio').value;
        const location = document.getElementById('location').value;
        const website = document.getElementById('website').value;
        const profilePicture = document.getElementById('profilePicture').files[0];
        
        // Get current user
        const topbarUserData = localStorage.getItem('topbarUserData');
        const currentUser = localStorage.getItem('currentUser');
        const registeredUser = localStorage.getItem('registeredUser');
        
        let userData = null;
        if (topbarUserData) {
            try {
                userData = JSON.parse(topbarUserData);
            } catch (e) {}
        }
        if (!userData && currentUser) {
            try {
                userData = JSON.parse(currentUser);
            } catch (e) {}
        }
        if (!userData && registeredUser) {
            try {
                userData = JSON.parse(registeredUser);
            } catch (e) {}
        }
        
        if (!userData || !userData.email) {
            this.showNotification('Error: User not found. Please log in again.', true);
            return;
        }
        
        // Create FormData
        const formData = new FormData();
        formData.append('email', userData.email);
        
        if (displayName) formData.append('displayName', displayName);
        if (bio !== undefined) formData.append('bio', bio);
        if (location !== undefined) formData.append('location', location);
        if (website !== undefined) formData.append('website', website);
        
        // Add file if selected
        if (profilePicture) {
            formData.append('profilePhoto', profilePicture);
            console.log('📸 Uploading new profile photo');
        }
        
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Update failed');
            }
            
            console.log('✅ Profile updated:', result.user);
            
            // Update localStorage
            const updatedData = { ...userData, ...result.user };
            localStorage.setItem('topbarUserData', JSON.stringify(updatedData));
            
            this.showNotification('Profile updated successfully!');
            
            // Reload page to show new photo
            setTimeout(() => window.location.reload(), 1500);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error: ' + error.message, true);
        }
    }

    async saveToSupabase(email, updateData) {
        try {
            // Filter out base64 images before saving to Supabase
            const cleanData = { ...updateData };
            if (cleanData.profile_photo && cleanData.profile_photo.startsWith('data:image')) {
                console.warn('Base64 image detected, skipping profile_photo save. Upload to Cloudinary first.');
                delete cleanData.profile_photo;
            }
            
            if (!this.supabase) await this.waitForSupabase();
            
            if (this.supabase) {
                try {
                    const { data, error } = await this.supabase
                        .from('users')
                        .update(cleanData)
                        .eq('email', email)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    this.updateLocalStorageAndNotify(cleanData);
                    this.showNotification('Profile updated successfully!');
                    return;
                } catch (supabaseError) {
                    console.warn('Supabase client error, trying REST API fallback:', supabaseError);
                }
            }
            
            await this.saveToSupabaseREST(email, cleanData);
            
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            this.showNotification('Error saving profile. Please try again.', true);
        }
    }
    
    async saveToSupabaseREST(email, updateData) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || 'https://gkckyyyaoqsaouemjnxl.supabase.co';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
            
            // Filter out any problematic fields and ensure we only send valid data
            const cleanUpdateData = {};
            Object.keys(updateData).forEach(key => {
                // Only include fields that are not system-managed
                if (key !== 'updated_at' && key !== 'created_at' && updateData[key] !== undefined) {
                    cleanUpdateData[key] = updateData[key];
                }
            });
            
            if (Object.keys(cleanUpdateData).length === 0) {
                throw new Error('No valid fields to update');
            }
            
            console.log('🔄 Updating via REST API:', cleanUpdateData);
            
            // Update using REST API - use PATCH method
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(cleanUpdateData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ REST API Error Response:', errorText);
                
                // Parse error to provide better message
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                    }
                } catch (e) {
                    errorMessage = errorText;
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('✅ Profile updated via REST API:', data);
            
            this.updateLocalStorageAndNotify(updateData);
            this.showNotification('Profile updated successfully!');
            
        } catch (error) {
            console.error('❌ Error saving via REST API:', error);
            const errorMessage = error.message || 'Unknown error';
            
            // Check if it's a column error
            if (errorMessage.includes('column') || errorMessage.includes('PGRST204') || errorMessage.includes('schema cache')) {
                this.showNotification('Error: Database columns may not exist. Please run the SQL migration to add bio, location, website, and display_name columns.', true);
            } else {
                this.showNotification(`Error saving profile: ${errorMessage}`, true);
            }
        }
    }
    
    updateLocalStorageAndNotify(updateData) {
        try {
            const currentData = JSON.parse(localStorage.getItem('topbarUserData') || '{}');
            
            // Don't store base64 images in localStorage to avoid quota issues
            const { profile_photo, ...updatesWithoutPhoto } = updateData;
            const updatedData = { ...currentData, ...updatesWithoutPhoto };
            
            // Only store if profile_photo is a URL, not base64
            if (profile_photo && !profile_photo.startsWith('data:image')) {
                updatedData.profile_photo = profile_photo;
            }
            
            localStorage.setItem('topbarUserData', JSON.stringify(updatedData));
            window.dispatchEvent(new CustomEvent('topbarUserDataUpdated', { detail: updatesWithoutPhoto }));
        } catch (e) {
            console.warn('LocalStorage update failed:', e.message);
            // Continue without localStorage
        }
    }

    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.remove('error');
            if (isError) {
                notification.classList.add('error');
            }
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profileSettingsSync = new ProfileSettingsSync();
    
    // Setup logout button if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear all user data
            localStorage.removeItem('registeredUser');
            localStorage.removeItem('userAuth');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('topbarUserData');
            sessionStorage.removeItem('registeredUser');
            
            // Redirect to login page
            window.location.href = '15-login.html';
        });
    }
});
