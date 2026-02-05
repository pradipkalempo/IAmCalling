// Hide Universal Navigation Bar on Messenger Page Only

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function hideUniversalBar() {
        // Hide the universal navigation bar
        const style = document.createElement('style');
        style.textContent = `
            .universal-topbar,
            .topbar,
            .navigation-bar,
            .nav-bar,
            .header-nav,
            .main-nav,
            nav[class*="universal"],
            nav[class*="topbar"],
            .site-header,
            .global-nav {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                overflow: hidden !important;
            }
            
            /* Adjust messenger container to fill full height */
            .messenger-container {
                height: 100vh !important;
                margin-top: 0 !important;
            }
            
            /* Ensure body uses full viewport */
            body {
                padding-top: 0 !important;
                margin-top: 0 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Universal navigation bar hidden on messenger page');
    }
    
    // Execute immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideUniversalBar);
    } else {
        hideUniversalBar();
    }
    
    // Also hide after a short delay to catch dynamically loaded elements
    setTimeout(hideUniversalBar, 100);
    setTimeout(hideUniversalBar, 500);
})();