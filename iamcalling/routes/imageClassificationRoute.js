import express from 'express';
import cloudinary from 'cloudinary';
import { classifyImage } from '../utils/imageClassifier.js';

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get properly classified images for an ideology
router.get('/:ideology', async (req, res) => {
  const { ideology } = req.params;
  try {
    // Get all images from the specific ideology folder using exact prefix
    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: `Ideology_root/${ideology}/`,
      max_results: 500
    });
    
    // Filter and validate images belong to this ideology
    const validImages = result.resources.filter(resource => {
      const filename = resource.public_id.split('/').pop();
      const classification = classifyImage(filename);
      
      // Include if it's classified as this ideology OR if it's a numbered file in the correct folder
      return classification.ideology === ideology || 
             (classification.confidence === 'low' && /^\d+$/.test(filename));
    });
    
    console.log(`Found ${validImages.length} valid images for ${ideology}`);
    
    const urls = validImages.map(r => r.secure_url);
    res.json(urls);
    
  } catch (err) {
    console.error(`Error fetching ${ideology} images:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get classification info for all images
router.get('/admin/classify-all', async (req, res) => {
  try {
    let allResources = [];
    let nextCursor = null;
    
    do {
      const result = await cloudinary.v2.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });
      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);
    
    const ideologyImages = allResources.filter(r => r.public_id.startsWith('Ideology_root/'));
    
    const classifications = ideologyImages.map(image => {
      const parts = image.public_id.split('/');
      const currentFolder = parts[1];
      const filename = parts[2];
      const classification = classifyImage(filename);
      
      return {
        filename,
        currentFolder,
        suggestedFolder: classification.ideology,
        confidence: classification.confidence,
        matchedKeyword: classification.matchedKeyword,
        url: image.secure_url,
        needsMove: currentFolder !== classification.ideology && classification.confidence === 'high'
      };
    });
    
    res.json({
      total: classifications.length,
      classifications,
      summary: {
        fascist: classifications.filter(c => c.currentFolder === 'fascist').length,
        communist: classifications.filter(c => c.currentFolder === 'communist').length,
        leftist: classifications.filter(c => c.currentFolder === 'leftist').length,
        neutral: classifications.filter(c => c.currentFolder === 'neutral').length,
        rightist: classifications.filter(c => c.currentFolder === 'rightist').length,
        needsMove: classifications.filter(c => c.needsMove).length
      }
    });
    
  } catch (err) {
    console.error('Error in classification:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;