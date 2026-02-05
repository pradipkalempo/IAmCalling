const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

console.log('✅ WebSocket server running on ws://localhost:3001');

wss.on('connection', function connection(ws) {
    console.log('👤 Client connected');
    
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'register') {
                ws.userId = data.userId;
                ws.userName = data.userName;
                console.log(`✅ User registered: ${data.userName} (${data.userId})`);
            }
            
            if (data.type === 'send-message') {
                console.log(`📨 Message: ${data.fromName} -> User ${data.to}: ${data.message}`);
                
                // Broadcast to all clients
                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'new-message',
                            from: data.from,
                            fromName: data.fromName,
                            to: data.to,
                            message: data.message,
                            timestamp: data.timestamp
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('❌ Message parse error:', error);
        }
    });
    
    ws.on('close', function() {
        console.log('👋 Client disconnected');
    });
    
    ws.on('error', function(error) {
        console.error('❌ WebSocket error:', error);
    });
});