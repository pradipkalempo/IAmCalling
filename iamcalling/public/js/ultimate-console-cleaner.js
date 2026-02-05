// Ultimate Console Cleaner - Blocks ALL unwanted messages
(function() {
    'use strict';
    
    // Store original console methods
    const originalConsole = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console),
        debug: console.debug.bind(console)
    };
    
    // Complete list of patterns to suppress
    const suppressPatterns = [
        'tracking prevention blocked access to storage',
        'multiple gotrueclient instances detected',
        'the message port closed before a response was received',
        'unchecked runtime.lasterror',
        'the message port closed before a response was received',
        'audiocontext',
        'scriptprocessornode is deprecated',
        'website url not defined',
        'zenera ai plugin',
        'chext_driver',
        'chext_loader',
        'alan_lib',
        'enable_copy',
        'e.c.p is not enabled',
        'alan: audio worker initialized',
        'using audiocontext with samplerate',
        'the audiocontext was not allowed to start',
        'initialized driver at',
        'initialized chextloader at'
    ];
    
    function shouldSuppress(message) {
        if (!message) return false;
        const msgStr = String(message).toLowerCase();
        return suppressPatterns.some(pattern => msgStr.includes(pattern));
    }
    
    function filterArgs(args) {
        return args.filter(arg => !shouldSuppress(arg));
    }
    
    // Override ALL console methods
    console.log = function(...args) {
        const filtered = filterArgs(args);
        if (filtered.length > 0 && !shouldSuppress(args.join(' '))) {
            originalConsole.log(...args);
        }
    };
    
    console.warn = function(...args) {
        const filtered = filterArgs(args);
        if (filtered.length > 0 && !shouldSuppress(args.join(' '))) {
            originalConsole.warn(...args);
        }
    };
    
    console.error = function(...args) {
        const filtered = filterArgs(args);
        if (filtered.length > 0 && !shouldSuppress(args.join(' '))) {
            originalConsole.error(...args);
        }
    };
    
    console.info = function(...args) {
        const filtered = filterArgs(args);
        if (filtered.length > 0 && !shouldSuppress(args.join(' '))) {
            originalConsole.info(...args);
        }
    };
    
    console.debug = function(...args) {
        const filtered = filterArgs(args);
        if (filtered.length > 0 && !shouldSuppress(args.join(' '))) {
            originalConsole.debug(...args);
        }
    };
    
    // Block error events
    window.addEventListener('error', function(e) {
        if (shouldSuppress(e.message) || shouldSuppress(e.filename)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    // Block unhandled rejections
    window.addEventListener('unhandledrejection', function(e) {
        if (shouldSuppress(String(e.reason))) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    // Disable problematic objects
    try {
        Object.defineProperty(window, 'alanBtn', { value: () => {}, writable: false });
        Object.defineProperty(window, 'alanAudio', { value: null, writable: false });
        Object.defineProperty(window, 'alan', { value: null, writable: false });
    } catch (e) {}
    
    // Override fetch to suppress tracking prevention errors
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(error => {
            if (shouldSuppress(String(error))) {
                return Promise.resolve(new Response('{}', { status: 200 }));
            }
            throw error;
        });
    };
    
    console.log('🧹 Ultimate console cleaner activated');
    
})();