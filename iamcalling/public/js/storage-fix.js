// Minimal Storage Fallback for Tracking Prevention
(function() {
    'use strict';
    
    // Memory storage fallback
    const memoryStorage = {};
    
    // Safe storage wrapper
    const safeStorage = {
        getItem: function(key) {
            try {
                return localStorage.getItem(key) || memoryStorage[key] || null;
            } catch (e) {
                return memoryStorage[key] || null;
            }
        },
        
        setItem: function(key, value) {
            try {
                localStorage.setItem(key, value);
                memoryStorage[key] = value;
            } catch (e) {
                memoryStorage[key] = value;
            }
        },
        
        removeItem: function(key) {
            try {
                localStorage.removeItem(key);
                delete memoryStorage[key];
            } catch (e) {
                delete memoryStorage[key];
            }
        },
        
        clear: function() {
            try {
                localStorage.clear();
            } catch (e) {}
            Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        }
    };
    
    // Replace localStorage if blocked
    if (!window.localStorage || !testStorage()) {
        window.localStorage = safeStorage;
    }
    
    function testStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    console.log('✅ Storage fallback loaded');
})();