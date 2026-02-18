// Web Push Notifications System
class PushNotificationManager {
    constructor() {
        this.vapidPublicKey = null; // Will be fetched from server
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.subscription = null;
    }

    async init() {
        if (!this.isSupported) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            // Fetch VAPID public key from server
            const response = await fetch('/api/vapid-public-key');
            const data = await response.json();
            this.vapidPublicKey = data.publicKey;

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                this.subscription = existingSubscription;
                console.log('Already subscribed to push notifications');
                return true;
            }

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

            console.log('Push subscription created:', this.subscription);
            
            // Save subscription to server
            await fetch('/api/push-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: this.subscription,
                    userAgent: navigator.userAgent
                })
            });
            
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
}

// Initialize push notifications
const pushManager = new PushNotificationManager();

// Auto-initialize on page load (ask for permission after 3 seconds)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (localStorage.getItem('pushPermissionAsked') !== 'true') {
            pushManager.init().then(success => {
                if (success) {
                    console.log('✅ Push notifications enabled!');
                }
                localStorage.setItem('pushPermissionAsked', 'true');
            });
        } else {
            // Already asked, just register service worker
            pushManager.init();
        }
    }, 3000);
});

// Export for global use
window.pushManager = pushManager;