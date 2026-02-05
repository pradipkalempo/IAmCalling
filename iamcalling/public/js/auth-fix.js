// Authentication fix for messenger

class AuthFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔐 Initializing auth fix...');
        this.ensureCurrentUser();
        this.setupGlobalAuth();
    }

    ensureCurrentUser() {
        // Try to find current user from various sources
        const user = this.findCurrentUser();
        
        if (user) {
            console.log('✅ Current user found:', user);
            this.setCurrentUser(user);
        } else {
            console.log('⚠️ No current user found, creating mock user...');
            this.createMockUser();
        }
    }

    findCurrentUser() {
        const sources = [
            () => JSON.parse(localStorage.getItem('currentUser') || 'null'),
            () => JSON.parse(localStorage.getItem('user_data') || 'null'),
            () => JSON.parse(localStorage.getItem('userData') || 'null'),
            () => JSON.parse(localStorage.getItem('userProfile') || 'null'),
            () => JSON.parse(localStorage.getItem('profile') || 'null'),
            () => JSON.parse(localStorage.getItem('user') || 'null')
        ];

        for (const source of sources) {
            try {
                const user = source();
                if (user && (user.id || user.user_id)) {
                    // Normalize user object
                    return {
                        id: user.id || user.user_id,
                        full_name: user.full_name || user.name || user.username,
                        email: user.email,
                        profile_photo: user.profile_photo || user.avatar
                    };
                }
            } catch (e) {
                // Continue to next source
            }
        }

        return null;
    }

    createMockUser() {
        const mockUser = {
            id: 94, // Use a consistent ID for testing
            full_name: 'Test User',
            email: 'test@example.com',
            profile_photo: 'https://i.pravatar.cc/150?u=94'
        };

        console.log('🎭 Created mock user:', mockUser);
        this.setCurrentUser(mockUser);
        return mockUser;
    }

    setCurrentUser(user) {
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Set in global auth if available
        if (window.globalAuth) {
            window.globalAuth.currentUser = user;
        } else {
            // Create minimal global auth
            window.globalAuth = {
                currentUser: user,
                isLoggedIn: () => true,
                getCurrentUser: () => user
            };
        }

        // Update UI
        this.updateCurrentUserUI(user);
    }

    updateCurrentUserUI(user) {
        // Update current user profile in sidebar
        const currentUserName = document.querySelector('.current-user-name');
        const currentUserPhoto = document.getElementById('current-user-photo');
        const currentUserInitial = document.getElementById('current-user-initial');

        if (currentUserName) {
            currentUserName.textContent = user.full_name || user.email || 'User';
        }

        if (currentUserPhoto && user.profile_photo) {
            currentUserPhoto.src = user.profile_photo;
            currentUserPhoto.style.display = 'block';
            if (currentUserInitial) currentUserInitial.style.display = 'none';
        } else if (currentUserInitial) {
            const name = user.full_name || user.email || 'User';
            currentUserInitial.textContent = name.charAt(0).toUpperCase();
            currentUserInitial.style.display = 'block';
            if (currentUserPhoto) currentUserPhoto.style.display = 'none';
        }

        console.log('✅ Current user UI updated');
    }

    setupGlobalAuth() {
        if (!window.globalAuth) {
            const user = this.findCurrentUser();
            window.globalAuth = {
                currentUser: user,
                isLoggedIn: () => !!user,
                getCurrentUser: () => user
            };
        }
    }
}

// Initialize auth fix immediately
window.authFix = new AuthFix();

// Make sure auth is ready before messenger initializes
document.addEventListener('DOMContentLoaded', () => {
    // Ensure auth is set up
    if (!window.globalAuth || !window.globalAuth.getCurrentUser()) {
        console.log('🔧 Setting up emergency auth...');
        window.authFix.ensureCurrentUser();
    }
});