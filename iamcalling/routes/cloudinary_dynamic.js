import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fetch photos from Cloudinary folders by ideology
router.get('/', async (req, res) => {
    try {
        const ideologies = ['fascist', 'communist', 'rightist', 'leftist', 'neutral'];
        const photosByIdeology = {};

        for (const ideology of ideologies) {
            try {
                const result = await cloudinary.search
                    .expression(`folder:ideology_photos/${ideology}`)
                    .sort_by([['created_at', 'desc']])
                    .max_results(20)
                    .execute();

                photosByIdeology[ideology] = result.resources.map(resource => ({
                    id: resource.public_id.split('/').pop(),
                    name: resource.display_name || resource.public_id.split('/').pop(),
                    imageUrl: resource.secure_url,
                    ideology: ideology,
                    source: 'cloudinary'
                }));
            } catch (error) {
                console.error(`Error fetching ${ideology} photos:`, error);
                photosByIdeology[ideology] = [];
            }
        }

        res.json(photosByIdeology);
    } catch (error) {
        console.error('Error fetching Cloudinary photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

export default router;