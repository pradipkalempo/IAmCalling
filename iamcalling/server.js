import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userProfileRoutes from './routes/userProfile.js';
import criticalThinkingRoutes from './routes/criticalThinking.js';
import configRoutes from './routes/config.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const viewsRoutes = require('./routes/views.cjs');
const adminRoutes = require('./routes/admin.cjs');
import SimpleSupabaseClient from './services/simpleSupabaseClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { PORT } = require('./config/port-config.cjs');

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: false
}));

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api', apiRateLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add Supabase client to requests
app.use((req, res, next) => {
    req.supabase = new SimpleSupabaseClient();
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', configRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/critical-thinking', criticalThinkingRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/admin', adminRoutes);

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/01-index.html'));
});

// Serve common HTML files
app.get('/01-index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/01-index.html'));
});

app.get('/15-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/15-login.html'));
});

app.get('/18-profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/18-profile.html'));
});

app.get('/config.js', (req, res) => {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-store');
    res.send(
        `window.APP_CONFIG = Object.assign(window.APP_CONFIG || {}, ${JSON.stringify({
            supabaseUrl,
            supabaseAnonKey
        })});`
    );
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
