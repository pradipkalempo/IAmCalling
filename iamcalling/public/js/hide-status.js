// Remove Online/Offline Status from Messenger
(function() {
    'use strict';
    
    function hideStatusIndicators() {
        // Add CSS to hide status elements
        const style = document.createElement('style');
        style.textContent = `
            .user-status,
            .current-user-status,
            .chat-user-status,
            .online-indicator {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Remove status text from current user
        const currentUserStatus = document.querySelector('.current-user-status');
        if (currentUserStatus) {
            currentUserStatus.style.display = 'none';
        }
        
        // Remove status from chat header
        const chatUserStatus = document.getElementById('chatUserStatus');
        if (chatUserStatus) {
            chatUserStatus.style.display = 'none';
        }
    }
    
    // Override unified messenger to not show status
    function overrideStatusRendering() {
        if (window.messenger && window.messenger.createUserElement) {
            const originalCreateUserElement = window.messenger.createUserElement.bind(window.messenger);
            window.messenger.createUserElement = function(user) {
                const element = originalCreateUserElement(user);
                // Remove status indicator from user elements
                const statusIndicator = element.querySelector('.user-status');
                if (statusIndicator) {
                    statusIndicator.remove();
                }
                return element;
            };
        }
        
        if (window.messenger && window.messenger.selectUser) {
            const originalSelectUser = window.messenger.selectUser.bind(window.messenger);
            window.messenger.selectUser = function(userId) {
                originalSelectUser(userId);
                // Hide status in chat header
                const chatUserStatus = document.getElementById('chatUserStatus');
                if (chatUserStatus) {
                    chatUserStatus.style.display = 'none';
                }
            };
        }
    }
    
    function init() {
        hideStatusIndicators();
        
        // Wait for messenger to load then override
        if (window.messenger) {
            overrideStatusRendering();
        } else {
            setTimeout(() => {
                if (window.messenger) {
                    overrideStatusRendering();
                }
            }, 1000);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run after a delay to catch dynamically loaded content
    setTimeout(init, 500);
})();