// Global Authentication Utility - Supabase Auth Integration
// This file provides consistent authentication across all pages using Supabase

class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Use localStorage authentication for now
        this.fallbackInit();
    }
    
    async checkCurrentSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            
            if (session) {
                console.log('Found active session:', session);
                await this.loadUserProfile(session.user);
                this.updateGlobalUIForLoggedInUser();
            } else {
                console.log('No active session found');
                this.clearUserData();
            }
        } catch (error) {
            console.error('Error checking session:', error);
            this.fallbackInit();
        }
    }
    
    async handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN' && session) {
            console.log('User signed in:', session.user);
            await this.loadUserProfile(session.user);
            this.updateGlobalUIForLoggedInUser();
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            this.clearUserData();
            this.updateGlobalUIForLoggedOutUser();
        }
    }
    
    async loadUserProfile(user) {
        try {
            // Check if user is admin
            if (user.email === 'admin@iamcalling.com') {
                this.currentUser = {
                    id: 'admin',
                    email: user.email,
                    role: 'admin',
                    full_name: 'Administrator',
                    isAdmin: true
                };
            } else {
                // Load regular user profile from users table
                const { data: userProfile, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('email', user.email)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    console.error('Error loading user profile:', error);
                }
                
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    role: 'user',
                    ...userProfile,
                    isAdmin: false
                };
            }
            
            // Store in secure storage for compatibility
            window.secureStorage.setItem('userData', JSON.stringify(this.currentUser));
            window.secureStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            console.log('User profile loaded:', this.currentUser);
            
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    fallbackInit() {
        // Fallback to localStorage-based auth
        if (this.isUserLoggedInFallback()) {
            this.updateGlobalUIForLoggedInUser();
        }
    }

    // Set persistent user session
    setUserSession(token, userData) {
        try {
            window.secureStorage.setItem('userToken', token);
            window.secureStorage.setItem('userData', JSON.stringify(userData));
            window.secureStorage.setItem('loginTimestamp', Date.now().toString());
            
            // Backup in sessionStorage
            try {
                sessionStorage.setItem('userSession', token);
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
            } catch (e) {
                console.warn('SessionStorage blocked, using memory only');
            }
            
            this.updateGlobalUIForLoggedInUser();
            
            // Dispatch auth status change event
            window.dispatchEvent(new CustomEvent('authStatusChanged'));
            return true;
        } catch (error) {
            console.error('❌ Failed to set user session:', error);
            return false;
        }
    }

    // Get authentication token with error handling
    getAuthToken() {
        let localToken = null;
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                localToken = localStorage.getItem('authToken');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        let secureToken = null;
        try {
            if (typeof window !== 'undefined' && window.secureStorage) {
                secureToken = window.secureStorage.getItem('userToken');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        let sessionToken = null;
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage) {
                sessionToken = sessionStorage.getItem('userSession');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        const token = secureToken || localToken || sessionToken || this.getCookieValue('authToken') || null;
        return token;
    }

    // Get user data with error handling
    getUserData() {
        let localUserData = null;
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                localUserData = localStorage.getItem('userData');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        let secureUserData = null;
        try {
            if (typeof window !== 'undefined' && window.secureStorage) {
                secureUserData = window.secureStorage.getItem('userData');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        let sessionUserData = null;
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage) {
                sessionUserData = sessionStorage.getItem('currentUser');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }

        try {
            const userData = secureUserData || localUserData || sessionUserData;
            const parsedData = userData ? JSON.parse(userData) : null;
            return parsedData;
        } catch (error) {
            return null;
        }
    }

    // Check if user is logged in using localStorage
    async isUserLoggedIn() {
        return this.isUserLoggedInFallback();
    }
    
    // Fallback method for localStorage-based auth with error handling
    isUserLoggedInFallback() {
        const token = this.getAuthToken();
        const userData = this.getUserData();
        
        let loginTime = null;
        try {
            if (typeof window !== 'undefined' && window.secureStorage) {
                loginTime = window.secureStorage.getItem('loginTimestamp');
            }
        } catch (e) {
            // Silently handle tracking prevention
        }
        
        if (!loginTime) {
            try {
                if (typeof localStorage !== 'undefined' && localStorage) {
                    loginTime = localStorage.getItem('loginTimestamp');
                }
            } catch (e) {
                // Silently handle tracking prevention
            }
        }

        if (!token || !userData) {
            return false;
        }

        // Check session expiry (30 days)
        if (loginTime) {
            const loginTimestamp = parseInt(loginTime);
            if (isNaN(loginTimestamp)) {
                this.clearUserSession();
                return false;
            }
            
            const daysSinceLogin = (Date.now() - loginTimestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin > 30) {
                this.clearUserSession();
                return false;
            }
        }

        return true;
    }
    
    // Check if current user is admin
    isAdmin() {
        if (this.currentUser) {
            return this.currentUser.isAdmin || (this.currentUser.id === 'admin' && this.currentUser.role === 'admin');
        }
        
        // Fallback check
        try {
            const userData = this.getUserData();
            return userData && ((userData.id === 'admin' && userData.role === 'admin') || 
                              (userData.email === 'admin@iamcalling.com'));
        } catch (error) {
            return false;
        }
    }
    
    // Get current user data
    getCurrentUser() {
        return this.currentUser || this.getUserData();
    }
    
    // Clear user data
    clearUserData() {
        this.currentUser = null;
        window.secureStorage.removeItem('userData');
        window.secureStorage.removeItem('currentUser');
        window.secureStorage.removeItem('userToken');
        window.secureStorage.removeItem('authToken');
        window.secureStorage.removeItem('loginTimestamp');
    }

    // Clear user session (logout)
    async clearUserSession() {
        // Clear all local data
        this.clearUserData();
        
        // Clear sessionStorage
        try {
            sessionStorage.removeItem('userSession');
            sessionStorage.removeItem('currentUser');
        } catch (e) {
            console.warn('SessionStorage not accessible');
        }
        
        // Clear cookies
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        this.updateGlobalUIForLoggedOutUser();
        
        // Dispatch auth status change event
        window.dispatchEvent(new CustomEvent('authStatusChanged'));
    }

    // Update UI for logged-in user across all pages
    updateGlobalUIForLoggedInUser() {
        const userData = this.getCurrentUser();
        if (!userData) return;

        // Hide registration/login prompts
        const registerPrompts = document.querySelectorAll('.register-prompt, .login-prompt, .signup-notice');
        registerPrompts.forEach(element => {
            element.style.display = 'none';
        });

        // Show user info if elements exist
        const userNameElements = document.querySelectorAll('.user-name, .current-user');
        userNameElements.forEach(element => {
            element.textContent = userData.full_name || userData.first_name || userData.name || 'User';
        });

        // Show logout buttons, hide login buttons
        const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
        const logoutButtons = document.querySelectorAll('.logout-btn');
        
        loginButtons.forEach(btn => btn.style.display = 'none');
        logoutButtons.forEach(btn => btn.style.display = 'block');
        
        // Update profile links based on user role
        this.updateProfileLinks();
    }
    
    // Update profile links based on user role
    updateProfileLinks() {
        const profileLinks = document.querySelectorAll('a[href="18-profile.html"]');
        profileLinks.forEach(link => {
            if (this.isAdmin()) {
                link.href = 'admin-profiles.html';
            } else {
                link.href = '18-profile.html';
            }
        });
    }

    // Update UI for logged-out user
    updateGlobalUIForLoggedOutUser() {
        // Show registration/login prompts
        const registerPrompts = document.querySelectorAll('.register-prompt, .login-prompt, .signup-notice');
        registerPrompts.forEach(element => {
            element.style.display = 'block';
        });

        // Show login buttons, hide logout buttons
        const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
        const logoutButtons = document.querySelectorAll('.logout-btn');
        
        loginButtons.forEach(btn => btn.style.display = 'block');
        logoutButtons.forEach(btn => btn.style.display = 'none');

        // Clear user name displays
        const userNameElements = document.querySelectorAll('.user-name, .current-user');
        userNameElements.forEach(element => {
            element.textContent = '';
        });
    }

    // Utility function to get cookie value
    getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Get API base URL
    getApiBaseUrl() {
        const currentPort = window.location.port;
        const currentHost = window.location.hostname;
        
        if (currentPort === '5501') {
            return `http://${currentHost}:1000`;
        }
        
        return window.location.origin;
    }

    // Validate token with server (optional)
    async validateTokenWithServer() {
        const token = this.getAuthToken();
        if (!token) return false;

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/api/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.valid) {
                    // Update user data if provided
                    if (data.user) {
                        window.secureStorage.setItem('userData', JSON.stringify(data.user));
                    }
                    return true;
                }
            }
            
            // Token invalid, clear session
            this.clearUserSession();
            return false;
        } catch (error) {
            console.log('⚠️ Token validation failed:', error.message);
            return true; // Assume valid if server unreachable
        }
    }
}

