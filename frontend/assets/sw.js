self.addEventListener('push', function(e) {
    const data = e.data ? e.data.json() : { title: 'New Notification', body: '' };
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/images/dread-emperor.png',
            badge: '/images/dread-emperor.png',
            tag: data.tag || 'purchase',
            requireInteraction: true,
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data?.url || '/43-purchase-admin.html'));
});
