import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/upload-profile-photo', async (req, res) => {
    try {
        const { image, userId } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: 'Image required' });
        }

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
        }

        console.log('📤 Uploading profile photo for user:', userId);

        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: 'iamcalling/profiles',
            public_id: `profile_${userId}_${Date.now()}`,
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });

        const photoUrl = uploadResult.secure_url;
        console.log('✅ Cloudinary upload success:', photoUrl);

        if (!String(userId).startsWith('temp_')) {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            console.log('💾 Updating Supabase for user:', userId);
            const { error } = await supabase
                .from('users')
                .update({ profile_photo: photoUrl })
                .eq('id', userId);

            if (error) {
                console.error('❌ Supabase update error:', error);
                return res.status(500).json({ success: false, error: error.message });
            }
            console.log('✅ Supabase updated successfully');
        }

        res.json({ 
            success: true, 
            photoUrl,
            message: 'Profile photo uploaded successfully'
        });

    } catch (error) {
        console.error('❌ Upload error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, error: error.message || 'Upload failed' });
    }
});

export default router;
