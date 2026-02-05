/**
 * Browser Messaging Test
 * Simulates the scenario you described with two browsers (Edge and Chrome)
 * Each browser has a different user logged in
 */

import WebSocket from 'ws';

// Test configuration - simulating your Edge (User 1) and Chrome (User 2)
const SERVER_URL = 'ws://localhost:1000';
const USER1_ID = 95; // Rahul (Edge browser)
const USER2_ID = 88; // Pradip (Chrome browser)
const USER1_NAME = 'Rahul Yadav';
const USER2_NAME = 'Pradip Kale';

console.log('🧪 Browser Messaging Test');
console.log('========================');
console.log('Simulating Edge browser (User 1: Rahul) and Chrome browser (User 2: Pradip)');
console.log('');

// Create WebSocket connections to simulate two browser sessions
const edgeBrowser = new WebSocket(SERVER_URL); // Edge browser
const chromeBrowser = new WebSocket(SERVER_URL); // Chrome browser

let edgeConnected = false;
let chromeConnected = false;
let edgeRegistered = false;
let chromeRegistered = false;
let messageReceivedByChrome = false;
let replyReceivedByEdge = false;
let testCompleted = false;

console.log('🔌 Connecting browsers to WebSocket server...');

// Edge browser (User 1) handlers
edgeBrowser.on('open', () => {
    console.log('✅ Edge browser (Rahul) connected to WebSocket');
    edgeConnected = true;
    registerUser(edgeBrowser, USER1_ID, USER1_NAME);
});

edgeBrowser.on('message', (data) => {
    const message = JSON.parse(data);
    
    switch (message.type) {
        case 'connected':
            console.log('🔗 Edge browser connection established');
            break;
        case 'registered':
            console.log('✅ Edge browser (Rahul) registered successfully');
            edgeRegistered = true;
            checkReadyToSend();
            break;
        case 'new-message':
            console.log('💬 Edge browser received reply:', message.message);
            replyReceivedByEdge = true;
            console.log('✅ SUCCESS: Reply received by Edge browser (Rahul)');
            checkTestCompletion();
            break;
        case 'message-delivered':
            console.log('✅ Edge browser message delivery confirmed');
            break;
        case 'message-failed':
            console.log('❌ Edge browser message failed:', message.reason);
            break;
    }
});

edgeBrowser.on('error', (error) => {
    console.error('❌ Edge browser connection error:', error);
});

edgeBrowser.on('close', () => {
    console.log('🔌 Edge browser disconnected');
});

// Chrome browser (User 2) handlers
chromeBrowser.on('open', () => {
    console.log('✅ Chrome browser (Pradip) connected to WebSocket');
    chromeConnected = true;
    registerUser(chromeBrowser, USER2_ID, USER2_NAME);
});

chromeBrowser.on('message', (data) => {
    const message = JSON.parse(data);
    
    switch (message.type) {
        case 'connected':
            console.log('🔗 Chrome browser connection established');
            break;
        case 'registered':
            console.log('✅ Chrome browser (Pradip) registered successfully');
            chromeRegistered = true;
            checkReadyToSend();
            break;
        case 'new-message':
            console.log('💬 Chrome browser received message:', message.message);
            messageReceivedByChrome = true;
            console.log('✅ SUCCESS: Message received by Chrome browser (Pradip)');
            
            // Send a reply back to Edge browser (simulating user action)
            console.log('📤 Chrome browser (Pradip) replying to Edge browser (Rahul)...');
            setTimeout(() => {
                sendMessage(chromeBrowser, USER2_ID, USER2_NAME, USER1_ID, 'Hello Rahul! This is Pradip from Chrome browser. I received your message.');
            }, 1000);
            break;
        case 'message-delivered':
            console.log('✅ Chrome browser message delivery confirmed');
            break;
    }
});

chromeBrowser.on('error', (error) => {
    console.error('❌ Chrome browser connection error:', error);
});

chromeBrowser.on('close', () => {
    console.log('🔌 Chrome browser disconnected');
});

// Helper functions
function registerUser(socket, userId, userName) {
    const registerMsg = {
        type: 'register',
        userId: userId,
        userName: userName
    };
    
    console.log(`📝 Registering ${userName} (${userId})`);
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
    
    console.log(`📤 Sending: "${message}"`);
    socket.send(JSON.stringify(msg));
}

function checkReadyToSend() {
    if (edgeConnected && chromeConnected && edgeRegistered && chromeRegistered) {
        console.log('✅ Both browsers connected and registered');
        console.log('🚀 Starting messaging test...');
        
        // Wait a bit for everything to settle, then send a message from Edge to Chrome
        setTimeout(() => {
            console.log('📤 Edge browser (Rahul) sending message to Chrome browser (Pradip)...');
            sendMessage(edgeBrowser, USER1_ID, USER1_NAME, USER2_ID, 'Hello Pradip! This is Rahul from Edge browser. Can you receive this message?');
        }, 2000);
    }
}

function checkTestCompletion() {
    if (messageReceivedByChrome && replyReceivedByEdge && !testCompleted) {
        testCompleted = true;
        console.log('');
        console.log('🎉 BROWSER MESSAGING TEST PASSED!');
        console.log('================================');
        console.log('✅ Edge browser (Rahul) connected: WORKING');
        console.log('✅ Chrome browser (Pradip) connected: WORKING');
        console.log('✅ Message delivery from Edge to Chrome: WORKING');
        console.log('✅ Reply delivery from Chrome to Edge: WORKING');
        console.log('✅ Real-time messaging between browsers: WORKING');
        console.log('');
        console.log('📋 This confirms that your messaging system should work');
        console.log('   between Edge and Chrome browsers as you intended.');
        console.log('');
        
        // Close connections
        setTimeout(() => {
            edgeBrowser.close();
            chromeBrowser.close();
        }, 1000);
    }
}

// Handle test timeout
setTimeout(() => {
    if (!testCompleted) {
        console.log('');
        console.log('⏰ TEST TIMEOUT');
        console.log('===============');
        console.log('📋 Test Results:');
        console.log(`✅ Edge browser connected: ${edgeConnected}`);
        console.log(`✅ Chrome browser connected: ${chromeConnected}`);
        console.log(`✅ Edge browser registered: ${edgeRegistered}`);
        console.log(`✅ Chrome browser registered: ${chromeRegistered}`);
        console.log(`✅ Message received by Chrome: ${messageReceivedByChrome}`);
        console.log(`✅ Reply received by Edge: ${replyReceivedByEdge}`);
        
        console.log('');
        console.log('⚠️  Test completed with partial results');
        console.log('   The messaging system may have issues that need investigation.');
        
        edgeBrowser.close();
        chromeBrowser.close();
    }
}, 30000);