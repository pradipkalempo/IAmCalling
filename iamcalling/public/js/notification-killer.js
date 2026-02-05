// COMPLETE NOTIFICATION KILLER - Load this FIRST
(function() {
    'use strict';
    
    // Kill all notification APIs
    if ('Notification' in window) {
        window.Notification = class { constructor() { return null; } };
        Notification.requestPermission = () => Promise.resolve('denied');
        Notification.permission = 'denied';
    }
    
    // Override all possible notification functions
    window.showNotification = () => {};
    window.alert = () => {};
    
    // Block toast notifications
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName.toLowerCase() === 'div' && element.className && element.className.includes('notification')) {
            element.style.display = 'none !important';
        }
        return element;
    };
    
    // Hide notification toast immediately
    setTimeout(() => {
        const toast = document.getElementById('notification-toast');
        if (toast) {
            toast.style.display = 'none';
            toast.remove();
        }
    }, 100);
    
    // Override any future showNotification assignments - SAFER APPROACH
    try {
        if (!window.hasOwnProperty('showNotification')) {
            Object.defineProperty(window, 'showNotification', {
                value: () => {},
                writable: false,
                configurable: false
            });
        }
    } catch(e) {
        // Fallback if property already exists
        window.showNotification = () => {};
    }
    
    console.log('🚫 All notifications blocked');
})();