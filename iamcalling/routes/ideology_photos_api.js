import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Test endpoint to verify API is working
router.get('/test', (req, res) => {
    console.log('📡 API test endpoint called');
    res.json({ success: true, message: 'API is working', timestamp: new Date().toISOString() });
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract ideology from flat folder structure
function extractIdeologyFromPath(publicId) {
    const parts = publicId.split('/');
    const ideologies = ['communist', 'fascist', 'leftist', 'neutral', 'rightist'];
    
    // Check if first part is an ideology folder
    if (ideologies.includes(parts[0])) {
        return parts[0];
    }
    return 'unknown';
}

// Extract clean name from public ID
function extractNameFromPublicId(publicId) {
    return publicId.split('/').pop().replace(/[_-]/g, ' ');
}

router.get('/', async (req, res) => {
    try {
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'Ideology_root',
            max_results: 500
        });
        
        const photosByIdeology = { communist: [], fascist: [], leftist: [], neutral: [], rightist: [] };
        
        result.resources.forEach(resource => {
            const parts = resource.public_id.split('/');
            if (parts.length >= 3 && parts[0] === 'Ideology_root') {
                const ideology = parts[1].toLowerCase();
                if (photosByIdeology[ideology]) {
                    photosByIdeology[ideology].push({
                        id: resource.public_id,
                        name: parts[2],
                        src: resource.secure_url,
                        ideology: ideology,
                        publicId: resource.public_id,
                        folder: ideology
                    });
                }
            }
        });
        
        res.json({ success: true, photos: photosByIdeology });
        
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.json({ success: false, error: error.message, photos: {
            communist: [], fascist: [], leftist: [], neutral: [], rightist: []
        }});
    }
});

router.get('/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'Ideology_root',
            max_results: 500
        });
        
        const photos = result.resources
            .filter(resource => {
                const parts = resource.public_id.split('/');
                return parts.length >= 3 && 
                       parts[0] === 'Ideology_root' && 
                       parts[1].toLowerCase() === ideology.toLowerCase();
            })
            .map(resource => {
                const parts = resource.public_id.split('/');
                return {
                    id: resource.public_id,
                    name: parts[2],
                    src: resource.secure_url,
                    ideology: ideology,
                    publicId: resource.public_id,
                    folder: ideology
                };
            });
        
        res.json({ success: true, ideology, count: photos.length, photos });
        
    } catch (error) {
        console.error(`Error fetching ${req.params.ideology} photos:`, error);
        res.json({ success: false, error: 'Failed to fetch photos', photos: [] });
    }
});

export default router;