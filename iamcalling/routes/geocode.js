import express from 'express';
import https from 'https';
const router = express.Router();

router.get('/location', async (req, res) => {
    try {
        const { city, district } = req.query;
        if (!city || !district) {
            return res.status(400).json({ error: 'City and district are required' });
        }

        const query = `${city}, ${district}, India`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        
        const data = await new Promise((resolve, reject) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'IAmCalling-App/1.0'
                }
            }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
        
        if (data && data.length > 0) {
            res.json({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            });
        } else {
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Geocoding failed' });
    }
});

export default router;