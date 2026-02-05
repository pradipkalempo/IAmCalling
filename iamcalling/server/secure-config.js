// Server-side secure configuration
require('dotenv').config();

const secureConfig = {
    // Database credentials (server-side only)
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY
    },
    
    // API keys (server-side only)
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    
    // Security settings
    session: {
        secret: process.env.SESSION_SECRET,
        adminPassword: process.env.ADMIN_PASSWORD
    },
    
    // App settings
    app: {
        port: process.env.PORT || 3002,
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};

// Validate required environment variables
const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SESSION_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
}

module.exports = secureConfig;