// Enhanced Chat Sorting and Unread Count System
(function() {
    'use strict';
    
    let conversationData = new Map(); // userId -> { lastMessageTime, unreadCount, lastMessage }
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
        };
        
        // Load existing conversations
        loadConversationData();
        
        // Hook into message receiving
        hookMessageReceiving();
    }
    
    async function loadConversationData() {
        if (!window.messenger?.currentUser) return;
        
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
            
            // Get latest message for each conversation
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_latest_conversations`, {\n                method: 'POST',\n                headers: {\n                    'apikey': SUPABASE_ANON_KEY,\n                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,\n                    'Content-Type': 'application/json'\n                },\n                body: JSON.stringify({ user_id: parseInt(window.messenger.currentUser.id) })\n            });\n            \n            if (response.ok) {\n                const conversations = await response.json();\n                conversations.forEach(conv => {\n                    const otherUserId = conv.sender_id === parseInt(window.messenger.currentUser.id) \n                        ? conv.receiver_id : conv.sender_id;\n                    \n                    conversationData.set(otherUserId, {\n                        lastMessage: conv.content,\n                        lastMessageTime: new Date(conv.created_at).getTime(),\n                        unreadCount: conv.unread_count || 0\n                    });\n                });\n                \n                console.log('📊 Loaded conversation data for', conversations.length, 'users');\n                window.messenger.renderUsersWithConversations();\n            } else {\n                // Fallback: get messages manually\n                await loadConversationDataFallback();\n            }\n        } catch (error) {\n            console.log('⚠️ Error loading conversations, using fallback:', error);\n            await loadConversationDataFallback();\n        }\n    }\n    \n    async function loadConversationDataFallback() {\n        if (!window.messenger?.users || !window.messenger?.currentUser) return;\n        \n        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';\n        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';\n        \n        for (const user of window.messenger.users) {\n            try {\n                // Get latest message with this user\n                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=content,created_at,sender_id,read&or=(and(sender_id.eq.${window.messenger.currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${window.messenger.currentUser.id}))&order=created_at.desc&limit=1`, {\n                    headers: {\n                        'apikey': SUPABASE_ANON_KEY,\n                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`\n                    }\n                });\n                \n                if (response.ok) {\n                    const messages = await response.json();\n                    if (messages.length > 0) {\n                        const lastMsg = messages[0];\n                        \n                        // Count unread messages from this user\n                        const unreadResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id&sender_id=eq.${user.id}&receiver_id=eq.${window.messenger.currentUser.id}&read=eq.false`, {\n                            headers: {\n                                'apikey': SUPABASE_ANON_KEY,\n                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`\n                            }\n                        });\n                        \n                        let unreadCount = 0;\n                        if (unreadResponse.ok) {\n                            const unreadMessages = await unreadResponse.json();\n                            unreadCount = unreadMessages.length;\n                        }\n                        \n                        conversationData.set(user.id, {\n                            lastMessage: lastMsg.content,\n                            lastMessageTime: new Date(lastMsg.created_at).getTime(),\n                            unreadCount: unreadCount\n                        });\n                    }\n                }\n            } catch (error) {\n                console.log('⚠️ Error loading data for user', user.id, error);\n            }\n        }\n        \n        console.log('📊 Loaded fallback conversation data');\n        window.messenger.renderUsersWithConversations();\n    }\n    \n    function hookMessageReceiving() {\n        // Hook into WebSocket messages\n        if (window.messenger.ws) {\n            const originalOnMessage = window.messenger.ws.onmessage;\n            window.messenger.ws.onmessage = function(event) {\n                const data = JSON.parse(event.data);\n                if (data.type === 'new-message' && data.to === parseInt(window.messenger.currentUser.id)) {\n                    updateConversationData(data.from, data.message, true);\n                }\n                if (originalOnMessage) originalOnMessage.call(this, event);\n            };\n        }\n        \n        // Hook into message sending\n        const originalSendMessage = window.messenger.sendMessage.bind(window.messenger);\n        window.messenger.sendMessage = function() {\n            const input = document.getElementById('chat-input');\n            if (input && input.value.trim() && this.activeChat) {\n                updateConversationData(this.activeChat, input.value.trim(), false);\n            }\n            originalSendMessage();\n        };\n    }\n    \n    function updateConversationData(userId, message, isReceived) {\n        const data = conversationData.get(userId) || { unreadCount: 0 };\n        \n        data.lastMessage = message;\n        data.lastMessageTime = Date.now();\n        \n        // Only increment unread count for received messages\n        if (isReceived && window.messenger.activeChat != userId) {\n            data.unreadCount = (data.unreadCount || 0) + 1;\n        }\n        \n        conversationData.set(userId, data);\n        \n        // Re-render to update sorting and counts\n        if (window.messenger.renderUsersWithConversations) {\n            window.messenger.renderUsersWithConversations();\n        }\n    }\n    \n    // Initialize when DOM is ready\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', initEnhancedSystem);\n    } else {\n        initEnhancedSystem();\n    }\n    \n    // Export for testing\n    window.updateConversationData = updateConversationData;\n    window.conversationData = conversationData;\n})();