// Instant User Sorting Fix - Direct DOM Manipulation
(function() {
    'use strict';

    console.log('🔧 Instant user sorting fix loaded');

    function moveUserToTop(userId) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        let userElement = usersList.querySelector(`[data-user-id="${userId}"]`);

        if (!userElement) {
            const allUsers = usersList.querySelectorAll('.user-item, .conversation-item, [onclick*="selectUser"]');
            userElement = Array.from(allUsers).find(el =>
                el.onclick?.toString().includes(userId) ||
                el.getAttribute('onclick')?.includes(userId)
            );
        }

        if (userElement) {
            console.log(`📌 Moving user ${userId} to top`);
            usersList.insertBefore(userElement, usersList.firstChild);

            userElement.style.backgroundColor = '#1a4d72';
            setTimeout(() => {
                userElement.style.backgroundColor = '';
            }, 2000);
        } else {
            console.log(`❌ User element not found for ID: ${userId}`);
        }
    }

    const originalHandleMessage = window.handleRealtimeMessage;
    if (originalHandleMessage) {
        window.handleRealtimeMessage = function(message) {
            const result = originalHandleMessage(message);

            setTimeout(() => {
                moveUserToTop(message.sender_id);
            }, 100);

            return result;
        };
    }

    if (window.supabase) {
        window.supabase
            .channel('instant-sorting')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const message = payload.new;
                const currentUserId = localStorage.getItem('currentUserId');

                if (message.receiver_id === currentUserId) {
                    console.log(`📨 Message received from ${message.sender_id}, moving to top`);
                    setTimeout(() => {
                        moveUserToTop(message.sender_id);
                    }, 200);
                }
            })
            .subscribe();
    }

    setInterval(() => {
        const currentUserId = localStorage.getItem('currentUserId');
        if (!currentUserId) return;

        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const userElements = Array.from(usersList.children);

        userElements.forEach(async (element) => {
            const userId = extractUserIdFromElement(element);
            if (!userId || userId === currentUserId) return;

            try {
                const supabaseUrl = window.APP_CONFIG?.supabaseUrl;
                const supabaseKey = window.APP_CONFIG?.supabaseAnonKey;
                if (!supabaseUrl || !supabaseKey) return;

                const response = await fetch(`${supabaseUrl}/rest/v1/messages?select=created_at&or=(and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}))&order=created_at.desc&limit=1`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                });

                if (response.ok) {
                    const messages = await response.json();
                    if (messages.length > 0) {
                        element.dataset.lastMessage = messages[0].created_at;
                    }
                }
            } catch (error) {
                console.error('Error checking messages:', error);
            }
        });

        setTimeout(() => {
            const sortedElements = userElements.sort((a, b) => {
                const aTime = a.dataset.lastMessage || '1970-01-01';
                const bTime = b.dataset.lastMessage || '1970-01-01';
                return new Date(bTime) - new Date(aTime);
            });

            sortedElements.forEach(element => {
                usersList.appendChild(element);
            });
        }, 1000);

    }, 3000);

    function extractUserIdFromElement(element) {
        if (element.dataset.userId) return element.dataset.userId;

        const onclick = element.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/selectUser\((\d+)\)/);
            if (match) return match[1];
        }

        const clickableChild = element.querySelector('[onclick*="selectUser"]');
        if (clickableChild) {
            const childOnclick = clickableChild.getAttribute('onclick');
            const match = childOnclick.match(/selectUser\((\d+)\)/);
            if (match) return match[1];
        }

        return null;
    }

    console.log('✅ Instant user sorting fix active');
})();