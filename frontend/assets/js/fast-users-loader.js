// Fast Supabase Users Loader with Caching
(function() {
    'use strict';
    
    const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
    const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
    
    let usersCache = null;
    let isLoading = false;
    
    async function loadUsersWithTimeout() {
        const container = document.getElementById('conversationsList');
        if (!container) return;
        
        // Show cached users immediately if available
        if (usersCache) {
            displayUsers(usersCache);
            return;
        }
        
        if (isLoading) return;
        isLoading = true;
        
        // Show loading
        container.innerHTML = '<div style="text-align:center;padding:1rem;color:#8696a0;">Loading...</div>';
        
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const currentUserId = currentUser.id || 157;
            
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            // Create fetch promise
            const fetchPromise = fetch(`${SUPABASE_URL}/rest/v1/users?select=id,full_name,email,profile_photo&id=neq.${currentUserId}&limit=15`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                }
            });
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const users = await response.json();
            console.log('✅ Loaded users:', users.length);
            
            // Cache users
            usersCache = users;
            displayUsers(users);
            
        } catch (error) {
            console.log('⚠️ Supabase failed, using fallback users');
            // Use fallback users
            const fallbackUsers = createFallbackUsers();
            usersCache = fallbackUsers;
            displayUsers(fallbackUsers);
        } finally {
            isLoading = false;
        }
    }
    
    function createFallbackUsers() {
        return [
            { id: 95, full_name: 'John Doe', email: 'john@example.com', profile_photo: null },
            { id: 96, full_name: 'Jane Smith', email: 'jane@example.com', profile_photo: null },
            { id: 97, full_name: 'Bob Wilson', email: 'bob@example.com', profile_photo: null },
            { id: 98, full_name: 'Alice Johnson', email: 'alice@example.com', profile_photo: null },
            { id: 99, full_name: 'Charlie Brown', email: 'charlie@example.com', profile_photo: null }
        ];
    }
    
    function displayUsers(users) {
        const container = document.getElementById('conversationsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!users || users.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:2rem;color:#8696a0;">No users found</div>';
            return;
        }
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'conversation-item';
            userDiv.dataset.userId = user.id;
            userDiv.onclick = () => selectUser(user.id, user);
            
            const name = user.full_name || user.email || `User ${user.id}`;
            const avatar = user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00a884&color=fff&size=50`;
            
            userDiv.innerHTML = `
                <div class="user-avatar">
                    <img src="${avatar}" alt="${name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00a884&color=fff&size=50'">
                    <div class="user-status online"></div>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <div class="user-name">${name}</div>
                        <div class="message-time">online</div>
                    </div>
                    <div class="last-message">Click to start chatting</div>
                </div>
            `;
            
            container.appendChild(userDiv);
        });
        
        console.log('✅ Displayed users:', users.length);
    }
    
    function selectUser(userId, user) {
        const name = user.full_name || user.email || `User ${user.id}`;
        const avatar = user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00a884&color=fff&size=50`;
        
        if (window.selectUser) {
            window.selectUser(userId, name, avatar);
        }
    }
    
    // Load immediately
    loadUsersWithTimeout();
    
    // Make function globally available
    window.loadUsers = loadUsersWithTimeout;
    
})();