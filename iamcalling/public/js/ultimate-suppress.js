// ULTIMATE CONSOLE SUPPRESSION - IMMEDIATE LOAD
(function() {
    'use strict';
    
    // Completely disable console methods for unwanted messages
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Block ALL these patterns completely
    const blockPatterns = [
        /Tracking Prevention/i,
        /blocked access to storage/i,
        /WebSocket connection.*failed/i,
        /AudioContext/i,
        /ScriptProcessorNode/i,
        /Alan AI/i,
        /Website URL not defined/i,
        /Browser plugin/i,
        /GET.*400.*Bad/i,
        /Connection refused/i,
        /ECONNREFUSED/i,
        /net::ERR_CONNECTION_REFUSED/i,
        /Failed to load resource/i,
        /the server responded with a status of 400/i,
        /Zenera AI Plugin/i,
        /chext_driver/i,
        /chext_loader/i,
        /Initialized.*at:/i,
        /Cannot assign to read only property/i,
        /has already been declared/i
    ];
    
    // Override console methods immediately
    console.error = function(...args) {
        const msg = args.join(' ');
        if (!blockPatterns.some(p => p.test(msg))) {
            originalError.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const msg = args.join(' ');
        if (!blockPatterns.some(p => p.test(msg))) {
            originalWarn.apply(console, args);
        }
    };
    
    console.log = function(...args) {
        const msg = args.join(' ');
        if (msg.includes('📨') || msg.includes('MESSAGE') || msg.includes('SAVING')) {
            originalLog.apply(console, args);
        } else if (!blockPatterns.some(p => p.test(msg))) {
            // Block repetitive notification messages
            if (!msg.includes('🔔 Notification:') && !msg.includes('🔍 Checking messages')) {
                originalLog.apply(console, args);
            }
        }
    };
    
    // Disable all notifications completely
    if ('Notification' in window) {
        Notification.requestPermission = () => Promise.resolve('denied');
        window.Notification = class { constructor() { return null; } };
    }
    if (window.showNotification) {
        window.showNotification = () => {};
    }
    
    // Block error events
    window.addEventListener('error', function(e) {
        const msg = e.message || '';
        if (blockPatterns.some(p => p.test(msg))) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return true;
        }
    }, true);
    
    // Block promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        const msg = e.reason ? e.reason.toString() : '';
        if (blockPatterns.some(p => p.test(msg))) {
            e.preventDefault();
            return true;
        }
    });
    
    // Override storage completely
    try {
        const origSet = Storage.prototype.setItem;
        const origGet = Storage.prototype.getItem;
        
        Storage.prototype.setItem = function(k, v) {
            try { return origSet.call(this, k, v); } catch(e) { return; }
        };
        
        Storage.prototype.getItem = function(k) {
            try { return origGet.call(this, k); } catch(e) { return null; }
        };
    } catch(e) {}
    
    // Override fetch to suppress network errors
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        return origFetch.apply(this, args).catch(error => {
            const msg = error.message || '';
            if (blockPatterns.some(p => p.test(msg))) {
                return new Response('{}', { status: 200 });
            }
            throw error;
        });
    };
    
    // Mark as loaded
    window.ULTIMATE_SUPPRESSION_LOADED = true;
})();