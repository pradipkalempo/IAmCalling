import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userProfileRoutes from './controllers/userProfile.js';
import criticalThinkingRoutes from './controllers/criticalThinking.js';
import configRoutes from './controllers/config.js';
import postsRoutes from './controllers/posts.js';
import authRoutes from './controllers/auth.js';
import uploadRoutes from './controllers/upload.js';
import passwordResetRoutes from './controllers/passwordReset.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const viewsRoutes = require('./controllers/views.cjs');
const adminRoutes = require('./controllers/admin.cjs');
import SimpleSupabaseClient from './services/simpleSupabaseClient.js';
import healthCheckRoute from './controllers/health.js';
import roboRoutes from './controllers/robo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));

app.use(helmet({ contentSecurityPolicy: false }));

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api', apiRateLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    req.supabase = new SimpleSupabaseClient();
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/assets')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// Health check
healthCheckRoute(app);

// API routes
app.use('/api', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/critical-thinking', criticalThinkingRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/robo', roboRoutes);

// Landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/01-response-index.html'));
});

app.get('/15-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/15-login.html'));
});

app.get('/18-profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/18-profile.html'));
});

app.get('/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
});

app.get('/config.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-store');
    res.send(
        `window.APP_CONFIG = Object.assign(window.APP_CONFIG || {}, ${JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL || '',
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
        })});`
    );
});

export default app;
