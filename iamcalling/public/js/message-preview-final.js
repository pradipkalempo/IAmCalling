// Complete Message Preview System - No Notifications
(function() {
    'use strict';
    
    // Kill all notifications immediately
    if ('Notification' in window) {
        Notification.requestPermission = () => Promise.resolve('denied');
        window.Notification = class { constructor() { return null; } };
    }
    
    // Override any notification functions
    window.showNotification = () => {};
    
    // Store message previews
    const userPreviews = new Map();
    
    // Add message preview
    function addPreview(userId, message) {
        if (!userPreviews.has(userId)) {
            userPreviews.set(userId, []);
        }
        
        const previews = userPreviews.get(userId);
        previews.unshift(message);
        if (previews.length > 4) previews.splice(4);\n        \n        updateUserElement(userId);\n    }\n    \n    // Update user element with previews\n    function updateUserElement(userId) {\n        const userEl = document.querySelector(`[data-user-id=\"${userId}\"]`);\n        if (!userEl) return;\n        \n        const previews = userPreviews.get(userId) || [];\n        let previewDiv = userEl.querySelector('.msg-previews');\n        \n        if (!previewDiv) {\n            previewDiv = document.createElement('div');\n            previewDiv.className = 'msg-previews';\n            const info = userEl.querySelector('.conversation-info');\n            if (info) info.appendChild(previewDiv);\n        }\n        \n        previewDiv.innerHTML = previews.map(msg => \n            `<div class=\"msg-preview\">${msg}</div>`\n        ).join('');\n    }\n    \n    // Clear previews when user selected\n    function clearPreviews(userId) {\n        userPreviews.delete(userId);\n        updateUserElement(userId);\n    }\n    \n    // Hook into message polling\n    const originalFetch = window.fetch;\n    window.fetch = function(...args) {\n        return originalFetch.apply(this, args).then(response => {\n            if (response.url && response.url.includes('/messages?') && response.ok) {\n                response.clone().json().then(messages => {\n                    messages.forEach(msg => {\n                        if (msg.sender_id && msg.content) {\n                            addPreview(msg.sender_id, msg.content);\n                        }\n                    });\n                }).catch(() => {});\n            }\n            return response;\n        });\n    };\n    \n    // Hook into user clicks\n    document.addEventListener('click', function(e) {\n        const userItem = e.target.closest('[data-user-id]');\n        if (userItem) {\n            const userId = userItem.dataset.userId;\n            setTimeout(() => clearPreviews(userId), 50);\n        }\n    });\n    \n    // Add CSS\n    const style = document.createElement('style');\n    style.textContent = `\n        .msg-previews {\n            margin-top: 4px;\n            max-height: 50px;\n            overflow: hidden;\n        }\n        .msg-preview {\n            font-size: 10px;\n            color: #666;\n            padding: 1px 4px;\n            margin: 1px 0;\n            background: #f0f8ff;\n            border-left: 2px solid #007bff;\n            border-radius: 2px;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n    `;\n    document.head.appendChild(style);\n    \n    console.log('✅ Message previews active, notifications disabled');\n})();