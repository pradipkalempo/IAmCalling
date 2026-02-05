// Supabase Realtime Message Delivery
class SupabaseRealtime {
    constructor() {
        this.currentUser = null;
        this.supabase = null;
        this.channel = null;
        this.init();
    }

    async init() {
        await this.waitForAuth();
        this.setupSupabase();
        this.subscribeToMessages();
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

    setupSupabase() {
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    subscribeToMessages() {
        console.log('🔊 Setting up Supabase realtime subscription for user:', this.currentUser.id);
        
        this.channel = this.supabase
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${this.currentUser.id}`
            }, (payload) => {
                console.log('🔔 Supabase realtime event triggered:', payload);
                this.handleNewMessage(payload.new);
            })
            .subscribe((status) => {
                console.log('🔊 Supabase subscription status:', status);
            });

        console.log('✅ Supabase realtime subscribed for user', this.currentUser.id);
    }

    handleNewMessage(message) {
        console.log('📨 Supabase realtime message received:', message);
        console.log('📨 Current user ID:', this.currentUser.id);
        console.log('📨 Message receiver_id:', message.receiver_id);
        console.log('📨 Active chat:', window.messenger?.activeChat);
        
        // Only process if message is for current user
        if (message.receiver_id === parseInt(this.currentUser.id)) {
            console.log('✅ Message is for current user');
            
            // Add to UI if chatting with sender
            if (window.messenger && message.sender_id === parseInt(window.messenger.activeChat)) {
                console.log('✅ Adding message to UI - sender matches active chat');
                window.messenger.addMessageToUI({
                    sender_id: message.sender_id,
                    content: message.content,
                    created_at: message.created_at
                });
            } else {
                console.log('⏭️ Message not added to UI - sender does not match active chat');
            }
            
            // Show notification
            if (false && window.showNotification) {
                window.showNotification(`📨 New message: ${message.content}`);
            }
        } else {
            console.log('⏭️ Message ignored - not for current user');
        }
    }
}

// Initialize Supabase realtime
window.supabaseRealtime = new SupabaseRealtime();