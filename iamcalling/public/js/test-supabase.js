// Test Supabase Message Storage
async function testSupabaseMessage() {
    try {
        const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
        const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
        
        console.log('🧪 Testing Supabase connection...');
        
        // Test connection
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!testResponse.ok) {
            console.error('❌ Supabase connection failed:', testResponse.status);
            return;
        }
        
        console.log('✅ Supabase connection OK');
        
        // Test message insertion
        const testMessage = {
            sender_id: 157, // Current user ID from logs
            receiver_id: 152, // Test receiver
            content: 'Test message ' + Date.now()
        };
        
        console.log('🧪 Testing message insertion:', testMessage);
        
        const messageResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testMessage)
        });
        
        if (messageResponse.ok) {
            const result = await messageResponse.json();
            console.log('✅ Test message saved:', result);
        } else {
            const error = await messageResponse.text();
            console.error('❌ Test message failed:', messageResponse.status, error);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Make function globally available
window.testSupabaseMessage = testSupabaseMessage;