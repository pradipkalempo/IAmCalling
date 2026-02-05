import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/', async (req, res) => {
    try {
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'Ideology_root',
            max_results: 500
        });
        
        const photos = result.resources.map(resource => {
            const parts = resource.public_id.split('/');
            return {
                id: resource.public_id,
                name: parts[2] || 'unknown',
                src: resource.secure_url,
                category: parts[1] || 'unknown',
                ideology: parts[1] || 'unknown'
            };
        });
        
        res.json(photos);
        
    } catch (error) {
        console.error('Analytics photos error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;