import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        // Get ALL photos from Cloudinary
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            max_results: 500
        });
        
        // Filter URLs that contain the exact ideology folder pattern
        const matchingUrls = result.resources
            .filter(resource => {
                const url = resource.secure_url;
                return url.includes(`/Ideology_root/${ideology}/`);
            })
            .map(resource => resource.secure_url);
        
        console.log(`${ideology}: Found ${matchingUrls.length} photos`);
        res.json(matchingUrls);
        
    } catch (error) {
        console.error(`Error fetching ${req.params.ideology}:`, error);
        res.status(500).json([]);
    }
});

export default router;