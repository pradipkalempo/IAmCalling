import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
    console.log('🔍 Testing Supabase connection...');
    
    // Test users table
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.log('❌ Users table error:', error.message);
        } else {
            console.log('✅ Users table exists, sample:', data);
        }
    } catch (e) {
        console.log('❌ Users table failed:', e.message);
    }
    
    // Test articles table
    try {
        const { data, error } = await supabase.from('articles').select('*').limit(1);
        if (error) {
            console.log('❌ Articles table error:', error.message);
        } else {
            console.log('✅ Articles table exists, sample:', data);
        }
    } catch (e) {
        console.log('❌ Articles table failed:', e.message);
    }
    
    // Test messages table
    try {
        const { data, error } = await supabase.from('messages').select('*').limit(1);
        if (error) {
            console.log('❌ Messages table error:', error.message);
        } else {
            console.log('✅ Messages table exists, sample:', data);
        }
    } catch (e) {
        console.log('❌ Messages table failed:', e.message);
    }
    
    // Test posts table (known to work)
    try {
        const { data, error } = await supabase.from('posts').select('*').limit(1);
        if (error) {
            console.log('❌ Posts table error:', error.message);
        } else {
            console.log('✅ Posts table exists, sample:', data);
        }
    } catch (e) {
        console.log('❌ Posts table failed:', e.message);
    }
}

testTables().then(() => {
    console.log('🏁 Test complete');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});