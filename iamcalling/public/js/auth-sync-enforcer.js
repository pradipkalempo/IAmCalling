// Critical Authentication Synchronization Enforcer
// Ensures 100% consistency across all 28 pages

class AuthSyncEnforcer {
    constructor() {
        this.syncInterval = null;
        this.lastAuthState = null;
        this.init();
    }

    init() {
        this.startRealTimeSync();
        this.setupCriticalListeners();
        this.enforceConsistency();
    }

    startRealTimeSync() {
        // Check auth state every 500ms for critical consistency
        this.syncInterval = setInterval(() => {
            this.enforceConsistency();
        }, 500);
    }

    enforceConsistency() {
        const currentState = this.getCurrentAuthState();
        
        // If state changed, force sync everywhere
        if (JSON.stringify(currentState) !== JSON.stringify(this.lastAuthState)) {
            console.log('🔄 Auth state changed, enforcing consistency across all components');
            this.lastAuthState = currentState;
            this.syncAllComponents(currentState);
        }
    }

    getCurrentAuthState() {
        const persistentLogin = localStorage.getItem('persistentLogin');
        const userAuth = localStorage.getItem('userAuth');
        const currentUser = localStorage.getItem('currentUser');
        
        return {
            isLoggedIn: persistentLogin === 'true' && userAuth === 'true' && currentUser,
            userData: currentUser ? JSON.parse(currentUser) : null,
            timestamp: Date.now()
        };
    }

    syncAllComponents(authState) {
        // Sync global auth manager
        if (window.globalAuth) {
            if (authState.isLoggedIn && !window.globalAuth.isLoggedIn()) {
                window.globalAuth.loadUserState();
            } else if (!authState.isLoggedIn && window.globalAuth.isLoggedIn()) {
                window.globalAuth.clearUserState();
            }
        }

        // Sync universal topbar
        if (window.universalTopBar) {
            window.universalTopBar.updateUserDisplay();
        }

        // Broadcast to all listeners
        window.dispatchEvent(new CustomEvent('authSyncEnforced', {
            detail: authState
        }));
    }

    setupCriticalListeners() {
        // Listen for any localStorage changes
        window.addEventListener('storage', (e) => {
            if (e.key && (e.key.includes('user') || e.key.includes('auth') || e.key === 'persistentLogin')) {
                console.log('🚨 Critical auth storage change detected:', e.key);
                setTimeout(() => this.enforceConsistency(), 50);
            }
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('🔄 Page became visible, checking auth consistency');
                this.enforceConsistency();
            }
        });

        // Listen for focus events
        window.addEventListener('focus', () => {
            console.log('🔄 Window focused, enforcing auth consistency');
            this.enforceConsistency();
        });
    }

    // Force immediate sync
    forceSyncNow() {
        this.enforceConsistency();
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Initialize immediately
window.authSyncEnforcer = new AuthSyncEnforcer();

// Also ensure it runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.authSyncEnforcer) {
        window.authSyncEnforcer = new AuthSyncEnforcer();
    }
});

console.log('🛡️ Auth Sync Enforcer loaded - ensuring 100% consistency');