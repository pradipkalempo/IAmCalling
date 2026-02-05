const express = require('express');
const QdrantPhotoService = require('../services/qdrantPhotoService');
const router = express.Router();

const photoService = new QdrantPhotoService();

// Initialize Qdrant collection on startup
photoService.initializeCollection().catch(console.error);

// Get diverse photos for game round
router.get('/diverse', async (req, res) => {
    try {
        const excludeIds = req.query.exclude ? req.query.exclude.split(',') : [];
        const count = parseInt(req.query.count) || 3;
        
        const photos = await photoService.getDiversePhotos(excludeIds, count);
        
        if (photos.length < count) {
            return res.status(404).json({ 
                error: 'Insufficient photos available',
                available: photos.length,
                required: count
            });
        }
        
        res.json({ photos, excludeIds: [...excludeIds, ...photos.map(p => p.id)] });
    } catch (error) {
        console.error('Error getting diverse photos:', error);
        res.status(500).json({ error: 'Failed to get photos' });
    }
});

// Store photo in Qdrant
router.post('/store', async (req, res) => {
    try {
        const { id, name, ideology, imageUrl, source } = req.body;
        
        if (!id || !name || !ideology || !imageUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await photoService.storePhoto({ id, name, ideology, imageUrl, source });
        res.json({ success: true, message: 'Photo stored successfully' });
    } catch (error) {
        console.error('Error storing photo:', error);
        res.status(500).json({ error: 'Failed to store photo' });
    }
});

// Bulk store photos
router.post('/bulk-store', async (req, res) => {
    try {
        const { photos } = req.body;
        
        if (!Array.isArray(photos)) {
            return res.status(400).json({ error: 'Photos must be an array' });
        }
        
        for (const photo of photos) {
            await photoService.storePhoto(photo);
        }
        
        res.json({ success: true, message: `${photos.length} photos stored successfully` });
    } catch (error) {
        console.error('Error bulk storing photos:', error);
        res.status(500).json({ error: 'Failed to store photos' });
    }
});

module.exports = router;