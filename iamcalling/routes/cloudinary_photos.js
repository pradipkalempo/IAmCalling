import express from 'express';
import cloudinary from 'cloudinary';
import { classifyImage } from '../utils/imageClassifier.js';

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/:ideology', async (req, res) => {
  const { ideology } = req.params;
  try {
    // Search for photos in the specific ideology folder
    const result = await cloudinary.v2.search
      .expression(`folder:Ideology_root/${ideology}`)
      .max_results(500)
      .execute();
    
    // Use original Cloudinary URLs (without folder paths)
    const urls = result.resources.map(photo => {
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v${photo.version}/${photo.public_id}.${photo.format}`;
    });
    
    console.log(`Found ${urls.length} photos in Ideology_root/${ideology} folder`);
    res.json(urls);
    
  } catch (err) {
    console.error(`Cloudinary error for ${ideology}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;