import express from 'express';
import { upload } from '../config/cloudinary.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/update', (req, res, next) => {
    console.log('🔍 Profile Update - Content-Type:', req.headers['content-type']);
    next();
}, upload.single('profilePhoto'), async (req, res) => {
    console.log('📝 Profile update request for:', req.body.email);
    console.log('📸 File received:', req.file ? 'YES' : 'NO');
    if (req.file) {
        console.log('📸 Cloudinary URL:', req.file.path);
    }
    
    try {
        const { email, displayName, bio, location, website } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }
        
        const updateData = {};
        
        if (displayName) updateData.display_name = displayName;
        if (bio !== undefined) updateData.bio = bio || null;
        if (location !== undefined) updateData.location = location || null;
        if (website !== undefined) updateData.website = website || null;
        
        if (req.file) {
            updateData.profile_photo = req.file.path;
            console.log('📸 Updating profile photo to:', req.file.path);
        }
        
        console.log('💾 Updating Supabase with:', Object.keys(updateData));
        
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('email', email)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Supabase update error:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        console.log('✅ Profile updated successfully for:', email);
        console.log('📸 New profile_photo in DB:', data.profile_photo ? 'SET' : 'NULL');
        
        res.json({ success: true, user: data });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

export default router;
