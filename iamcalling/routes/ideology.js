import express from 'express';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET photos from Cloudinary by ideology category
router.get('/photos', async (req, res) => {
  try {
    const { ideology } = req.query;
    
    console.log('🔍 Fetching photos for ideology:', ideology);
    
    // Search for photos by tag/folder in Cloudinary
    const searchQuery = ideology ? `tags:${ideology}` : 'resource_type:image';
    
    const result = await cloudinary.v2.search
      .expression(searchQuery)
      .max_results(20)
      .execute();
    
    console.log('📸 Found photos:', result.resources.length);
    
    // Format photos for frontend
    const photos = result.resources.map(photo => ({
      id: photo.public_id,
      url: photo.secure_url,
      name: photo.display_name || photo.public_id,
      ideology: ideology || 'general',
      created_at: photo.created_at
    }));
    
    res.json({
      success: true,
      photos,
      count: photos.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching Cloudinary photos:', error);
    
    // Return demo photos as fallback
    const demoPhotos = Array.from({ length: 20 }, (_, i) => ({
      id: `demo_${ideology || 'general'}_${i + 1}`,
      url: `https://picsum.photos/400/300?random=${Math.random()}`,
      name: `${ideology || 'Demo'} Photo ${i + 1}`,
      ideology: ideology || 'general',
      created_at: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      photos: demoPhotos,
      count: demoPhotos.length,
      fallback: true
    });
  }
});

// GET all photos (no ideology filter)
router.get('/photos/all', async (req, res) => {
  try {
    const result = await cloudinary.v2.search
      .expression('resource_type:image')
      .max_results(100)
      .execute();
    
    const photos = result.resources.map(photo => ({
      id: photo.public_id,
      url: photo.secure_url,
      name: photo.display_name || photo.public_id,
      created_at: photo.created_at
    }));
    
    res.json({
      success: true,
      photos,
      count: photos.length
    });
    
  } catch (error) {
    console.error('Error fetching all photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos',
      error: error.message
    });
  }
});

export default router;