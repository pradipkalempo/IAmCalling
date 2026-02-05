// Session Manager - Handles proper session cleanup and creation
class SessionManager {
    static clearAllSessions() {
        // Clear all storage types
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear secure storage if available
        if (window.secureStorage) {
            window.secureStorage.clear();
        }
        
        // Clear memory storage
        if (window.memoryStorage) {
            window.memoryStorage = {};
        }
        
        // Clear Supabase auth
        if (window.supabaseAuthManager && window.supabaseAuthManager.supabase) {
            window.supabaseAuthManager.supabase.auth.signOut();
        }
        
        console.log('🧹 All sessions cleared');
    }
    
    static createNewSession(userData) {
        // First clear any existing sessions
        this.clearAllSessions();
        
        // Create new session with timestamp
        const sessionData = {
            ...userData,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        // Store in all available storage methods
        const dataStr = JSON.stringify(sessionData);
        
        localStorage.setItem('currentUser', dataStr);
        localStorage.setItem('userAuth', 'true');
        localStorage.setItem('sessionActive', 'true');
        
        if (window.secureStorage) {
            window.secureStorage.setItem('currentUser', dataStr);
            window.secureStorage.setItem('userAuth', 'true');
        }
        
        console.log('✅ New session created:', sessionData.sessionId);
        return sessionData;
    }
    
    static isValidSession() {
        const userData = localStorage.getItem('currentUser');
        const userAuth = localStorage.getItem('userAuth');
        const sessionActive = localStorage.getItem('sessionActive');
        
        return userData && userAuth === 'true' && sessionActive === 'true';
    }
    
    static getCurrentUser() {
        if (!this.isValidSession()) return null;
        
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            console.error('Failed to parse user data:', e);
            this.clearAllSessions();
            return null;
        }
    }
    
    static updateActivity() {
        if (this.isValidSession()) {
            const userData = this.getCurrentUser();
            if (userData) {
                userData.lastActivity = new Date().toISOString();
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        }
    }
}

// Make available globally
window.SessionManager = SessionManager;

// Update activity on page interactions
document.addEventListener('click', () => SessionManager.updateActivity());
document.addEventListener('keypress', () => SessionManager.updateActivity());