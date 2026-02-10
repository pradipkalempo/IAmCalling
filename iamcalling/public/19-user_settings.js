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
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
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
        
        // Prepare update data - only include fields that exist in the database
        // Note: updated_at is managed by database trigger, don't include it
        const updateData = {};
        
        // Only add fields that have values
        if (displayName && displayName.trim()) {
            updateData.display_name = displayName.trim();
        }
        
        if (bio && bio.trim()) {
            updateData.bio = bio.trim();
        } else if (bio === '') {
            updateData.bio = null; // Allow clearing bio
        }
        
        if (location && location.trim()) {
            updateData.location = location.trim();
        } else if (location === '') {
            updateData.location = null; // Allow clearing location
        }
        
        if (website && website.trim()) {
            updateData.website = website.trim();
        } else if (website === '') {
            updateData.website = null; // Allow clearing website
        }
        
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            this.showNotification('No changes to save.', true);
            return;
        }
        
        // Handle profile picture upload if provided
        if (profilePicture) {
            try {
                // Convert to base64 for now (in production, upload to Cloudinary)
                const reader = new FileReader();
                reader.onload = async (e) => {
                    updateData.profile_photo = e.target.result;
                    await this.saveToSupabase(userData.email, updateData);
                };
                reader.readAsDataURL(profilePicture);
                return; // Will continue in reader.onload
            } catch (error) {
                console.error('Error processing profile picture:', error);
            }
        }
        
        // Save to Supabase
        await this.saveToSupabase(userData.email, updateData);
    }

    async saveToSupabase(email, updateData) {
        try {
            // Try to get Supabase client
            if (!this.supabase) {
                await this.waitForSupabase();
            }
            
            // If Supabase client is available, use it
            if (this.supabase) {
                try {
                    const { data, error } = await this.supabase
                        .from('users')
                        .update(updateData)
                        .eq('email', email)
                        .select()
                        .single();
                    
                    if (error) {
                        throw error;
                    }
                    
                    // Success with Supabase client
                    this.updateLocalStorageAndNotify(updateData);
                    return;
                } catch (supabaseError) {
                    console.warn('Supabase client error, trying REST API fallback:', supabaseError);
                }
            }
            
            // Fallback to REST API if client not available
            await this.saveToSupabaseREST(email, updateData);
            
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
            
            // Update localStorage and notify
            this.updateLocalStorageAndNotify(updateData);
            
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
        // Update localStorage
        const topbarUserData = localStorage.getItem('topbarUserData');
        const currentUser = localStorage.getItem('currentUser');
        
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
        
        if (userData) {
            const updatedUserData = {
                ...userData,
                ...updateData,
                name: updateData.display_name || userData.name,
                full_name: updateData.display_name || userData.full_name
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            localStorage.setItem('topbarUserData', JSON.stringify(updatedUserData));
            
            // Trigger global consistency update
            if (window.globalUserConsistency) {
                window.globalUserConsistency.enforceUserConsistency();
            }
            
            // Trigger auth status change event
            window.dispatchEvent(new CustomEvent('authStatusChanged'));
            
            this.showNotification('Profile updated successfully!');
            console.log('✅ Profile updated:', updateData);
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
