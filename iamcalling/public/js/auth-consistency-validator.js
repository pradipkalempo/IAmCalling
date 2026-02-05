// Authentication Consistency Validator
// Ensures all 28 pages show identical authentication state

class AuthConsistencyValidator {
    constructor() {
        this.validationInterval = null;
        this.lastValidationState = null;
        this.inconsistencyCount = 0;
        this.init();
    }

    init() {
        this.startValidation();
        this.setupValidationListeners();
        console.log('🛡️ Auth Consistency Validator active');
    }

    startValidation() {
        // Validate every 2 seconds
        this.validationInterval = setInterval(() => {
            this.validateAuthConsistency();
        }, 2000);
    }

    validateAuthConsistency() {
        const currentState = this.getCurrentAuthState();
        
        // Check for inconsistencies
        if (this.hasInconsistency(currentState)) {
            this.inconsistencyCount++;
            console.warn('🚨 Auth inconsistency detected, fixing...', {
                attempt: this.inconsistencyCount,
                state: currentState
            });
            
            this.fixInconsistency(currentState);
        }
        
        this.lastValidationState = currentState;
    }

    getCurrentAuthState() {
        return {
            localStorage: {
                persistentLogin: localStorage.getItem('persistentLogin'),
                userAuth: localStorage.getItem('userAuth'),
                currentUser: localStorage.getItem('currentUser')
            },
            globalAuth: {
                isLoggedIn: window.globalAuth ? window.globalAuth.isLoggedIn() : false,
                user: window.globalAuth ? window.globalAuth.getCurrentUser() : null
            },
            topbar: {
                exists: !!document.querySelector('.universal-topbar'),
                userDisplay: document.getElementById('topbar-user-display')?.innerHTML || 'not found'
            },
            timestamp: Date.now()
        };
    }

    hasInconsistency(state) {
        // Check if localStorage and globalAuth are in sync
        const shouldBeLoggedIn = state.localStorage.persistentLogin === 'true' && 
                                state.localStorage.userAuth === 'true' && 
                                state.localStorage.currentUser;
        
        const globalAuthSaysLoggedIn = state.globalAuth.isLoggedIn;
        
        // Main inconsistency: localStorage says logged in but globalAuth says not
        if (shouldBeLoggedIn && !globalAuthSaysLoggedIn) {
            return true;
        }
        
        // Reverse inconsistency: globalAuth says logged in but localStorage doesn't
        if (!shouldBeLoggedIn && globalAuthSaysLoggedIn) {
            return true;
        }
        
        // Topbar inconsistency: should show user but shows guest
        if (shouldBeLoggedIn && state.topbar.userDisplay.includes('Guest')) {
            return true;
        }
        
        return false;
    }

    fixInconsistency(state) {
        const shouldBeLoggedIn = state.localStorage.persistentLogin === 'true' && 
                                state.localStorage.userAuth === 'true' && 
                                state.localStorage.currentUser;
        
        if (shouldBeLoggedIn) {
            // Force global auth to sync with localStorage
            if (window.globalAuth && !window.globalAuth.isLoggedIn()) {
                console.log('🔧 Forcing global auth to sync with localStorage');
                window.globalAuth.loadUserState();
            }
            
            // Force topbar update
            if (window.universalTopBar) {
                console.log('🔧 Forcing topbar update');
                window.universalTopBar.updateUserDisplay();
            }
            
            // Force auth sync enforcer
            if (window.authSyncEnforcer) {
                console.log('🔧 Forcing auth sync enforcer');
                window.authSyncEnforcer.forceSyncNow();
            }
        } else {
            // Force logout everywhere
            console.log('🔧 Forcing complete logout');
            if (window.globalAuth) {
                window.globalAuth.clearUserState();
            }
        }
        
        // Broadcast fix
        window.dispatchEvent(new CustomEvent('authInconsistencyFixed', {
            detail: { state, timestamp: Date.now() }
        }));
    }

    setupValidationListeners() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('🔍 Page visible, validating auth consistency');
                setTimeout(() => this.validateAuthConsistency(), 100);
            }
        });

        // Listen for storage changes
        window.addEventListener('storage', () => {
            console.log('🔍 Storage changed, validating auth consistency');
            setTimeout(() => this.validateAuthConsistency(), 100);
        });

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            console.log('🔍 Auth state changed, validating consistency');
            setTimeout(() => this.validateAuthConsistency(), 100);
        });
    }

    // Manual validation trigger
    validateNow() {
        this.validateAuthConsistency();
    }

    // Get validation report
    getValidationReport() {
        return {
            inconsistencyCount: this.inconsistencyCount,
            lastValidation: this.lastValidationState,
            isActive: !!this.validationInterval,
            timestamp: Date.now()
        };
    }

    destroy() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
    }
}

// Initialize validator
window.authValidator = new AuthConsistencyValidator();

// Make validation available globally
window.validateAuthNow = () => window.authValidator.validateNow();
window.getAuthReport = () => window.authValidator.getValidationReport();

console.log('✅ Auth Consistency Validator loaded - monitoring all auth states');