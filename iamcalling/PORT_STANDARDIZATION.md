# Port Standardization - IAmCalling Project

## Overview
All services in the IAmCalling project now use **PORT 1000** to avoid port mismatches and conflicts.

## Changes Made

### 1. Centralized Configuration
- Created `config/port-config.js` for server-side port management
- Created `public/js/port-config.js` for client-side port configuration

### 2. Updated Server Files
- `server.js` - Main HTTP server on port 1000

### 3. Updated Client Files
- `public/js/auth-utils.js` - API calls to port 1000
- `public/js/bidirectional-test.js` - WebSocket connection to port 1000
- `public/js/stable-websocket.js` - WebSocket connection to port 1000
- `public/js/global-security-config.js` - API base URL to port 1000

### 4. Updated Environment Files
- `public/.env` - PORT=1000
- `server/.env` - PORT=1000
- `IAmCalling.env` - PORT=1000

## Usage

### Starting the Server
```bash
npm start
```

### Client-Side Usage
All JavaScript files now use the centralized port configuration:
```javascript
// Use the global port config
const apiUrl = window.PORT_CONFIG.getApiUrl('/api/endpoint');
const wsUrl = window.PORT_CONFIG.getWebSocketUrl();
```

## Benefits
1. **No Port Conflicts** - Everything runs on port 1000
2. **Easy Configuration** - Change port in one place
3. **Consistent URLs** - All services accessible via localhost:1000
4. **Simplified Deployment** - Only one port to expose

## Important Notes
- This project now uses a single server entrypoint: `iamcalling/server.js`
- All hardcoded port references should be routed through config and environment variables
