// Centralized Port Configuration for IAmCalling Project
// This file ensures all services use the same port to avoid mismatches

const PORT = process.env.PORT || 1000;

exports.PORT = PORT;
exports.HTTP_PORT = PORT;
exports.WEBSOCKET_PORT = PORT;
exports.API_PORT = PORT;

// URL builders
exports.getHttpUrl = (hostname = 'localhost') => `http://${hostname}:${PORT}`;
exports.getWebSocketUrl = (hostname = 'localhost') => `ws://${hostname}:${PORT}`;

// For client-side usage
exports.getClientConfig = () => ({
    port: PORT,
    httpUrl: `http://localhost:${PORT}`,
    wsUrl: `ws://localhost:${PORT}`
});