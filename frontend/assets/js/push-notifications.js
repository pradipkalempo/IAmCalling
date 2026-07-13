class PushNotificationManager {
    constructor() {
        this.vapidPublicKey = null;
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    }

    async init(role = 'user') {
        if (!this.isSupported) return false;
        try {
            const res = await fetch('/api/push/vapid-public-key');
            const { key } = await res.json();
            this.vapidPublicKey = key;

            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this._toUint8Array(this.vapidPublicKey)
            });

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub, role })
            });

            return true;
        } catch (e) {
            console.error('Push init failed:', e);
            return false;
        }
    }

    _toUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
    }
}

window.pushManager = new PushNotificationManager();
