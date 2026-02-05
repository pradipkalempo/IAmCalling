// Direct User Sorting Fix
(function() {
    'use strict';
    
    console.log('🔧 Direct user sorting loaded');
    
    // Function to move user to top
    function moveUserToTop(senderId) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        // Find user element by onclick attribute containing the sender ID
        const allUsers = usersList.querySelectorAll('[onclick*="selectUser"]');
        let userElement = null;
        
        for (let user of allUsers) {
            const onclick = user.getAttribute('onclick');
            if (onclick && onclick.includes(senderId)) {
                userElement = user;
                break;
            }
        }
        
        if (userElement) {
            console.log(`📌 Moving user ${senderId} to top`);
            usersList.insertBefore(userElement, usersList.firstChild);
            
            // Visual highlight
            userElement.style.backgroundColor = '#1a4d72';
            setTimeout(() => {
                userElement.style.backgroundColor = '';
            }, 1500);
        }
    }
    
    // Listen for real-time messages
    if (window.supabase) {
        window.supabase
            .channel('user-sorting')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const message = payload.new;
                const currentUserId = localStorage.getItem('currentUserId');
                
                // If message is for current user, move sender to top
                if (message.receiver_id === currentUserId) {
                    console.log(`📨 Message from ${message.sender_id}, moving to top`);
                    setTimeout(() => {
                        moveUserToTop(message.sender_id);
                    }, 300);
                }
            })
            .subscribe();
    }
    
    console.log('✅ Direct user sorting active');
})();