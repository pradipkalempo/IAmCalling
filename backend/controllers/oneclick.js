import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// Use python -m yt_dlp which works cross-platform without PATH issues
const YTDLP = 'python -m yt_dlp';
const execOpts = { timeout: 30000, shell: true };

function safeTitle(title = '') {
    return title.replace(/[^\w\s.-]/g, '').trim().slice(0, 80) || 'media';
}

// ── Search ────────────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Query required' });

    try {
        const { stdout } = await execAsync(
            `${YTDLP} "ytsearch10:${q.replace(/"/g, '')}" --dump-json --flat-playlist --no-warnings --quiet`,
            execOpts
        );

        const results = stdout.trim().split('\n')
            .filter(Boolean)
            .map(line => {
                try {
                    const e = JSON.parse(line);
                    const id = e.id || '';
                    return {
                        id: `yt_${id}`,
                        yt_id: id,
                        title: e.title || 'Unknown',
                        thumbnail: e.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                        duration: e.duration,
                        channel: e.channel || e.uploader || '',
                    };
                } catch { return null; }
            })
            .filter(Boolean);

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
        const { stdout } = await execAsync(
            `${YTDLP} "${url}" --dump-json --no-warnings --quiet`,
            execOpts
        );
        const info = JSON.parse(stdout.trim());

        const title = info.title || 'video';
        const duration = info.duration || 0;
        const yt_id = info.id || '';

        const QUALITIES = [2160, 1440, 1080, 720, 480, 360];
        const BITRATES = { 2160: 15000, 1440: 8000, 1080: 4000, 720: 2500, 480: 1200, 360: 700 };

        const availableHeights = new Set(
            (info.formats || [])
                .filter(f => f.height && f.vcodec && f.vcodec !== 'none')
                .map(f => f.height)
        );

        const files = QUALITIES
            .filter(h => [...availableHeights].some(ah => ah >= h))
            .map(h => ({
                format: `MP4 ${h}p`,
                height: h,
                yt_id,
                format_selector: `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${h}]`,
                size: duration ? Math.round(BITRATES[h] * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_${h}p.mp4`,
            }));

        const audio_files = [
            {
                format: 'MP3 320k', height: 0, yt_id,
                format_selector: 'bestaudio/best',
                size: duration ? Math.round(320 * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_320k.mp3`,
                is_audio: true,
            },
            {
                format: 'MP3 128k', height: 0, yt_id,
                format_selector: 'bestaudio[abr<=128]/bestaudio/best',
                size: duration ? Math.round(128 * 1000 / 8 * duration) : 0,
                name: `${safeTitle(title)}_128k.mp3`,
                is_audio: true,
            },
        ];

        if (!files.length) return res.json({ status: 'unavailable', files: [], audio_files: [] });

        res.json({ status: 'downloadable', title, yt_id, thumbnail: info.thumbnail, files, audio_files });
    } catch (e) {
        res.status(500).json({ error: 'Extract failed', detail: e.message });
    }
});

// ── Stream download directly to browser ──────────────────────────────────────
router.get('/stream', (req, res) => {
    const { yt_id, format_selector, filename, is_audio } = req.query;
    if (!yt_id || !format_selector) return res.status(400).json({ error: 'Missing params' });

    const safeName = (filename || `${yt_id}.mp4`).replace(/[^\w\s.-]/g, '');
    const url = `https://www.youtube.com/watch?v=${yt_id}`;

    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', is_audio === 'true' ? 'audio/mpeg' : 'video/mp4');

    const args = is_audio === 'true'
        ? [url, '-f', format_selector, '--no-warnings', '-x', '--audio-format', 'mp3', '-o', '-']
        : [url, '-f', format_selector, '--no-warnings', '--merge-output-format', 'mp4', '-o', '-'];

    const ytdlpPath = 'python';
    const ytdlpArgs = ['-m', 'yt_dlp', ...args];
    const proc = spawn(ytdlpPath, ytdlpArgs, { shell: true });
    proc.stdout.pipe(res);
    proc.stderr.on('data', () => {});
    req.on('close', () => proc.kill());
    proc.on('error', (err) => { if (!res.headersSent) res.status(500).end(); });
});

export default router;
