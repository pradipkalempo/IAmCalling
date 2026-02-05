// Simple Supabase Users Loader - Fast and Direct
(function() {
    'use strict';
    
    const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
    const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
    
    async function loadRealUsers() {
        const container = document.getElementById('conversationsList');
        if (!container) return;
        
        // Show loading
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#a0c0ff;">Loading users...</div>';
        
        try {
            // Get current user ID
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const currentUserId = currentUser.id || 157;
            
            console.log('🔍 Loading users for current user:', currentUserId);
            
            // Fetch users from Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,full_name,email,profile_photo,last_seen&id=neq.${currentUserId}&limit=20`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const users = await response.json();
            console.log('✅ Loaded real users from Supabase:', users.length);
            
            // Clear container
            container.innerHTML = '';
            
            if (users.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:2rem;color:#a0c0ff;">No other users found</div>';
                return;
            }
            
            // Display users
            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'conversation-item';
                userDiv.dataset.userId = user.id;
                userDiv.onclick = () => selectUser(user.id, user);
                
                const status = getStatus(user.last_seen);
                const avatar = user.profile_photo || `https://i.pravatar.cc/150?u=${user.id}`;
                const name = user.full_name || user.email || `User ${user.id}`;
                
                userDiv.innerHTML = `
                    <div class="user-avatar">
                        <img src="${avatar}" alt="${name}" onerror="this.src='https://i.pravatar.cc/150?u=${user.id}'">
                        <div class="user-status ${status}"></div>
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <div class="user-name">${name}</div>
                            <div class="message-time">Online</div>
                        </div>
                        <div class="conversation-footer">
                            <div class="last-message">Click to start chatting</div>
                        </div>
                    </div>
                `;
                
                container.appendChild(userDiv);
            });
            
            console.log('✅ Real users displayed:', users.length);
            
        } catch (error) {
            console.error('❌ Error loading users:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:2rem;color:#ff6b6b;">
                    Failed to load users<br>
                    <button onclick="window.loadRealUsers()" style="margin-top:1rem;padding:0.5rem 1rem;background:#6a99ff;color:white;border:none;border-radius:0.5rem;cursor:pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }
    
    function getStatus(lastSeen) {
        if (!lastSeen) return 'offline';
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / (1000 * 60);
        return diffMinutes < 5 ? 'online' : 'offline';
    }
    
    function selectUser(userId, user) {
        console.log('👤 Selected real user:', user.full_name || user.email);
        
        // Update active state
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-user-id="${userId}"]`).classList.add('active');
        
        // Update chat header
        const name = user.full_name || user.email || `User ${user.id}`;
        const avatar = user.profile_photo || `https://i.pravatar.cc/150?u=${user.id}`;
        
        document.getElementById('chatUserName').textContent = name;
        document.getElementById('chatUserStatus').textContent = 'Online';
        document.getElementById('chatUserAvatar').innerHTML = `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        
        // Show main content
        document.getElementById('sidebar').classList.add('hidden');
        document.querySelector('.main-content').classList.add('active');
        
        // Enable input
        const inputContainer = document.querySelector('.chat-input-container');
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        inputContainer.classList.add('active');
        inputContainer.style.display = 'flex';
        input.disabled = false;
        sendBtn.disabled = false;
        
        // Show welcome message
        document.getElementById('chat-messages').innerHTML = `
            <div class="message received">
                <div class="message-bubble">
                    You are now chatting with ${name}. Say hello!
                    <div class="message-time">Just now</div>
                </div>
            </div>
        `;
        
        input.focus();
    }
    
    // Make function globally available
    window.loadRealUsers = loadRealUsers;
    
    // Auto-load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadRealUsers);
    } else {
        loadRealUsers();
    }
    
    // Also load after a short delay to ensure everything is ready
    setTimeout(loadRealUsers, 1000);
    
})();