// Unified Messenger System for IAMCALLING
// Handles user listing, messaging, and WebSocket connections

class UnifiedMessenger {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.activeChat = null;
        this.ws = null;
        this.wsConnected = false;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 2;
        this.messages = new Map();
        this.processedMessages = new Set(); // Track processed message IDs
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Unified Messenger...');
        await this.waitForAuth();
        await this.loadUsers();
        this.connectWebSocket();
        this.setupEventListeners();
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                // Try to get user from various sources
                let currentUser = this.getCurrentUser();
                
                if (currentUser) {
                    this.currentUser = currentUser;
                    console.log('✅ User authenticated:', this.currentUser);
                    
                    // Set up global auth if not present
                    if (!window.globalAuth) {
                        window.globalAuth = {
                            isLoggedIn: () => true,
                            getCurrentUser: () => this.currentUser
                        };
                    }
                    
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }
    
    getCurrentUser() {
        const sources = [
            'currentUser', 'user_data', 'userData', 'userProfile', 'profile', 'user'
        ];

        for (const key of sources) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const user = JSON.parse(data);
                    if (user && (user.id || user.user_id)) {
                        return {
                            id: user.id || user.user_id,
                            full_name: user.full_name || user.name || user.username || `User ${user.id || user.user_id}`,
                            email: user.email,
                            profile_photo: user.profile_photo || user.avatar
                        };
                    }
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    async loadUsers() {
        try {
            console.log('📋 Loading users from Supabase...');

            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            // Get all users except current user
            const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,full_name,email,profile_photo,last_seen&id=neq.${this.currentUser.id}&limit=20`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });

            if (usersResponse.ok) {
                const users = await usersResponse.json();
                
                this.users = users.map(user => ({
                    id: user.id,
                    name: user.full_name || user.email || `User ${user.id}`,
                    email: user.email,
                    avatar: user.profile_photo || `https://i.pravatar.cc/150?u=${user.id}`,
                    status: this.getUserStatus(user.last_seen),
                    lastMessage: '',
                    lastMessageTime: null,
                    unreadCount: 0
                }));

