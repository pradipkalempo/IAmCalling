// Chat List Reordering System
(function() {
    'use strict';
    
    // Hook into the unified messenger
    function initChatReordering() {
        if (!window.messenger) {
            setTimeout(initChatReordering, 500);
            return;
        }
        
        // Override the message preview function to include reordering
        const originalAddPreview = window.addPreview || function() {};
        
        window.addPreview = function(userId, message) {
            // Call original preview function
            originalAddPreview(userId, message);
            
            // Reorder the chat list
            reorderChatList(userId, message);
        };
        
        // Hook into fetch responses for message polling
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (response.url && response.url.includes('/messages?') && response.ok) {
                    response.clone().json().then(messages => {
                        messages.forEach(msg => {
                            if (msg.sender_id && msg.content && msg.sender_id != window.messenger?.currentUser?.id) {
                                reorderChatList(msg.sender_id, msg.content);
                            }
                        });
                    }).catch(() => {});
                }
                return response;
            });
        };
        
        console.log('✅ Chat reordering system active');
    }
    
    function reorderChatList(userId, message) {
        if (!window.messenger || !window.messenger.users) return;
        
        // Find the user in the list
        const userIndex = window.messenger.users.findIndex(u => u.id == userId);
        if (userIndex === -1) return;
        
        // Don't reorder if this user is currently active
        if (window.messenger.activeChat == userId) return;
        
        // Move user to top
        const user = window.messenger.users.splice(userIndex, 1)[0];
        user.lastMessage = message;
        user.lastMessageTime = Date.now();
        
        // Insert at the beginning
        window.messenger.users.unshift(user);
        
        // Re-render the user list
        if (window.messenger.renderUsersWithConversations) {
            window.messenger.renderUsersWithConversations();
        }
        
        // Add visual feedback
        setTimeout(() => {
            const userElement = document.querySelector(`[data-user-id="${userId}"]`);
            if (userElement) {
                userElement.style.background = 'rgba(106, 153, 255, 0.2)';
                setTimeout(() => {
                    userElement.style.background = '';
                }, 1000);
            }
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatReordering);
    } else {
        initChatReordering();
    }
    
    // Export for testing
    window.reorderChatList = reorderChatList;
})();