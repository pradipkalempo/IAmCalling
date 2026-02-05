// Stable WebSocket Connection Manager
class StableWebSocket {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnects = 3;
        this.reconnectDelay = 2000;
        this.messageQueue = [];
        this.listeners = {};
        this.serverStarted = false;
        
        this.init();
    }
    
    async init() {
        // Try to start local server first
        await this.ensureServer();
        this.connect();
    }
    
    async ensureServer() {
        if (this.serverStarted) return;
        
        try {
            // Check if server is running
            const testWs = new WebSocket('ws://localhost:1000');
            testWs.onopen = () => {
                testWs.close();
                this.serverStarted = true;
            };
            testWs.onerror = () => {
                // Server not running, try to start it
                this.startLocalServer();
            };
        } catch (e) {
            this.startLocalServer();
        }
    }
    
    startLocalServer() {
        // Create a simple WebSocket server using a service worker approach
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('js/websocket-sw.js').catch(() => {});
        }
        
        // Fallback: Use a mock WebSocket for development
        this.createMockServer();
    }
    
    createMockServer() {
        // Create a mock WebSocket server that simulates real behavior
        window.MockWebSocketServer = {
            clients: new Set(),
            broadcast: function(data) {
                this.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.onmessage({ data: JSON.stringify(data) });
                    }
                });
            }
        };
        this.serverStarted = true;
    }
    
    connect() {
        if (this.reconnectAttempts >= this.maxReconnects) {
            console.log('🔌 WebSocket: Max reconnection attempts reached, using fallback mode');
            this.useFallbackMode();
            return;
        }
        
        try {
            this.ws = new WebSocket('ws://localhost:1000');
            this.reconnectAttempts++;
            
            // Connection timeout
            const timeout = setTimeout(() => {
                if (this.ws.readyState === WebSocket.CONNECTING) {
                    this.ws.close();
                }
            }, 3000);
            
            this.ws.onopen = () => {
                clearTimeout(timeout);
                console.log('✅ WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.processMessageQueue();
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                } catch (e) {
                    // Silent error handling
                }
            };
            
            this.ws.onclose = () => {
                clearTimeout(timeout);
                this.connected = false;
                
                if (this.reconnectAttempts < this.maxReconnects) {
                    setTimeout(() => this.connect(), this.reconnectDelay);
                } else {
                    this.useFallbackMode();
                }
            };
            
            this.ws.onerror = () => {
                clearTimeout(timeout);
                this.connected = false;
            };
            
        } catch (e) {
            this.useFallbackMode();
        }
    }
    
    useFallbackMode() {
        console.log('🔄 WebSocket: Using Supabase fallback mode');
        this.connected = false;
        this.emit('fallback');
    }
    
    send(data) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.messageQueue.push(data);
            this.emit('fallback-send', data);
        }
    }
    
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    close() {
        if (this.ws) {
            this.ws.close();
        }
        this.connected = false;
    }
}

// Create global instance
window.stableWebSocket = new StableWebSocket();