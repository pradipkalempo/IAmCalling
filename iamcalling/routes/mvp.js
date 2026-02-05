// MVP API Routes
// Implements the API endpoints for the new database structure
import express from 'express';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    createArticle,
    getUserArticles,
    createComment,
    getUserComments,
    savePoliticalTestAnswers,
    getUserPoliticalTestAnswers,
    findSimilarUsers,
    createCallLog,
    getUserCallLogs,
    setUserProfileImage,
    deleteUserProfileImage
} from '../services/databaseService.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

// ================================
// USER PROFILE ROUTES
// ================================

/**
 * POST /api/mvp/users
 * Create a new user profile
 */
router.post('/users', async (req, res) => {
    try {
        const userData = req.body;
        const userProfile = await createUserProfile(userData);
        res.status(201).json({ success: true, data: userProfile });
    } catch (error) {
        console.error('Error in POST /api/mvp/users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/mvp/users/:userId
 * Get user profile by ID
 */
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await getUserProfile(userId);
        res.json({ success: true, data: userProfile });
    } catch (error) {
        console.error('Error in GET /api/mvp/users/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/mvp/users/:userId
 * Update user profile
 */
router.put('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const updatedProfile = await updateUserProfile(userId, updates);
        res.json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error in PUT /api/mvp/users/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/mvp/users/:userId/profile-image
 * Upload and set user profile image
 */
router.post('/users/:userId/profile-image', upload.single('profileImage'), async (req, res) => {
    try {
        const { userId } = req.params;
        const imageBuffer = req.file.buffer;
        
        const result = await setUserProfileImage(userId, imageBuffer);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in POST /api/mvp/users/:userId/profile-image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/mvp/users/:userId/profile-image
 * Delete user profile image
 */
router.delete('/users/:userId/profile-image', async (req, res) => {
    try {
        const { userId } = req.params;
        const { publicId } = req.body;
        
        const updatedProfile = await deleteUserProfileImage(userId, publicId);
        res.json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error in DELETE /api/mvp/users/:userId/profile-image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================
// ARTICLE ROUTES
// ================================

/**
 * POST /api/mvp/articles
 * Create a new article
 */
router.post('/articles', async (req, res) => {
    try {
        const articleData = req.body;
        const article = await createArticle(articleData);
        res.status(201).json({ success: true, data: article });
    } catch (error) {
        console.error('Error in POST /api/mvp/articles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/mvp/articles/user/:userId
 * Get articles by user ID
 */
router.get('/articles/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const articles = await getUserArticles(userId);
        res.json({ success: true, data: articles });
    } catch (error) {
        console.error('Error in GET /api/mvp/articles/user/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================
// COMMENT ROUTES
// ================================

/**
 * POST /api/mvp/comments
 * Create a new comment
 */
router.post('/comments', async (req, res) => {
    try {
        const commentData = req.body;
        const comment = await createComment(commentData);
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        console.error('Error in POST /api/mvp/comments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/mvp/comments/user/:userId
 * Get comments by user ID
 */
router.get('/comments/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const comments = await getUserComments(userId);
        res.json({ success: true, data: comments });
    } catch (error) {
        console.error('Error in GET /api/mvp/comments/user/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================
// POLITICAL TEST ROUTES
// ================================

/**
 * POST /api/mvp/political-tests
 * Save political test answers
 */
router.post('/political-tests', async (req, res) => {
    try {
        const testData = req.body;
        const savedTest = await savePoliticalTestAnswers(testData);
        res.status(201).json({ success: true, data: savedTest });
    } catch (error) {
        console.error('Error in POST /api/mvp/political-tests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/mvp/political-tests/user/:userId
 * Get political test answers by user ID
 */
router.get('/political-tests/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const testAnswers = await getUserPoliticalTestAnswers(userId);
        res.json({ success: true, data: testAnswers });
    } catch (error) {
        console.error('Error in GET /api/mvp/political-tests/user/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/mvp/political-tests/similar-users
 * Find similar users based on political ideology
 */
router.post('/political-tests/similar-users', async (req, res) => {
    try {
        const { embedding, limit } = req.body;
        const similarUsers = await findSimilarUsers(embedding, limit);
        res.json({ success: true, data: similarUsers });
    } catch (error) {
        console.error('Error in POST /api/mvp/political-tests/similar-users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================
// CALL LOG ROUTES
// ================================

/**
 * POST /api/mvp/call-logs
 * Create a new call log
 */
router.post('/call-logs', async (req, res) => {
    try {
        const callLogData = req.body;
        const callLog = await createCallLog(callLogData);
        res.status(201).json({ success: true, data: callLog });
    } catch (error) {
        console.error('Error in POST /api/mvp/call-logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/mvp/call-logs/user/:userId
 * Get call logs by user ID
 */
router.get('/call-logs/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const callLogs = await getUserCallLogs(userId);
        res.json({ success: true, data: callLogs });
    } catch (error) {
        console.error('Error in GET /api/mvp/call-logs/user/:userId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;