import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all ideology folders dynamically
router.get('/folders', async (req, res) => {
  try {
    console.log(`🔍 Fetching ideology folders from Cloudinary...`);
    const result = await cloudinary.v2.api.sub_folders('Ideology_root');
    console.log(`📊 Found ${result.folders.length} folders under 'Ideology_root'`);
    const folderNames = result.folders.map(f => f.name);
    console.log(`📁 Folder names:`, folderNames);
    res.json({ folders: folderNames });
  } catch (err) {
    console.error(`Cloudinary folders error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get images for a specific ideology folder
router.get('/photos/:ideology', async (req, res) => {
  const { ideology } = req.params;
  try {
    console.log(`🔍 API Request for ideology: ${ideology}`);
    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: `Ideology_root/${ideology}/`,
      max_results: 100,
    });
    console.log(`📊 Found ${result.resources.length} resources for ${ideology}. Prefix used: Ideology_root/${ideology}/`);
    if (result.resources.length > 0) {
      console.log(`  Sample public_id: ${result.resources[0].public_id}`);
    }
    const photos = result.resources.map(r => ({
      src: r.secure_url,
      public_id: r.public_id,
      folder: ideology
    }));
    res.json({ photos });
  } catch (err) {
    console.error(`Cloudinary error for ${ideology}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
