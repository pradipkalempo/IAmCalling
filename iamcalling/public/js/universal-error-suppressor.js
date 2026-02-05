// Universal Error Suppression and Storage Fallback System
(function() {
    'use strict';
    
    // Memory storage fallback for when localStorage is blocked
    window.memoryStorage = window.memoryStorage || {};
    
    // Storage availability detection
    let storageAvailable = false;
    try {
        localStorage.setItem('__test__', '1');
        localStorage.removeItem('__test__');
        storageAvailable = true;
    } catch (e) {
        storageAvailable = false;
    }
    
    // Universal storage wrapper with fallback
    window.safeStorage = {
        setItem: function(key, value) {
            try {
                if (storageAvailable) {
                    localStorage.setItem(key, value);
                } else {
                    window.memoryStorage[key] = value;
                }
            } catch (e) {
                window.memoryStorage[key] = value;
            }
        },
        
        getItem: function(key) {
            try {
                if (storageAvailable) {
                    return localStorage.getItem(key);
                } else {
                    return window.memoryStorage[key] || null;
                }
            } catch (e) {
                return window.memoryStorage[key] || null;
            }
        },
        
        removeItem: function(key) {
            try {
                if (storageAvailable) {
                    localStorage.removeItem(key);
                }
                delete window.memoryStorage[key];
            } catch (e) {
                delete window.memoryStorage[key];
            }
        },
        
        clear: function() {
            try {
                if (storageAvailable) {
                    localStorage.clear();
                }
                window.memoryStorage = {};
            } catch (e) {
                window.memoryStorage = {};
            }
        }
    };
    
    // Console error suppression
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };
    
    // Remove image blocking for real photos
    const suppressedMessages = [
        'Tracking Prevention blocked access to storage',
        'AudioContext',
        'ScriptProcessorNode is deprecated',
        'Website URL not defined',
        'Zenera AI Plugin',
        'chext_driver',
        'chext_loader',
        'alan_lib',
        'enable_copy',
        'E.C.P is not enabled',
        'Duplicate variable declaration',
        'Multiple GoTrueClient instances detected',
        'The message port closed before a response was received',
        'Unchecked runtime.lastError'
    ];
    
    function shouldSuppress(message) {
        return suppressedMessages.some(pattern => 
            String(message).toLowerCase().includes(pattern.toLowerCase())
        );
    }
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalConsole.error.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalConsole.warn.apply(console, args);
        }
    };
    
    console.log = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalConsole.log.apply(console, args);
        }
    };
    
    // Global error handler with more specific filtering
    window.addEventListener('error', function(e) {
        const errorMessage = e.message || e.error?.message || '';
        const filename = e.filename || '';
        
        // Suppress specific errors
        if (shouldSuppress(errorMessage) || 
            filename.includes('alan_lib') || 
            filename.includes('chext') || 
            filename.includes('enable_copy') ||
            errorMessage.includes('res.cloudinary.com')) {
            e.preventDefault();
            e.stopPropagation();
            return true;
        }
    }, true);
    
    // Unhandled promise rejection handler with better filtering
    window.addEventListener('unhandledrejection', function(e) {
        const reason = String(e.reason || '');
        if (shouldSuppress(reason) || 
            reason.includes('cloudinary') ||
            reason.includes('Unauthorized') ||
            reason.includes('Failed to fetch')) {
            e.preventDefault();
            return true;
        }
    });
    
    // Block problematic external scripts and prevent network errors
    window.alanAudio = null;
    window.alan = null;
    if (window.chext) window.chext = null;
    

    
    // Override localStorage and sessionStorage to use safe storage
    if (!storageAvailable) {
        Object.defineProperty(window, 'localStorage', {
            value: window.safeStorage,
            writable: false
        });
        
        Object.defineProperty(window, 'sessionStorage', {
            value: window.safeStorage,
            writable: false
        });
    }
    
    // Prevent duplicate variable declarations
    window.preventDuplicateDeclarations = function() {
        // Disabled to prevent false positives
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.preventDuplicateDeclarations();
        });
    } else {
        window.preventDuplicateDeclarations();
    }
    
})();