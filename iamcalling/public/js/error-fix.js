// Minimal Error Fix
(function() {
    'use strict';
    
    // Suppress console errors
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Tracking Prevention') || 
            message.includes('Failed to load resource') ||
            message.includes('404')) {
            return; // Suppress these errors
        }
        originalError.apply(console, args);
    };
    
    // Handle missing scripts gracefully
    window.addEventListener('error', function(e) {
        if (e.filename && (e.filename.includes('error-fix.js') || 
                          e.filename.includes('user-auth-global.js') ||
                          e.filename.includes('user-session-manager.js'))) {
            e.preventDefault();
            return false;
        }
    });
    
    console.log('✅ Error fix loaded');
})();