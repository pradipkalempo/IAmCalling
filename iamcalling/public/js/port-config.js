// Client-side Port Configuration
// Automatically detects environment (local vs production)

window.PORT_CONFIG = {
    // Dynamic port detection
    get PORT() {
        return window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
    },
    
    // Use relative URLs for API calls (works in both local and production)
    get HTTP_URL() {
        return window.location.origin;
    },
    
    get WS_URL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    },
    
    // Helper functions - use relative paths
    getApiUrl: (endpoint) => `${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
    getWebSocketUrl: () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }
};

console.log('🔧 Port configuration loaded:', window.PORT_CONFIG.HTTP_URL);