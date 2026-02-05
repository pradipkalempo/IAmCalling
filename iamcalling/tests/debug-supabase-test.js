/**
 * Debug Supabase Real-time Test Script
 * Tests the Supabase broadcast channel functionality with enhanced debugging
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

console.log('🧪 Starting Debug Supabase Real-time Test');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testCompleted = false;
let messageReceived = false;
let user1Subscribed = false;
let user2Subscribed = false;

console.log('🔧 Setting up Supabase channels');

// Channel for User 1 (receiver)
const user1Channel = supabase
    .channel('debug-user1-messages')
    .on('broadcast', { event: 'debug-test-message' }, (payload) => {
        console.log('📥 User 1 received Supabase message:', JSON.stringify(payload, null, 2));
        console.log('🔍 Payload targetUserId:', payload.payload.targetUserId, 'Expected:', USER1_ID);
        console.log('🔍 IDs match:', payload.payload.targetUserId == USER1_ID);
        
        if (payload.payload.targetUserId == USER1_ID) {
            console.log('✅ TEST PASSED: Message delivered successfully to User 1 via Supabase');
            messageReceived = true;
            completeTest();
        } else {
            console.log('⏭️ Message not for User 1, skipping');
        }
    })
    .subscribe((status, error) => {
        console.log('📡 User 1 channel status:', status);
        if (error) {
            console.error('❌ User 1 channel error:', error);
        }
        if (status === 'SUBSCRIBED') {
            console.log('✅ User 1 channel successfully subscribed');
            user1Subscribed = true;
            checkReadyToSend();
        }
    });

// Channel for User 2 (sender)
const user2Channel = supabase
    .channel('debug-user2-messages')
    .on('broadcast', { event: 'debug-test-message' }, (payload) => {
        console.log('📥 User 2 received Supabase message (should not happen for this test):', payload);
    })
    .subscribe((status, error) => {
        console.log('📡 User 2 channel status:', status);
        if (error) {
            console.error('❌ User 2 channel error:', error);
        }
        if (status === 'SUBSCRIBED') {
            console.log('✅ User 2 channel successfully subscribed');
            user2Subscribed = true;
            checkReadyToSend();
        }
    });

function checkReadyToSend() {
    if (user1Subscribed && user2Subscribed) {
        console.log('✅ Both channels subscribed, sending test message...');
        setTimeout(sendTestMessage, 2000);
    }
}

async function sendTestMessage() {
    try {
        const messagePayload = {
            type: 'broadcast',
            event: 'debug-test-message',
            payload: {
                senderId: USER2_ID,
                targetUserId: USER1_ID,
                content: 'Debug test message via Supabase!',
                timestamp: new Date().toISOString()
            }
        };
        
        console.log('📡 Sending debug test message via Supabase broadcast');
        console.log('📋 Message payload:', JSON.stringify(messagePayload, null, 2));
        await user2Channel.send(messagePayload);
        console.log('✅ Debug test message sent via Supabase broadcast');
        
        // Set a timeout to complete the test even if message is not received
        setTimeout(() => {
            if (!messageReceived) {
                console.log('⚠️ Message not received within timeout period');
                completeTest();
            }
        }, 10000);
    } catch (error) {
        console.error('❌ Supabase broadcast failed:', error);
        completeTest();
    }
}

function completeTest() {
    if (!testCompleted) {
        testCompleted = true;
        console.log('\n🎉 DEBUG SUPABASE TEST COMPLETED!');
        console.log(`✅ Message received: ${messageReceived}`);
        
        // Clean up channels
        setTimeout(() => {
            try {
                user1Channel.unsubscribe();
                user2Channel.unsubscribe();
                console.log('🔌 Channels unsubscribed');
            } catch (e) {
                console.log('⚠️ Error unsubscribing channels:', e.message);
            }
            console.log('🔚 Test finished');
        }, 1000);
    }
}

// Handle test timeout
setTimeout(() => {
    if (!testCompleted) {
        console.log('\n⏰ DEBUG SUPABASE TEST TIMEOUT');
        console.log('❌ Test did not complete within expected time');
        console.log(`✅ Message received: ${messageReceived}`);
        completeTest();
    }
}, 30000);
