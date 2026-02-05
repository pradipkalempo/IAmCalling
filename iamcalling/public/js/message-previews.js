// Message Preview System - Auto-integrate with existing messenger
(function() {
    'use strict';
    
    // Disable push notifications immediately
    if ('Notification' in window) {
        Notification.requestPermission = () => Promise.resolve('denied');
        window.Notification = class { constructor() { return null; } };
    }
    if (window.showNotification) {
        window.showNotification = () => {};
    }
    
    // Store message previews per user
    window.userMessagePreviews = new Map();
    
    // Add message preview to user
    function addMessagePreview(userId, message) {
        if (!window.userMessagePreviews.has(userId)) {
            window.userMessagePreviews.set(userId, []);
        }
        
        const messages = window.userMessagePreviews.get(userId);
        messages.unshift({ message, time: new Date() });
        
        if (messages.length > 5) messages.splice(5);
        
        updateUserDisplay(userId);
    }
    
    // Update user display with message previews
    function updateUserDisplay(userId) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userElement) return;
        
        const messages = window.userMessagePreviews.get(userId) || [];
        let previewContainer = userElement.querySelector('.message-preview');
        
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'message-preview';
            const conversationInfo = userElement.querySelector('.conversation-info');
            if (conversationInfo) conversationInfo.appendChild(previewContainer);
        }
        
        previewContainer.innerHTML = messages.map(msg => 
            `<div class="preview-msg">${msg.message}</div>`
        ).join('');
    }
    
    // Clear previews when user is selected
    function clearUserPreviews(userId) {
        window.userMessagePreviews.delete(userId);
        updateUserDisplay(userId);
    }
    
    // Hook into existing messenger WebSocket messages
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const ws = new originalWebSocket(url, protocols);
        
        const originalOnMessage = ws.onmessage;
        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new-message' && data.to && data.from && data.message) {
                    addMessagePreview(data.from, data.message);
                }
            } catch(e) {}
            
            if (originalOnMessage) originalOnMessage.call(this, event);
        };
        
        return ws;
    };
    
    // Hook into user selection to clear previews
    document.addEventListener('click', function(e) {
        const userItem = e.target.closest('[data-user-id]');
        if (userItem) {
            const userId = userItem.dataset.userId;
            setTimeout(() => clearUserPreviews(userId), 100);
        }
    });
    
    // Add CSS for message previews
    const style = document.createElement('style');
    style.textContent = `
        .message-preview {
            margin-top: 5px;
            max-height: 60px;
            overflow: hidden;
        }
        .preview-msg {
            font-size: 11px;
            color: #666;
            padding: 2px 0;
            border-left: 2px solid #007bff;
            padding-left: 6px;
            margin: 1px 0;
            background: #f8f9fa;
            border-radius: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .user-item:hover .preview-msg {
            background: #e0e0e0;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Message preview system loaded');
})();