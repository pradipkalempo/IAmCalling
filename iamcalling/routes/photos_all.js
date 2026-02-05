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
        
        const allPhotos = { fascist: [], communist: [], rightist: [], leftist: [], neutral: [] };
        
        result.resources.forEach(resource => {
            const parts = resource.public_id.split('/');
            if (parts.length >= 3 && parts[0] === 'Ideology_root') {
                const ideology = parts[1].toLowerCase();
                if (allPhotos[ideology]) {
                    allPhotos[ideology].push({
                        id: resource.public_id,
                        name: parts[2],
                        src: resource.secure_url,
                        ideology: ideology
                    });
                }
            }
        });
        
        res.json(allPhotos);
        
    } catch (error) {
        console.error('Error fetching all photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

export default router;