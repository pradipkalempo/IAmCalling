/**
 * Real-time Messaging Test Script
 * Tests the WebSocket messaging functionality between two users
 */

import WebSocket from 'ws';

// Test configuration
const SERVER_URL = 'ws://localhost:1000';
const USER1_ID = 95; // Rahul
const USER2_ID = 88; // Pradip
const USER1_NAME = 'Rahul Yadav';
const USER2_NAME = 'Pradip Kale';

console.log('🧪 Starting Real-time Messaging Test');

// Create two WebSocket connections to simulate two users
const user1Socket = new WebSocket(SERVER_URL);
const user2Socket = new WebSocket(SERVER_URL);

let user1Connected = false;
let user2Connected = false;
let testCompleted = false;

// User 1 connection handlers
user1Socket.on('open', () => {
    console.log('✅ User 1 (Rahul) connected to WebSocket');
    user1Connected = true;
    registerUser(user1Socket, USER1_ID, USER1_NAME);
});

user1Socket.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📥 User 1 received:', message.type);
    
    if (message.type === 'registered') {
        console.log('✅ User 1 registered successfully');
        checkReadyToSend();
    } else if (message.type === 'new-message') {
        console.log('💬 User 1 received message:', message.message);
        console.log('✅ TEST PASSED: Message delivered successfully to User 1');
        completeTest();
    } else if (message.type === 'message-delivered') {
        console.log('✅ User 1 message delivered confirmation received');
    }
});

user1Socket.on('error', (error) => {
    console.error('❌ User 1 connection error:', error);
});

user1Socket.on('close', () => {
    console.log('🔌 User 1 disconnected');
});

// User 2 connection handlers
user2Socket.on('open', () => {
    console.log('✅ User 2 (Pradip) connected to WebSocket');
    user2Connected = true;
    registerUser(user2Socket, USER2_ID, USER2_NAME);
});

user2Socket.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📥 User 2 received:', message.type);
    
    if (message.type === 'registered') {
        console.log('✅ User 2 registered successfully');
        checkReadyToSend();
    } else if (message.type === 'new-message') {
        console.log('💬 User 2 received message:', message.message);
        console.log('✅ TEST PASSED: Message delivered successfully to User 2');
        // Send a reply
        setTimeout(() => {
            sendMessage(user2Socket, USER2_ID, USER2_NAME, USER1_ID, 'Hello Rahul, this is Pradip replying!');
        }, 1000);
    } else if (message.type === 'message-delivered') {
        console.log('✅ User 2 message delivered confirmation received');
    }
});

user2Socket.on('error', (error) => {
    console.error('❌ User 2 connection error:', error);
});

user2Socket.on('close', () => {
    console.log('🔌 User 2 disconnected');
});

// Helper functions
function registerUser(socket, userId, userName) {
    const registerMsg = {
        type: 'register',
        userId: userId,
        userName: userName
    };
    
    console.log(`📝 Registering user ${userName} (${userId})`);
    socket.send(JSON.stringify(registerMsg));
}

function sendMessage(socket, fromId, fromName, toId, message) {
    const msg = {
        type: 'send-message',
        from: fromId,
        fromName: fromName,
        to: toId,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    console.log(`📤 Sending message from ${fromName} to user ${toId}: "${message}"`);
    socket.send(JSON.stringify(msg));
}

function checkReadyToSend() {
    if (user1Connected && user2Connected) {
        console.log('✅ Both users connected and registered');
        console.log('🚀 Starting message test...');
        
        // Wait a bit for everything to settle, then send a message
        setTimeout(() => {
            sendMessage(user1Socket, USER1_ID, USER1_NAME, USER2_ID, 'Hello Pradip, this is Rahul!');
        }, 2000);
    }
}

function completeTest() {
    if (!testCompleted) {
        testCompleted = true;
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Real-time messaging is working correctly');
        
        // Close connections
        setTimeout(() => {
            user1Socket.close();
            user2Socket.close();
            console.log('🔌 Test connections closed');
        }, 1000);
    }
}

// Handle test timeout
setTimeout(() => {
    if (!testCompleted) {
        console.log('\n⏰ TEST TIMEOUT');
        console.log('❌ Test did not complete within expected time');
        user1Socket.close();
        user2Socket.close();
    }
}, 30000);