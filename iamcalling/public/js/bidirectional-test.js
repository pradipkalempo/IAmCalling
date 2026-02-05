// Bidirectional Communication Test & Fix
class BidirectionalTest {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.waitForAuth();
        this.runTests();
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

    async runTests() {
        console.log('🧪 BIDIRECTIONAL COMMUNICATION TEST');
        console.log('👤 Current User:', this.currentUser.id);
        
        // Test 1: Check WebSocket connection
        this.testWebSocketConnection();
        
        // Test 2: Check message sending
        setTimeout(() => this.testMessageSending(), 2000);
        
        // Test 3: Check message receiving
        setTimeout(() => this.testMessageReceiving(), 4000);
    }

    testWebSocketConnection() {
        console.log('🔌 TEST 1: WebSocket Connection');
        
        if (window.messenger && window.messenger.ws) {
            const state = window.messenger.ws.readyState;
            const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
            console.log('  WebSocket State:', states[state]);
            console.log('  Connected Flag:', window.messenger.wsConnected);
            
            if (state === 1) {
                console.log('✅ WebSocket connection OK');
                window.showNotification('✅ WebSocket connected');
            } else {
                console.log('❌ WebSocket not connected');
                window.showNotification('❌ WebSocket failed - fixing...');
                this.fixWebSocketConnection();
            }
        } else {
            console.log('❌ No WebSocket found');
            window.showNotification('❌ No WebSocket - creating...');
            this.createWebSocketConnection();
        }
    }

    fixWebSocketConnection() {
        console.log('🔧 FIXING WebSocket connection...');
        
        if (window.messenger) {
            // Force reconnect
            window.messenger.connectWebSocket();
            
            setTimeout(() => {
                if (window.messenger.ws && window.messenger.ws.readyState === 1) {
                    console.log('✅ WebSocket fixed');
                    window.showNotification('✅ WebSocket reconnected');
                } else {
                    console.log('❌ WebSocket fix failed');
                    window.showNotification('❌ WebSocket fix failed');
                }
            }, 2000);
        }
    }

