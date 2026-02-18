// Message Count System - No Previews
(function() {
    'use strict';
    
    // Disable all notifications
    if ('Notification' in window) {
        Notification.requestPermission = () => Promise.resolve('denied');
        window.Notification = class { constructor() { return null; } };
    }
    
    const userUnreadCounts = new Map();
    
    // Reset counts on page load for clean state
    function resetAllCounts() {
        userUnreadCounts.clear();
        document.querySelectorAll('.unread-badge').forEach(badge => {
            badge.style.display = 'none';
            badge.textContent = '0';
        });
    }
    
    // Reset on load
    resetAllCounts();
    
    function addUnreadCount(userId) {
        const currentCount = userUnreadCounts.get(userId) || 0;
        userUnreadCounts.set(userId, currentCount + 1);
        updateUserBadge(userId);
    }
    
    function updateUserBadge(userId) {
        const userEl = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userEl) return;
        
        const count = userUnreadCounts.get(userId) || 0;
        let badge = userEl.querySelector('.unread-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'unread-badge';
                const footer = userEl.querySelector('.conversation-footer');
                if (footer) footer.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = 'inline';
        } else if (badge) {
            badge.style.display = 'none';
        }
        
        // Remove any message previews
        const previews = userEl.querySelector('.msg-previews');
        if (previews) previews.remove();
    }
    
    function clearUnreadCount(userId) {
        userUnreadCounts.set(userId, 0);
        updateUserBadge(userId);
    }
    
    // Hook into fetch for message polling
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            if (response.url && response.url.includes('/messages?') && response.ok) {
                response.clone().json().then(messages => {
                    const currentUserId = window.messenger?.currentUser?.id || 
                                        JSON.parse(localStorage.getItem('currentUser') || '{}').id;
                    
                    if (!currentUserId) return;
                    
                    // Only count messages that are: 1) from others, 2) not read by current user
                    messages.forEach(msg => {
                        if (msg.sender_id && 
                            msg.sender_id != currentUserId && 
                            msg.is_read === false) {
                            addUnreadCount(msg.sender_id);
                        }
                    });
                }).catch(() => {});
            }
            return response;
        });
    };
    
    // Clear count on user click
    document.addEventListener('click', function(e) {
        const userItem = e.target.closest('[data-user-id]');
        if (userItem) {
            const userId = userItem.dataset.userId;
            setTimeout(() => clearUnreadCount(userId), 50);
        }
    });
    
    // Clean up any existing previews
    setInterval(() => {
        document.querySelectorAll('.msg-previews').forEach(el => el.remove());
    }, 1000);
    
    console.log('✅ Message count system loaded');
})();