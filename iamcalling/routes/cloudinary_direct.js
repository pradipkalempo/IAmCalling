import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Cloudinary configured:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING'
});

// Get photos directly from Cloudinary by ideology folder
router.get('/photos/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        // Get ALL photos first
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'Ideology_root',
            max_results: 500
        });
        
        // Filter to exact folder match only
        const exactMatches = result.resources.filter(resource => {
            const parts = resource.public_id.split('/');
            return parts.length >= 3 && 
                   parts[0] === 'Ideology_root' && 
                   parts[1].toLowerCase() === ideology.toLowerCase();
        });
        
        const urls = exactMatches.map(resource => resource.secure_url);
        
        console.log(`${ideology}: ${urls.length} exact matches`);
        res.json(urls);
        
    } catch (error) {
        console.error(`Error fetching ${ideology}:`, error);
        res.status(500).json({ error: error.message });
    }
});

export default router;