// Quick connectivity test
const testSupabase = async () => {
    try {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
        }
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        console.log('Supabase Status:', response.status);
        console.log('Response:', await response.text());
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
};

testSupabase();
