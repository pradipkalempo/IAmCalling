// Enhanced Storage Fallback System
(function() {
    'use strict';
    
    // Memory storage for when all storage is blocked
    const memoryStore = new Map();
    
    // Test storage availability
    function testStorage(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    const localStorageAvailable = testStorage('localStorage');
    const sessionStorageAvailable = testStorage('sessionStorage');
    
    // Enhanced secure storage with multiple fallbacks
    window.secureStorage = {
        setItem: function(key, value) {
            try {
                // Try localStorage first
                if (localStorageAvailable) {
                    localStorage.setItem(key, value);
                    return;
                }
                
                // Try sessionStorage
                if (sessionStorageAvailable) {
                    sessionStorage.setItem(key, value);
                    return;
                }
                
                // Fallback to memory
                memoryStore.set(key, value);
                
                // Try IndexedDB as last resort
                this.setIndexedDB(key, value);
                
            } catch (e) {
                memoryStore.set(key, value);
            }
        },
        
        getItem: function(key) {
            try {
                // Try localStorage first
                if (localStorageAvailable) {
                    return localStorage.getItem(key);
                }
                
                // Try sessionStorage
                if (sessionStorageAvailable) {
                    return sessionStorage.getItem(key);
                }
                
                // Fallback to memory
                return memoryStore.get(key) || null;
                
            } catch (e) {
                return memoryStore.get(key) || null;
            }
        },
        
        removeItem: function(key) {
            try {
                if (localStorageAvailable) {
                    localStorage.removeItem(key);
                }
                if (sessionStorageAvailable) {
                    sessionStorage.removeItem(key);
                }
                memoryStore.delete(key);
            } catch (e) {
                memoryStore.delete(key);
            }
        },
        
        clear: function() {
            try {
                if (localStorageAvailable) {
                    localStorage.clear();
                }
                if (sessionStorageAvailable) {
                    sessionStorage.clear();
                }
                memoryStore.clear();
            } catch (e) {
                memoryStore.clear();
            }
        },
        
        // IndexedDB fallback for persistent storage
        setIndexedDB: function(key, value) {
            try {
                if (!window.indexedDB) return;
                
                const request = indexedDB.open('SecureStorage', 1);
                request.onupgradeneeded = function(e) {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('data')) {
                        db.createObjectStore('data');
                    }
                };
                
                request.onsuccess = function(e) {
                    const db = e.target.result;
                    const transaction = db.transaction(['data'], 'readwrite');
                    const store = transaction.objectStore('data');
                    store.put(value, key);
                };
            } catch (e) {
                // IndexedDB failed, already in memory
            }
        }
    };
    
    // Override native storage if blocked
    if (!localStorageAvailable) {
        Object.defineProperty(window, 'localStorage', {
            value: window.secureStorage,
            writable: false,
            configurable: false
        });
    }
    
    if (!sessionStorageAvailable) {
        Object.defineProperty(window, 'sessionStorage', {
            value: window.secureStorage,
            writable: false,
            configurable: false
        });
    }
    
    // Suppress tracking prevention messages
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('Tracking Prevention blocked access to storage')) {
            return; // Suppress this specific warning
        }
        originalConsoleWarn.apply(console, args);
    };
    
    console.log('🔒 Enhanced storage fallback system initialized');
    console.log('📊 Storage availability:', {
        localStorage: localStorageAvailable,
        sessionStorage: sessionStorageAvailable,
        memoryFallback: true,
        indexedDB: !!window.indexedDB
    });
    
})();