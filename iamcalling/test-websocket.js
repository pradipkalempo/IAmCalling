const WebSocket = require('ws');

console.log('🔍 Testing WebSocket Server...');

// Test connection to the server
const testWs = new WebSocket('ws://localhost:3001');

testWs.on('open', function open() {
    console.log('✅ WebSocket server is running on port 3001');
    
    // Test registration
    testWs.send(JSON.stringify({
        type: 'register',
        userId: 999
    }));
    
    console.log('📝 Test user registered');
    
    // Test message sending
    setTimeout(() => {
        testWs.send(JSON.stringify({
            type: 'send-message',
            from: 999,
            fromName: 'Test User',
            to: 1, // Dynamic test - any user ID
            message: 'Test message from server checker',
            timestamp: new Date().toISOString()
        }));
        
        console.log('📤 Test message sent');
        
        setTimeout(() => {
            testWs.close();
            console.log('✅ WebSocket server test completed');
            process.exit(0);
        }, 1000);
    }, 1000);
});

testWs.on('error', function error(err) {
    console.error('❌ WebSocket server not running or error:', err.message);
    console.log('💡 Start the server with: node websocket-server.js');
    process.exit(1);
});

testWs.on('message', function message(data) {
    console.log('📨 Received:', data.toString());
});

testWs.on('close', function close() {
    console.log('🔌 Connection closed');
});