// IMMEDIATE CONSOLE SUPPRESSION - Load this FIRST
(function() {
    // Completely override console methods immediately
    const noop = function() {};
    
    // Store originals
    window._originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log
    };
    
    // Suppress patterns
    const suppress = [
        /Tracking Prevention/i,
        /WebSocket/i,
        /AudioContext/i,
        /ScriptProcessorNode/i,
        /Alan AI/i,
        /Website URL not defined/i,
        /Browser plugin/i,
        /GET.*400.*Bad/i,
        /Connection refused/i,
        /ECONNREFUSED/i
    ];
    
    // Override console methods
    console.error = function(...args) {
        const msg = args.join(' ');
        if (!suppress.some(p => p.test(msg))) {
            window._originalConsole.error.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const msg = args.join(' ');
        if (!suppress.some(p => p.test(msg))) {
            window._originalConsole.warn.apply(console, args);
        }
    };
    
    console.log = function(...args) {
        const msg = args.join(' ');
        if (!suppress.some(p => p.test(msg))) {
            window._originalConsole.log.apply(console, args);
        }
    };
    
    // Override error handlers immediately
    window.addEventListener('error', function(e) {
        const msg = e.message || '';
        if (suppress.some(p => p.test(msg))) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return true;
        }
    }, true);
    
    window.addEventListener('unhandledrejection', function(e) {
        const msg = e.reason ? e.reason.toString() : '';
        if (suppress.some(p => p.test(msg))) {
            e.preventDefault();
            return true;
        }
    });
    
    // Override storage methods
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
    
    // Mark as loaded
    window.CONSOLE_SUPPRESSION_LOADED = true;
})();