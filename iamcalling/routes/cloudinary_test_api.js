import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
router.get('/test', async (req, res) => {
  try {
    const result = await cloudinary.v2.api.ping();
    res.json({ 
      status: 'success', 
      message: 'Cloudinary connection successful',
      result 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Cloudinary connection failed',
      error: error.message 
    });
  }
});

// Get all folders under Ideology_root
router.get('/folders', async (req, res) => {
  try {
    console.log('🔍 Fetching folders from Cloudinary...');
    const result = await cloudinary.v2.api.sub_folders('Ideology_root');
    console.log(`📊 Found ${result.folders.length} folders`);
    
    const folderNames = result.folders.map(f => f.name);
    res.json({ 
      success: true,
      count: folderNames.length,
      folders: folderNames 
    });
  } catch (error) {
    console.error('❌ Cloudinary folders error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get photos for a specific ideology
router.get('/photos/:ideology', async (req, res) => {
  const { ideology } = req.params;
  
  try {
    console.log(`🔍 Fetching photos for ideology: ${ideology}`);
    
    // Method 1: Using search API
    const searchResult = await cloudinary.v2.search
      .expression(`folder:Ideology_root/${ideology}`)
      .max_results(100)
      .execute();
    
    console.log(`📊 Search API found ${searchResult.resources.length} photos`);
    
    // Method 2: Using resources API as backup
    const resourcesResult = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: `Ideology_root/${ideology}/`,
      max_results: 100,
    });
    
    console.log(`📊 Resources API found ${resourcesResult.resources.length} photos`);
    
    // Use whichever method found more photos
    const resources = searchResult.resources.length > 0 ? 
      searchResult.resources : resourcesResult.resources;
    
    const photos = resources.map(photo => ({
      public_id: photo.public_id,
      secure_url: photo.secure_url,
      url: photo.url,
      format: photo.format,
      width: photo.width,
      height: photo.height,
      folder: ideology
    }));
    
    res.json({
      success: true,
      ideology,
      count: photos.length,
      photos,
      methods: {
        search: searchResult.resources.length,
        resources: resourcesResult.resources.length
      }
    });
    
  } catch (error) {
    console.error(`❌ Error fetching photos for ${ideology}:`, error.message);
    res.status(500).json({
      success: false,
      ideology,
      error: error.message
    });
  }
});

// Get all photos from all ideology folders
router.get('/all-photos', async (req, res) => {
  try {
    console.log('🔍 Fetching all ideology photos...');
    
    const result = await cloudinary.v2.search
      .expression('folder:Ideology_root/*')
      .max_results(500)
      .execute();
    
    const photosByIdeology = {};
    
    result.resources.forEach(photo => {
      // Extract ideology from folder path
      const folderMatch = photo.folder?.match(/Ideology_root\/([^\/]+)/);
      const ideology = folderMatch ? folderMatch[1] : 'unknown';
      
      if (!photosByIdeology[ideology]) {
        photosByIdeology[ideology] = [];
      }
      
      photosByIdeology[ideology].push({
        public_id: photo.public_id,
        secure_url: photo.secure_url,
        format: photo.format
      });
    });
    
    const summary = Object.keys(photosByIdeology).map(ideology => ({
      ideology,
      count: photosByIdeology[ideology].length
    }));
    
    res.json({
      success: true,
      total: result.resources.length,
      summary,
      photos: photosByIdeology
    });
    
  } catch (error) {
    console.error('❌ Error fetching all photos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;