                console.log(`📋 Loaded ${this.users.length} users`);
                this.renderUsersWithConversations();
            }
        } catch (error) {
            console.log('⚠️ Error loading users:', error);
            this.users = this.createMockUsers();
            this.renderUsersWithConversations();
        }
    }
    
    async getLastMessageForUser(userId) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=content,created_at,sender_id&or=(and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${this.currentUser.id}))&order=created_at.desc&limit=1`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const messages = await response.json();
                return messages[0] || null;
            }
            return null;
        } catch (error) {
            console.error('Error getting last message:', error);
            return null;
        }
    }
    
    async getUnreadCount(userId) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id&sender_id=eq.${userId}&receiver_id=eq.${this.currentUser.id}&read=eq.false&order=created_at.desc&limit=1`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.length;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }
    
    createMockUsers() {
        return [
            {
                id: 95,
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://i.pravatar.cc/150?u=95',
                status: 'online',
                lastMessage: 'Hey there! How are you doing?',
                lastMessageTime: new Date(Date.now() - 300000).toISOString(),
                unreadCount: 2
            },
            {
                id: 96,
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: 'https://i.pravatar.cc/150?u=96',
                status: 'offline',
                lastMessage: 'Thanks for your help yesterday',
                lastMessageTime: new Date(Date.now() - 600000).toISOString(),
                unreadCount: 0
            },
            {
                id: 97,
                name: 'Bob Wilson',
                email: 'bob@example.com',
                avatar: 'https://i.pravatar.cc/150?u=97',
                status: 'online',
                lastMessage: 'See you at the meeting',
                lastMessageTime: new Date(Date.now() - 900000).toISOString(),
                unreadCount: 1
            }
        ];
    }

    getUserStatus(lastSeen) {
        if (!lastSeen) return 'offline';

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / (1000 * 60);

        return diffMinutes < 5 ? 'online' : 'offline';
    }

    renderUsersWithConversations() {
        const container = document.getElementById('conversationsList');
        if (!container) return;

        container.innerHTML = '';

        if (this.users.length === 0) {
            container.innerHTML = '<div class="no-users-message" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No users found</div>';
            return;
        }

        this.users.forEach(user => {
            const userElement = this.createUserElement(user);
            container.appendChild(userElement);
        });

        console.log('✅ Rendered users:', this.users.length);
    }

    createUserElement(user) {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.userId = user.id;
        div.onclick = () => this.selectUser(user.id);

        if (this.activeChat == user.id) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="user-avatar">
                <img src="${user.avatar}" alt="${user.name}" onerror="this.src='https://i.pravatar.cc/150?u=${user.id}'">
                <div class="user-status ${user.status}"></div>
            </div>
            <div class="conversation-info">
                <div class="conversation-header">
                    <div class="user-name">${user.name}</div>
                    <div class="message-time">${user.lastMessageTime ? this.formatTime(user.lastMessageTime) : ''}</div>
                </div>
                <div class="conversation-footer">
                    <div class="last-message">${user.lastMessage ? (user.lastMessage.length > 50 ? user.lastMessage.substring(0, 50) + '...' : user.lastMessage) : 'No messages yet'}</div>
                </div>
            </div>
        `;

        return div;
    }

    selectUser(userId) {
        console.log('👤 Selecting user:', userId);
        this.activeChat = userId;

        // Update UI - fix null element error
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Update chat header
        const user = this.users.find(u => u.id == userId);
        if (user) {
            const chatUserName = document.getElementById('chatUserName');
            const chatUserStatus = document.getElementById('chatUserStatus');
            const chatUserAvatar = document.getElementById('chatUserAvatar');
            
            if (chatUserName) chatUserName.textContent = user.name;
            if (chatUserStatus) chatUserStatus.textContent = user.status === 'online' ? 'Online' : 'Offline';
            if (chatUserAvatar) {
                chatUserAvatar.textContent = user.name.charAt(0).toUpperCase();
                if (user.avatar) {
                    chatUserAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                }
            }
        }

        // Show main content on mobile
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        if (sidebar) sidebar.classList.add('hidden');
        if (mainContent) mainContent.classList.add('active');

        // Show and enable input
        const chatInputContainer = document.querySelector('.chat-input-container');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInputContainer) {
            chatInputContainer.classList.add('active');
            chatInputContainer.style.display = 'flex';
        }
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.focus();
        }
        if (sendBtn) sendBtn.disabled = false;

        // Load messages
        this.loadMessages(userId);
        
        // Reset unread count immediately when opening conversation
        const user = this.users.find(u => u.id == userId);
        if (user) {
            user.unreadCount = 0;
            this.renderUsersWithConversations();
        }
    }

    async loadMessages(userId) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            // Get ALL messages between current user and selected user
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=id,sender_id,receiver_id,content,created_at&or=(and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${this.currentUser.id}))&order=created_at.asc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const messages = await response.json();
                console.log(`💬 Loaded ${messages.length} messages between users ${this.currentUser.id} and ${userId}`);
                this.renderMessages(messages);
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        }
    }
    
    async markMessagesAsRead(userId) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
            
            await fetch(`${SUPABASE_URL}/rest/v1/messages?receiver_id=eq.${this.currentUser.id}&sender_id=eq.${userId}&read=eq.false`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ read: true })
            });
            
            // Reset unread count in UI
            const user = this.users.find(u => u.id == userId);
            if (user) {
                user.unreadCount = 0;
            }
        } catch (error) {
            console.error('❌ Error marking messages as read:', error);
        }
    }

    renderMessages(messages) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = '';

        if (messages.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No messages yet. Start the conversation!</div>';
            return;
        }

        messages.forEach(message => {
            this.addMessageToUI(message);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    addMessageToUI(message) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const isSent = message.sender_id == this.currentUser.id;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${message.content}
                <div class="message-time">${this.formatTime(message.created_at)}</div>
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    connectWebSocket() {
        try {
            this.ws = new WebSocket('ws://localhost:1000');
            
            this.ws.onopen = () => {
                this.wsConnected = true;
                console.log('✅ WebSocket connected');
                
                // Register user for targeted messaging
                this.ws.send(JSON.stringify({
                    type: 'register',
                    userId: parseInt(this.currentUser.id)
                }));
            };
            
            this.ws.onmessage = (event) => {
                // Disabled automatic unread count to prevent issues
                console.log('📨 Message received but unread count disabled');
            };
            
            this.ws.onclose = () => {
                this.wsConnected = false;
                console.log('🔌 WebSocket disconnected');
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.wsConnected = false;
            };
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.wsConnected = false;
        }
    }

    handleWebSocketMessage(data) {
        console.log('📨 WebSocket message:', data.type, data);

        if (data.type === 'new-message') {
            // CRITICAL: Only process messages intended for current user
            if (data.to === parseInt(this.currentUser.id)) {
                console.log('✅ Message received for current user from:', data.fromName);

                // Add to UI only if chatting with sender
                if (data.from === parseInt(this.activeChat)) {
                    this.addMessageToUI({
                        sender_id: data.from,
                        receiver_id: data.to,
                        content: data.message,
                        created_at: data.timestamp
                    });
                }

                // Show notification
                if (window.showNotification) {
                    window.showNotification(`📨 ${data.fromName}: ${data.message}`);
                }

                // Update conversation preview
                this.updateConversationPreview(data.from, data.message);
            } else {
                // SECURITY: Ignore messages not intended for current user
                console.log('⚠️ Message ignored - not for current user (to:', data.to, 'current:', this.currentUser.id, ')');
            }
        }
    }

    updateConversationPreview(userId, message) {
        const userIndex = this.users.findIndex(u => u.id == userId);
        if (userIndex > -1) {
            // Update the user's last message
            this.users[userIndex].lastMessage = message;
            this.users[userIndex].lastMessageTime = new Date().toISOString();
            
            // Only increment unread count if:
            // 1. It's a message from the other user (not current user)
            // 2. The user is NOT currently viewing this conversation
            if (parseInt(userId) !== this.currentUser.id && parseInt(userId) !== parseInt(this.activeChat)) {
                this.users[userIndex].unreadCount++;
            }
            
            // Sort users by last message time
            this.users.sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA;
            });

            // Re-render
            this.renderUsersWithConversations();
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim() || !this.activeChat) return;

        const message = input.value.trim();
        input.value = '';

        const messageData = {
            sender_id: parseInt(this.currentUser.id),
            receiver_id: parseInt(this.activeChat),
            content: message,
            created_at: new Date().toISOString()
        };

        console.log('📤 SENDING MESSAGE:', messageData);

        // Add to UI immediately and keep it there
        this.addMessageToUI(messageData);

        // Try to save to Supabase but don't remove from UI if it fails
        this.sendMessageViaSupabase(messageData);
    }

    async sendMessageViaSupabase(messageData) {
        try {
            const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
            const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';

            console.log('💾 SAVING MESSAGE:', messageData.sender_id, '->', messageData.receiver_id, ':', messageData.content);

            // Use fetch with proper error handling
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    sender_id: messageData.sender_id,
                    receiver_id: messageData.receiver_id,
                    content: messageData.content
                })
            });

            if (response.ok) {
                const savedMessage = await response.json();
                console.log('✅ MESSAGE SAVED TO SUPABASE:', savedMessage);
                
                // Send via WebSocket for real-time delivery
                this.sendViaWebSocket(messageData);
                
                return savedMessage[0];
            } else {
                const errorText = await response.text();
                console.error('❌ SUPABASE SAVE FAILED:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
        } catch (error) {
            console.error('❌ SUPABASE SAVE ERROR:', error);
            // Don't let the message disappear - keep it in UI even if save fails
            if (window.showNotification) {
                window.showNotification('⚠️ Message sent but may not be saved');
            }
            return null;
        }
    }

    sendViaWebSocket(messageData) {
        if (this.ws && this.wsConnected) {
            const senderName = this.currentUser.full_name || this.currentUser.email || 'Unknown User';
            
            this.ws.send(JSON.stringify({
                type: 'send-message',
                from: messageData.sender_id,
                fromName: senderName,
                to: messageData.receiver_id,
                message: messageData.content,
                timestamp: messageData.created_at
            }));
            
            console.log(`📨 WebSocket message sent: ${messageData.sender_id} -> ${messageData.receiver_id}`);
        } else {
            console.log('⚠️ WebSocket not connected, message saved to DB only');
        }
    }

    setupEventListeners() {
        // Send button
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Enter key
        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.sendMessage();
                }
            });
        }

        // Back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('hidden');
                document.getElementById('main-content').classList.remove('active');
            });
        }
    }

    showError(message) {
        console.error('❌ Error:', message);
        if (window.showNotification) {
            window.showNotification(`❌ ${message}`);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.messenger = new UnifiedMessenger();
});

// Make functions globally available for HTML inline scripts
window.UnifiedMessenger = UnifiedMessenger;
