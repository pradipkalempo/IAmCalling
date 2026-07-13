// Global Authentication Manager - Single Source of Truth
class GlobalAuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadUserState();
        this.setupStorageListener();
    }

    // Load user state from localStorage
    loadUserState() {
        try {
            const userData = localStorage.getItem('currentUser');
            const userAuth = localStorage.getItem('userAuth');
            const loginTimestamp = localStorage.getItem('loginTimestamp');
            
            if (userData && userAuth === 'true' && loginTimestamp) {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                console.log('✅ User session restored:', this.currentUser.name || this.currentUser.email);
            } else {
                this.clearUserState();
            }
        } catch (error) {
            console.error('Error loading user state:', error);
            this.clearUserState();
        }
    }

    // Set user login state
    setUser(userData) {
        this.currentUser = userData;
        this.isAuthenticated = true;
        
        // Store with persistent flags
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('userAuth', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        localStorage.setItem('persistentLogin', 'true');
        
        console.log('✅ User logged in persistently:', userData.name || userData.email);
        this.broadcastAuthChange();
        this.updateAuthUI();
        
        // Force immediate UI update across all components
        setTimeout(() => {
            this.updateAuthUI();
            if (window.universalTopBar) {
                window.universalTopBar.updateUserDisplay();
            }
        }, 100);
    }

    // Clear user state
    clearUserState() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear all possible auth keys (do NOT clear iamcalling_uid / uid — used by profile page)
        const authKeys = [
            'currentUser', 'userAuth', 'userData', 'user_data', 
            'authToken', 'userToken', 'auth_token', 'loginTimestamp',
            'iamcalling_current_user', 'topbarUserData', 'persistentLogin'
        ];
        
        authKeys.forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
        
        console.log('🚪 User logged out - all sessions cleared');
        this.broadcastAuthChange();
        this.updateAuthUI();
        
        // Force immediate UI update across all components
        setTimeout(() => {
            this.updateAuthUI();
            if (window.universalTopBar) {
                window.universalTopBar.updateUserDisplay();
            }
        }, 100);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    // Get user display name
    getUserName() {
        if (!this.currentUser) return 'Guest';
        return this.currentUser.name || this.currentUser.full_name || 
               this.currentUser.first_name || 'User';
    }

    // Logout user – project-wide; redirect to home, not login
    logout() {
        this.clearUserState();
        const home = (typeof window.HOME_PAGE !== 'undefined') ? window.HOME_PAGE : '01-index.html';
        window.location.href = home;
    }

    // Listen for storage changes across tabs
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser' || e.key === 'userAuth' || e.key === 'persistentLogin') {
                console.log('🔄 Auth state changed in another tab, syncing...');
                this.loadUserState();
                this.broadcastAuthChange();
                this.updateAuthUI();
            }
        });
        
        // Real-time auth state monitoring every 5 seconds
        setInterval(() => {
            const persistentLogin = localStorage.getItem('persistentLogin');
            const userAuth = localStorage.getItem('userAuth');
            const currentUserData = localStorage.getItem('currentUser');
            
            // If should be logged in but isn't — restore
            if (persistentLogin === 'true' && userAuth === 'true' && currentUserData && !this.isAuthenticated) {
                console.log('🔄 Restoring lost auth state');
                this.loadUserState();
                this.broadcastAuthChange();
                this.updateAuthUI();
            }
            
            // Only clear if we were previously authenticated AND all three flags are gone
            // Avoids wiping sessions that use iamcalling_uid / uid keys instead of persistentLogin
            if (this.isAuthenticated && persistentLogin !== 'true' && userAuth !== 'true' && !currentUserData) {
                console.log('🔄 Clearing invalid auth state');
                this.clearUserState();
            }
        }, 5000);
    }

    // Broadcast auth state changes
    broadcastAuthChange() {
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated: this.isAuthenticated,
                user: this.currentUser
            }
        }));
    }

    // Update auth UI – universal topbar is single source; only trigger topbar update
    updateAuthUI() {
        if (window.universalTopBar && typeof window.universalTopBar.updateUserDisplay === 'function') {
            window.universalTopBar.updateUserDisplay();
        }
    }
}

// Create global instance
window.globalAuth = new GlobalAuthManager();

// Auto-update UI when auth state changes
window.addEventListener('authStateChanged', () => {
    window.globalAuth.updateAuthUI();
});

// Update UI on page load
document.addEventListener('DOMContentLoaded', () => {
    window.globalAuth.updateAuthUI();
});