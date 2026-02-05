import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/photos/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: `ideology_photos/${ideology}`,
            max_results: 20
        });
        
        const photos = result.resources.map(resource => resource.secure_url);
        res.json({ photos });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

export default router;