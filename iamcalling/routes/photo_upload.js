import express from 'express';
import multer from 'multer';
import { supabase } from '../database/supabaseClient.js';
import cloudinary from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload photo endpoint for photo management page
router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        console.log('📸 Photo upload request received');
        console.log('Body:', req.body);
        console.log('File:', req.file ? 'Present' : 'Missing');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No photo file provided'
            });
        }

        const { ideology, name, placeholderId } = req.body;

        if (!ideology || !placeholderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: ideology, placeholderId'
            });
        }

        // Upload to Cloudinary
        console.log('☁️ Uploading to Cloudinary...');
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'ideology_photos',
                    public_id: `${ideology}_${placeholderId}_${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        console.log('✅ Cloudinary upload successful:', uploadResult.public_id);

        // Save to Supabase
        console.log('💾 Saving to database...');
        const { data, error } = await supabase
            .from('ideology_photos')
            .insert({
                name: name || 'Untitled',
                category: ideology,
                placeholder_id: placeholderId,
                image_url: uploadResult.secure_url,
                cloudinary_public_id: uploadResult.public_id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            // Even if database fails, Cloudinary upload succeeded
            return res.json({
                success: true,
                cloudinarySuccess: true,
                databaseSuccess: false,
                message: 'Photo uploaded to Cloudinary but database save failed',
                data: {
                    imageUrl: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    placeholderId: placeholderId,
                    ideology: ideology,
                    name: name || 'Untitled'
                },
                error: error.message
            });
        }

        console.log('✅ Database save successful:', data.id);

        res.json({
            success: true,
            cloudinarySuccess: true,
            databaseSuccess: true,
            message: 'Photo uploaded successfully to Cloudinary and database',
            data: {
                id: data.id,
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                placeholderId: placeholderId,
                ideology: ideology,
                name: name || 'Untitled'
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        
        // Determine if this was a Cloudinary or other error
        const isCloudinaryError = error.message && (error.message.includes('cloudinary') || error.http_code);
        
        res.status(500).json({
            success: false,
            cloudinarySuccess: false,
            databaseSuccess: false,
            error: isCloudinaryError ? 'Cloudinary upload failed' : 'Upload failed',
            message: error.message,
            details: {
                errorType: isCloudinaryError ? 'cloudinary' : 'general',
                originalError: error.message
            }
        });
    }
});

// Get all photos
router.get('/photos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ideology_photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('❌ Fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch photos'
        });
    }
});

// Update photo name
router.put('/photos/:id/name', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const { data, error } = await supabase
            .from('ideology_photos')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('❌ Update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update photo name'
        });
    }
});

// Delete photo
router.delete('/photos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get photo data first
        const { data: photo, error: fetchError } = await supabase
            .from('ideology_photos')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Delete from Cloudinary
        if (photo.cloudinary_public_id) {
            await cloudinary.v2.uploader.destroy(photo.cloudinary_public_id);
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('ideology_photos')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete photo'
        });
    }
});

export default router;