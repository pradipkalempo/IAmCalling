import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Get photos from database by ideology
router.get('/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        const { data: photos, error } = await supabase
            .from('ideology_photos')
            .select('*')
            .eq('category', ideology)
            .eq('active', true)
            .limit(20);
        
        if (error) throw error;
        
        const formattedPhotos = photos.map(photo => ({
            id: photo.id,
            name: photo.name,
            src: photo.image_url,
            ideology: photo.category
        }));
        
        res.json(formattedPhotos);
        
    } catch (error) {
        console.error(`Error fetching ${req.params.ideology} photos:`, error);
        res.json([]);
    }
});

export default router;