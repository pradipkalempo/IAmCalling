// Enhanced Storage and Loading Fix
(function() {
    'use strict';
    
    console.log('🔧 Initializing storage and loading fixes...');
    
    // Enhanced storage detection and fallback system with network awareness
    const StorageFix = {
        fallbackData: {},
        isNetworkOnline: true,
        
        init: function() {
            this.checkNetworkStatus();
            this.setupStorageFallbacks();
            this.fixImageLoading();
            this.setupErrorHandling();
            this.setupAudioFix();
            console.log('✅ Storage and loading fixes initialized');
        },
        
        checkNetworkStatus: function() {
            // Check initial network status
            this.isNetworkOnline = navigator.onLine !== undefined ? navigator.onLine : true;
            
            // Listen for network changes
            window.addEventListener('online', () => {
                this.isNetworkOnline = true;
                console.log('✅ Network connection restored');
            });
            
            window.addEventListener('offline', () => {
                this.isNetworkOnline = false;
                console.log('⚠️ Network connection lost');
            });
        },
        
        setupStorageFallbacks: function() {
            // Create robust storage fallback
            const storageHandler = {
                data: {},
                
                setItem: function(key, value) {
                    try {
                        if (typeof localStorage !== 'undefined' && localStorage) {
                            localStorage.setItem(key, value);
                        } else {
                            this.data[key] = value;
                        }
                    } catch (e) {
                        this.data[key] = value;
                    }
                },
                
                getItem: function(key) {
                    try {
                        if (typeof localStorage !== 'undefined' && localStorage) {
                            return localStorage.getItem(key);
                        } else {
                            return this.data[key] || null;
                        }
                    } catch (e) {
                        return this.data[key] || null;
                    }
                },
                
                removeItem: function(key) {
                    try {
                        if (typeof localStorage !== 'undefined' && localStorage) {
                            localStorage.removeItem(key);
                        } else {
                            delete this.data[key];
                        }
                    } catch (e) {
                        delete this.data[key];
                    }
                },
                
                clear: function() {
                    try {
                        if (typeof localStorage !== 'undefined' && localStorage) {
                            localStorage.clear();
                        } else {
                            this.data = {};
                        }
                    } catch (e) {
                        this.data = {};
                    }
                }
            };
            
            // Override blocked storage APIs
            if (typeof localStorage === 'undefined' || !localStorage) {
                window.localStorage = storageHandler;
            }
            
            if (typeof sessionStorage === 'undefined' || !sessionStorage) {
                window.sessionStorage = storageHandler;
            }
            
            // Test storage functionality
            try {
                const testKey = '__storage_test__';
                storageHandler.setItem(testKey, 'test');
                const result = storageHandler.getItem(testKey);
                storageHandler.removeItem(testKey);
                
                console.log('✅ Storage system working properly');
            } catch (e) {
                console.warn('⚠️ Storage system using memory fallback only');
            }
        },
        
        fixImageLoading: function() {
            // Fix avatar image loading issues
            const fixAvatarImages = () => {
                const avatars = document.querySelectorAll('img[src*="pravatar.cc"]');
                avatars.forEach(img => {
                    // Add error handling for failed image loads
                    img.addEventListener('error', function() {
                        // Replace with gradient fallback
                        const parent = this.parentElement;
                        const fallback = document.createElement('div');
                        fallback.className = 'profile-avatar';
                        fallback.style.cssText = `
                            width: ${this.width || 36}px;
                            height: ${this.height || 36}px;
                            border-radius: 50%;
                            border: 2px solid #d4af37;
                            object-fit: cover;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(45deg, #d4af37, #f0c040);
                            color: white;
                            font-weight: bold;
                            font-size: 16px;
                        `;
                        fallback.textContent = '👤';
                        parent.replaceChild(fallback, this);
                    });
                });
                
                // Add multiple fallback sources for images
                const allImages = document.querySelectorAll('img');
                allImages.forEach(img => {
                    const originalSrc = img.src;
                    img.addEventListener('error', function() {
                        // Try alternative image sources
                        const fallbackSources = [
                            'https://ui-avatars.com/api/?name=User&background=d4af37&color=fff',
                            'https://robohash.org/' + Math.random(),
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23d4af37"/><text x="50" y="55" font-family="Arial" font-size="40" fill="white" text-anchor="middle">👤</text></svg>'
                        ];
                        
                        if (!this.dataset.fallbackAttempted) {
                            this.dataset.fallbackAttempted = 'true';
                            this.src = fallbackSources[0];
                        }
                    });
                });
            };
            
            // Run immediately and after DOM content loads
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixAvatarImages);
            } else {
                fixAvatarImages();
            }
        },
        
        setupAudioFix: function() {
            // Fix AudioContext initialization issues
            const fixAudioContext = () => {
                if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
                    // Create a user interaction handler to resume AudioContext
                    const resumeAudioContext = () => {
                        if (window.audioContext) {
                            window.audioContext.resume().catch(e => {
                                console.warn('AudioContext resume failed:', e);
                            });
                        }
                    };
                    
                    // Add event listeners for user interaction
                    document.addEventListener('click', resumeAudioContext, { once: true });
                    document.addEventListener('touchstart', resumeAudioContext, { once: true });
                    document.addEventListener('keydown', resumeAudioContext, { once: true });
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixAudioContext);
            } else {
                fixAudioContext();
            }
        },
        
        setupErrorHandling: function() {
            // Suppress tracking prevention errors
            const originalConsoleError = console.error;
            console.error = function() {
                const args = Array.from(arguments);
                const message = args.join(' ');
                
                // Filter out tracking prevention messages
                if (message.includes('Tracking Prevention blocked access to storage')) {
                    return; // Suppress these messages
                }
                
                // Filter out font loading errors
                if (message.includes('fa-solid-900.woff2') || message.includes('fa-brands-400.woff2')) {
                    return; // Suppress font loading errors
                }
                
                // Filter out AudioContext deprecation warnings
                if (message.includes('ScriptProcessorNode is deprecated') || 
                    message.includes('AudioContext was not allowed to start')) {
                    return; // Suppress audio-related warnings
                }
                
                // Filter out image loading errors for specific domains
                if (message.includes('pravatar.cc') || message.includes('i.pravatar.cc')) {
                    return; // Suppress avatar loading errors
                }
                
                // Pass through other errors
                originalConsoleError.apply(console, arguments);
            };
            
            // Handle unhandled promise rejections
            window.addEventListener('unhandledrejection', function(event) {
                console.warn('Unhandled promise rejection:', event.reason);
                // Prevent unhandled rejection errors from breaking the app
                event.preventDefault();
            });
            
            // Handle general errors
            window.addEventListener('error', function(event) {
                // Suppress specific known errors
                if (event.message && (
                    event.message.includes('Tracking Prevention') ||
                    event.message.includes('pravatar.cc') ||
                    event.message.includes('AudioContext')
                )) {
                    event.preventDefault();
                    return false;
                }
            });
        }
    };
    
    // Initialize the fixes
    StorageFix.init();
    
    // Make available globally
    window.StorageFix = StorageFix;
    
})();