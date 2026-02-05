import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Get random photos for ideology game (one from each ideology)
router.get('/random', async (req, res) => {
    try {
        console.log('🎲 Fetching random photos for game...');
        
        // Fallback photos if database is unavailable
        const fallbackPhotos = [
            { ideology: 'fascist', url: 'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1/test/fascist_1', name: 'Test Fascist', id: 'f1' },
            { ideology: 'rightist', url: 'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1/test/rightist_1', name: 'Test Rightist', id: 'r1' },
            { ideology: 'neutral', url: 'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1/test/neutral_1', name: 'Test Neutral', id: 'n1' },
            { ideology: 'leftist', url: 'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1/test/leftist_1', name: 'Test Leftist', id: 'l1' },
            { ideology: 'communist', url: 'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1/test/communist_1', name: 'Test Communist', id: 'c1' }
        ];
        
        try {
            const ideologies = ['communist', 'leftist', 'neutral', 'rightist', 'fascist'];
            const gamePhotos = [];
            
            for (const ideology of ideologies) {
                // Get all photos for this ideology
                const { data: photos, error } = await supabase
                    .from('ideology_photos')
                    .select('image_url, name, id')
                    .eq('category', ideology)
                    .not('image_url', 'is', null);
                
                if (error) {
                    console.error(`Error fetching ${ideology} photos:`, error);
                    continue;
                }
                
                if (photos && photos.length > 0) {
                    const cloudinaryPhotos = photos.filter(photo => 
                        photo.image_url && photo.image_url.includes('cloudinary.com')
                    );
                    
                    if (cloudinaryPhotos.length > 0) {
                        const randomIndex = Math.floor(Math.random() * cloudinaryPhotos.length);
                        const selectedPhoto = cloudinaryPhotos[randomIndex];
                        
                        gamePhotos.push({
                            ideology: ideology,
                            url: selectedPhoto.image_url,
                            name: selectedPhoto.name || `${ideology} photo`,
                            id: selectedPhoto.id
                        });
                    }
                }
            }
            
            // If we got photos from database, use them
            if (gamePhotos.length >= 5) {
                console.log(`✅ Using ${gamePhotos.length} photos from database`);
                return res.json({
                    success: true,
                    photos: gamePhotos,
                    count: gamePhotos.length,
                    source: 'database'
                });
            }
        } catch (dbError) {
            console.warn('⚠️ Database unavailable, using fallback photos');
        }
        
        // Use fallback photos
        const shuffled = [...fallbackPhotos].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);
        
        console.log('✅ Using fallback photos for game');
        res.json({
            success: true,
            photos: selected,
            count: selected.length,
            source: 'fallback'
        });
        
    } catch (error) {
        console.error('❌ Random photos error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch random photos',
            message: error.message
        });
    }
});

// Get photos by ideology for analytics
router.get('/by-ideology/:ideology', async (req, res) => {
    try {
        const { ideology } = req.params;
        
        const { data: photos, error } = await supabase
            .from('ideology_photos')
            .select('*')
            .eq('category', ideology)
            .not('image_url', 'is', null)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            ideology: ideology,
            photos: photos || [],
            count: photos ? photos.length : 0
        });
        
    } catch (error) {
        console.error('❌ Get photos by ideology error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch photos by ideology'
        });
    }
});

// Debug endpoint to check database contents
router.get('/debug', async (req, res) => {
    try {
        const summary = {
            total: 0,
            byCategory: {},
            cloudinaryCount: 0,
            sampleUrls: [],
            status: 'unknown'
        };
        
        try {
            const { data: allPhotos, error } = await supabase
                .from('ideology_photos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            summary.total = allPhotos ? allPhotos.length : 0;
            summary.status = 'database_connected';
            
            if (allPhotos) {
                allPhotos.forEach(photo => {
                    if (!summary.byCategory[photo.category]) {
                        summary.byCategory[photo.category] = 0;
                    }
                    summary.byCategory[photo.category]++;
                    
                    if (photo.image_url && photo.image_url.includes('cloudinary.com')) {
                        summary.cloudinaryCount++;
                    }
                    
                    if (summary.sampleUrls.length < 5) {
                        summary.sampleUrls.push({
                            category: photo.category,
                            url: photo.image_url ? photo.image_url.substring(0, 80) + '...' : 'null',
                            isCloudinary: photo.image_url ? photo.image_url.includes('cloudinary.com') : false
                        });
                    }
                });
            }
            
            return res.json({
                success: true,
                summary,
                photos: allPhotos
            });
            
        } catch (dbError) {
            console.warn('⚠️ Database unavailable for debug:', dbError.message);
            summary.status = 'database_unavailable';
            summary.error = dbError.message;
            
            return res.json({
                success: true,
                summary,
                photos: [],
                fallback: true
            });
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch debug info',
            message: error.message
        });
    }
});

export default router;