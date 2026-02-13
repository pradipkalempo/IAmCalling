// Unified Database Service for MVP
// Handles Supabase, Qdrant, and Cloudinary operations
import { createClient } from '@supabase/supabase-js';
import { initializeIdeologyCollection, storeIdeologyEmbedding, findSimilarIdeologies } from '../qdrant_setup.js';
import { uploadProfileImage, deleteProfileImage } from '../cloudinary_setup.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '..', 'IAmCalling.env') });

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * Initialize all database services
 */
async function initializeDatabaseServices() {
    try {
        // Initialize Qdrant collection
        await initializeIdeologyCollection();
        console.log('✅ Database services initialized');
    } catch (error) {
        console.error('❌ Error initializing database services:', error);
        throw error;
    }
}

/**
 * User Management Functions
 */

/**
 * Create a new user profile
 * @param {Object} userData - User data
 */
async function createUserProfile(userData) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 */
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Content Management Functions
 */

/**
 * Create a new article
 * @param {Object} articleData - Article data
 */
async function createArticle(articleData) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert([articleData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
}

/**
 * Get articles by user ID
 * @param {string} userId - User ID
 */
async function getUserArticles(userId) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user articles:', error);
        throw error;
    }
}

/**
 * Comments Functions
 */

/**
 * Create a new comment
 * @param {Object} commentData - Comment data
 */
async function createComment(commentData) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([commentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

/**
 * Get comments by user ID
 * @param {string} userId - User ID
 */
async function getUserComments(userId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user comments:', error);
        throw error;
    }
}

/**
 * Ideological Test Functions
 */

/**
 * Save ideological test answers
 * @param {Object} testData - Test data
 */
async function saveIdeologicalTestAnswers(testData) {
    try {
        const { data, error } = await supabase
            .from('ideological_test_answers')
            .insert([testData])
            .select()
            .single();

        if (error) throw error;
        
        // Also store in Qdrant for AI analysis
        if (testData.embedding) {
            await storeIdeologyEmbedding(
                testData.user_id,
                testData.embedding,
                { test_date: testData.created_at }
            );
        }
        
        return data;
    } catch (error) {
        console.error('Error saving ideological test answers:', error);
        throw error;
    }
}

/**
 * Get ideological test answers by user ID
 * @param {string} userId - User ID
 */
async function getUserIdeologicalTestAnswers(userId) {
    try {
        const { data, error } = await supabase
            .from('ideological_test_answers')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user ideological test answers:', error);
        throw error;
    }
}

/**
 * Find similar users based on ideological alignment
 * @param {Array<number>} embedding - User's ideology embedding
 * @param {number} limit - Number of similar users to find
 */
async function findSimilarUsers(embedding, limit = 10) {
    try {
        const similarUsers = await findSimilarIdeologies(embedding, limit);
        return similarUsers;
    } catch (error) {
        console.error('Error finding similar users:', error);
        throw error;
    }
}

/**
 * Call Log Functions
 */

/**
 * Create a new call log
 * @param {Object} callLogData - Call log data
 */
async function createCallLog(callLogData) {
    try {
        const { data, error } = await supabase
            .from('call_logs')
            .insert([callLogData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating call log:', error);
        throw error;
    }
}

/**
 * Get call logs by user ID
 * @param {string} userId - User ID
 */
async function getUserCallLogs(userId) {
    try {
        const { data, error } = await supabase
            .from('call_logs')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user call logs:', error);
        throw error;
    }
}

/**
 * Profile Image Functions
 */

/**
 * Upload and set user profile image
 * @param {string} userId - User ID
 * @param {Buffer} imageBuffer - Image buffer
 */
async function setUserProfileImage(userId, imageBuffer) {
    try {
        // Upload to Cloudinary
        const uploadResult = await uploadProfileImage(imageBuffer, userId);
        
        // Update user profile with image URL
        const updatedProfile = await updateUserProfile(userId, {
            profile_image_url: uploadResult.url
        });
        
        return {
            uploadResult,
            updatedProfile
        };
    } catch (error) {
        console.error('Error setting user profile image:', error);
        throw error;
    }
}

/**
 * Delete user profile image
 * @param {string} userId - User ID
 * @param {string} publicId - Cloudinary public ID
 */
async function deleteUserProfileImage(userId, publicId) {
    try {
        // Delete from Cloudinary
        await deleteProfileImage(publicId);
        
        // Remove image URL from user profile
        const updatedProfile = await updateUserProfile(userId, {
            profile_image_url: null
        });
        
        return updatedProfile;
    } catch (error) {
        console.error('Error deleting user profile image:', error);
        throw error;
    }
}

export {
    initializeDatabaseServices,
    // User functions
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    // Article functions
    createArticle,
    getUserArticles,
    // Comment functions
    createComment,
    getUserComments,
    // Ideological Test Functions
    saveIdeologicalTestAnswers,
    getUserIdeologicalTestAnswers,
    findSimilarUsers,
    // Call log functions
    createCallLog,
    getUserCallLogs,
    // Profile image functions
    setUserProfileImage,
    deleteUserProfileImage
};
