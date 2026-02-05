import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Get photos by ideology using URL pattern matching
router.get('/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        // Get ALL photos from Ideology_root folder
        const result = await cloudinary.v2.search
            .expression('folder:Ideology_root/*')
            .sort_by([['created_at', 'desc']])
            .max_results(500)
            .execute();

        // Filter photos by URL pattern - look for /Ideology_root/{ideology}/ in URL
        const filteredPhotos = result.resources.filter(photo => {
            return photo.secure_url.includes(`/Ideology_root/${ideology}/`);
        });

        res.json({
            success: true,
            photos: filteredPhotos.map(photo => ({
                url: photo.secure_url,
                public_id: photo.public_id,
                folder: ideology
            }))
        });

    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch photos' 
        });
    }
});

export default router;