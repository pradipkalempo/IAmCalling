// Ensure Unread Message Badges are Visible
(function() {
    'use strict';
    
    function enhanceUnreadBadges() {
        // Add CSS to ensure badges are visible
        const style = document.createElement('style');
        style.textContent = `
            .unread-badge {
                background: #ef4444 !important;
                color: white !important;
                border-radius: 12px !important;
                padding: 2px 8px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                min-width: 20px !important;
                text-align: center !important;
                display: inline-block !important;
                margin-left: 8px !important;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3) !important;
            }
            
            .conversation-item .unread-badge {
                flex-shrink: 0 !important;
            }
            
            /* Ensure badges show up in conversation footer */
            .conversation-footer {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            .last-message {
                flex: 1 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceUnreadBadges);
    } else {
        enhanceUnreadBadges();
    }
})();