// Override User Sorting - Simple Fix
(function() {
    'use strict';
    
    console.log('🔧 Override user sorting loaded');
    
    // Wait for messenger to be ready
    function waitForMessenger() {
        if (!window.messenger || !window.messenger.renderUsersWithConversations) {
            setTimeout(waitForMessenger, 500);
            return;
        }
        
        console.log('✅ Messenger found, overriding renderUsersWithConversations');
        
        // Store original function
        const originalRender = window.messenger.renderUsersWithConversations;
        
        // Override with sorting
        window.messenger.renderUsersWithConversations = function() {
            // Sort users by last message time before rendering
            if (this.users && this.users.length > 0) {
                this.users.sort((a, b) => {
                    const aTime = a.lastMessageTime || a.created_at || '1970-01-01';
                    const bTime = b.lastMessageTime || b.created_at || '1970-01-01';
                    return new Date(bTime) - new Date(aTime);
                });
                
                console.log('📊 Users sorted by last message time');
            }
            
            // Call original function
            return originalRender.call(this);
        };
        
        // Force immediate re-render
        window.messenger.renderUsersWithConversations();
    }
    
    // Start waiting
    waitForMessenger();
    
    // Also listen for real-time messages to trigger re-sort
    if (window.supabase) {
        window.supabase
            .channel('override-sorting')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const message = payload.new;
                const currentUserId = localStorage.getItem('currentUserId');
                
                // If message involves current user, update sender's lastMessageTime and re-render
                if (message.receiver_id === currentUserId || message.sender_id === currentUserId) {
                    setTimeout(() => {
                        if (window.messenger && window.messenger.users) {
                            // Update lastMessageTime for sender
                            const senderUser = window.messenger.users.find(u => u.id == message.sender_id);
                            if (senderUser) {
                                senderUser.lastMessageTime = message.created_at;
                            }
                            
                            // Force re-render with new sorting
                            window.messenger.renderUsersWithConversations();
                            
                            console.log(`📨 Message from ${message.sender_id}, re-sorted users`);
                        }
                    }, 300);
                }
            })
            .subscribe();
    }
    
    console.log('✅ Override user sorting active');
})();