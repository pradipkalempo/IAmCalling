// Simple Message Polling System
class MessagePoller {
    constructor() {
        this.currentUser = null;
        this.lastMessageId = 0;
        this.pollInterval = null;
        this.init();
    }

    async init() {
        await this.waitForAuth();
        this.startPolling();
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.globalAuth && window.globalAuth.isLoggedIn()) {
                    this.currentUser = window.globalAuth.getCurrentUser();
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    startPolling() {
        // Poll every 3 seconds for new messages
        this.pollInterval = setInterval(() => {
            this.checkForNewMessages();
        }, 3000);
        
        console.log('✅ Message polling started for user', this.currentUser.id);
    }

    async checkForNewMessages() {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            // Get messages where current user is receiver AND newer than last seen
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at&receiver_id=eq.${this.currentUser.id}&id=gt.${this.lastMessageId}&order=id.asc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const newMessages = await response.json();
                
                if (newMessages.length > 0) {
                    console.log(`📨 Polling found ${newMessages.length} new messages for user ${this.currentUser.id}`);
                    
                    newMessages.forEach(message => {
                        this.handleNewMessage(message);
                        this.lastMessageId = message.id;
                    });
                }
            }
        } catch (error) {
            console.error('❌ Polling error:', error);
        }
    }

    handleNewMessage(message) {
        console.log('📨 Polling found new message:', message);
        
        // Update unread count
        this.updateUnreadCount();
        
        // Only add to UI if chatting with sender
        if (window.messenger && message.sender_id === parseInt(window.messenger.activeChat)) {
            console.log('✅ Adding message to UI - sender matches active chat');
            window.messenger.addMessageToUI({
                sender_id: message.sender_id,
                content: message.content,
                created_at: message.created_at
            });
        }
        
        // Show notification
        if (false && window.showNotification) {
            window.showNotification(`📨 New: ${message.content}`);
        }
    }

    async updateUnreadCount() {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id&receiver_id=eq.${this.currentUser.id}&read=eq.false`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const unreadMessages = await response.json();
                const count = unreadMessages.length;
                
                const unreadElement = document.getElementById('total-unread');
                if (unreadElement) {
                    if (count > 0) {
                        unreadElement.textContent = count;
                        unreadElement.style.display = 'inline';
                    } else {
                        unreadElement.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating unread count:', error);
        }
    }

    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('⏹️ Message polling stopped');
        }
    }
}

// Initialize message poller
window.messagePoller = new MessagePoller();