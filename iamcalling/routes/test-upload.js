import express from 'express';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/test-upload', upload.single('testPhoto'), (req, res) => {
    console.log('📸 Test upload request received');
    console.log('📸 File:', req.file);
    
    if (req.file) {
        res.json({
            success: true,
            message: 'Upload successful!',
            file: {
                url: req.file.path,
                size: req.file.size,
                filename: req.file.filename
            }
        });
    } else {
        res.json({
            success: false,
            message: 'No file received'
        });
    }
});

export default router;
