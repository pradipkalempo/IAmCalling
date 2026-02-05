// Message Isolation Validator for IAMCALLING
// Ensures complete message security and prevents cross-user data leakage

class MessageIsolationValidator {
    constructor(currentUserId) {
        this.currentUserId = parseInt(currentUserId);
        this.SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        this.SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
    }

    // Validate message belongs to current user (sender or receiver)
    validateMessageAccess(message) {
        const senderId = parseInt(message.sender_id);
        const receiverId = parseInt(message.receiver_id);
        
        const hasAccess = senderId === this.currentUserId || receiverId === this.currentUserId;
        
        if (!hasAccess) {
            console.error(`🚨 SECURITY VIOLATION: User ${this.currentUserId} attempted to access message between ${senderId} and ${receiverId}`);
            return false;
        }
        
        return true;
    }

    // Get messages with strict isolation
    async getIsolatedMessages(partnerId) {
        const partnerIdInt = parseInt(partnerId);
        
        try {
            // CRITICAL: Only get messages between current user and specific partner
            const response = await fetch(
                `${this.SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at,read,sender:users!messages_sender_id_fkey(id,full_name,email,profile_photo)&or=(and(sender_id.eq.${this.currentUserId},receiver_id.eq.${partnerIdInt}),and(sender_id.eq.${partnerIdInt},receiver_id.eq.${this.currentUserId}))&order=created_at.asc`,
                {
                    headers: {
                        'apikey': this.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const messages = await response.json();
            
            // Double-check isolation on client side
            const validatedMessages = messages.filter(msg => this.validateMessageAccess(msg));
            
            console.log(`✅ Retrieved ${validatedMessages.length} isolated messages between users ${this.currentUserId} and ${partnerIdInt}`);
            
            return validatedMessages;
        } catch (error) {
            console.error('❌ Error getting isolated messages:', error);
            return [];
        }
    }

    // Send message with isolation validation
    async sendIsolatedMessage(receiverId, content) {
        const receiverIdInt = parseInt(receiverId);
        
        if (receiverIdInt === this.currentUserId) {
            console.error('🚨 Cannot send message to self');
            return null;
        }

        const messageData = {
            sender_id: this.currentUserId,
            receiver_id: receiverIdInt,
            content: content.trim(),
            read: false,
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const savedMessage = await response.json();
            console.log(`✅ Message isolated and persisted: ${this.currentUserId} -> ${receiverIdInt}`);
            
            return savedMessage[0];
        } catch (error) {
            console.error('❌ Error sending isolated message:', error);
            return null;
        }
    }

    // Get conversations with isolation
    async getIsolatedConversations() {
        try {
            // Get all messages involving current user
            const response = await fetch(
                `${this.SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at,read&or=(receiver_id.eq.${this.currentUserId},sender_id.eq.${this.currentUserId})&order=created_at.desc`,
                {
                    headers: {
                        'apikey': this.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const messages = await response.json();
            
            // Validate all messages belong to current user
            const validatedMessages = messages.filter(msg => this.validateMessageAccess(msg));
            
            // Group by conversation partner
            const conversationsMap = new Map();
            
            validatedMessages.forEach(message => {
                const partnerId = message.sender_id === this.currentUserId ? message.receiver_id : message.sender_id;
                
                if (!conversationsMap.has(partnerId)) {
                    conversationsMap.set(partnerId, {
                        partnerId: partnerId,
                        lastMessage: null,
                        lastMessageTime: null,
                        unreadCount: 0
                    });
                }
                
                const conv = conversationsMap.get(partnerId);
                
                // Update last message if this is more recent
                if (!conv.lastMessage || new Date(message.created_at) > new Date(conv.lastMessageTime)) {
                    conv.lastMessage = message.content;
                    conv.lastMessageTime = message.created_at;
                }
                
                // Count unread messages received by current user
                if (message.receiver_id === this.currentUserId && !message.read) {
                    conv.unreadCount++;
                }
            });
            
            console.log(`✅ Retrieved ${conversationsMap.size} isolated conversations for user ${this.currentUserId}`);
            
            return conversationsMap;
        } catch (error) {
            console.error('❌ Error getting isolated conversations:', error);
            return new Map();
        }
    }

    // Mark messages as read with isolation
    async markMessagesAsRead(senderId) {
        const senderIdInt = parseInt(senderId);
        
        try {
            // CRITICAL: Only mark messages sent TO current user FROM specific sender
            const response = await fetch(
                `${this.SUPABASE_URL}/rest/v1/messages?receiver_id=eq.${this.currentUserId}&sender_id=eq.${senderIdInt}&read=eq.false`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ read: true })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`✅ Marked messages as read: from ${senderIdInt} to ${this.currentUserId}`);
            return true;
        } catch (error) {
            console.error('❌ Error marking messages as read:', error);
            return false;
        }
    }
}

// Export for use in unified-messenger
window.MessageIsolationValidator = MessageIsolationValidator;