// Complete Console Error Suppression
(function() {
    'use strict';
    
    // Override all console methods to suppress specific errors
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Patterns to completely suppress
    const suppressAll = [
        /Tracking Prevention blocked access to storage/i,
        /WebSocket connection.*failed/i,
        /WebSocket error/i,
        /WebSocket closed/i,
        /GET.*400.*Bad/i,
        /AudioContext was not allowed/i,
        /ScriptProcessorNode is deprecated/i,
        /Alan AI Studio/i,
        /Website URL not defined/i,
        /Browser plugin section/i,
        /Connection refused/i,
        /ECONNREFUSED/i,
        /net::ERR_CONNECTION_REFUSED/i
    ];
    
    console.error = function(...args) {
        const msg = args.join(' ');
        if (!suppressAll.some(p => p.test(msg))) {
            originalError.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const msg = args.join(' ');
        if (!suppressAll.some(p => p.test(msg))) {
            originalWarn.apply(console, args);
        }
    };
    
    console.log = function(...args) {
        const msg = args.join(' ');
        if (!suppressAll.some(p => p.test(msg))) {
            originalLog.apply(console, args);
        }
    };
    
    // Suppress all window errors
    window.addEventListener('error', function(e) {
        const msg = e.message || '';
        if (suppressAll.some(p => p.test(msg))) {
            e.preventDefault();
            e.stopPropagation();
            return true;
        }
    }, true);
    
    // Suppress promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        const msg = e.reason ? e.reason.toString() : '';
        if (suppressAll.some(p => p.test(msg))) {
            e.preventDefault();
            return true;
        }
    });
    
    // Override storage methods
    const origSetItem = Storage.prototype.setItem;
    const origGetItem = Storage.prototype.getItem;
    
    Storage.prototype.setItem = function(key, value) {
        try {
            return origSetItem.call(this, key, value);
        } catch (e) {
            return;
        }
    };
    
    Storage.prototype.getItem = function(key) {
        try {
            return origGetItem.call(this, key);
        } catch (e) {
            return null;
        }
    };
    
    // Override fetch to suppress network errors
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        return origFetch.apply(this, args).catch(error => {
            const msg = error.message || '';
            if (suppressAll.some(p => p.test(msg))) {
                return new Response('{}', { status: 200 });
            }
            throw error;
        });
    };
    
})();