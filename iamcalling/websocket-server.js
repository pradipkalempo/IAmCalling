const WebSocket = require('ws');
const { PORT } = require('./config/port-config.js');

const wss = new WebSocket.Server({ port: PORT });
const clients = new Map(); // userId -> WebSocket

console.log('🔒 Secure WebSocket server running on ws://localhost:3001');
console.log('📊 Server ready for bidirectional messaging');

wss.on('connection', function connection(ws) {
    console.log('👤 Client connected');
    
    ws.on('message', function message(data) {
        try {
            const message = JSON.parse(data);
            console.log('📨 Received message:', message.type, message);
            
            if (message.type === 'register') {
                ws.userId = parseInt(message.userId);
                clients.set(ws.userId, ws);
                console.log(`✅ User ${message.userId} registered (${clients.size} total clients)`);
                
                // Send confirmation
                ws.send(JSON.stringify({
                    type: 'registered',
                    userId: ws.userId,
                    message: 'Successfully registered'
                }));
            }
            
            if (message.type === 'send-message') {
                const fromUserId = parseInt(message.from);
                const toUserId = parseInt(message.to);
                
                console.log(`📨 MESSAGE: ${fromUserId} -> ${toUserId}: "${message.message}"`);
                
                // CRITICAL: Send ONLY to specific recipient
                const recipientWs = clients.get(toUserId);
                
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                    const deliveryMessage = {
                        type: 'new-message',
                        from: fromUserId,
                        fromName: message.fromName || 'Unknown User',
                        to: toUserId,
                        message: message.message,
                        timestamp: message.timestamp || new Date().toISOString()
                    };
                    
                    recipientWs.send(JSON.stringify(deliveryMessage));
                    console.log(`✅ Message delivered to user ${toUserId}`);
                    
                    // Send delivery confirmation to sender
                    const senderWs = clients.get(fromUserId);
                    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                        senderWs.send(JSON.stringify({
                            type: 'message-delivered',
                            to: toUserId,
                            messageId: message.messageId || Date.now()
                        }));
                    }
                } else {
                    console.log(`⚠️ User ${toUserId} not connected or WebSocket closed`);
                    
                    // Send failure notification to sender
                    const senderWs = clients.get(fromUserId);
                    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                        senderWs.send(JSON.stringify({
                            type: 'message-failed',
                            to: toUserId,
                            reason: 'User not connected'
                        }));
                    }
                }
            }
            
            if (message.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
            
        } catch (error) {
            console.error('❌ Message parsing error:', error);
        }
    });
    
    ws.on('close', function close() {
        if (ws.userId) {
            clients.delete(ws.userId);
            console.log(`👋 User ${ws.userId} disconnected (${clients.size} remaining)`);
        } else {
            console.log('👋 Unknown client disconnected');
        }
    });
    
    ws.on('error', function error(err) {
        console.error('❌ WebSocket error:', err);
        if (ws.userId) {
            clients.delete(ws.userId);
        }
    });
});

// Heartbeat to keep connections alive
setInterval(() => {
    console.log(`💓 Heartbeat: ${clients.size} active connections`);
    
    clients.forEach((ws, userId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        } else {
            console.log(`🔌 Removing dead connection for user ${userId}`);
            clients.delete(userId);
        }
    });
}, 30000);

// Status endpoint for debugging
setInterval(() => {
    const activeUsers = Array.from(clients.keys());
    if (activeUsers.length > 0) {
        console.log(`📊 Active users: [${activeUsers.join(', ')}]`);
    }
}, 60000);