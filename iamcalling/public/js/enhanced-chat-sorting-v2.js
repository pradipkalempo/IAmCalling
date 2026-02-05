// Enhanced Chat Sorting and Unread Count System
(function() {
    'use strict';
    
    let conversationData = new Map();
    let isInitialized = false;
    
    function initEnhancedSystem() {
        if (!window.messenger || isInitialized) {
            setTimeout(initEnhancedSystem, 500);
            return;
        }
        
        isInitialized = true;
        console.log('🔧 Enhanced chat sorting and unread count system active');
        
        // Override the renderUsersWithConversations method
        const originalRender = window.messenger.renderUsersWithConversations.bind(window.messenger);
        window.messenger.renderUsersWithConversations = function() {
            // Sort users by latest conversation before rendering
            this.users.sort((a, b) => {
                const aData = conversationData.get(a.id) || { lastMessageTime: 0 };
                const bData = conversationData.get(b.id) || { lastMessageTime: 0 };
                return bData.lastMessageTime - aData.lastMessageTime;
            });
            
            // Update user data with conversation info
            this.users.forEach(user => {
                const data = conversationData.get(user.id);
                if (data) {
                    user.lastMessage = data.lastMessage || '';
                    user.lastMessageTime = data.lastMessageTime;
                    user.unreadCount = data.unreadCount || 0;
                }
            });
            
            originalRender();
        };
        
        // Override selectUser to clear unread count
        const originalSelectUser = window.messenger.selectUser.bind(window.messenger);
        window.messenger.selectUser = function(userId) {
            // Clear unread count when user is selected
            const data = conversationData.get(userId) || {};
            data.unreadCount = 0;
            conversationData.set(userId, data);
            
            originalSelectUser(userId);
            
            // Mark messages as read
            this.markMessagesAsRead(userId);
            
            // Force re-render to update badge
            this.renderUsersWithConversations();
        };
        
        // Load existing conversations
        loadConversationData();
        
        // Hook into message receiving
        hookMessageReceiving();
    }
    
    async function loadConversationData() {
        if (!window.messenger?.users || !window.messenger?.currentUser) return;
        
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        for (const user of window.messenger.users) {
            try {
                // Get latest message with this user
                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=content,created_at,sender_id,read&or=(and(sender_id.eq.${window.messenger.currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${window.messenger.currentUser.id}))&order=created_at.desc&limit=1`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                
                if (response.ok) {
                    const messages = await response.json();
                    if (messages.length > 0) {
                        const lastMsg = messages[0];
                        
                        // Count unread messages from this user
                        const unreadResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id&sender_id=eq.${user.id}&receiver_id=eq.${window.messenger.currentUser.id}&read=eq.false`, {
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            }
                        });
                        
                        let unreadCount = 0;
                        if (unreadResponse.ok) {
                            const unreadMessages = await unreadResponse.json();
                            unreadCount = unreadMessages.length;
                        }
                        
                        conversationData.set(user.id, {
                            lastMessage: lastMsg.content,
                            lastMessageTime: new Date(lastMsg.created_at).getTime(),
                            unreadCount: unreadCount
                        });
                    }
                }
            } catch (error) {
                console.log('⚠️ Error loading data for user', user.id, error);
            }
        }
        
        console.log('📊 Loaded conversation data');
        window.messenger.renderUsersWithConversations();
    }
    
    function hookMessageReceiving() {
        // Hook into WebSocket messages
        if (window.messenger.ws) {
            const originalOnMessage = window.messenger.ws.onmessage;
            window.messenger.ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new-message' && data.to === parseInt(window.messenger.currentUser.id)) {
                        // Always move sender to top when message received
                        moveUserToTop(data.from, data.message);
                        updateConversationData(data.from, data.message, true);
                    }
                } catch (e) {}
                if (originalOnMessage) originalOnMessage.call(this, event);
            };
        }
        
        // Hook into message sending
        const originalSendMessage = window.messenger.sendMessage.bind(window.messenger);
        window.messenger.sendMessage = function() {
            const input = document.getElementById('chat-input');
            if (input && input.value.trim() && this.activeChat) {
                // Move recipient to top when sending message
                moveUserToTop(this.activeChat, input.value.trim());
                updateConversationData(this.activeChat, input.value.trim(), false);
            }
            originalSendMessage();
        };
        
        // Hook into fetch for polling messages
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (response.url && response.url.includes('/messages?') && response.ok) {
                    response.clone().json().then(messages => {
                        messages.forEach(msg => {
                            if (msg.sender_id && msg.content && msg.sender_id != window.messenger?.currentUser?.id) {
                                moveUserToTop(msg.sender_id, msg.content);
                                updateConversationData(msg.sender_id, msg.content, true);
                            }
                        });
                    }).catch(() => {});
                }
                return response;
            });
        };
    }
    
    function moveUserToTop(userId, message) {
        if (!window.messenger?.users) return;
        
        const userIndex = window.messenger.users.findIndex(u => u.id == userId);
        if (userIndex > -1) {
            // Remove user from current position
            const user = window.messenger.users.splice(userIndex, 1)[0];
            
            // Update user data
            user.lastMessage = message;
            user.lastMessageTime = Date.now();
            
            // Insert at the beginning
            window.messenger.users.unshift(user);
            
            // Force re-render
            window.messenger.renderUsersWithConversations();
        }
    }
    
    function updateConversationData(userId, message, isReceived) {
        const data = conversationData.get(userId) || { unreadCount: 0 };
        
        data.lastMessage = message;
        data.lastMessageTime = Date.now();
        
        // Increment unread count for received messages when user is not active
        if (isReceived && window.messenger.activeChat != userId) {
            data.unreadCount = (data.unreadCount || 0) + 1;
        }
        
        conversationData.set(userId, data);
        
        // Re-render to update sorting and counts
        if (window.messenger.renderUsersWithConversations) {
            window.messenger.renderUsersWithConversations();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedSystem);
    } else {
        initEnhancedSystem();
    }
    
    // Export for testing
    window.updateConversationData = updateConversationData;
    window.conversationData = conversationData;
})();