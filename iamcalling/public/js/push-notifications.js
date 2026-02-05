// Web Push Notifications System
class PushNotificationManager {
    constructor() {
        this.vapidPublicKey = 'BAYg1UdXx8MxkveYPGtoHJh1vaLm-r4b_w0y3eT7KfUQgTOITJREY4e__slCCW-y1_pMftiPHEahqW5J1OpIVa4';
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.subscription = null;
    }

    async init() {
        if (!this.isSupported) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/scripts/sw.js');
            console.log('Service Worker registered');

            // Request permission
            const permission = await this.requestPermission();
            if (permission === 'granted') {
                await this.subscribe(registration);
                return true;
            }
        } catch (error) {
            console.error('Push notification setup failed:', error);
        }
        return false;
    }

    async requestPermission() {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission;
    }

    async subscribe(registration) {
        try {
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            });

            console.log('Push subscription:', this.subscription);
            
            // Save subscription to localStorage for now
            localStorage.setItem('pushSubscription', JSON.stringify(this.subscription));
            
            return this.subscription;
        } catch (error) {
            console.error('Failed to subscribe:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Send local notification (for testing)
    showLocalNotification(title, body, icon = '/assets/logo.png') {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon });
        }
    }
}

// Initialize push notifications
const pushManager = new PushNotificationManager();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Ask for permission after user interaction
    setTimeout(() => {
        if (localStorage.getItem('pushPermissionAsked') !== 'true') {
            pushManager.init().then(success => {
                if (success) {
                    pushManager.showLocalNotification(
                        'Welcome to ICallUser!', 
                        'You will now receive notifications for messages and calls.'
                    );
                }
                localStorage.setItem('pushPermissionAsked', 'true');
            });
        }
    }, 3000); // Wait 3 seconds after page load
});

// Listen for new article notifications
window.addEventListener('newArticlePublished', (event) => {
    const notification = event.detail;
    
    // Show push notification to all users except the author
    const currentUserName = document.getElementById('currentUserName')?.textContent || 'Demo User';
    
    if (notification.author !== currentUserName) {
        pushManager.showLocalNotification(
            notification.title,
            notification.message
        );
        console.log('📢 Received new article notification:', notification.articleTitle);
    }
});

// Check for stored notifications on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show notification badge if there are unread notifications
    setTimeout(() => {
        const notifications = JSON.parse(localStorage.getItem('global_notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            console.log(`📬 You have ${unreadCount} unread notifications`);
            
            // Show summary notification
            if (pushManager.isSupported && Notification.permission === 'granted') {
                pushManager.showLocalNotification(
                    '📬 Unread Notifications',
                    `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                );
            }
        }
    }, 2000);
});

// Export for global use
window.pushManager = pushManager;