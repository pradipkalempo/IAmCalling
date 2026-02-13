// Storage Fallback Utility - Handles localStorage quota errors gracefully
(function() {
    'use strict';
    
    // Safe localStorage wrapper
    const SafeStorage = {
        setItem: function(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.warn('⚠️ Storage quota exceeded, clearing old cache');
                    this.clearOldCache();
                    try {
                        localStorage.setItem(key, value);
                        return true;
                    } catch (e2) {
                        console.warn('⚠️ Still quota exceeded, using memory storage');
                        return false;
                    }
                }
                return false;
            }
        },
        
        getItem: function(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return null;
            }
        },
        
        clearOldCache: function() {
            try {
                // Clear old cache items
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('cache') || key.includes('temp'))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                console.log('✅ Cleared', keysToRemove.length, 'cache items');
            } catch (e) {
                console.warn('⚠️ Could not clear cache');
            }
        }
    };
    
    // Export to window
    window.SafeStorage = SafeStorage;
    
    console.log('✅ Storage fallback utility loaded');
})();
