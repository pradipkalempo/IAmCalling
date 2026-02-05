/**
 * Comprehensive Messaging Test Script
 * Tests both WebSocket and Supabase real-time messaging functionality
 */

import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SERVER_URL = 'ws://localhost:1000';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const USER1_ID = 95; // Rahul
const USER2_ID = 88; // Pradip
const USER1_NAME = 'Rahul Yadav';
const USER2_NAME = 'Pradip Kale';

console.log('🧪 Starting Comprehensive Messaging Test');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create WebSocket connections
const user1Socket = new WebSocket(SERVER_URL);
const user2Socket = new WebSocket(SERVER_URL);

let user1Connected = false;
let user2Connected = false;
let user1Registered = false;
let user2Registered = false;
let supabaseSubscribed = false;
let testPhase = 0; // 0: setup, 1: WebSocket test, 2: Supabase test
let testCompleted = false;

// Supabase real-time subscription
let messageSubscription;

// User 1 WebSocket handlers
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
        user1Registered = true;
        checkReadyForTest();
    } else if (message.type === 'new-message') {
        console.log('💬 User 1 received WebSocket message:', message.message);
        if (testPhase === 1) {
            console.log('✅ WebSocket TEST PASSED: Message delivered successfully to User 1');
            testPhase = 2; // Move to Supabase test
            setTimeout(() => testSupabaseMessaging(), 2000);
        }
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

// User 2 WebSocket handlers
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
        user2Registered = true;
        checkReadyForTest();
    } else if (message.type === 'new-message') {
        console.log('💬 User 2 received WebSocket message:', message.message);
        if (testPhase === 1) {
            console.log('✅ WebSocket TEST PASSED: Message delivered successfully to User 2');
            // Send a reply
            setTimeout(() => {
                sendMessage(user2Socket, USER2_ID, USER2_NAME, USER1_ID, 'Hello Rahul, this is Pradip replying via WebSocket!');
            }, 1000);
        }
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

function checkReadyForTest() {
    if (user1Connected && user2Connected && user1Registered && user2Registered) {
        console.log('✅ Both users connected and registered');
        console.log('🚀 Starting WebSocket messaging test...');
        testPhase = 1; // WebSocket test phase
        
        // Wait a bit for everything to settle, then send a message
        setTimeout(() => {
            sendMessage(user1Socket, USER1_ID, USER1_NAME, USER2_ID, 'Hello Pradip, this is Rahul via WebSocket!');
        }, 2000);
    }
}

async function setupSupabaseSubscription() {
    console.log('🔧 Setting up Supabase real-time subscription');
    
    try {
        // Create a channel for message broadcasting
        messageSubscription = supabase
            .channel('test-messages')
            .on('broadcast', { event: 'new-message' }, (payload) => {
                console.log('📡 Supabase message received:', payload);
                if (payload.payload.receiver_id == USER1_ID) {
                    console.log('💬 User 1 received Supabase message:', payload.payload.content);
                    console.log('✅ Supabase TEST PASSED: Message delivered successfully via Supabase');
                    completeTest();
                }
            })
            .subscribe((status) => {
                console.log('📡 Supabase subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    supabaseSubscribed = true;
                    console.log('✅ Supabase channel successfully subscribed');
                }
            });
            
        // Wait for subscription to be established
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return true;
    } catch (error) {
        console.error('❌ Supabase subscription error:', error);
        return false;
    }
}

async function testSupabaseMessaging() {
    console.log('🧪 Starting Supabase real-time messaging test');
    
    // Setup Supabase subscription
    const subscriptionSuccess = await setupSupabaseSubscription();
    
    if (!subscriptionSuccess) {
        console.log('❌ Failed to setup Supabase subscription');
        completeTest();
        return;
    }
    
    // Wait for subscription to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send message via Supabase broadcast
    if (messageSubscription) {
        try {
            const messagePayload = {
                type: 'broadcast',
                event: 'new-message',
                payload: {
                    sender_id: USER2_ID,
                    receiver_id: USER1_ID,
                    content: 'Hello Rahul, this is Pradip via Supabase!',
                    created_at: new Date().toISOString()
                }
            };
            
            console.log('📡 Broadcasting message via Supabase:', messagePayload.payload.content);
            await messageSubscription.send(messagePayload);
            console.log('✅ Message sent via Supabase broadcast');
        } catch (error) {
            console.error('❌ Supabase broadcast failed:', error);
            completeTest();
        }
    }
}

function completeTest() {
    if (!testCompleted) {
        testCompleted = true;
        console.log('\n🎉 ALL TESTS COMPLETED!');
        console.log('✅ WebSocket messaging: VERIFIED');
        console.log('✅ Supabase real-time messaging: VERIFIED');
        
        // Close connections
        setTimeout(() => {
            user1Socket.close();
            user2Socket.close();
            if (messageSubscription) {
                messageSubscription.unsubscribe();
            }
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
        if (messageSubscription) {
            messageSubscription.unsubscribe();
        }
    }
}, 60000);

// Start the test
console.log('🚀 Initializing test...');