    createWebSocketConnection() {
        console.log('🔧 CREATING WebSocket connection...');
        
        if (window.messenger) {
            try {
                window.messenger.ws = new WebSocket('ws://localhost:1000');
                
                window.messenger.ws.onopen = () => {
                    window.messenger.wsConnected = true;
                    console.log('✅ WebSocket created and connected');
                    window.showNotification('✅ WebSocket created');
                    
                    // Register user
                    window.messenger.ws.send(JSON.stringify({
                        type: 'register',
                        userId: parseInt(this.currentUser.id)
                    }));
                };
                
                window.messenger.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new-message' && data.to === parseInt(this.currentUser.id)) {
                        console.log('📨 Message received via WebSocket:', data);
                        
                        if (window.messenger && data.from === parseInt(window.messenger.activeChat)) {
                            window.messenger.addMessageToUI({
                                sender_id: data.from,
                                content: data.message,
                                created_at: data.timestamp
                            });
                        }
                        
                        window.showNotification(`📨 ${data.fromName}: ${data.message}`);
                    }
                };
                
                window.messenger.ws.onclose = () => {
                    window.messenger.wsConnected = false;
                    console.log('🔌 WebSocket closed');
                };
                
            } catch (error) {
                console.error('❌ WebSocket creation failed:', error);
                window.showNotification('❌ WebSocket creation failed');
            }
        }
    }

    async testMessageSending() {
        console.log('📤 TEST 2: Message Sending');
        
        if (!window.messenger || !window.messenger.activeChat) {
            console.log('❌ No active chat selected');
            window.showNotification('❌ Select a user to test sending');
            return;
        }
        
        const testMessage = {
            sender_id: parseInt(this.currentUser.id),
            receiver_id: parseInt(window.messenger.activeChat),
            content: 'BIDIRECTIONAL TEST: Sending at ' + new Date().toLocaleTimeString(),
            created_at: new Date().toISOString()
        };
        
        console.log('📤 Sending test message:', testMessage);
        
        // Test via WebSocket
        if (window.messenger.ws && window.messenger.ws.readyState === 1) {
            const wsMessage = {
                type: 'send-message',
                from: testMessage.sender_id,
                fromName: this.currentUser.full_name || 'Test User',
                to: testMessage.receiver_id,
                message: testMessage.content,
                timestamp: testMessage.created_at
            };
            
            window.messenger.ws.send(JSON.stringify(wsMessage));
            console.log('✅ Message sent via WebSocket');
            window.showNotification('📤 Test message sent via WebSocket');
        } else {
            console.log('❌ WebSocket not available for sending');
            window.showNotification('❌ WebSocket not available');
        }
        
        // Also save to Supabase
        await this.saveMessageToSupabase(testMessage);
    }

    async saveMessageToSupabase(messageData) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender_id: messageData.sender_id,
                    receiver_id: messageData.receiver_id,
                    content: messageData.content
                })
            });

            if (response.ok) {
                console.log('✅ Message saved to Supabase');
                window.showNotification('✅ Message saved to database');
            } else {
                console.log('❌ Supabase save failed');
                window.showNotification('❌ Database save failed');
            }
        } catch (error) {
            console.error('❌ Supabase error:', error);
            window.showNotification('❌ Database error');
        }
    }

    async testMessageReceiving() {
        console.log('📥 TEST 3: Message Receiving');
        
        // Check polling system
        if (window.messagePoller) {
            console.log('✅ Message poller active');
            window.showNotification('✅ Polling system active');
        } else {
            console.log('❌ No message poller');
            window.showNotification('❌ Polling system missing');
        }
        
        // Check Supabase realtime
        if (window.supabaseRealtime) {
            console.log('✅ Supabase realtime active');
            window.showNotification('✅ Realtime system active');
        } else {
            console.log('❌ No Supabase realtime');
            window.showNotification('❌ Realtime system missing');
        }
        
        // Test manual message check
        await this.checkForNewMessages();
    }

    async checkForNewMessages() {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at&receiver_id=eq.${this.currentUser.id}&order=id.desc&limit=5`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const messages = await response.json();
                console.log(`📥 Found ${messages.length} recent messages for user ${this.currentUser.id}`);
                
                if (messages.length > 0) {
                    console.log('📥 Latest message:', messages[0]);
                    window.showNotification(`📥 ${messages.length} messages found`);
                } else {
                    console.log('📥 No messages found');
                    window.showNotification('📥 No messages in database');
                }
            }
        } catch (error) {
            console.error('❌ Message check failed:', error);
            window.showNotification('❌ Message check failed');
        }
    }
}

// Initialize test
window.bidirectionalTest = new BidirectionalTest();

// Add test functions to window
window.testBidirectional = () => {
    if (window.bidirectionalTest) {
        window.bidirectionalTest.runTests();
    }
};

window.fixMessaging = () => {
    console.log('🔧 FIXING MESSAGING SYSTEM...');
    
    // Fix 1: Ensure WebSocket connection
    if (window.messenger && (!window.messenger.ws || window.messenger.ws.readyState !== 1)) {
        console.log('🔧 Fixing WebSocket...');
        window.messenger.connectWebSocket();
    }
    
    // Fix 2: Restart polling
    if (window.messagePoller) {
        console.log('🔧 Restarting polling...');
        window.messagePoller.stop();
        setTimeout(() => {
            window.messagePoller.startPolling();
        }, 1000);
    }
    
    // Fix 3: Restart Supabase realtime
    if (window.supabaseRealtime && window.supabaseRealtime.channel) {
        console.log('🔧 Restarting Supabase realtime...');
        window.supabaseRealtime.channel.unsubscribe();
        setTimeout(() => {
            window.supabaseRealtime.subscribeToMessages();
        }, 1000);
    }
    
    window.showNotification('🔧 Messaging system reset - test in 3 seconds');
    
    setTimeout(() => {
        window.testBidirectional();
    }, 3000);
};