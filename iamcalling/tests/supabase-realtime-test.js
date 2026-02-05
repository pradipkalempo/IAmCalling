/**
 * Supabase Real-time Test Script
 * Tests the Supabase broadcast channel functionality
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const USER1_ID = 95; // Rahul
const USER2_ID = 88; // Pradip

console.log('🧪 Starting Supabase Real-time Test');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testCompleted = false;
let messageReceived = false;

// Create two channels to simulate two users
console.log('🔧 Setting up Supabase channels');

// Channel for User 1
const user1Channel = supabase
    .channel('user1-messages')
    .on('broadcast', { event: 'test-message' }, (payload) => {
        console.log('📥 User 1 received Supabase message:', payload);
        if (payload.payload.targetUserId == USER1_ID) {
            console.log('✅ TEST PASSED: Message delivered successfully to User 1 via Supabase');
            messageReceived = true;
            completeTest();
        }
    })
    .subscribe((status) => {
        console.log('📡 User 1 channel status:', status);
        if (status === 'SUBSCRIBED') {
            console.log('✅ User 1 channel successfully subscribed');
            // Now that User 1 is subscribed, subscribe User 2 and send a message
            setTimeout(setupUser2AndSendMessage, 2000);
        }
    });

// Function to setup User 2 channel and send message
function setupUser2AndSendMessage() {
    console.log('🔧 Setting up User 2 channel');
    
    // Channel for User 2
    const user2Channel = supabase
        .channel('user2-messages')
        .on('broadcast', { event: 'test-message' }, (payload) => {
            console.log('📥 User 2 received Supabase message:', payload);
        })
        .subscribe((status) => {
            console.log('📡 User 2 channel status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✅ User 2 channel successfully subscribed');
                
                // Send a test message from User 2 to User 1
                setTimeout(() => {
                    sendTestMessage(user2Channel);
                }, 1000);
            }
        });
}

async function sendTestMessage(channel) {
    try {
        const messagePayload = {
            type: 'broadcast',
            event: 'test-message',
            payload: {
                senderId: USER2_ID,
                targetUserId: USER1_ID,
                content: 'Hello Rahul, this is a test message via Supabase!',
                timestamp: new Date().toISOString()
            }
        };
        
        console.log('📡 Sending test message via Supabase broadcast');
        await channel.send(messagePayload);
        console.log('✅ Test message sent via Supabase broadcast');
    } catch (error) {
        console.error('❌ Supabase broadcast failed:', error);
        completeTest();
    }
}

function completeTest() {
    if (!testCompleted) {
        testCompleted = true;
        console.log('\n🎉 SUPABASE TEST COMPLETED!');
        console.log(`✅ Message received: ${messageReceived}`);
        
        // Clean up channels
        setTimeout(() => {
            user1Channel.unsubscribe();
            console.log('🔌 User 1 channel unsubscribed');
        }, 1000);
    }
}

// Handle test timeout
setTimeout(() => {
    if (!testCompleted) {
        console.log('\n⏰ SUPABASE TEST TIMEOUT');
        console.log('❌ Test did not complete within expected time');
        console.log(`✅ Message received: ${messageReceived}`);
        user1Channel.unsubscribe();
    }
}, 30000);
