import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

console.log('🔧 Users router loaded - setting up user endpoints...');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

console.log('🔍 Users route - Supabase config:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
router.get('/test', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('❌ Supabase connection test failed:', error);
            return res.status(500).json({ error: 'Supabase connection failed', details: error.message });
        }
        console.log('✅ Supabase connection test successful');
        res.json({ status: 'connected', message: 'Supabase connection working' });
    } catch (error) {
        console.error('❌ Supabase test error:', error);
        res.status(500).json({ error: 'Connection test failed', details: error.message });
    }
});

// Get users with photos for messenger
router.get('/messenger-photos', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, full_name, email, profile_photo, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        const formattedUsers = users.map(user => {
            const name = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            
            return {
                id: user.id,
                name: name,
                initials: initials,
                email: user.email,
                profile_photo: user.profile_photo,
                created_at: user.created_at
            };
        });

        console.log(`📸 Sending ${formattedUsers.length} users with photos`);
        res.json(formattedUsers);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users for messenger with profile photos
router.get('/messenger', async (req, res) => {
    console.log('📨 Fetching users for messenger with profile photos - Improved Version');
    
    try {
        // Query with explicit profile_photo field
        const { data: users, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, full_name, email, profile_photo, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('❌ Supabase query error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch users', 
                details: error.message
            });
        }

        console.log(`✅ Found ${users?.length || 0} users in database`);
        
        if (!users || users.length === 0) {
            console.log('⚠️ No users found in database');
            return res.json([]);
        }

        // Format users for messenger with flexible field mapping
        const formattedUsers = users.map(user => {
            // Try different possible name field combinations
            const name = user.full_name || 
                        `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                        user.email?.split('@')[0] || 
                        'Unknown User';
            
            const initials = name.split(' ')
                .map(n => n.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'UN';
            
            console.log(`👤 User ${user.id} profile_photo:`, user.profile_photo ? 'Has photo' : 'No photo');
            
            return {
                id: user.id,
                name: name,
                initials: initials,
                email: user.email || 'No email',
                profile_photo: user.profile_photo || null,
                created_at: user.created_at || new Date().toISOString()
            };
        });
        
        console.log(`📤 Sending ${formattedUsers.length} users with profile photos`);
        res.json(formattedUsers);
        
    } catch (error) {
        console.error('❌ Unexpected error fetching users:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message
        });
    }
});

// User registration endpoint
router.post('/register', async (req, res) => {
    console.log('✅ POST /api/users/register endpoint hit!');
    console.log('📋 Request body:', req.body);
    
    try {
        const { email, firstName, lastName, password, profilePhoto } = req.body;
        
        if (!email || !firstName || !lastName || !password) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required',
                missing: {
                    email: !email,
                    firstName: !firstName, 
                    lastName: !lastName,
                    password: !password
                }
            });
        }
        
        console.log('🔍 Checking for existing user...');
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();
            
        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error checking existing user:', checkError);
            throw checkError;
        }
            
        if (existingUser) {
            console.log('❌ Email already exists');
            return res.status(409).json({ 
                success: false,
                error: 'Email already registered' 
            });
        }
        
        console.log('💾 Creating new user...');
        // Create new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email: email,
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                password: password,
                profile_photo: profilePhoto,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (error) {
            console.error('❌ Supabase insert error:', error);
            throw error;
        }
        
        console.log('✅ User created successfully:', newUser.id);
        res.json({ 
            success: true, 
            user: newUser,
            message: 'Registration successful'
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Registration failed', 
            details: error.message 
        });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, full_name, first_name, last_name, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(users || []);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router;
