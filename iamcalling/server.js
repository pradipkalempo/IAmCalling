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
import postsRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const viewsRoutes = require('./routes/views.cjs');
const adminRoutes = require('./routes/admin.cjs');
import SimpleSupabaseClient from './services/simpleSupabaseClient.js';
import healthCheckRoute from './routes/health.js';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Health check routes
healthCheckRoute(app);

// API routes
app.use('/api', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/critical-thinking', criticalThinkingRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/admin', adminRoutes);

// Basic routes
app.get('/', async (req, res) => {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data } = await supabase
            .from('posts')
            .select('id, title, author_name, thumbnail_url, views_count, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        res.set('Cache-Control', 'public, max-age=30');
        res.render('index', { posts: data || [] });
    } catch (error) {
        res.render('index', { posts: [] });
    }
});

// Serve common HTML files
app.get('/01-index.html', async (req, res) => {
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data } = await supabase
            .from('posts')
            .select('id, title, author_name, thumbnail_url, views_count, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        res.set('Cache-Control', 'public, max-age=30');
        res.render('index', { posts: data || [] });
    } catch (error) {
        res.render('index', { posts: [] });
    }
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
