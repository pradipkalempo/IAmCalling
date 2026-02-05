// Aggressive Console Error Suppression
(function() {
    'use strict';
    
    // Completely override console methods to block unwanted messages
    const originalMethods = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };
    
    // Messages to completely suppress
    const suppressPatterns = [
        'Tracking Prevention blocked access to storage',
        'Multiple GoTrueClient instances detected',
        'The message port closed before a response was received',
        'Unchecked runtime.lastError',
        'AudioContext',
        'ScriptProcessorNode is deprecated',
        'Website URL not defined',
        'Zenera AI Plugin',
        'chext_driver',
        'chext_loader',
        'alan_lib',
        'enable_copy',
        'E.C.P is not enabled',
        'Alan: audio worker initialized',
        'Using AudioContext with sampleRate',
        'The AudioContext was not allowed to start'
    ];
    
    function shouldSuppress(message) {
        const msgStr = String(message).toLowerCase();
        return suppressPatterns.some(pattern => 
            msgStr.includes(pattern.toLowerCase())
        );
    }
    
    // Override all console methods
    console.log = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalMethods.log.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalMethods.warn.apply(console, args);
        }
    };
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalMethods.error.apply(console, args);
        }
    };
    
    console.info = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalMethods.info.apply(console, args);
        }
    };
    
    // Block all error events from problematic sources
    window.addEventListener('error', function(e) {
        const errorMessage = e.message || '';
        const filename = e.filename || '';
        
        if (shouldSuppress(errorMessage) || 
            filename.includes('alan_lib') || 
            filename.includes('chext') || 
            filename.includes('enable_copy') ||
            filename.includes('client.js')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    // Block unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        const reason = String(e.reason || '');
        if (shouldSuppress(reason)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    // Disable problematic external libraries
    Object.defineProperty(window, 'alanBtn', {
        value: function() { /* disabled */ },
        writable: false
    });
    
    Object.defineProperty(window, 'alanAudio', {
        value: null,
        writable: false
    });
    
    // Block chrome extension messages
    if (window.chrome && window.chrome.runtime) {
        const originalSendMessage = window.chrome.runtime.sendMessage;
        window.chrome.runtime.sendMessage = function(...args) {
            try {
                return originalSendMessage.apply(this, args);
            } catch (e) {
                // Suppress chrome extension errors
                return;
            }
        };
    }
    
    console.log('🔇 Aggressive error suppression activated');
    
})();