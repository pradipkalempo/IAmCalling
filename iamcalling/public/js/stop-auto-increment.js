// Stop Auto-Incrementing Unread Counts
(function() {
    'use strict';
    
    // Only block specific polling requests, not all message requests
    function stopPolling() {
        // Clear all intervals
        for (let i = 1; i < 99999; i++) {
            clearInterval(i);
        }
        
        // Override fetch to prevent only problematic polling
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            // Only block specific polling patterns that cause issues
            if (typeof url === 'string' && url.includes('/messages?') && 
                (url.includes('read=eq.false') || url.includes('limit=1'))) {
                console.log('🚫 Blocked problematic polling request');
                return Promise.resolve(new Response('[]', { status: 200 }));
            }
            
            return originalFetch.apply(this, args);
        };
        
        console.log('🚫 Problematic polling disabled');
    }
    
    function init() {
        stopPolling();
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();