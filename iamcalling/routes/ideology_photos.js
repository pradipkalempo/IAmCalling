import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/photos', async (req, res) => {
    try {
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'Ideology_root',
            max_results: 500
        });
        
        const allPhotos = result.resources.map(resource => {
            const parts = resource.public_id.split('/');
            const ideology = parts[1] || 'unknown';
            const filename = parts[2] || 'unknown';
            
            return {
                id: resource.public_id,
                name: filename,
                image_url: resource.secure_url,
                category: ideology,
                ideology: ideology
            };
        });
        
        res.json(allPhotos);
        
    } catch (error) {
        console.error('Error fetching ideology photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

export default router;