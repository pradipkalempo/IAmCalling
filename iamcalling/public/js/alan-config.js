// Alan AI Configuration Fix
(function() {
    'use strict';
    
    // Prevent Alan AI initialization errors
    if (typeof window.alanBtn !== 'undefined') {
        try {
            window.alanBtn({
                key: 'your-alan-ai-key-here',
                rootEl: document.getElementById('alan-btn'),
                onCommand: function (commandData) {
                    // Handle Alan AI commands
                },
                onConnectionStatus: function (status) {
                    // Handle connection status
                },
                onButtonState: function (state) {
                    // Handle button state
                }
            });
        } catch (error) {
            console.log('Alan AI initialization skipped');
        }
    }
    
    // Suppress Alan AI related errors
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('Website URL not defined')) {
            e.preventDefault();
            return true;
        }
    });
})();