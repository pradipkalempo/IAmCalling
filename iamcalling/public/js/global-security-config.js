// Global Security Configuration for IAmCalling Platform
// Handles tracking prevention and storage access issues

(function() {
    'use strict';
    
    console.log('🔐 Global Security Config loaded');
    
    // 1. Fix Tracking Prevention Storage Issues
    function initSecureStorage() {
        // Check if we're in a secure context
        const isSecure = window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
        
        if (!isSecure) {
            console.warn('⚠️ Not in secure context - some features may be limited');
        }
        
        // Create fallback storage for tracking prevention
        // Ensure window.secureStorage is always defined
        if (typeof window.secureStorage === 'undefined') {
            window.secureStorage = {
                _memoryStorage: {},
                _storageBlocked: false,
                
                setItem: function(key, value) {
                    try {
                        localStorage.setItem(key, value);
                        return true;
                    } catch (e) {
                        if (!this._storageBlocked) {
                            this._storageBlocked = true;
                        }
                        this._memoryStorage[key] = value;
                        return false;
                    }
                },
                
                getItem: function(key) {
                    try {
                        const value = localStorage.getItem(key);
                        if (value !== null) return value;
                    } catch (e) {
                        this._storageBlocked = true;
                    }
                    return this._memoryStorage[key] || null;
                },
                
                removeItem: function(key) {
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        this._storageBlocked = true;
                    }
                    delete this._memoryStorage[key];
                },
                
                clear: function() {
                    try {
                        localStorage.clear();
                    } catch (e) {
                        this._storageBlocked = true;
                    }
                    this._memoryStorage = {};
                },
                
                isBlocked: function() {
                    return this._storageBlocked;
                }
            };
        }
    }
    
    // 2. Fix API Base URL Detection
    function getApiBaseUrl() {
        // For production (Render)
        if (window.location.hostname.includes('render.com') || 
            window.location.hostname.includes('onrender.com')) {
            return window.location.origin;
        }
        
        // For local development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:1000';
        }
        
        // Default fallback
        return window.location.origin;
    }
    
    // 3. Enhanced Fetch with Error Handling
    window.secureFetch = async function(url, options = {}) {
        const baseUrl = getApiBaseUrl();
        const fullUrl = url.startsWith('/') ? baseUrl + url : url;
        
        console.log('🌐 Secure fetch:', fullUrl);
        
        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error('🚫 Fetch error:', error);
            throw error;
        }
    };
    
    // 4. Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecureStorage);
    } else {
        initSecureStorage();
    }
    
    // 5. Global error handler for unhandled promises
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason?.message || event.reason?.toString() || '';
        
        // Suppress tracking prevention errors
        if (reason.includes('Tracking Prevention') || 
            reason.includes('storage') ||
            reason.includes('localStorage') ||
            reason.includes('sessionStorage')) {
            event.preventDefault();
            return;
        }
        
        console.error('🚫 Unhandled promise rejection:', event.reason);
    });
    
    console.log('✅ Global Security Config initialized');
})();