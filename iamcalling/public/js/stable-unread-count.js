// Stable Unread Count System - No Duplicates, No Blinking
(function() {
    'use strict';
    
    let processedMessageIds = new Set();
    let unreadCounts = new Map();
    let isUpdating = false;
    let updateTimeout = null;
    
    function initStableUnreadSystem() {
        if (!window.messenger) {
            setTimeout(initStableUnreadSystem, 500);
            return;
        }
        
        console.log('🔧 Stable unread count system active');
        
        // Override render to include stable unread counts
        const originalRender = window.messenger.renderUsersWithConversations.bind(window.messenger);
        window.messenger.renderUsersWithConversations = function() {
            // Update users with stable unread counts
            this.users.forEach(user => {
                const count = unreadCounts.get(user.id) || 0;
                user.unreadCount = count;
            });
            
            originalRender();
        };
        
        // Override selectUser to clear count
        const originalSelectUser = window.messenger.selectUser.bind(window.messenger);
        window.messenger.selectUser = function(userId) {
            unreadCounts.set(userId, 0);
            originalSelectUser(userId);
            debouncedRender();
        };
        
        // Load initial counts
        loadInitialUnreadCounts();
        
        // Hook message receiving
        hookMessageReceiving();
    }
    
    async function loadInitialUnreadCounts() {
        if (!window.messenger?.users || !window.messenger?.currentUser) return;
        
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        for (const user of window.messenger.users) {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id&sender_id=eq.${user.id}&receiver_id=eq.${window.messenger.currentUser.id}&read=eq.false`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                
                if (response.ok) {
                    const unreadMessages = await response.json();
                    unreadCounts.set(user.id, unreadMessages.length);
                    
                    // Track these message IDs to prevent duplicate counting
                    unreadMessages.forEach(msg => processedMessageIds.add(msg.id));
                }
            } catch (error) {
                console.log('⚠️ Error loading unread count for user', user.id);
            }
        }
        
        debouncedRender();
    }
    
    function hookMessageReceiving() {
        // Hook WebSocket messages
        if (window.messenger.ws) {
            const originalOnMessage = window.messenger.ws.onmessage;
            window.messenger.ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new-message' && data.to === parseInt(window.messenger.currentUser.id)) {
                        handleNewMessage(data.from, data.messageId);
                    }
                } catch (e) {}
                if (originalOnMessage) originalOnMessage.call(this, event);
            };
        }
        
        // Hook fetch to prevent duplicate processing
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (response.url && response.url.includes('/messages?') && response.ok && !isUpdating) {
                    isUpdating = true;
                    
                    response.clone().json().then(messages => {
                        messages.forEach(msg => {
                            if (msg.sender_id && 
                                msg.sender_id != window.messenger?.currentUser?.id && 
                                msg.read === false &&
                                !processedMessageIds.has(msg.id)) {
                                
                                handleNewMessage(msg.sender_id, msg.id);
                            }
                        });
                        
                        setTimeout(() => { isUpdating = false; }, 1000);
                    }).catch(() => { isUpdating = false; });
                }
                return response;
            });
        };
    }
    
    function handleNewMessage(senderId, messageId) {
        // Prevent duplicate processing
        if (messageId && processedMessageIds.has(messageId)) return;
        if (messageId) processedMessageIds.add(messageId);
        
        // Only increment if sender is not active chat
        if (window.messenger.activeChat != senderId) {
            const currentCount = unreadCounts.get(senderId) || 0;
            unreadCounts.set(senderId, currentCount + 1);
            debouncedRender();
        }
    }
    
    function debouncedRender() {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            if (window.messenger.renderUsersWithConversations) {
                window.messenger.renderUsersWithConversations();
            }
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStableUnreadSystem);
    } else {
        initStableUnreadSystem();
    }
    
    // Export for debugging
    window.stableUnreadCounts = unreadCounts;
    window.processedMessageIds = processedMessageIds;
})();