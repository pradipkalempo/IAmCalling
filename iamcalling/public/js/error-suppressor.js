// Error suppression for browser extensions
(function() {
    'use strict';
    
    // Override chrome.runtime if it exists
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        const originalLastError = chrome.runtime.lastError;
        Object.defineProperty(chrome.runtime, 'lastError', {
            get: function() {
                return null; // Always return null to suppress errors
            },
            configurable: true
        });
    }
    
    // Block all console errors containing runtime
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('runtime') || 
            message.includes('lastError') ||
            message.includes('message port') ||
            message.includes('channel closed')) {
            return;
        }
        originalError.apply(console, args);
    };
    
    // Block all error events
    window.addEventListener('error', function(e) {
        if (e.message && (
            e.message.includes('runtime') ||
            e.message.includes('lastError') ||
            e.message.includes('message port') ||
            e.message.includes('channel closed')
        )) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }, true);
})();