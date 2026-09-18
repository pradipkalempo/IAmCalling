import { Router } from 'express';
import ytdl from '@distube/ytdl-core';

const router = Router();

function safeTitle(title = '') {
    return title.replace(/[^\w\s.-]/g, '').trim().slice(0, 80) || 'media';
}

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

// ── Search via YouTube RSS / suggest API (no auth needed) ─────────────────────
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        // Use YouTube's internal suggest/search API
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%3D%3D`;
        const resp = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await resp.text();

        // Extract ytInitialData JSON from page
        const match = html.match(/var ytInitialData = ({.+?});<\/script>/s);
        if (!match) return res.json({ results: [], total: 0 });

        const data = JSON.parse(match[1]);
        const contents = data?.contents?.twoColumnSearchResultsRenderer
            ?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const results = contents
            .filter(c => c.videoRenderer)
            .slice(0, 10)
            .map(c => {
                const v = c.videoRenderer;
                const id = v.videoId;
                return {
                    id: `yt_${id}`,
                    yt_id: id,
                    title: v.title?.runs?.[0]?.text || 'Unknown',
                    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                    duration: v.lengthText?.simpleText || '',
                    channel: v.ownerText?.runs?.[0]?.text || '',
                };
            });

        res.json({ results, total: results.length });
    } catch (e) {
        res.status(500).json({ error: 'Search failed', detail: e.message });
    }
});

// ── Extract formats ───────────────────────────────────────────────────────────
router.get('/extract', async (req, res) => {
    const url = (req.query.url || '').trim();
    if (!url) return res.status(400).json({ error: 'URL required' });

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const yt_id = info.videoDetails.videoId;
        const duration = parseInt(info.videoDetails.lengthSeconds) || 0;
        const thumbnail = info.videoDetails.thumbnails?.slice(-1)[0]?.url || '';

        const QUALITIES = [2160, 1440, 1080, 720, 480, 360];
        const BITRATES = { 2160: 15000, 1440: 8000, 1080: 4000, 720: 2500, 480: 1200, 360: 700 };

        // Get available video heights
        const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
        const availableHeights = new Set(videoFormats.map(f => f.height).filter(Boolean));

        const files = QUALITIES
            .filter(h => [...availableHeights].some(ah => ah >= h))
            .map(h => ({
                format: `MP4 ${h}p`,
                height: h,
                yt_id,
                quality: `${h}p`,
                size: duration ? Math.round(BITRATES[h] * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_${h}p.mp4`,
            }));

        const audio_files = [
            {
                format: 'MP3 320k', height: 0, yt_id,
                quality: 'highestaudio',
                size: duration ? Math.round(320 * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_320k.mp3`,
                is_audio: true,
            },
            {
                format: 'MP3 128k', height: 0, yt_id,
                quality: 'lowestaudio',
                size: duration ? Math.round(128 * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_128k.mp3`,
                is_audio: true,
            },
        ];

        if (!files.length) return res.json({ status: 'unavailable', files: [], audio_files: [] });

        res.json({ status: 'downloadable', title, yt_id, thumbnail, files, audio_files });
    } catch (e) {
        res.status(500).json({ error: 'Extract failed', detail: e.message });
    }
});

// ── Stream download directly to browser ──────────────────────────────────────
router.get('/stream', async (req, res) => {
    const { yt_id, quality, filename, is_audio } = req.query;
    if (!yt_id) return res.status(400).json({ error: 'Missing yt_id' });

    const safeName = (filename || `${yt_id}.mp4`).replace(/[^\w\s.-]/g, '');
    const url = `https://www.youtube.com/watch?v=${yt_id}`;

    try {
        const info = await ytdl.getInfo(url);

        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

        if (is_audio === 'true') {
            res.setHeader('Content-Type', 'audio/mpeg');
            ytdl(url, { quality: 'highestaudio', filter: 'audioonly' }).pipe(res);
        } else {
            res.setHeader('Content-Type', 'video/mp4');
            const h = parseInt(quality) || 720;
            // Try to get combined format first, fallback to best available
            const fmt = ytdl.chooseFormat(info.formats, {
                quality: 'highestvideo',
                filter: f => f.height <= h && f.hasAudio && f.hasVideo
            }) || ytdl.chooseFormat(info.formats, { quality: `${h}p` });

            ytdl.downloadFromInfo(info, { format: fmt }).pipe(res);
        }

        req.on('close', () => res.destroy());
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: e.message });
    }
});

export default router;
