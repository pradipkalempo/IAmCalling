import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'article_thumbnails',
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto:good' },
                        { format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        res.json({
            success: true,
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            error: 'Failed to upload image',
            message: error.message
        });
    }
});

// Delete image endpoint
router.delete('/delete-image/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        res.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            message: error.message
        });
    }
});

export default router;