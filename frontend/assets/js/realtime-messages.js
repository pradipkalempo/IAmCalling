// Real-time Message Display Fix
(function() {
    'use strict';
    
    let supabaseClient = null;
    let messageSubscription = null;
    let pollingInterval = null;
    
    function initRealTimeMessages() {
        if (!window.messenger || !window.messenger.currentUser) {
            setTimeout(initRealTimeMessages, 500);
            return;
        }
        
        console.log('🔄 Real-time message system starting');
        
        // Initialize Supabase client
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            setupRealTimeSubscription();
        }
        
        // Fallback polling
        setupMessagePolling();
        
        // Override sendMessage to ensure immediate UI update
        overrideSendMessage();
    }
    
    function setupRealTimeSubscription() {
        if (!supabaseClient) return;
        
        messageSubscription = supabaseClient
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${window.messenger.currentUser.id}`
            }, (payload) => {
                console.log('📨 Real-time message received:', payload.new);
                handleNewMessage(payload.new);
            })
            .subscribe();
            
        console.log('✅ Real-time subscription active');
    }
    
    function setupMessagePolling() {
        if (pollingInterval) clearInterval(pollingInterval);
        
        pollingInterval = setInterval(async () => {
            if (!window.messenger.activeChat) return;
            
            try {
                const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
                const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
                
                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&or=(and(sender_id.eq.${window.messenger.currentUser.id},receiver_id.eq.${window.messenger.activeChat}),and(sender_id.eq.${window.messenger.activeChat},receiver_id.eq.${window.messenger.currentUser.id}))&order=created_at.desc&limit=1`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                
                if (response.ok) {
                    const messages = await response.json();
                    if (messages.length > 0) {
                        const latestMessage = messages[0];
                        
                        // Check if this message is already in UI
                        const messageElements = document.querySelectorAll('.message');
                        const lastMessageElement = messageElements[messageElements.length - 1];
                        const lastMessageText = lastMessageElement?.querySelector('.message-bubble')?.textContent?.trim();
                        
                        if (lastMessageText !== latestMessage.content.trim()) {
                            console.log('📨 Polling found new message:', latestMessage.content);
                            handleNewMessage(latestMessage);
                        }
                    }
                }
            } catch (error) {
                console.log('⚠️ Polling error:', error);
            }
        }, 2000);
        
        console.log('✅ Message polling active');
    }
    
    function handleNewMessage(message) {
        // Only show if chatting with sender or if it's from current user
        if (message.sender_id == window.messenger.activeChat || message.sender_id == window.messenger.currentUser.id) {
            // Add to UI immediately
            window.messenger.addMessageToUI({
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                content: message.content,
                created_at: message.created_at
            });
        }
    }
    
    function overrideSendMessage() {
        const originalSendMessage = window.messenger.sendMessage.bind(window.messenger);
        
        window.messenger.sendMessage = function() {
            const input = document.getElementById('chat-input');
            if (!input || !input.value.trim() || !this.activeChat) return;
            
            const message = input.value.trim();
            const messageData = {
                sender_id: parseInt(this.currentUser.id),
                receiver_id: parseInt(this.activeChat),
                content: message,
                created_at: new Date().toISOString()
            };
            
            // Clear input immediately
            input.value = '';
            
            // Add to UI immediately
            this.addMessageToUI(messageData);
            
            // Save to database
            this.sendMessageViaSupabase(messageData);
            
            console.log('📤 Message sent and displayed:', message);
        };
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRealTimeMessages);
    } else {
        initRealTimeMessages();
    }
    
    setTimeout(initRealTimeMessages, 1000);
})();