// Direct Message Delivery System
window.forceMessageDelivery = async function() {
    if (!window.messenger || !window.messenger.currentUser) {
        console.log('❌ Messenger not ready');
        return;
    }

    const currentUserId = parseInt(window.messenger.currentUser.id);
    console.log('🔍 Checking messages for user:', currentUserId);

    try {
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

        // Get all messages for current user as receiver
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at&receiver_id=eq.${currentUserId}&order=created_at.desc&limit=10`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const messages = await response.json();
            console.log(`📨 Found ${messages.length} messages for user ${currentUserId}:`, messages);

            // If user has active chat, refresh that conversation
            if (window.messenger.activeChat) {
                console.log('🔄 Refreshing active chat:', window.messenger.activeChat);
                await window.messenger.loadMessages(window.messenger.activeChat);
            }

            // Show latest message as notification
            if (messages.length > 0) {
                const latestMessage = messages[0];
                if (window.showNotification) {
                    window.showNotification(`📨 Latest: ${latestMessage.content}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Force delivery error:', error);
    }
};

// Auto-run every 5 seconds
setInterval(() => {
    if (window.messenger && window.messenger.currentUser) {
        window.forceMessageDelivery();
    }
}, 5000);

console.log('✅ Direct message delivery system started');