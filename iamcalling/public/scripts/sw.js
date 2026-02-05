self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('iamcalling-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/css/style.css',
                '/js/main.js',
                '/assets/logo.png' // Updated path to assets
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/logo.png' // Updated path to assets
    });
});