// Create global instance when DOM and Supabase are ready
function initializeAuthManager() {
    // Wait for Supabase to be available
    if (typeof window !== 'undefined' && window.supabase) {
        window.authManager = new AuthManager();
    } else {
        setTimeout(initializeAuthManager, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthManager);
} else {
    initializeAuthManager();
}

console.log('🔐 Global Authentication Manager initialized');

// Global utility functions for backward compatibility
window.getAuthToken = () => {
    return window.authManager.getAuthToken();
};
window.getUserData = () => {
    return window.authManager.getUserData();
};
window.isUserLoggedIn = async () => {
    return await window.authManager.isUserLoggedIn();
};
window.setUserSession = (token, userData) => {
    return window.authManager.setUserSession(token, userData);
};
window.clearUserSession = async () => {
    return await window.authManager.clearUserSession();
};
window.checkUserLoginStatus = async () => {
    return await window.authManager.isUserLoggedIn();
};
window.isAdmin = () => {
    return window.authManager.isAdmin();
};
window.getCurrentUser = () => {
    return window.authManager.getCurrentUser();
};

// Auto-logout functionality
window.addEventListener('beforeunload', () => {
    // Optional: Extend session on activity
    if (window.authManager.isUserLoggedIn()) {
        localStorage.setItem('lastActivity', Date.now().toString());
    }
});