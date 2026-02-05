// Simple Latest Conversation Sorting
(function() {
    'use strict';
    
    let lastMessageTimes = new Map();
    
    function initConversationSorting() {
        if (!window.messenger) {
            setTimeout(initConversationSorting, 500);
            return;
        }
        
        console.log('📊 Latest conversation sorting active');
        
        // Override rendering to sort by latest message time
        const originalRender = window.messenger.renderUsersWithConversations.bind(window.messenger);
        window.messenger.renderUsersWithConversations = function() {
            // Sort users by latest message time (most recent first)
            this.users.sort((a, b) => {
                const aTime = lastMessageTimes.get(a.id) || 0;
                const bTime = lastMessageTimes.get(b.id) || 0;
                return bTime - aTime; // Descending order (latest first)
            });
            
            originalRender();
        };
        
        // Load latest message times
        loadLatestMessageTimes();
        
        // Hook into message sending to update times
        const originalSendMessage = window.messenger.sendMessage.bind(window.messenger);
        window.messenger.sendMessage = function() {
            const input = document.getElementById('chat-input');
            if (input && input.value.trim() && this.activeChat) {
                // Update time for recipient when sending
                lastMessageTimes.set(this.activeChat, Date.now());
                this.renderUsersWithConversations();
            }
            originalSendMessage();
        };
    }
    
    async function loadLatestMessageTimes() {
        if (!window.messenger?.users || !window.messenger?.currentUser) return;
        
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        for (const user of window.messenger.users) {
            try {
                // Get latest message between current user and this user
                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=created_at&or=(and(sender_id.eq.${window.messenger.currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${window.messenger.currentUser.id}))&order=created_at.desc&limit=1`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                
                if (response.ok) {
                    const messages = await response.json();
                    if (messages.length > 0) {
                        const messageTime = new Date(messages[0].created_at).getTime();
                        lastMessageTimes.set(user.id, messageTime);
                    }
                }
            } catch (error) {
                console.log('⚠️ Error loading message time for user', user.id);
            }
        }
        
        console.log('📊 Latest message times loaded');
        window.messenger.renderUsersWithConversations();
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initConversationSorting);
    } else {
        initConversationSorting();
    }
    
    setTimeout(initConversationSorting, 1000);
})();