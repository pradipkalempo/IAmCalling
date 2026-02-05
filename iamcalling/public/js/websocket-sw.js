// WebSocket Service Worker
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

// Mock WebSocket server functionality
const mockServer = {
    clients: new Map(),
    
    handleConnection: function(clientId) {
        this.clients.set(clientId, { id: clientId, connected: true });
        console.log('Mock WebSocket: Client connected', clientId);
    },
    
    handleMessage: function(clientId, message) {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'register') {
                const client = this.clients.get(clientId);
                if (client) {
                    client.userId = data.userId;
                    client.userName = data.userName;
                }
            }
            
            if (data.type === 'send-message') {
                // Broadcast to all other clients
                this.clients.forEach((client, id) => {
                    if (id !== clientId && client.connected) {
                        self.clients.get(id).postMessage({
                            type: 'websocket-message',
                            data: {
                                type: 'new-message',
                                from: data.from,
                                fromName: data.fromName,
                                to: data.to,
                                message: data.message,
                                timestamp: data.timestamp
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error('Mock WebSocket: Message parse error', e);
        }
    },
    
    handleDisconnection: function(clientId) {
        this.clients.delete(clientId);
        console.log('Mock WebSocket: Client disconnected', clientId);
    }
};

self.addEventListener('message', function(event) {
    const { type, clientId, data } = event.data;
    
    switch (type) {
        case 'websocket-connect':
            mockServer.handleConnection(clientId);
            break;
        case 'websocket-message':
            mockServer.handleMessage(clientId, data);
            break;
        case 'websocket-disconnect':
            mockServer.handleDisconnection(clientId);
            break;
    }
});