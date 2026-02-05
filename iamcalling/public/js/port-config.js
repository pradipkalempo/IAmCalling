// Client-side Port Configuration
// This ensures all client-side code uses the same port

window.PORT_CONFIG = {
    PORT: 1000,
    HTTP_URL: 'http://localhost:1000',
    WS_URL: 'ws://localhost:1000',
    
    // Helper functions
    getApiUrl: (endpoint) => `http://localhost:1000${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
    getWebSocketUrl: () => 'ws://localhost:1000'
};

console.log('🔧 Port configuration loaded: All services on port 1000');