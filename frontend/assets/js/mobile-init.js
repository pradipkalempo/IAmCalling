// Universal Mobile Initialization Script
(function() {
    'use strict';
    
    // FIRST: Suppress all tracking prevention and console errors
    const suppressedMessages = [
        'Tracking Prevention blocked access to storage',
        'AudioContext',
        'ScriptProcessorNode is deprecated',
        'Website URL not defined',
        'Zenera AI Plugin',
        'chext_driver',
        'chext_loader',
        'alan_lib',
        'enable_copy',
        'E.C.P is not enabled',
        'Identifier',
        'has already been declared'
    ];
    
    function shouldSuppress(message) {
        return suppressedMessages.some(pattern => 
            String(message).toLowerCase().includes(pattern.toLowerCase())
        );
    }
    
    // Override console methods immediately
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalConsole.error.apply(console, args);
        }
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (!shouldSuppress(message)) {
            originalConsole.warn.apply(console, args);
        }
    };
    
    // Global error handlers
    window.addEventListener('error', function(e) {
        if (shouldSuppress(e.message)) {
            e.preventDefault();
            e.stopPropagation();
            return true;
        }
    }, true);
    
    window.addEventListener('unhandledrejection', function(e) {
        if (shouldSuppress(e.reason)) {
            e.preventDefault();
            return true;
        }
    });
    
    // Block problematic globals
    try {
        if (!window.hasOwnProperty('alanAudio')) {
            window.alanAudio = null;
        }
        if (!window.hasOwnProperty('alan')) {
            window.alan = null;
        }
        if (window.chext && !window.hasOwnProperty('chext')) {
            window.chext = null;
        }
    } catch (e) {
        // Ignore read-only property errors
    }
    
    // Ensure viewport meta tag exists
    function ensureViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        } else {
            // Update existing viewport to be mobile-friendly
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
    }
    
    // Ensure mobile CSS is loaded
    function ensureMobileCSS() {
        const existingMobileCSS = document.querySelector('link[href*="mobile-responsive.css"]');
        if (!existingMobileCSS) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/mobile-responsive.css';
            document.head.appendChild(link);
        }
    }
    
    // Add mobile-specific classes to body
    function addMobileClasses() {
        const body = document.body;
        
        // Safety check for body element
        if (!body) {
            console.warn('Body element not found, skipping mobile classes');
            return;
        }
        
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        
        if (isMobile) body.classList.add('mobile-device');
        if (isAndroid) body.classList.add('android-device');
        if (isSmallScreen) body.classList.add('small-screen');
        
        // Add screen size classes
        if (window.innerWidth <= 360) body.classList.add('xs-screen');
        else if (window.innerWidth <= 480) body.classList.add('sm-screen');
        else if (window.innerWidth <= 768) body.classList.add('md-screen');
    }
    
    // Initialize mobile menu functionality
    function initMobileMenu() {
        // Find mobile menu button and menu
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn, #mobileMenuBtn');
        const menu = document.querySelector('.nav-menu, .navbar-menu, #mainMenu');
        
        if (mobileMenuBtn && menu) {
            mobileMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                menu.classList.toggle('active');
                
                // Update button icon
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    if (menu.classList.contains('active')) {
                        icon.className = 'fas fa-times';
                    } else {
                        icon.className = 'fas fa-bars';
                    }
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenuBtn.contains(e.target) && !menu.contains(e.target)) {
                    menu.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-bars';
                    }
                }
            });
        }
    }
    
    // Fix iOS Safari viewport issues
    function fixIOSViewport() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewportHeight = window.innerHeight;
            document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
            
            window.addEventListener('resize', function() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            });
        }
    }
    
    // Prevent zoom on input focus (iOS)
    function preventZoomOnInput() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.addEventListener('focus', function() {
                    if (parseFloat(input.style.fontSize) < 16) {
                        input.style.fontSize = '16px';
                    }
                });
            }
        });
    }
    
    // Optimize touch interactions
    function optimizeTouchInteractions() {
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('button, .btn, .button, a[role="button"]');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });
        
        // Improve scroll performance
        const scrollElements = document.querySelectorAll('.scroll-container, .chat-messages, .photo-container');
        scrollElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    // Handle orientation changes
    function handleOrientationChange() {
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                // Recalculate viewport height
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                }
                
                // Update screen size classes
                addMobileClasses();
            }, 100);
        });
    }
    
    // Add CSS for touch feedback
    function addTouchFeedbackCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-active {
                opacity: 0.7 !important;
                transform: scale(0.95) !important;
                transition: all 0.1s ease !important;
            }
            
            /* iOS Safari specific fixes */
            body {
                height: 100vh;
                height: calc(var(--vh, 1vh) * 100);
            }
            
            /* Prevent horizontal scroll */
            html, body {
                overflow-x: hidden;
                width: 100%;
            }
            
            /* Improve tap targets */
            button, .btn, .button, a, input, textarea, select {
                min-height: 44px;
                min-width: 44px;
            }
            
            /* Better form styling on mobile */
            @media (max-width: 768px) {
                input, textarea, select {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize everything when DOM is ready
    function init() {
        ensureViewportMeta();
        ensureMobileCSS();
        
        // Wait for body to be available
        if (document.body) {
            addMobileClasses();
        } else {
            document.addEventListener('DOMContentLoaded', addMobileClasses);
        }
        
        addTouchFeedbackCSS();
        fixIOSViewport();
        handleOrientationChange();
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initMobileMenu();
                preventZoomOnInput();
                optimizeTouchInteractions();
            });
        } else {
            initMobileMenu();
            preventZoomOnInput();
            optimizeTouchInteractions();
        }
    }
    
    // Start initialization
    init();
    
    // Export functions for manual use
    window.MobileInit = {
        ensureViewportMeta,
        ensureMobileCSS,
        addMobileClasses,
        initMobileMenu,
        fixIOSViewport,
        preventZoomOnInput,
        optimizeTouchInteractions
    };
})();