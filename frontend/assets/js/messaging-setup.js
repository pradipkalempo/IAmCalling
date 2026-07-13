// Auto-setup script for Supabase messaging
async function setupMessagingDatabase() {
    const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
    const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
    
    console.log('🔧 Setting up messaging database...');
    
    // Test messages table access
    try {
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (testResponse.ok) {
            console.log('✅ Messages table accessible');
            return true;
        } else {
            console.log(`❌ Messages table error: ${testResponse.status}`);
            
            // Try to create table via RPC function
            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/setup_messaging`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (createResponse.ok) {
                console.log('✅ Messaging setup completed');
                return true;
            } else {
                console.log('❌ Auto-setup failed - manual setup required');
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Database connection failed:', error);
        return false;
    }
}

// Export for use in main script
window.setupMessagingDatabase = setupMessagingDatabase;